"""File upload API — audio and video uploads for recordings."""
import os
import uuid
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


def _validate_audio(file: UploadFile) -> None:
    if file.content_type not in settings.allowed_audio_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported audio type: {file.content_type}. "
                   f"Allowed: {settings.allowed_audio_types}",
        )


def _validate_video(file: UploadFile) -> None:
    if file.content_type not in settings.allowed_video_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported video type: {file.content_type}",
        )


async def _save_file(file: UploadFile, subdir: str) -> tuple[str, int]:
    """Save uploaded file to local storage. Returns (relative_path, size_bytes)."""
    dest_dir = os.path.join(STORAGE_DIR, subdir)
    os.makedirs(dest_dir, exist_ok=True)

    ext = os.path.splitext(file.filename or "audio")[1] or ".bin"
    filename = f"{uuid.uuid4()}{ext}"
    dest_path = os.path.join(dest_dir, filename)

    size = 0
    async with aiofiles.open(dest_path, "wb") as f:
        while chunk := await file.read(1024 * 1024):  # 1 MB chunks
            await f.write(chunk)
            size += len(chunk)

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
    _validate_audio(file)

    # Check size (read Content-Length header or stream)
    result = await db.execute(select(Recording).where(Recording.id == recording_id))
    recording = result.scalar_one_or_none()
    if not recording:
        raise HTTPException(status_code=404, detail="Recording not found")
    if recording.user_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not your recording")

    path, size = await _save_file(file, f"audio/{current_user.id}")

    recording.file_path = os.path.join(STORAGE_DIR, path)
    recording.file_name = file.filename
    recording.file_size_bytes = size
    recording.mime_type = file.content_type
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
    await db.commit()
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
    _validate_video(file)

    result = await db.execute(select(Recording).where(Recording.id == recording_id))
    recording = result.scalar_one_or_none()
    if not recording:
        raise HTTPException(status_code=404, detail="Recording not found")
    if recording.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your recording")

    path, size = await _save_file(file, f"video/{current_user.id}")

    recording.file_path = os.path.join(STORAGE_DIR, path)
    recording.file_name = file.filename
    recording.file_size_bytes = size
    recording.mime_type = file.content_type
    db.add(recording)
    await db.commit()

    return {
        "message": "Video uploaded successfully",
        "recording_id": str(recording_id),
        "file_size_bytes": size,
    }
