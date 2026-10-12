"""Voice Roots — FastAPI Backend Service.

Provides health checks, audio recording ingestion, SQLite transcript persistence,
and static streaming of preserved acoustic audio masters.
"""

import hashlib
import logging
import os
import sqlite3
import tempfile
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from transcription_service import (
    TranscriptionNotConfiguredError,
    TranscriptionProviderError,
    create_transcription_provider,
)

logger = logging.getLogger(__name__)

# Base directory for backend and file storage
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
STORAGE_DIR = os.environ.get(
    "VOICE_ROOTS_STORAGE_DIR", os.path.join(BACKEND_DIR, "storage")
)
AUDIO_STORAGE = os.path.join(STORAGE_DIR, "audio")
DB_PATH = os.environ.get(
    "VOICE_ROOTS_DB_PATH", os.path.join(BACKEND_DIR, "voice_roots.db")
)
MAX_AUDIO_SIZE_MB = max(1, int(os.environ.get("VOICE_ROOTS_MAX_AUDIO_SIZE_MB", "500")))
MAX_AUDIO_SIZE_BYTES = MAX_AUDIO_SIZE_MB * 1024 * 1024
CONSENT_VERSION = "voice-roots-consent-v1"
TRANSCRIPTION_CONSENT_VERSION = "voice-roots-ai-transcription-v1"

# Sniffed bytes determine the saved format. MIME types are checked as a second
# signal, never used as proof that a file contains audio.
AUDIO_FORMATS = {
    "wav": {"audio/wav", "audio/x-wav", "audio/wave"},
    "mp3": {"audio/mpeg", "audio/mp3"},
    "m4a": {"audio/mp4", "audio/m4a", "audio/x-m4a"},
    "ogg": {"audio/ogg", "application/ogg"},
    "webm": {"audio/webm"},
    "flac": {"audio/flac", "audio/x-flac"},
}

# Ensure required storage folders exist
os.makedirs(AUDIO_STORAGE, exist_ok=True)


def init_db():
    """Initialize SQLite database with table for saved recordings and transcripts."""
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS transcripts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid_id TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                audio_filename TEXT NOT NULL,
                audio_url TEXT NOT NULL,
                language TEXT NOT NULL,
                dialect TEXT,
                transcript_text TEXT NOT NULL,
                status TEXT NOT NULL,
                duration_seconds REAL DEFAULT 0.0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        # Additive migration: keep existing rows and audio untouched.
        existing_columns = {
            row[1] for row in cursor.execute("PRAGMA table_info(transcripts)")
        }
        additions = {
            "audio_sha256": "TEXT",
            "file_size_bytes": "INTEGER",
            "consent_at": "TEXT",
            "consent_version": "TEXT",
            "archived_at": "TEXT",
            "machine_transcript_text": "TEXT NOT NULL DEFAULT ''",
            "transcription_status": "TEXT NOT NULL DEFAULT 'not_requested'",
            "transcription_provider": "TEXT",
            "transcription_model": "TEXT",
            "transcription_error": "TEXT",
            "transcription_consent_at": "TEXT",
            "transcription_consent_version": "TEXT",
            "transcribed_at": "TEXT",
        }
        for column, sql_type in additions.items():
            if column not in existing_columns:
                cursor.execute(
                    f"ALTER TABLE transcripts ADD COLUMN {column} {sql_type}"
                )
        conn.commit()


# Initialize database upon module import
init_db()

app = FastAPI(
    title="Voice Roots API",
    description="Rooting Oral Languages in Text with AI — Core Backend API",
    version="1.0.0",
)

# CORS configuration for local frontend development (Vite + Next.js + Preview)
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "VOICE_ROOTS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,"
        "http://127.0.0.1:3000,http://localhost:3001,https://voice-roots.onrender.com",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static storage to allow direct audio playback
if os.path.exists(STORAGE_DIR):
    app.mount("/storage", StaticFiles(directory=STORAGE_DIR), name="storage")


# Pydantic schemas for data validation
class TranscriptUpdate(BaseModel):
    title: Optional[str] = None
    transcript_text: Optional[str] = None
    dialect: Optional[str] = None


class TranscriptionRequest(BaseModel):
    transcription_consent: bool = False


class TranscriptResponse(BaseModel):
    id: int
    uuid_id: str
    title: str
    audio_filename: str
    audio_url: str
    language: str
    dialect: Optional[str] = None
    transcript_text: str
    status: str
    duration_seconds: float
    created_at: str
    updated_at: str
    audio_sha256: Optional[str] = None
    file_size_bytes: Optional[int] = None
    consent_at: Optional[str] = None
    consent_version: Optional[str] = None
    archived_at: Optional[str] = None
    machine_transcript_text: str = ""
    transcription_status: str = "not_requested"
    transcription_provider: Optional[str] = None
    transcription_model: Optional[str] = None
    transcription_error: Optional[str] = None
    transcription_consent_at: Optional[str] = None
    transcription_consent_version: Optional[str] = None
    transcribed_at: Optional[str] = None


SUPPORTED_LANGUAGES = [
    {"code": "te", "name": "Telugu", "native": "తెలుగు", "category": "Scheduled"},
    {"code": "hi", "name": "Hindi", "native": "हिन्दी", "category": "Scheduled"},
    {"code": "gondi", "name": "Gondi", "native": "గోండీ", "category": "Indigenous / Tribal"},
    {"code": "koya", "name": "Koya", "native": "కోయ", "category": "Indigenous / Tribal"},
    {"code": "sat", "name": "Santhali", "native": "ᱥᱟᱱᱛᱟᱲᱤ", "category": "Scheduled"},
    {"code": "lam", "name": "Lambadi", "native": "లంబాడీ", "category": "Indigenous / Tribal"},
    {"code": "ta", "name": "Tamil", "native": "தமிழ்", "category": "Scheduled"},
    {"code": "kn", "name": "Kannada", "native": "ಕನ್ನಡ", "category": "Scheduled"},
    {"code": "ml", "name": "Malayalam", "native": "മലയാളം", "category": "Scheduled"},
    {"code": "mr", "name": "Marathi", "native": "मराठी", "category": "Scheduled"},
    {"code": "or", "name": "Odia", "native": "ଓଡ଼ିଆ", "category": "Scheduled"},
    {"code": "bn", "name": "Bengali", "native": "বাংলা", "category": "Scheduled"},
    {"code": "en", "name": "English", "native": "English", "category": "Official"},
]


@app.get("/")
def root():
    """Root endpoint welcoming clients and referencing documentation."""
    return {
        "name": "Voice Roots API",
        "tagline": "Rooting Oral Languages in Text with AI",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_check": "/health",
    }


@app.get("/health")
def health_check():
    """Health check endpoint confirming API availability and database connectivity."""
    db_status = "ok"
    status = "healthy"
    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("SELECT 1").fetchone()
    except Exception:
        # Keep internal paths and exception details out of the public health response.
        db_status = "error"
        status = "degraded"

    return {
        "status": status,
        "app": "Voice Roots",
        "version": "1.0.0",
        "database": "sqlite",
        "database_status": db_status,
        "storage_path": STORAGE_DIR,
    }


@app.get("/languages")
@app.get("/api/languages")
def get_languages():
    """List supported oral and regional languages."""
    return {"languages": SUPPORTED_LANGUAGES}


@app.get("/api/v1/transcriptions")
@app.get("/api/transcripts")
def list_transcripts():
    """Retrieve all saved transcripts from SQLite database."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM transcripts WHERE archived_at IS NULL ORDER BY id DESC"
        )
        rows = cursor.fetchall()

    items = [dict(row) for row in rows]
    return {"transcripts": items, "count": len(items)}


@app.get("/api/v1/transcriptions/{transcript_id}")
@app.get("/api/transcripts/{transcript_id}")
def get_transcript(transcript_id: int):
    """Retrieve a single transcript by ID."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM transcripts WHERE id = ? AND archived_at IS NULL",
            (transcript_id,),
        )
        row = cursor.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Transcript not found")
    return dict(row)


def _set_transcription_state(
    transcript_id: int,
    *,
    state: str,
    error: Optional[str] = None,
    provider: Optional[str] = None,
    model: Optional[str] = None,
    text: Optional[str] = None,
):
    """Persist transcription state without touching the original audio."""
    now = datetime.now(timezone.utc).isoformat()
    with sqlite3.connect(DB_PATH) as conn:
        if state == "completed" and text is not None:
            conn.execute(
                """
                UPDATE transcripts
                SET machine_transcript_text = ?,
                    transcript_text = CASE
                        WHEN transcript_text = '' AND status != 'Community Edited' THEN ?
                        ELSE transcript_text
                    END,
                    status = CASE
                        WHEN transcript_text = '' AND status != 'Community Edited' THEN 'Transcribed'
                        ELSE status
                    END,
                    transcription_status = 'completed',
                    transcription_provider = ?, transcription_model = ?,
                    transcription_error = NULL, transcribed_at = ?, updated_at = ?
                WHERE id = ? AND archived_at IS NULL
                """,
                (text, text, provider, model, now, now, transcript_id),
            )
        else:
            conn.execute(
                """
                UPDATE transcripts
                SET transcription_status = ?, transcription_provider = ?,
                    transcription_model = ?, transcription_error = ?, updated_at = ?
                WHERE id = ? AND archived_at IS NULL
                """,
                (state, provider, model, error, now, transcript_id),
            )
        conn.commit()


def process_saved_transcription(transcript_id: int):
    """Run a consented provider request and store its annotation in SQLite."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            "SELECT * FROM transcripts WHERE id = ? AND archived_at IS NULL",
            (transcript_id,),
        ).fetchone()
        if row is None:
            return
        audio_path = os.path.join(AUDIO_STORAGE, row["audio_filename"])

    _set_transcription_state(transcript_id, state="processing")
    try:
        provider = create_transcription_provider()
        result = provider.transcribe(audio_path)
    except TranscriptionNotConfiguredError as exc:
        _set_transcription_state(
            transcript_id, state="not_configured", error=str(exc)
        )
        return
    except TranscriptionProviderError as exc:
        _set_transcription_state(transcript_id, state="failed", error=str(exc))
        return
    except Exception as exc:
        # Log only the type; avoid SDK bodies or credential-bearing details.
        logger.error(
            "Transcription failed for recording %s (%s)",
            transcript_id,
            type(exc).__name__,
        )
        _set_transcription_state(
            transcript_id,
            state="failed",
            error="Transcription failed unexpectedly. Check backend logs before retrying.",
        )
        return

    _set_transcription_state(
        transcript_id,
        state="completed",
        provider=result.provider,
        model=result.model,
        text=result.text,
    )


def _audio_format(prefix: bytes) -> Optional[str]:
    if len(prefix) >= 12 and prefix[:4] == b"RIFF" and prefix[8:12] == b"WAVE":
        return "wav"
    if prefix.startswith(b"fLaC"):
        return "flac"
    if prefix.startswith(b"OggS"):
        return "ogg"
    if prefix.startswith(b"\x1a\x45\xdf\xa3"):
        return "webm"
    if len(prefix) >= 8 and prefix[4:8] == b"ftyp":
        return "m4a"
    if prefix.startswith(b"ID3") or (
        len(prefix) >= 2 and prefix[0] == 0xFF and prefix[1] & 0xE0 == 0xE0
    ):
        return "mp3"
    return None


async def _store_audio_upload(file: UploadFile) -> tuple[str, int, str]:
    """Stream a bounded upload to a temporary file and atomically preserve it."""
    os.makedirs(AUDIO_STORAGE, exist_ok=True)
    fd, temp_path = tempfile.mkstemp(prefix=".upload-", dir=AUDIO_STORAGE)
    digest = hashlib.sha256()
    size = 0
    prefix = b""
    try:
        with os.fdopen(fd, "wb") as output:
            os.chmod(temp_path, 0o600)
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_AUDIO_SIZE_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail=f"Audio exceeds the {MAX_AUDIO_SIZE_MB} MB upload limit.",
                    )
                if len(prefix) < 64:
                    prefix += chunk[: 64 - len(prefix)]
                digest.update(chunk)
                output.write(chunk)
            output.flush()
            os.fsync(output.fileno())

        detected_format = _audio_format(prefix)
        if size == 0 or detected_format is None:
            raise HTTPException(
                status_code=415,
                detail="The file is empty or is not a supported audio format.",
            )

        declared_type = (file.content_type or "").split(";", 1)[0].strip().lower()
        if declared_type not in AUDIO_FORMATS[detected_format]:
            raise HTTPException(
                status_code=415,
                detail="The file content does not match its declared audio type.",
            )

        original_extension = os.path.splitext(file.filename or "")[1].lower()
        accepted_extensions = {
            "wav": {".wav"},
            "mp3": {".mp3"},
            "m4a": {".m4a", ".mp4"},
            "ogg": {".ogg", ".oga"},
            "webm": {".webm"},
            "flac": {".flac"},
        }
        if (
            original_extension
            and original_extension not in accepted_extensions[detected_format]
        ):
            raise HTTPException(
                status_code=415,
                detail="The file extension does not match the audio content.",
            )

        filename = f"{uuid.uuid4()}.{detected_format}"
        final_path = os.path.join(AUDIO_STORAGE, filename)
        os.replace(temp_path, final_path)
        return filename, size, digest.hexdigest()
    except Exception:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise


@app.post("/api/v1/audio/upload")
@app.post("/api/upload")
async def upload_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = Form(...),
    language: str = Form(...),
    dialect: Optional[str] = Form(None),
    consent: bool = Form(False),
    transcription_consent: bool = Form(False),
):
    """Store a consented audio master and optionally queue consented transcription."""
    if not consent:
        raise HTTPException(
            status_code=400,
            detail="Consent is required before the recording can be stored.",
        )
    if not title.strip() or not language.strip():
        raise HTTPException(
            status_code=422,
            detail="Title and contributor-selected language are required.",
        )

    unique_filename, file_size, audio_sha256 = await _store_audio_upload(file)

    audio_url = f"/storage/audio/{unique_filename}"
    unique_uuid = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    initial_transcript = ""
    status_label = "Awaiting transcription"
    transcription_status = "queued" if transcription_consent else "not_requested"
    transcription_consent_at = now if transcription_consent else None
    transcription_consent_version = (
        TRANSCRIPTION_CONSENT_VERSION if transcription_consent else None
    )

    # Insert into SQLite. Roll back the just-created file if registration fails.
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO transcripts (
                    uuid_id, title, audio_filename, audio_url, language,
                    dialect, transcript_text, status, duration_seconds,
                    created_at, updated_at, audio_sha256, file_size_bytes,
                    consent_at, consent_version, transcription_status,
                    transcription_consent_at, transcription_consent_version
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    unique_uuid,
                    title.strip(),
                    unique_filename,
                    audio_url,
                    language,
                    dialect or "Standard / Unspecified",
                    initial_transcript,
                    status_label,
                    0.0,
                    now,
                    now,
                    audio_sha256,
                    file_size,
                    now,
                    CONSENT_VERSION,
                    transcription_status,
                    transcription_consent_at,
                    transcription_consent_version,
                ),
            )
            conn.commit()
            transcript_id = cursor.lastrowid
    except Exception:
        stored_path = os.path.join(AUDIO_STORAGE, unique_filename)
        if os.path.exists(stored_path):
            os.remove(stored_path)
        raise

    if transcription_consent:
        background_tasks.add_task(process_saved_transcription, transcript_id)

    return {
        "success": True,
        "id": transcript_id,
        "uuid_id": unique_uuid,
        "title": title,
        "audio_url": audio_url,
        "language": language,
        "dialect": dialect,
        "transcript_text": initial_transcript,
        "status": status_label,
        "machine_transcript_text": initial_transcript,
        "transcription_status": transcription_status,
        "transcription_error": None,
        "transcription_provider": None,
        "transcription_model": None,
        "transcription_consent_at": transcription_consent_at,
        "transcription_consent_version": transcription_consent_version,
        "transcribed_at": None,
        "created_at": now,
        "audio_sha256": audio_sha256,
        "file_size_bytes": file_size,
        "consent_at": now,
        "consent_version": CONSENT_VERSION,
        "notice": (
            "Audio master saved unchanged. Transcription was queued after separate transcription consent."
            if transcription_consent
            else "Audio master saved unchanged. Transcription was not requested."
        ),
    }


@app.post("/api/v1/transcriptions/{transcript_id}/transcribe")
@app.post("/api/transcripts/{transcript_id}/transcribe")
def request_transcription(
    transcript_id: int,
    payload: TranscriptionRequest,
    background_tasks: BackgroundTasks,
):
    """Queue transcription only after the caller explicitly confirms consent."""
    if not payload.transcription_consent:
        raise HTTPException(
            status_code=400,
            detail="Separate transcription consent is required before audio is sent to the configured provider.",
        )

    now = datetime.now(timezone.utc).isoformat()
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            "SELECT * FROM transcripts WHERE id = ? AND archived_at IS NULL",
            (transcript_id,),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Transcript not found")
        if row["transcription_status"] in {"queued", "processing"}:
            return {
                "success": True,
                "id": transcript_id,
                "transcription_status": row["transcription_status"],
                "transcript_text": row["transcript_text"],
                "machine_transcript_text": row["machine_transcript_text"],
                "transcription_error": row["transcription_error"],
            }
        conn.execute(
            """
            UPDATE transcripts
            SET transcription_status = 'queued', transcription_error = NULL,
                transcription_consent_at = ?, transcription_consent_version = ?,
                updated_at = ?
            WHERE id = ? AND archived_at IS NULL
            """,
            (now, TRANSCRIPTION_CONSENT_VERSION, now, transcript_id),
        )
        conn.commit()

    background_tasks.add_task(process_saved_transcription, transcript_id)
    return {
        "success": True,
        "id": transcript_id,
        "transcription_status": "queued",
        "transcript_text": row["transcript_text"],
        "machine_transcript_text": row["machine_transcript_text"],
        "transcription_error": None,
        "message": "Transcription was queued. Poll the recording endpoint for its result.",
    }


@app.patch("/api/v1/transcriptions/{transcript_id}")
@app.put("/api/transcripts/{transcript_id}")
def update_transcript(transcript_id: int, payload: TranscriptUpdate):
    """Update title, dialect, or editable transcript text for a saved recording."""
    now = datetime.now(timezone.utc).isoformat()
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM transcripts WHERE id = ? AND archived_at IS NULL",
            (transcript_id,),
        )
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Transcript not found")

        updates = []
        params = []
        if payload.title is not None:
            updates.append("title = ?")
            params.append(payload.title)
        if payload.transcript_text is not None:
            updates.append("transcript_text = ?")
            params.append(payload.transcript_text)
            updates.append("status = ?")
            params.append("Community Edited")
        if payload.dialect is not None:
            updates.append("dialect = ?")
            params.append(payload.dialect)

        updates.append("updated_at = ?")
        params.append(now)
        params.append(transcript_id)

        sql = f"UPDATE transcripts SET {', '.join(updates)} WHERE id = ?"
        cursor.execute(sql, params)
        conn.commit()

    return {
        "success": True,
        "message": "Transcript updated successfully",
        "id": transcript_id,
    }


@app.delete("/api/v1/transcriptions/{transcript_id}")
@app.delete("/api/transcripts/{transcript_id}")
def delete_transcript(transcript_id: int):
    """Hide a transcript from the active archive without deleting its audio."""
    now = datetime.now(timezone.utc).isoformat()
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE transcripts SET archived_at = ?, updated_at = ? "
            "WHERE id = ? AND archived_at IS NULL",
            (now, now, transcript_id),
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Transcript not found")
        conn.commit()
    return {
        "success": True,
        "message": f"Transcript {transcript_id} archived; original audio retained",
    }


@app.get("/api/v1/archive/search")
def search_archive(
    q: Optional[str] = None,
    language: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
):
    """Search saved titles/transcripts with optional metadata filters."""
    if page < 1 or not 1 <= page_size <= 100:
        raise HTTPException(status_code=422, detail="Invalid page or page_size.")

    conditions = ["archived_at IS NULL"]
    params: list[object] = []
    if q and q.strip():
        conditions.append("(title LIKE ? OR transcript_text LIKE ?)")
        term = f"%{q.strip()}%"
        params.extend([term, term])
    if language:
        conditions.append("language = ?")
        params.append(language)
    if status:
        conditions.append("status = ?")
        params.append(status)
    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    offset = (page - 1) * page_size

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        total = conn.execute(
            f"SELECT COUNT(*) FROM transcripts {where}", params
        ).fetchone()[0]
        rows = conn.execute(
            f"SELECT * FROM transcripts {where} ORDER BY id DESC LIMIT ? OFFSET ?",
            [*params, page_size, offset],
        ).fetchall()
    return {
        "transcripts": [dict(row) for row in rows],
        "count": total,
        "page": page,
        "page_size": page_size,
    }
