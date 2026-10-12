"""File upload API — audio and video uploads for recordings."""
import os
import tempfile
import uuid
from collections.abc import Callable
import aiofiles
import structlog
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.recording import Recording, RecordingStatus
from app.config import settings

router = APIRouter(prefix="/uploads", tags=["Uploads"])
logger = structlog.get_logger(__name__)

STORAGE_DIR = os.path.abspath(settings.local_storage_path)
os.makedirs(STORAGE_DIR, exist_ok=True)


def _has_mp3_signature(prefix: bytes) -> bool:
    return prefix.startswith(b"ID3") or (
        len(prefix) >= 2 and prefix[0] == 0xFF and prefix[1] & 0xE0 == 0xE0
    )


def _has_mp4_signature(prefix: bytes) -> bool:
    return len(prefix) >= 8 and prefix[4:8] == b"ftyp"


AUDIO_SIGNATURES: dict[str, tuple[str, Callable[[bytes], bool]]] = {
    "audio/mpeg": ("mp3", _has_mp3_signature),
    "audio/wav": (
        "wav",
        lambda prefix: len(prefix) >= 12
        and prefix[:4] == b"RIFF"
        and prefix[8:12] == b"WAVE",
    ),
    "audio/ogg": ("ogg", lambda prefix: prefix.startswith(b"OggS")),
    "audio/mp4": ("m4a", _has_mp4_signature),
    "audio/webm": ("webm", lambda prefix: prefix.startswith(b"\x1a\x45\xdf\xa3")),
    "audio/flac": ("flac", lambda prefix: prefix.startswith(b"fLaC")),
}

VIDEO_SIGNATURES: dict[str, tuple[str, Callable[[bytes], bool]]] = {
    "video/mp4": ("mp4", _has_mp4_signature),
    "video/webm": ("webm", lambda prefix: prefix.startswith(b"\x1a\x45\xdf\xa3")),
    "video/ogg": ("ogv", lambda prefix: prefix.startswith(b"OggS")),
}


async def _validate_media(
    file: UploadFile,
    *,
    allowed_types: list[str],
    signatures: dict[str, tuple[str, Callable[[bytes], bool]]],
    media_label: str,
) -> tuple[str, str]:
    media_type = (file.content_type or "").split(";", 1)[0].strip().lower()
    if media_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported {media_label} type: {media_type or 'missing'}. "
            f"Allowed: {allowed_types}",
        )

    signature = signatures.get(media_type)
    if signature is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"No signature validator is configured for {media_type}.",
        )
    prefix = await file.read(64)
    await file.seek(0)
    extension, matches = signature
    if not prefix or not matches(prefix):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"The file content does not match its declared {media_label} type.",
        )
    return media_type, extension


async def _validate_audio(file: UploadFile) -> tuple[str, str]:
    return await _validate_media(
        file,
        allowed_types=settings.allowed_audio_types,
        signatures=AUDIO_SIGNATURES,
        media_label="audio",
    )


async def _validate_video(file: UploadFile) -> tuple[str, str]:
    return await _validate_media(
        file,
        allowed_types=settings.allowed_video_types,
        signatures=VIDEO_SIGNATURES,
        media_label="video",
    )


async def _save_file(
    file: UploadFile,
    subdir: str,
    *,
    max_size_bytes: int,
    extension: str,
) -> tuple[str, int]:
    """Stream a bounded upload to a private temporary file and atomically save it."""
    dest_dir = os.path.join(STORAGE_DIR, subdir)
    os.makedirs(dest_dir, exist_ok=True)

    filename = f"{uuid.uuid4()}.{extension}"
    dest_path = os.path.join(dest_dir, filename)
    fd, temp_path = tempfile.mkstemp(prefix=".upload-", dir=dest_dir)
    os.close(fd)
    os.chmod(temp_path, 0o600)

    size = 0
    try:
        async with aiofiles.open(temp_path, "wb") as f:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > max_size_bytes:
                    raise HTTPException(
                        status_code=413,
                        detail="Uploaded file exceeds the configured size limit.",
                    )
                await f.write(chunk)
            await f.flush()
        os.replace(temp_path, dest_path)
    except Exception:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise

    relative_path = os.path.join(subdir, filename)
    return relative_path, size


@router.post("/audio/{recording_id}")
async def upload_audio(
    recording_id: uuid.UUID,
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload an audio file and attach it to an existing recording."""
    media_type, extension = await _validate_audio(file)

    # Check size (read Content-Length header or stream)
    result = await db.execute(select(Recording).where(Recording.id == recording_id))
    recording = result.scalar_one_or_none()
    if not recording:
        raise HTTPException(status_code=404, detail="Recording not found")
    if recording.user_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not your recording")

    max_size_bytes = max(1, settings.max_audio_size_mb) * 1024 * 1024
    path, size = await _save_file(
        file,
        f"audio/{current_user.id}",
        max_size_bytes=max_size_bytes,
        extension=extension,
    )

    recording.file_path = os.path.join(STORAGE_DIR, path)
    recording.file_name = file.filename
    recording.file_size_bytes = size
    recording.mime_type = media_type
    recording.status = RecordingStatus.pending

    # Try to get audio duration
    try:
        import librosa  # type: ignore
        import asyncio
        loop = asyncio.get_event_loop()
        duration = await loop.run_in_executor(
            None, lambda: librosa.get_duration(path=recording.file_path)
        )
        recording.duration_seconds = round(duration, 2)
    except Exception:
        recording.duration_seconds = None

    db.add(recording)
    try:
        await db.commit()
    except Exception:
        stored_path = os.path.join(STORAGE_DIR, path)
        if os.path.exists(stored_path):
            os.remove(stored_path)
        raise
    await db.refresh(recording)

    logger.info("upload.audio_saved", recording_id=str(recording_id), size=size)

    return {
        "message": "Audio uploaded successfully",
        "recording_id": str(recording_id),
        "file_size_bytes": size,
        "duration_seconds": recording.duration_seconds,
        "ready_to_process": True,
    }


@router.post("/video/{recording_id}")
async def upload_video(
    recording_id: uuid.UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a video file. Audio will be extracted before AI processing."""
    media_type, extension = await _validate_video(file)

    result = await db.execute(select(Recording).where(Recording.id == recording_id))
    recording = result.scalar_one_or_none()
    if not recording:
        raise HTTPException(status_code=404, detail="Recording not found")
    if recording.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your recording")

    max_size_bytes = max(1, settings.max_video_size_mb) * 1024 * 1024
    path, size = await _save_file(
        file,
        f"video/{current_user.id}",
        max_size_bytes=max_size_bytes,
        extension=extension,
    )

    recording.file_path = os.path.join(STORAGE_DIR, path)
    recording.file_name = file.filename
    recording.file_size_bytes = size
    recording.mime_type = media_type
    db.add(recording)
    try:
        await db.commit()
    except Exception:
        stored_path = os.path.join(STORAGE_DIR, path)
        if os.path.exists(stored_path):
            os.remove(stored_path)
        raise

    return {
        "message": "Video uploaded successfully",
        "recording_id": str(recording_id),
        "file_size_bytes": size,
    }
