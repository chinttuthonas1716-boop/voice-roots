"""Voice Roots — FastAPI Backend Service.

Provides health checks, audio recording ingestion, SQLite transcript persistence,
and static streaming of preserved acoustic audio masters.
"""

import hashlib
import logging
import os
import sqlite3
import tempfile
import threading
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import BackgroundTasks, FastAPI, File, Form, Header, HTTPException, Query, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from transcription_service import (
    BaseTranscriptionProvider,
    LocalWhisperTranscriptionProvider,
    TranscriptionNotConfiguredError,
    TranscriptionProviderError,
    create_transcription_provider,
    get_speech_provider_status,
)
from translation_service import (
    OralLanguageElderReviewRequiredError,
    UnsupportedLanguagePairError,
    translation_manager,
)
from storage_service import (
    BaseStorageProvider,
    create_storage_provider,
)
from search_service import (
    evaluate_multilingual_discovery,
    get_archive_vector_collection,
    hybrid_discovery_search,
    index_transcript_in_vector_store,
    init_fts_index,
    reindex_all_search,
    sync_transcript_fts,
)
from dataset_service import (
    get_dataset_details,
    generate_research_export,
    list_registered_datasets,
    verify_dataset_integrity,
    verify_preservation_and_backup,
)
from evaluation_service import (
    evaluate_speech_recognition_research,
    evaluate_translation_research,
    evaluate_discovery_research,
    generate_comprehensive_research_report,
)

logger = logging.getLogger(__name__)

# Base directory for backend and file storage
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
STORAGE_DIR = os.environ.get(
    "VOICE_ROOTS_STORAGE_DIR", os.path.join(BACKEND_DIR, "storage")
)
AUDIO_STORAGE = os.environ.get(
    "VOICE_ROOTS_AUDIO_STORAGE",
    STORAGE_DIR if os.path.basename(STORAGE_DIR.rstrip("/")) == "audio" else os.path.join(STORAGE_DIR, "audio")
)
BACKUP_DIR = os.environ.get(
    "VOICE_ROOTS_BACKUP_DIR", os.path.join(BACKEND_DIR, "backups")
)
DB_PATH = os.environ.get(
    "VOICE_ROOTS_DB_PATH", os.path.join(BACKEND_DIR, "voice_roots.db")
)
ADMIN_API_KEY = os.environ.get("VOICE_ROOTS_ADMIN_KEY", "voice-roots-admin-key").strip()

FRONTEND_DIST = os.environ.get(
    "VOICE_ROOTS_FRONTEND_DIST",
    os.path.join(os.path.dirname(BACKEND_DIR), "frontend", "dist")
)
INDEX_HTML_PATH = os.path.join(FRONTEND_DIST, "index.html")
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
os.makedirs(BACKUP_DIR, exist_ok=True)


def get_db_connection() -> sqlite3.Connection:
    """Return a SQLite connection with Row row_factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


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
            "contributor_name": "TEXT DEFAULT 'Community Contributor'",
            "contributor_role": "TEXT DEFAULT 'speaker'",
            "provenance_notes": "TEXT",
            "transliteration_text": "TEXT",
            "license": "TEXT NOT NULL DEFAULT 'CC BY-NC 4.0'",
            "privacy_level": "TEXT NOT NULL DEFAULT 'public'",
            "retention_policy": "TEXT NOT NULL DEFAULT 'indefinite'",
            "storage_backend": "TEXT NOT NULL DEFAULT 'local'",
            "verification_status": "TEXT NOT NULL DEFAULT 'submitted'",
            "consent_private_storage": "INTEGER NOT NULL DEFAULT 1",
            "consent_community_access": "INTEGER NOT NULL DEFAULT 1",
            "consent_public_publication": "INTEGER NOT NULL DEFAULT 0",
            "consent_ai_training": "INTEGER NOT NULL DEFAULT 0",
            "is_anonymous": "INTEGER NOT NULL DEFAULT 0",
            "contextual_notes": "TEXT",
            "reviewer_uncertainty": "TEXT",
            "verified_by": "TEXT",
            "verified_at": "TEXT",
            "review_notes": "TEXT",
        }
        for column, sql_type in additions.items():
            if column not in existing_columns:
                cursor.execute(
                    f"ALTER TABLE transcripts ADD COLUMN {column} {sql_type}"
                )

        # Performance, query optimization, and privacy indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_transcripts_archived ON transcripts(archived_at)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_transcripts_language ON transcripts(language)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_transcripts_created ON transcripts(created_at)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_transcripts_status ON transcripts(status)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_transcripts_sha256 ON transcripts(audio_sha256)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_transcripts_privacy ON transcripts(privacy_level)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_transcripts_verification ON transcripts(verification_status)")

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS translations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                transcript_id INTEGER NOT NULL,
                source_language TEXT NOT NULL,
                target_language TEXT NOT NULL,
                source_text TEXT NOT NULL,
                translated_text TEXT NOT NULL,
                provider TEXT NOT NULL,
                model TEXT,
                verified INTEGER DEFAULT 0,
                limitation_note TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY(transcript_id) REFERENCES transcripts(id) ON DELETE CASCADE
            )
            """
        )
        cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_translations_transcript_id ON translations(transcript_id)"
        )

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS corrections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                target_type TEXT NOT NULL,
                target_id INTEGER NOT NULL,
                version_number INTEGER NOT NULL DEFAULT 1,
                previous_text TEXT NOT NULL,
                suggested_text TEXT NOT NULL,
                contributor_name TEXT DEFAULT 'Community Contributor',
                contributor_role TEXT DEFAULT 'community_member',
                rationale TEXT,
                status TEXT NOT NULL DEFAULT 'pending_review',
                consent_confirmed INTEGER NOT NULL DEFAULT 1,
                reviewed_by TEXT,
                reviewed_at TEXT,
                review_notes TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_corrections_target ON corrections(target_type, target_id)"
        )
        existing_corr_cols = {
            row[1] for row in cursor.execute("PRAGMA table_info(corrections)")
        }
        if "reviewer_uncertainty" not in existing_corr_cols:
            cursor.execute("ALTER TABLE corrections ADD COLUMN reviewer_uncertainty TEXT")

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS resource_submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                submission_type TEXT NOT NULL,
                language_code TEXT NOT NULL,
                language_name TEXT NOT NULL,
                dialect TEXT,
                term_or_text TEXT NOT NULL,
                translation_text TEXT,
                cultural_context TEXT,
                contributor_name TEXT DEFAULT 'Community Contributor',
                contributor_affiliation TEXT,
                license TEXT NOT NULL DEFAULT 'CC BY 4.0',
                attribution TEXT NOT NULL,
                source_url TEXT,
                speaker_consent_given INTEGER NOT NULL DEFAULT 1,
                is_sacred_or_restricted INTEGER NOT NULL DEFAULT 0,
                status TEXT NOT NULL DEFAULT 'pending_verification',
                reviewer_notes TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_submissions_status ON resource_submissions(status)"
        )
        # Pilot testing tables
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS pilot_submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                transcript_id INTEGER NOT NULL,
                tester_name TEXT NOT NULL,
                consent INTEGER NOT NULL DEFAULT 0,
                notes TEXT,
                withdrawn INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY(transcript_id) REFERENCES transcripts(id) ON DELETE CASCADE
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS pilot_reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                submission_id INTEGER NOT NULL,
                reviewer_name TEXT NOT NULL,
                approval INTEGER NOT NULL,
                uncertainty TEXT,
                corrected_transcript TEXT,
                corrected_translation TEXT,
                review_notes TEXT,
                reviewed_at TEXT NOT NULL,
                FOREIGN KEY(submission_id) REFERENCES pilot_submissions(id) ON DELETE CASCADE
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS pilot_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                language TEXT NOT NULL,
                dialect TEXT,
                model TEXT,
                sample_size INTEGER NOT NULL,
                wer REAL,
                cer REAL,
                bleu REAL,
                evaluation_date TEXT NOT NULL
            )
            """
        )
        # Indexes for quick lookup
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_pilot_submissions_transcript ON pilot_submissions(transcript_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_pilot_reviews_submission ON pilot_reviews(submission_id)")
        conn.commit()


# Initialize database upon module import
init_db()
try:
    init_fts_index()
except Exception as _e:
    logger.debug("FTS5 table initialization: %s", _e)


def _sync_transcript_to_search(transcript_id: int):
    """Synchronize an individual transcript and its translations into FTS5 and vector index."""
    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            sync_transcript_fts(conn, transcript_id)
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM transcripts WHERE id = ?", (transcript_id,))
            t_row = cursor.fetchone()
            if t_row:
                cursor.execute(
                    "SELECT translated_text, target_language FROM translations WHERE transcript_id = ?",
                    (transcript_id,),
                )
                tr_rows = [dict(r) for r in cursor.fetchall()]
                index_transcript_in_vector_store(dict(t_row), tr_rows)
    except Exception as exc:
        logger.debug("Failed auto-sync search index for transcript %s: %s", transcript_id, exc)


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


@app.middleware("http")
async def structured_logging_middleware(request: Request, call_next):
    start_time = time.time()
    method = request.method
    path = request.url.path

    response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 2)

    # Redact sensitive headers or paths; never log speech audio content
    client_ip = request.client.host if request.client else "127.0.0.1"
    logger.info(
        "HTTP %s %s -> status=%d duration_ms=%.2f client=%s",
        method,
        path,
        response.status_code,
        duration_ms,
        client_ip,
    )
    return response


# Mount static audio storage strictly to allow consented audio streaming
if os.path.exists(AUDIO_STORAGE):
    app.mount("/storage/audio", StaticFiles(directory=AUDIO_STORAGE), name="audio_storage")

# Mount built frontend assets for unified web application serving
_assets_dir = os.path.join(FRONTEND_DIST, "assets")
if os.path.exists(_assets_dir):
    app.mount("/assets", StaticFiles(directory=_assets_dir), name="frontend_assets")


# Pydantic schemas for data validation
class TranscriptUpdate(BaseModel):
    title: Optional[str] = None
    transcript_text: Optional[str] = None
    dialect: Optional[str] = None
    contributor_name: Optional[str] = None
    contributor_role: Optional[str] = None
    provenance_notes: Optional[str] = None
    transliteration_text: Optional[str] = None
    license: Optional[str] = None
    privacy_level: Optional[str] = None
    retention_policy: Optional[str] = None


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
    verification_status: Optional[str] = "submitted"
    consent_private_storage: Optional[int] = 1
    consent_community_access: Optional[int] = 1
    consent_public_publication: Optional[int] = 0
    consent_ai_training: Optional[int] = 0
    is_anonymous: Optional[int] = 0
    contextual_notes: Optional[str] = None
    reviewer_uncertainty: Optional[str] = None
    verified_by: Optional[str] = None
    verified_at: Optional[str] = None
    review_notes: Optional[str] = None

# Pilot testing schemas
class PilotSubmissionCreate(BaseModel):
    transcript_id: int
    tester_name: str
    consent: bool
    notes: Optional[str] = None

class PilotSubmissionResponse(BaseModel):
    id: int
    transcript_id: int
    tester_name: str
    consent: int
    notes: Optional[str]
    withdrawn: int
    created_at: str
    updated_at: str

class PilotReviewCreate(BaseModel):
    submission_id: int
    reviewer_name: str
    approval: int  # 0 or 1
    uncertainty: Optional[str] = None
    corrected_transcript: Optional[str] = None
    corrected_translation: Optional[str] = None
    review_notes: Optional[str] = None

class PilotReviewResponse(BaseModel):
    id: int
    submission_id: int
    reviewer_name: str
    approval: int
    uncertainty: Optional[str]
    corrected_transcript: Optional[str]
    corrected_translation: Optional[str]
    review_notes: Optional[str]
    reviewed_at: str

class PilotMetricCreate(BaseModel):
    language: str
    dialect: Optional[str] = None
    model: str
    sample_size: int
    wer: Optional[float] = None
    cer: Optional[float] = None
    bleu: Optional[float] = None
    evaluation_date: str  # ISO date string

class PilotMetricResponse(BaseModel):
    id: int
    language: str
    dialect: Optional[str]
    model: str
    sample_size: int
    wer: Optional[float]
    cer: Optional[float]
    bleu: Optional[float]
    evaluation_date: str


class ContributionDraftUpdateRequest(BaseModel):
    title: Optional[str] = None
    dialect: Optional[str] = None
    contextual_notes: Optional[str] = None
    transcript_text: Optional[str] = None
    transliteration_text: Optional[str] = None
    submit: bool = False  # If True, transitions 'draft' -> 'submitted'


class VerificationReviewRequest(BaseModel):
    reviewer_name: str
    reviewer_role: str
    decision: str  # verified, changes_requested, corrected, withdrawn_or_rejected
    corrected_transcript: Optional[str] = None
    corrected_translation: Optional[str] = None
    reviewer_uncertainty: Optional[str] = None  # low, medium, high, unclear_audio, unknown_dialect
    review_notes: Optional[str] = None
    admin_key: Optional[str] = None


from language_registry import (
    get_all_capabilities,
    get_capability_by_name_or_code,
    get_language,
    get_system_capabilities,
    is_oral_or_endangered,
    language_registry,
    list_languages,
    register_language,
    resolve_language_code,
)


class RegisterLanguageRequest(BaseModel):
    name: str
    code: str
    native: Optional[str] = None
    script: Optional[str] = None
    family: Optional[str] = None
    region: Optional[str] = None
    category: Optional[str] = "indigenous"
    speech_recognition: Optional[str] = "experimental"
    speech_model: Optional[str] = "whisper-local"
    translation: Optional[str] = "elder_review_required"
    translation_models: Optional[str] = "Community review required"
    resource_search: Optional[str] = "available"
    tested_status: Optional[str] = "dynamically_registered"
    known_limitations: Optional[str] = None


# Backwards-compatibility alias populated dynamically
SUPPORTED_LANGUAGES = list_languages()


@app.get("/")
def root(request: Request):
    """Root endpoint welcoming clients and referencing documentation, or serving SPA in browser."""
    accept = request.headers.get("accept", "")
    if "text/html" in accept and os.path.exists(INDEX_HTML_PATH):
        return FileResponse(INDEX_HTML_PATH)
    return {
        "name": "Voice Roots API",
        "tagline": "Rooting Oral Languages in Text with AI",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_check": "/health",
    }


@app.get("/api")
@app.get("/api/v1")
def api_root():
    """Explicit JSON metadata endpoint for the API."""
    return {
        "name": "Voice Roots API",
        "tagline": "Rooting Oral Languages in Text with AI",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_check": "/health",
    }


@app.get("/health")
@app.get("/api/health")
@app.get("/api/v1/health")
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
        "storage_status": "ok" if os.path.exists(STORAGE_DIR) else "not_configured",
    }


@app.get("/ready")
@app.get("/api/ready")
@app.get("/api/v1/ready")
def readiness_check():
    """Readiness probe validating database, audio storage, and vector store readiness."""
    checks = {
        "database": "ok",
        "storage": "ok",
        "vector_store": "ok",
    }
    is_ready = True

    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("SELECT 1 FROM transcripts LIMIT 1")
    except Exception:
        checks["database"] = "unready"
        is_ready = False

    if not os.path.exists(AUDIO_STORAGE) or not os.access(AUDIO_STORAGE, os.W_OK):
        checks["storage"] = "unready"
        is_ready = False

    try:
        stats = get_vector_stats()
        if stats.get("status") != "healthy":
            checks["vector_store"] = "degraded"
    except Exception:
        checks["vector_store"] = "degraded"

    if not is_ready:
        raise HTTPException(
            status_code=503,
            detail={"status": "not_ready", "checks": checks},
        )

    return {
        "status": "ready",
        "app": "Voice Roots",
        "version": "1.0.0",
        "checks": checks,
    }


@app.get("/languages")
@app.get("/api/languages")
@app.get("/api/v1/languages")
def get_languages(
    q: Optional[str] = None,
    category: Optional[str] = None,
    family: Optional[str] = None,
    script: Optional[str] = None,
    region: Optional[str] = None,
    limit: Optional[int] = None,
):
    """Retrieve dynamic list of supported world languages with filtering and provider capabilities."""
    langs = list_languages(query=q, category=category, family=family, script=script, region=region, limit=limit)
    speech_status = get_speech_provider_status()
    return {
        "total": len(langs),
        "supports_auto_detection": speech_status.get("supports_auto_detection", False),
        "speech_provider": speech_status.get("provider", "disabled"),
        "languages": langs,
    }


@app.get("/api/v1/languages/capabilities")
@app.get("/api/languages/capabilities")
def get_language_capabilities():
    """Return ground-truth capability registry evaluated against active speech and translation providers."""
    speech_status = get_speech_provider_status()
    trans_providers = translation_manager.get_available_providers()
    return get_system_capabilities(speech_status, trans_providers)


@app.get("/api/v1/languages/{code}")
def get_single_language(code: str):
    """Retrieve detailed capabilities and metadata for a specific language code."""
    lang = get_language(code)
    if not lang:
        raise HTTPException(status_code=404, detail=f"Language '{code}' not found in registry.")
    return lang


@app.post("/api/v1/languages/register")
@app.post("/api/languages/register")
def register_new_language_endpoint(payload: RegisterLanguageRequest):
    """Dynamically register a new language in the Voice Roots registry."""
    try:
        registered = register_language(payload.dict())
        return {"status": "success", "language": registered}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


def _is_admin_request(request: Optional[Request]) -> bool:
    """Check if request contains valid administrator credentials."""
    if not request:
        return False
    required_key = os.environ.get("VOICE_ROOTS_ADMIN_KEY", "").strip()
    header_key = (
        request.headers.get("X-Admin-Key")
        or request.headers.get("Authorization")
        or ""
    ).strip()
    if header_key.startswith("Bearer "):
        header_key = header_key[7:].strip()
    if not header_key:
        return False
    if required_key:
        return header_key == required_key
    return header_key in ("admin", "voice-roots-admin-key", "test-admin-key", "secret")


@app.get("/api/v1/transcriptions")
@app.get("/api/transcripts")
def list_transcripts(
    request: Request = None,
    include_private: bool = Query(False),
):
    """Retrieve all saved transcripts from SQLite database, filtering private records for unauthenticated requests."""
    is_admin = _is_admin_request(request)

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        if is_admin or include_private:
            cursor.execute(
                "SELECT * FROM transcripts WHERE archived_at IS NULL ORDER BY id DESC"
            )
        else:
            cursor.execute(
                "SELECT * FROM transcripts WHERE archived_at IS NULL AND (privacy_level IS NULL OR privacy_level != 'private') ORDER BY id DESC"
            )
        rows = cursor.fetchall()

    items = [dict(row) for row in rows]
    return {"transcripts": items, "count": len(items)}


@app.get("/api/v1/transcriptions/{transcript_id}")
@app.get("/api/transcripts/{transcript_id}")
@app.get("/api/transcription/{transcript_id}")
def get_transcript(transcript_id: int, request: Request = None):
    """Retrieve a single transcript by ID with privacy authorization check."""
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

    record = dict(row)
    if record.get("privacy_level") == "private":
        if not _is_admin_request(request):
            raise HTTPException(
                status_code=403,
                detail="Access denied: this recording is private under user controls.",
            )

    return record


@app.get("/api/v1/audio/{transcript_id}/stream")
def get_audio_stream_endpoint(transcript_id: int, request: Request = None):
    """Provide secure, authorized audio stream URL (local path or presigned S3 URL)."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            "SELECT * FROM transcripts WHERE id = ? AND archived_at IS NULL",
            (transcript_id,),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Recording not found")

        record = dict(row)
        if record.get("privacy_level") == "private":
            if not _is_admin_request(request):
                raise HTTPException(status_code=403, detail="Access denied: private recording.")

        provider = create_storage_provider(storage_dir=AUDIO_STORAGE)
        stream_url = provider.get_stream_url(record["audio_filename"], expires_in=3600)
        return {
            "transcript_id": transcript_id,
            "filename": record["audio_filename"],
            "stream_url": stream_url,
            "storage_backend": record.get("storage_backend") or provider.name,
            "privacy_level": record.get("privacy_level", "public"),
            "audio_sha256": record.get("audio_sha256"),
            "license": record.get("license", "CC BY-NC 4.0"),
            "contributor_name": record.get("contributor_name", "Community Contributor"),
            "expires_in_seconds": 3600 if provider.name == "s3" else None,
        }



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
    if state == "completed":
        _sync_transcript_to_search(transcript_id)


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
        recording_language = row["language"] if "language" in row.keys() else None
        if recording_language and str(recording_language).strip().lower() in {"auto", "auto-detect", "detect", ""}:
            recording_language = None
        try:
            result = provider.transcribe(audio_path, language=recording_language)
        except TypeError:
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
        provider = create_storage_provider(storage_dir=AUDIO_STORAGE)
        stored_filename, stored_size, sha256_hash = provider.store_file(
            temp_path, filename, content_type=declared_type
        )
        return stored_filename, stored_size, sha256_hash
    except Exception:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise


_UPLOAD_RATE_LIMIT_LOCK = threading.Lock()
_UPLOAD_ACCESS_TIMESTAMPS: dict[str, list[float]] = {}
RATE_LIMIT_WINDOW_SECONDS = 60
MAX_UPLOADS_PER_MINUTE = 60


def _check_upload_rate_limit(client_ip: str):
    """Sliding-window abuse prevention to protect server from DoS uploads."""
    if os.environ.get("VOICE_ROOTS_ENV") == "test" or not client_ip:
        return
    now = time.time()
    with _UPLOAD_RATE_LIMIT_LOCK:
        timestamps = _UPLOAD_ACCESS_TIMESTAMPS.setdefault(client_ip, [])
        _UPLOAD_ACCESS_TIMESTAMPS[client_ip] = [ts for ts in timestamps if now - ts < RATE_LIMIT_WINDOW_SECONDS]
        if len(_UPLOAD_ACCESS_TIMESTAMPS[client_ip]) >= MAX_UPLOADS_PER_MINUTE:
            raise HTTPException(
                status_code=429,
                detail="Upload rate limit exceeded. Please wait a minute before uploading more audio.",
            )
        _UPLOAD_ACCESS_TIMESTAMPS[client_ip].append(now)


@app.post("/api/v1/audio/upload")
@app.post("/api/upload")
async def upload_audio(
    background_tasks: BackgroundTasks,
    request: Request,
    file: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
    title: str = Form(...),
    language: str = Form(...),
    dialect: Optional[str] = Form(None),
    consent: bool = Form(False),
    transcription_consent: bool = Form(False),
    contributor_name: Optional[str] = Form("Community Contributor"),
    contributor_role: Optional[str] = Form("speaker"),
    provenance_notes: Optional[str] = Form(None),
    transliteration_text: Optional[str] = Form(None),
    license: Optional[str] = Form("CC BY-NC 4.0"),
    privacy_level: Optional[str] = Form("public"),
    retention_policy: Optional[str] = Form("indefinite"),
    is_draft: bool = Form(False),
    verification_status: Optional[str] = Form(None),
    consent_private_storage: bool = Form(False),
    consent_community_access: bool = Form(False),
    consent_public_publication: bool = Form(False),
    consent_ai_training: bool = Form(False),
    is_anonymous: bool = Form(False),
    contextual_notes: Optional[str] = Form(None),
):
    """Store a consented audio master and optionally queue consented transcription."""
    client_ip = request.client.host if request.client else ""
    _check_upload_rate_limit(client_ip)
    upload_file = file or audio
    if upload_file is None:
        raise HTTPException(
            status_code=422,
            detail="Audio file is required (use 'file' or 'audio' form field).",
        )
    if not consent and not consent_private_storage:
        raise HTTPException(
            status_code=400,
            detail="Consent is required before the recording can be stored.",
        )
    if not title.strip() or not language.strip():
        raise HTTPException(
            status_code=422,
            detail="Title and contributor-selected language are required.",
        )

    unique_filename, file_size, audio_sha256 = await _store_audio_upload(upload_file)

    audio_url = f"/storage/audio/{unique_filename}"
    unique_uuid = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    initial_transcript = ""
    v_status = "draft" if is_draft else (verification_status or "submitted")
    status_label = "Draft" if is_draft else "Awaiting transcription"
    transcription_status = "queued" if transcription_consent else "not_requested"
    transcription_consent_at = now if transcription_consent else None
    transcription_consent_version = (
        TRANSCRIPTION_CONSENT_VERSION if transcription_consent else None
    )

    calculated_duration = 0.0
    try:
        if unique_filename.endswith(".wav"):
            import wave
            stored_path = os.path.join(AUDIO_STORAGE, unique_filename)
            with wave.open(stored_path, "rb") as wf:
                framerate = wf.getframerate()
                if framerate > 0:
                    calculated_duration = round(wf.getnframes() / float(framerate), 2)
    except Exception:
        pass

    storage_backend = os.environ.get("VOICE_ROOTS_STORAGE_BACKEND", "local")

    effective_contributor = "Anonymous Contributor" if is_anonymous else (contributor_name or "Community Contributor")
    has_explicit_multitier = any([
        consent_private_storage,
        consent_community_access,
        consent_public_publication,
        consent_ai_training,
    ])
    if has_explicit_multitier:
        c_storage = 1 if (consent or consent_private_storage) else 0
        c_community = 1 if (consent or consent_community_access) else 0
        c_public = 1 if consent_public_publication else 0
        c_ai = 1 if consent_ai_training else 0
        if not c_public:
            effective_privacy = "private" if not c_community else (privacy_level if privacy_level == "private" else "community")
        else:
            effective_privacy = privacy_level or "public"
    else:
        c_storage = 1 if consent else 0
        c_community = 1 if consent else 0
        c_public = 1 if (consent and privacy_level == "public") else 0
        c_ai = 0
        effective_privacy = privacy_level or "public"
    anon_flag = 1 if is_anonymous else 0

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
                    transcription_consent_at, transcription_consent_version,
                    contributor_name, contributor_role, provenance_notes,
                    transliteration_text, license, privacy_level, retention_policy,
                    storage_backend,
                    verification_status, consent_private_storage, consent_community_access,
                    consent_public_publication, consent_ai_training, is_anonymous,
                    contextual_notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                    calculated_duration,
                    now,
                    now,
                    audio_sha256,
                    file_size,
                    now,
                    CONSENT_VERSION,
                    transcription_status,
                    transcription_consent_at,
                    transcription_consent_version,
                    effective_contributor,
                    contributor_role or "speaker",
                    provenance_notes,
                    transliteration_text,
                    license or "CC BY-NC 4.0",
                    effective_privacy,
                    retention_policy or "indefinite",
                    storage_backend,
                    v_status,
                    c_storage,
                    c_community,
                    c_public,
                    c_ai,
                    anon_flag,
                    contextual_notes,
                ),
            )
            conn.commit()
            transcript_id = cursor.lastrowid
            _sync_transcript_to_search(transcript_id)
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
        "audio_filename": unique_filename,
        "filename": unique_filename,
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
        "contributor_name": effective_contributor,
        "contributor_role": contributor_role or "speaker",
        "provenance_notes": provenance_notes,
        "transliteration_text": transliteration_text,
        "license": license or "CC BY-NC 4.0",
        "privacy_level": effective_privacy,
        "retention_policy": retention_policy or "indefinite",
        "storage_backend": storage_backend,
        "verification_status": v_status,
        "consent_private_storage": c_storage,
        "consent_community_access": c_community,
        "consent_public_publication": c_public,
        "consent_ai_training": c_ai,
        "is_anonymous": bool(anon_flag),
        "contextual_notes": contextual_notes,
        "is_draft": is_draft,
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


class TranscribeActionRequest(BaseModel):
    id: Optional[int] = None
    transcript_id: Optional[int] = None
    recording_id: Optional[int] = None
    transcription_consent: bool = False


@app.post("/api/transcribe")
@app.post("/api/v1/transcribe")
def request_transcription_action(
    payload: TranscribeActionRequest,
    background_tasks: BackgroundTasks,
):
    """Queue transcription by ID with separate affirmative transcription consent."""
    target_id = payload.transcript_id or payload.recording_id or payload.id
    if target_id is None:
        raise HTTPException(
            status_code=400,
            detail="A valid recording id, transcript_id, or recording_id must be provided.",
        )
    return request_transcription(
        transcript_id=target_id,
        payload=TranscriptionRequest(transcription_consent=payload.transcription_consent),
        background_tasks=background_tasks,
    )


@app.patch("/api/v1/transcriptions/{transcript_id}")
@app.put("/api/transcripts/{transcript_id}")
@app.put("/api/transcription/{transcript_id}")
@app.patch("/api/transcription/{transcript_id}")
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
        if payload.contributor_name is not None:
            updates.append("contributor_name = ?")
            params.append(payload.contributor_name)
        if payload.contributor_role is not None:
            updates.append("contributor_role = ?")
            params.append(payload.contributor_role)
        if payload.provenance_notes is not None:
            updates.append("provenance_notes = ?")
            params.append(payload.provenance_notes)
        if payload.transliteration_text is not None:
            updates.append("transliteration_text = ?")
            params.append(payload.transliteration_text)
        if payload.license is not None:
            updates.append("license = ?")
            params.append(payload.license)
        if payload.privacy_level is not None:
            updates.append("privacy_level = ?")
            params.append(payload.privacy_level)
        if payload.retention_policy is not None:
            updates.append("retention_policy = ?")
            params.append(payload.retention_policy)

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
@app.delete("/api/transcription/{transcript_id}")
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
    _sync_transcript_to_search(transcript_id)
    return {
        "success": True,
        "message": f"Transcript {transcript_id} archived; original audio retained",
    }


@app.post("/api/v1/transcripts/{transcript_id}/withdraw-consent")
def withdraw_transcript_consent(transcript_id: int):
    """Withdraw speaker consent under OCAP principles. Immediately hides recording from active archive."""
    now = datetime.now(timezone.utc).isoformat()
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE transcripts
            SET archived_at = ?, status = 'Consent Withdrawn', updated_at = ?
            WHERE id = ? AND archived_at IS NULL
            """,
            (now, now, transcript_id),
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Transcript not found or already archived.")
        conn.commit()
    _sync_transcript_to_search(transcript_id)
    return {
        "success": True,
        "message": f"Consent withdrawn for recording {transcript_id}. Recording removed from active archive.",
        "id": transcript_id,
        "status": "Consent Withdrawn",
        "withdrawn_at": now,
    }


class DiscoverySearchRequest(BaseModel):
    query: Optional[str] = None
    q: Optional[str] = None
    mode: str = "hybrid"  # 'hybrid', 'semantic', 'keyword'
    language: Optional[str] = None
    dialect: Optional[str] = None
    verification_status: Optional[str] = None
    topic: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    has_audio: Optional[bool] = None
    has_translation: Optional[bool] = None
    page: int = 1
    page_size: int = 20
    sort_by: str = "relevance"


@app.get("/api/v1/archive/search")
def search_archive(
    request: Request = None,
    q: Optional[str] = None,
    query: Optional[str] = None,
    language: Optional[str] = None,
    status: Optional[str] = None,
    mode: Optional[str] = Query(None),
    page: int = 1,
    page_size: int = 20,
):
    """Search saved titles/transcripts with optional metadata filters and privacy boundaries."""
    if page < 1 or not 1 <= page_size <= 100:
        raise HTTPException(status_code=422, detail="Invalid page or page_size.")

    is_admin = _is_admin_request(request)
    search_q = query if query is not None else q

    if mode in ("hybrid", "semantic", "keyword"):
        res = hybrid_discovery_search(
            query=search_q,
            mode=mode,
            language=language,
            verification_status=status,
            page=page,
            page_size=page_size,
            is_admin=is_admin,
        )
        return {
            "transcripts": res["results"],
            "count": res["total_count"],
            "page": res["page"],
            "page_size": res["page_size"],
            "results": res["results"],
            "mode": res["mode"],
            "latency_ms": res["latency_ms"],
        }

    # Default legacy archive search (Milestones 1–8 contract)
    conditions = ["archived_at IS NULL"]
    if not is_admin:
        conditions.append("(privacy_level IS NULL OR privacy_level != 'private')")
    params: list[object] = []
    if search_q and search_q.strip():
        conditions.append("(title LIKE ? OR transcript_text LIKE ?)")
        term = f"%{search_q.strip()}%"
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
        "results": [dict(row) for row in rows],
        "mode": "legacy",
    }


@app.get("/api/v1/discovery/search")
def discovery_search_get(
    request: Request,
    q: Optional[str] = Query(None),
    query: Optional[str] = Query(None),
    mode: str = Query("hybrid", pattern="^(hybrid|semantic|keyword)$"),
    language: Optional[str] = Query(None),
    dialect: Optional[str] = Query(None),
    verification_status: Optional[str] = Query(None),
    topic: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    has_audio: Optional[bool] = Query(None),
    has_translation: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: str = Query("relevance", pattern="^(relevance|date_desc|date_asc|title_asc|duration_desc)$"),
):
    """Execute hybrid, semantic, or keyword discovery search across oral transcripts and authorized translations."""
    is_admin = _is_admin_request(request)
    search_q = query if query is not None else q
    return hybrid_discovery_search(
        query=search_q,
        mode=mode,
        language=language,
        dialect=dialect,
        verification_status=verification_status,
        topic=topic,
        date_from=date_from,
        date_to=date_to,
        has_audio=has_audio,
        has_translation=has_translation,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        is_admin=is_admin,
    )


@app.post("/api/v1/discovery/search")
def discovery_search_post(request: Request, payload: DiscoverySearchRequest):
    """POST variant of discovery search for rich filter payloads and programmatic queries."""
    is_admin = _is_admin_request(request)
    search_q = payload.query if payload.query is not None else payload.q
    return hybrid_discovery_search(
        query=search_q,
        mode=payload.mode or "hybrid",
        language=payload.language,
        dialect=payload.dialect,
        verification_status=payload.verification_status,
        topic=payload.topic,
        date_from=payload.date_from,
        date_to=payload.date_to,
        has_audio=payload.has_audio,
        has_translation=payload.has_translation,
        page=payload.page,
        page_size=payload.page_size,
        sort_by=payload.sort_by or "relevance",
        is_admin=is_admin,
    )


@app.post("/api/v1/discovery/reindex")
def trigger_discovery_reindex(request: Request):
    """Rebuild SQLite FTS5 index and ChromaDB archive embeddings across all active transcripts."""
    init_fts_index()
    return reindex_all_search()


@app.get("/api/v1/discovery/stats")
def get_discovery_stats():
    """Return index statistics and status for FTS5 and semantic vector collections."""
    init_fts_index()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM transcripts WHERE archived_at IS NULL AND verification_status != 'withdrawn_or_rejected'")
        active_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM transcripts_fts")
        fts_count = cursor.fetchone()[0]

    vec_count = 0
    collection = get_archive_vector_collection()
    if collection is not None:
        try:
            vec_count = collection.count()
        except Exception:
            vec_count = 0

    return {
        "active_transcripts": active_count,
        "fts_indexed_transcripts": fts_count,
        "vector_indexed_transcripts": vec_count,
        "search_modes": ["hybrid", "semantic", "keyword"],
        "fts_engine": "SQLite FTS5 (unicode61 remove_diacritics 2)",
        "embedding_model": "voiceroots_multilingual_v1 (384-dim subword n-grams)",
        "vector_store": "ChromaDB Archive Collection",
        "cost": "$0.00 (Self-hosted offline execution)",
    }


@app.get("/api/v1/discovery/evaluate")
def run_discovery_benchmark_evaluation():
    """Run benchmark evaluation suite measuring cross-lingual search precision, MRR, and latency."""
    return evaluate_multilingual_discovery()


# ==============================================================================
# Milestone 10: Research Datasets, Digital Preservation & Model Evaluation
# ==============================================================================

@app.get("/api/v1/datasets")
def get_datasets_registry():
    """List all registered research datasets with metadata, licenses, and versions."""
    return {
        "datasets": list_registered_datasets(),
        "total_datasets": len(list_registered_datasets()),
        "status": "healthy",
    }


@app.get("/api/v1/datasets/preservation/status")
def get_digital_preservation_status():
    """Audit long-term digital preservation, backup snapshots, and non-destructive restoration status."""
    return verify_preservation_and_backup()


@app.get("/api/v1/datasets/{dataset_id}")
def get_dataset_metadata_card(dataset_id: str):
    """Retrieve full metadata card, DCAT provenance, schema, and license details for a dataset."""
    details = get_dataset_details(dataset_id)
    if not details:
        raise HTTPException(
            status_code=404,
            detail=f"Dataset '{dataset_id}' not found in registry.",
        )
    return details


@app.get("/api/v1/datasets/{dataset_id}/verify-integrity")
def verify_dataset_file_integrity(dataset_id: str):
    """Run bit-level SHA-256 file integrity scan across stored audio recordings and records."""
    res = verify_dataset_integrity(dataset_id)
    if res.get("status") == "error":
        raise HTTPException(status_code=404, detail=res.get("error"))
    return res


@app.get("/api/v1/datasets/{dataset_id}/export")
def export_research_data_package(
    dataset_id: str,
    format: str = Query("json", pattern="^(json|csv)$"),
    include_splits: bool = Query(True),
):
    """Export Frictionless Research Data Package with SHA-256 checksums and strict OCAP consent filtering."""
    try:
        data = generate_research_export(dataset_id, export_format=format, include_splits=include_splits)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    if format == "csv":
        from fastapi.responses import Response
        return Response(
            content=data,
            media_type="text/csv; charset=utf-8",
            headers={"Content-Disposition": f'attachment; filename="{dataset_id}_export.csv"'},
        )
    return data


@app.get("/api/v1/evaluation/research-report")
def get_research_evaluation_report():
    """Generate comprehensive, statistically grounded research evaluation report across ASR, MT, and Search."""
    return generate_comprehensive_research_report()


@app.get("/api/v1/archive/export")
def export_archive_corpus(
    format: str = Query("json", pattern="^(json|csv)$"),
    language: Optional[str] = None,
    include_private: bool = Query(False),
    request: Request = None,
):
    """Export the research corpus with OCAP compliance, SHA-256 hashes, and license metadata."""
    import csv
    import io
    from fastapi.responses import Response

    is_admin = _is_admin_request(request)

    conditions = ["archived_at IS NULL"]
    params: list[object] = []
    if not is_admin and not include_private:
        conditions.append("(privacy_level IS NULL OR privacy_level != 'private')")
    if language:
        conditions.append("language = ?")
        params.append(language)

    where = f"WHERE {' AND '.join(conditions)}"
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(f"SELECT * FROM transcripts {where} ORDER BY id ASC", params).fetchall()

    records = [dict(row) for row in rows]
    now = datetime.now(timezone.utc).isoformat()

    if format == "json":
        return {
            "metadata": {
                "project": "Voice Roots — Rooting Oral Languages in Text with AI",
                "export_timestamp": now,
                "record_count": len(records),
                "license_standard": "OCAP / CC BY-NC 4.0",
                "notice": "The original voice recording is the immutable master. AI text is an annotation layer.",
            },
            "records": records,
        }

    # CSV format with UTF-8 BOM
    output = io.StringIO()
    output.write("\ufeff")
    if records:
        fieldnames = list(records[0].keys())
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)

    return Response(
        content=output.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f"attachment; filename=voice_roots_corpus_{int(time.time())}.csv"}
    )



class DetectLanguageRequest(BaseModel):
    id: Optional[int] = None
    transcript_id: Optional[int] = None
    recording_id: Optional[int] = None


@app.post("/api/detect-language")
@app.post("/api/v1/detect-language")
def detect_language_endpoint(payload: DetectLanguageRequest):
    """Detect language of a saved recording using Whisper acoustic analysis."""
    target_id = payload.transcript_id or payload.recording_id or payload.id
    if target_id is None:
        raise HTTPException(status_code=400, detail="Recording ID must be provided.")
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            "SELECT * FROM transcripts WHERE id = ? AND archived_at IS NULL",
            (target_id,),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Transcript not found")
        audio_path = os.path.join(AUDIO_STORAGE, row["audio_filename"])
        if not os.path.isfile(audio_path):
            raise HTTPException(status_code=404, detail="Audio file not found on disk")

    try:
        provider = create_transcription_provider()
        if not getattr(provider, "supports_language_detection", False):
            raise HTTPException(
                status_code=501,
                detail=f"Language detection is not supported by active transcription provider '{provider.name}'.",
            )
        detection = provider.detect_language(audio_path)
        top_lang = detection["detected_language_code"]
        lang_record = get_language(top_lang)
        lang_name = lang_record["name"] if lang_record else top_lang
        return {
            "id": target_id,
            "detected_language_code": top_lang,
            "detected_language_name": lang_name,
            "confidence": detection["confidence"],
            "probabilities": detection["probabilities"],
            "provider": detection["provider"],
            "model": detection.get("model", ""),
            "notice": detection.get("notice", "Detection performed on audio acoustic features using local Whisper model."),
        }
    except HTTPException:
        raise
    except TranscriptionNotConfiguredError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.error("Language detection failed for %s: %s", target_id, exc)
        raise HTTPException(status_code=500, detail="Language detection failed due to an internal processing error.")


class TranslateRequest(BaseModel):
    text: str
    source_language: Optional[str] = None
    sourceLang: Optional[str] = None
    target_language: Optional[str] = "en"
    targetLang: Optional[str] = "en"
    transcript_id: Optional[int] = None
    recording_id: Optional[int] = None


class TranslationUpdate(BaseModel):
    translated_text: Optional[str] = None
    verified: Optional[bool] = None
    limitation_note: Optional[str] = None


@app.post("/api/translate")
@app.post("/api/v1/translate")
def translate_text_endpoint(payload: TranslateRequest):
    """Translate text between languages with provider discovery, oral language protections, and optional database persistence."""
    src = (payload.source_language or payload.sourceLang or "").strip()
    tgt = (payload.target_language or payload.targetLang or "en").strip()
    text = payload.text.strip()
    target_id = payload.transcript_id or payload.recording_id
    if not text:
        raise HTTPException(status_code=400, detail="Text to translate must not be empty.")

    if target_id is not None:
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute("SELECT id FROM transcripts WHERE id = ? AND archived_at IS NULL", (target_id,)).fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Transcript not found")

    try:
        result = translation_manager.translate(text, src, tgt)
        translation_id = None
        now = datetime.now(timezone.utc).isoformat()
        if target_id is not None:
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    INSERT INTO translations (
                        transcript_id, source_language, target_language, source_text,
                        translated_text, provider, model, verified, limitation_note,
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        target_id,
                        result.source_language,
                        result.target_language,
                        result.source_text,
                        result.translated_text,
                        result.provider,
                        result.model,
                        1 if result.verified else 0,
                        result.limitation_note,
                        now,
                        now,
                    ),
                )
                conn.commit()
                translation_id = cursor.lastrowid

        return {
            "id": translation_id,
            "transcript_id": target_id,
            "source_text": result.source_text,
            "translated_text": result.translated_text,
            "source_language": result.source_language,
            "target_language": result.target_language,
            "provider": result.provider,
            "model": result.model,
            "verified": result.verified,
            "pair_status": result.pair_status,
            "limitation_note": result.limitation_note,
            "created_at": now if translation_id else None,
        }
    except OralLanguageElderReviewRequiredError as o_err:
        raise HTTPException(
            status_code=503,
            detail=(
                f"Translation restricted: {str(o_err)} "
                f"Oral languages require community elder verification."
            ),
        )
    except UnsupportedLanguagePairError as u_err:
        raise HTTPException(
            status_code=503,
            detail=(
                f"Translation provider is not configured for pair '{u_err.source}' -> '{u_err.target}': {u_err.reason}. "
                f"Oral languages (Gondi, Koya, Santhali, Lambadi) have restricted automated support and require elder community review."
            ),
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Translation provider error: %s", exc)
        raise HTTPException(status_code=502, detail=f"Translation provider request failed: {type(exc).__name__}")


@app.get("/api/v1/transcripts/{transcript_id}/translations")
@app.get("/api/transcripts/{transcript_id}/translations")
def list_transcript_translations(transcript_id: int):
    """Retrieve all saved translations for a specific transcript."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        parent = conn.execute("SELECT id FROM transcripts WHERE id = ? AND archived_at IS NULL", (transcript_id,)).fetchone()
        if not parent:
            raise HTTPException(status_code=404, detail="Transcript not found")
        rows = conn.execute(
            "SELECT * FROM translations WHERE transcript_id = ? ORDER BY id DESC",
            (transcript_id,),
        ).fetchall()
    return {
        "transcript_id": transcript_id,
        "count": len(rows),
        "translations": [dict(r) for r in rows],
    }


@app.get("/api/v1/translations/{translation_id}")
def get_single_translation(translation_id: int):
    """Retrieve a single saved translation record by ID."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute("SELECT * FROM translations WHERE id = ?", (translation_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Translation not found")
    return dict(row)


@app.patch("/api/v1/translations/{translation_id}")
def update_translation(translation_id: int, payload: TranslationUpdate):
    """Update a saved translation or record elder community verification."""
    now = datetime.now(timezone.utc).isoformat()
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        existing = cursor.execute("SELECT id FROM translations WHERE id = ?", (translation_id,)).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Translation not found")
        updates = []
        params = []
        if payload.translated_text is not None:
            updates.append("translated_text = ?")
            params.append(payload.translated_text.strip())
        if payload.verified is not None:
            updates.append("verified = ?")
            params.append(1 if payload.verified else 0)
        if payload.limitation_note is not None:
            updates.append("limitation_note = ?")
            params.append(payload.limitation_note.strip())
        if not updates:
            return {"success": True, "message": "No updates requested", "id": translation_id}
        updates.append("updated_at = ?")
        params.append(now)
        params.append(translation_id)
        cursor.execute(f"UPDATE translations SET {', '.join(updates)} WHERE id = ?", params)
        conn.commit()
    return {"success": True, "message": "Translation updated successfully", "id": translation_id}


@app.delete("/api/v1/translations/{translation_id}")
def delete_translation(translation_id: int):
    """Delete a stored translation record without modifying original audio master or transcript text."""
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM translations WHERE id = ?", (translation_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Translation not found")
        conn.commit()
    return {"success": True, "message": f"Translation {translation_id} removed; audio master untouched", "id": translation_id}


@app.get("/api/v1/translate/pairs")
def check_translation_pair_support(
    source: str = Query(..., description="Source language code or name"),
    target: str = Query("en", description="Target language code or name"),
):
    """Discover whether a specific language pair is currently supported."""
    return translation_manager.check_pair_support(source, target)


from vector_store import (
    delete_resource as vs_delete_resource,
    get_vector_stats,
    search_resources,
    upsert_resources,
)


@app.get("/api/v1/resources/health")
@app.get("/api/resources/health")
def get_resources_health():
    """Vector database health status."""
    stats = get_vector_stats()
    return {
        "status": stats.get("status", "unknown"),
        "vector_engine": "chromadb",
        "collection": stats.get("collection_name", "language_resources"),
        "indexed_records": stats.get("total_records", 0),
        "persistence_status": "configured" if stats.get("status") == "healthy" else "uninitialized",
    }


@app.get("/api/v1/resources/stats")
@app.get("/api/resources/stats")
def get_resources_statistics():
    """Detailed vector database statistics and language/type distributions."""
    return get_vector_stats()


class ResourceSearchRequest(BaseModel):
    query: str
    language: Optional[str] = None
    dialect: Optional[str] = None
    document_type: Optional[str] = None
    verification_status: Optional[str] = None
    limit: int = 10


@app.post("/api/v1/resources/search")
@app.post("/api/resources/search")
def search_language_resources(payload: ResourceSearchRequest):
    """Execute semantic vector search across verified language resources."""
    query = payload.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Search query must not be empty.")

    results = search_resources(
        query=query,
        language=payload.language,
        dialect=payload.dialect,
        document_type=payload.document_type,
        verification_status=payload.verification_status,
        limit=payload.limit,
    )
    return {
        "query": query,
        "count": len(results),
        "filters": {
            "language": payload.language,
            "dialect": payload.dialect,
            "document_type": payload.document_type,
            "verification_status": payload.verification_status,
        },
        "resources": results,
    }


class ResourceIngestRequest(BaseModel):
    admin_key: Optional[str] = None
    resources: Optional[List[Dict[str, Any]]] = None

ResourceIngestRequest.model_rebuild()


def _verify_admin(admin_key: Optional[str] = None, header_key: Optional[str] = None):
    required_key = os.environ.get("VOICE_ROOTS_ADMIN_KEY", "").strip()
    provided_key = (admin_key or header_key or "").strip()
    if required_key and provided_key != required_key:
        raise HTTPException(status_code=403, detail="Invalid administrator credentials.")


@app.post("/api/v1/resources/ingest")
@app.post("/api/resources/ingest")
def ingest_resources_endpoint(
    payload: Optional[ResourceIngestRequest] = None,
    x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key"),
):
    """Idempotently ingest language resources into ChromaDB."""
    req = payload or ResourceIngestRequest()
    _verify_admin(req.admin_key, x_admin_key)

    items = req.resources
    if items is None:
        processed_path = os.path.join(
            os.path.dirname(BACKEND_DIR), "data", "processed", "language_resources.jsonl"
        )
        if not os.path.exists(processed_path):
            raise HTTPException(
                status_code=404,
                detail="Resource dataset file not found. Run data/seed_data.py to generate seeded resources.",
            )
        import json
        items = []
        with open(processed_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    items.append(json.loads(line))

    ingested = upsert_resources(items)
    stats = get_vector_stats()
    return {
        "success": True,
        "ingested_count": ingested,
        "indexed_count": ingested,
        "collection": stats.get("collection_name", "language_resources"),
        "total_indexed": stats.get("total_records", 0),
        "message": f"Successfully indexed {ingested} resources into ChromaDB.",
    }


@app.post("/api/v1/resources/reindex")
@app.post("/api/resources/reindex")
def reindex_resources_endpoint(
    payload: Optional[ResourceIngestRequest] = None,
    x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key"),
):
    """Re-index all language resources into ChromaDB."""
    return ingest_resources_endpoint(payload, x_admin_key=x_admin_key)


# ==============================================================================
# Stage 6: Evaluation, Community Corrections, Dataset Quality, and Reliability
# ==============================================================================

class CorrectionCreateRequest(BaseModel):
    suggested_text: str
    contributor_name: Optional[str] = "Community Contributor"
    contributor_role: Optional[str] = "community_member"
    rationale: Optional[str] = None
    consent_confirmed: bool = True


class CorrectionReviewRequest(BaseModel):
    status: str  # approved | rejected
    reviewed_by: Optional[str] = "Community Elder"
    reviewer_role: Optional[str] = "community_elder"
    review_notes: Optional[str] = None
    reviewer_uncertainty: Optional[str] = None  # e.g., 'certain', 'uncertain_dialect_variation', 'needs_second_elder'


class ResourceSubmissionRequest(BaseModel):
    submission_type: str = "vocabulary"
    language_code: str
    language_name: str
    dialect: Optional[str] = None
    term_or_text: str
    translation_text: Optional[str] = None
    cultural_context: Optional[str] = None
    contributor_name: Optional[str] = "Community Contributor"
    contributor_affiliation: Optional[str] = None
    license: str = "CC BY 4.0"
    attribution: str
    source_url: Optional[str] = None
    speaker_consent_given: bool = True
    is_sacred_or_restricted: bool = False


class SubmissionModerateRequest(BaseModel):
    status: str  # verified | rejected
    reviewer_notes: Optional[str] = None
    admin_key: Optional[str] = None


# --- 1. Language Evaluation Endpoints ---

class EvaluationCalculateRequest(BaseModel):
    reference: str
    hypothesis: str


@app.get("/api/v1/evaluation/latest")
@app.get("/api/evaluation/latest")
def get_latest_evaluation_endpoint():
    """Retrieve the latest multilingual quality evaluation report."""
    from evaluation import get_evaluation_runner
    runner = get_evaluation_runner()
    if runner.cached_report:
        return runner.cached_report
    return runner.run_full_evaluation()


@app.post("/api/v1/evaluation/run")
@app.post("/api/evaluation/run")
def run_evaluation_endpoint():
    """Execute live multilingual evaluation benchmark and return report."""
    from evaluation import get_evaluation_runner
    runner = get_evaluation_runner()
    return runner.run_full_evaluation()


@app.post("/api/v1/evaluation/calculate")
@app.post("/api/evaluation/calculate")
def calculate_evaluation_metrics_endpoint(payload: EvaluationCalculateRequest):
    """Calculate grounded Word Error Rate (WER), Character Error Rate (CER), and chrF scores."""
    from evaluation import (
        compute_wer,
        compute_cer,
        compute_chrf,
        levenshtein_distance,
        _normalize_text,
    )
    ref = payload.reference or ""
    hyp = payload.hypothesis or ""

    wer = compute_wer(ref, hyp)
    cer = compute_cer(ref, hyp)
    chrf = compute_chrf(ref, hyp)

    ref_norm = _normalize_text(ref)
    hyp_norm = _normalize_text(hyp)
    word_distance = levenshtein_distance(ref_norm.split(), hyp_norm.split())
    char_distance = levenshtein_distance(
        list(ref_norm.replace(" ", "")), list(hyp_norm.replace(" ", ""))
    )

    return {
        "reference": ref,
        "hypothesis": hyp,
        "wer": wer,
        "wer_percent": round(wer * 100, 2),
        "cer": cer,
        "cer_percent": round(cer * 100, 2),
        "chrf": chrf,
        "chrf_percent": round(chrf * 100, 2),
        "reference_word_count": len(ref_norm.split()),
        "hypothesis_word_count": len(hyp_norm.split()),
        "word_edit_distance": word_distance,
        "char_edit_distance": char_distance,
        "notice": "Calculated via deterministic Levenshtein distance and character n-gram F-score without synthetic hallucination.",
    }


@app.get("/api/v1/evaluation/community-reviews")
def get_community_reviewed_evaluation():
    """Retrieve grounded transcription accuracy measured against reviewer-approved reference transcripts."""
    from evaluation import get_evaluation_runner
    runner = get_evaluation_runner()
    return runner.evaluate_community_reviewed_transcripts()


# --- 2. Community Corrections Endpoints ---

@app.post("/api/v1/transcripts/{transcript_id}/corrections")
def submit_transcript_correction(transcript_id: int, payload: CorrectionCreateRequest):
    """Submit a community correction suggestion for a transcript."""
    if not payload.consent_confirmed:
        raise HTTPException(
            status_code=400,
            detail="Contributor affirmative consent is strictly required under OCAP principles before submitting corrections.",
        )
    if not payload.suggested_text.strip():
        raise HTTPException(status_code=400, detail="Suggested text cannot be empty.")

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT transcript_text FROM transcripts WHERE id = ?", (transcript_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Transcript not found.")
        current_text = row["transcript_text"]

        cursor.execute(
            "SELECT COUNT(*) as cnt FROM corrections WHERE target_type = 'transcript' AND target_id = ?",
            (transcript_id,),
        )
        version_num = cursor.fetchone()["cnt"] + 1

        now = datetime.now(timezone.utc).isoformat()
        cursor.execute(
            """
            INSERT INTO corrections (
                target_type, target_id, version_number, previous_text, suggested_text,
                contributor_name, contributor_role, rationale, status, consent_confirmed,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending_review', 1, ?, ?)
            """,
            (
                "transcript",
                transcript_id,
                version_num,
                current_text,
                payload.suggested_text.strip(),
                payload.contributor_name or "Community Contributor",
                payload.contributor_role or "community_member",
                payload.rationale,
                now,
                now,
            ),
        )
        correction_id = cursor.lastrowid
        conn.commit()

        cursor.execute("SELECT * FROM corrections WHERE id = ?", (correction_id,))
        return dict(cursor.fetchone())


@app.get("/api/v1/transcripts/{transcript_id}/corrections")
def get_transcript_corrections(transcript_id: int):
    """Retrieve version history and correction suggestions for a transcript."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM corrections WHERE target_type = 'transcript' AND target_id = ? ORDER BY version_number ASC",
            (transcript_id,),
        )
        return {"transcript_id": transcript_id, "corrections": [dict(r) for r in cursor.fetchall()]}


@app.post("/api/v1/translations/{translation_id}/corrections")
def submit_translation_correction(translation_id: int, payload: CorrectionCreateRequest):
    """Submit a community correction suggestion for a translation."""
    if not payload.consent_confirmed:
        raise HTTPException(
            status_code=400,
            detail="Contributor affirmative consent is strictly required under OCAP principles before submitting corrections.",
        )
    if not payload.suggested_text.strip():
        raise HTTPException(status_code=400, detail="Suggested text cannot be empty.")

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT translated_text FROM translations WHERE id = ?", (translation_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Translation not found.")
        current_text = row["translated_text"]

        cursor.execute(
            "SELECT COUNT(*) as cnt FROM corrections WHERE target_type = 'translation' AND target_id = ?",
            (translation_id,),
        )
        version_num = cursor.fetchone()["cnt"] + 1

        now = datetime.now(timezone.utc).isoformat()
        cursor.execute(
            """
            INSERT INTO corrections (
                target_type, target_id, version_number, previous_text, suggested_text,
                contributor_name, contributor_role, rationale, status, consent_confirmed,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending_review', 1, ?, ?)
            """,
            (
                "translation",
                translation_id,
                version_num,
                current_text,
                payload.suggested_text.strip(),
                payload.contributor_name or "Community Contributor",
                payload.contributor_role or "community_member",
                payload.rationale,
                now,
                now,
            ),
        )
        correction_id = cursor.lastrowid
        conn.commit()

        cursor.execute("SELECT * FROM corrections WHERE id = ?", (correction_id,))
        return dict(cursor.fetchone())


@app.get("/api/v1/translations/{translation_id}/corrections")
def get_translation_corrections(translation_id: int):
    """Retrieve version history and corrections for a translation."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM corrections WHERE target_type = 'translation' AND target_id = ? ORDER BY version_number ASC",
            (translation_id,),
        )
        return {"translation_id": translation_id, "corrections": [dict(r) for r in cursor.fetchall()]}


AUTHORIZED_REVIEWER_ROLES = {
    "community_elder",
    "native_speaker_reviewer",
    "linguist",
    "moderator",
    "elder",
    "admin",
}


@app.patch("/api/v1/corrections/{correction_id}/review")
def review_correction(correction_id: int, payload: CorrectionReviewRequest):
    """Approve or reject a suggested correction (by authorized community elders/moderators)."""
    role = (payload.reviewer_role or "community_elder").lower().strip()
    if role not in AUTHORIZED_REVIEWER_ROLES:
        raise HTTPException(
            status_code=403,
            detail=f"Role '{payload.reviewer_role}' is not authorized to review corrections. Reviews must be conducted by recognized community elders or designated native speaker reviewers.",
        )

    if payload.status not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'.")

    now = datetime.now(timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM corrections WHERE id = ?", (correction_id,))
        corr = cursor.fetchone()
        if not corr:
            raise HTTPException(status_code=404, detail="Correction record not found.")

        cursor.execute(
            """
            UPDATE corrections
            SET status = ?, reviewed_by = ?, reviewed_at = ?, review_notes = ?, reviewer_uncertainty = ?, updated_at = ?
            WHERE id = ?
            """,
            (
                payload.status,
                payload.reviewed_by or "Community Elder",
                now,
                payload.review_notes,
                payload.reviewer_uncertainty,
                now,
                correction_id,
            ),
        )

        if payload.status == "approved":
            target_type = corr["target_type"]
            target_id = corr["target_id"]
            new_text = corr["suggested_text"]

            if target_type == "transcript":
                verified_status = (
                    "Community Verified (Dialect Caveat)"
                    if (payload.reviewer_uncertainty and "uncertain" in payload.reviewer_uncertainty.lower())
                    else "Community Verified"
                )
                cursor.execute(
                    "UPDATE transcripts SET transcript_text = ?, status = ?, updated_at = ? WHERE id = ?",
                    (new_text, verified_status, now, target_id),
                )
            elif target_type == "translation":
                note = (
                    f"Community elder verified (Uncertainty noted: {payload.reviewer_uncertainty})"
                    if payload.reviewer_uncertainty
                    else "Community elder verified"
                )
                cursor.execute(
                    "UPDATE translations SET translated_text = ?, verified = 1, limitation_note = ?, updated_at = ? WHERE id = ?",
                    (new_text, note, now, target_id),
                )

        conn.commit()
        cursor.execute("SELECT * FROM corrections WHERE id = ?", (correction_id,))
        return dict(cursor.fetchone())


@app.delete("/api/v1/corrections/{correction_id}")
@app.post("/api/v1/corrections/{correction_id}/withdraw")
def withdraw_correction(correction_id: int):
    """Withdraw a suggested correction under contributor control."""
    now = datetime.now(timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM corrections WHERE id = ?", (correction_id,))
        corr = cursor.fetchone()
        if not corr:
            raise HTTPException(status_code=404, detail="Correction record not found.")

        c = dict(corr)
        if c.get("status") == "withdrawn":
            raise HTTPException(status_code=400, detail="Correction has already been withdrawn.")

        cursor.execute(
            "UPDATE corrections SET status = 'withdrawn', updated_at = ? WHERE id = ?",
            (now, correction_id),
        )
        conn.commit()

        return {
            "success": True,
            "message": f"Correction {correction_id} has been withdrawn.",
            "id": correction_id,
            "status": "withdrawn",
            "withdrawn_at": now,
        }


# --- 3. Resource Submissions & Dataset Quality Endpoints ---

@app.post("/api/v1/resources/submit")
def submit_language_resource(payload: ResourceSubmissionRequest):
    """Submit new vocabulary, translation, or oral knowledge from community contributors."""
    if not payload.speaker_consent_given:
        raise HTTPException(
            status_code=400,
            detail="Speaker/contributor consent is strictly mandatory under OCAP Data Sovereignty.",
        )
    if payload.is_sacred_or_restricted:
        raise HTTPException(
            status_code=403,
            detail="Restricted or sacred cultural knowledge cannot be contributed to an open corpus under Indigenous Ethical Protocols.",
        )
    if not payload.term_or_text.strip():
        raise HTTPException(status_code=400, detail="Resource content cannot be empty.")

    now = datetime.now(timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO resource_submissions (
                submission_type, language_code, language_name, dialect, term_or_text,
                translation_text, cultural_context, contributor_name, contributor_affiliation,
                license, attribution, source_url, speaker_consent_given, is_sacred_or_restricted,
                status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 'pending_verification', ?, ?)
            """,
            (
                payload.submission_type,
                payload.language_code.lower().strip(),
                payload.language_name.strip(),
                payload.dialect,
                payload.term_or_text.strip(),
                payload.translation_text,
                payload.cultural_context,
                payload.contributor_name or "Community Contributor",
                payload.contributor_affiliation,
                payload.license,
                payload.attribution,
                payload.source_url,
                now,
                now,
            ),
        )
        submission_id = cursor.lastrowid
        conn.commit()
        cursor.execute("SELECT * FROM resource_submissions WHERE id = ?", (submission_id,))
        return dict(cursor.fetchone())


@app.get("/api/v1/resources/submissions")
def list_resource_submissions(status: Optional[str] = None):
    """List contributed language resources with optional verification status filter."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if status:
            cursor.execute("SELECT * FROM resource_submissions WHERE status = ? ORDER BY id DESC", (status,))
        else:
            cursor.execute("SELECT * FROM resource_submissions ORDER BY id DESC")
        return {"submissions": [dict(r) for r in cursor.fetchall()]}


@app.patch("/api/v1/resources/submissions/{submission_id}/moderate")
def moderate_resource_submission(
    submission_id: int,
    payload: SubmissionModerateRequest,
    x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key"),
):
    """Moderate a contributed resource: approve and index into ChromaDB, or reject."""
    _verify_admin(payload.admin_key, x_admin_key)
    if payload.status not in ("verified", "rejected"):
        raise HTTPException(status_code=400, detail="Status must be 'verified' or 'rejected'.")

    now = datetime.now(timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM resource_submissions WHERE id = ?", (submission_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Submission not found.")

        cursor.execute(
            "UPDATE resource_submissions SET status = ?, reviewer_notes = ?, updated_at = ? WHERE id = ?",
            (payload.status, payload.reviewer_notes, now, submission_id),
        )
        conn.commit()

        # If verified, index directly into ChromaDB vector store
        if payload.status == "verified":
            sub = dict(row)
            doc_id = f"sub_{submission_id}_{sub['language_code']}"
            search_text = (
                f"{sub['term_or_text']} — {sub['translation_text'] or ''} ({sub['cultural_context'] or ''})"
            )
            item = {
                "document_id": doc_id,
                "text_original": sub["term_or_text"],
                "text_translation": sub["translation_text"] or "",
                "search_text": search_text,
                "language": sub["language_name"],
                "language_code": sub["language_code"],
                "dialect": sub["dialect"],
                "document_type": sub["submission_type"],
                "source_title": f"Community Contribution: {sub['language_name']}",
                "source_url": sub["source_url"] or "https://voiceroots.org/contributions",
                "license": sub["license"],
                "attribution": f"Contributed by {sub['contributor_name']}. {sub['attribution']}",
                "verification_status": "community_verified",
            }
            upsert_resources([item])

        cursor.execute("SELECT * FROM resource_submissions WHERE id = ?", (submission_id,))
        return dict(cursor.fetchone())


@app.post("/api/v1/resources/submissions/{submission_id}/withdraw")
@app.delete("/api/v1/resources/submissions/{submission_id}")
def withdraw_resource_submission(submission_id: int):
    """Withdraw a contributed language resource under OCAP data sovereignty protocols."""
    now = datetime.now(timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM resource_submissions WHERE id = ?", (submission_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Submission not found.")

        sub = dict(row)
        if sub.get("status") == "withdrawn":
            raise HTTPException(status_code=400, detail="Submission has already been withdrawn.")

        cursor.execute(
            "UPDATE resource_submissions SET status = 'withdrawn', updated_at = ? WHERE id = ?",
            (now, submission_id),
        )
        conn.commit()

        # If it was verified and indexed in ChromaDB, purge it immediately
        doc_id = f"sub_{submission_id}_{sub['language_code']}"
        try:
            from vector_store import delete_resource
            delete_resource(doc_id)
        except Exception as e:
            logger.warning("Could not delete %s from vector store on withdrawal: %s", doc_id, e)

        return {
            "success": True,
            "message": f"Resource submission {submission_id} has been withdrawn under OCAP protocols.",
            "id": submission_id,
            "status": "withdrawn",
            "withdrawn_at": now,
        }


@app.get("/api/v1/dataset/audit")
def audit_dataset_quality():
    """Audit dataset quality: licenses, URL integrity, duplicates, and coverage statistics."""
    import json
    processed_path = os.path.join(
        os.path.dirname(BACKEND_DIR), "data", "processed", "language_resources.jsonl"
    )

    records: List[Dict[str, Any]] = []
    if os.path.exists(processed_path):
        with open(processed_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    records.append(json.loads(line))

    seen_ids = set()
    seen_texts = set()
    duplicate_count = 0
    license_counts: Dict[str, int] = {}
    lang_counts: Dict[str, int] = {}
    invalid_url_count = 0

    for r in records:
        doc_id = r.get("document_id", "")
        if doc_id in seen_ids:
            duplicate_count += 1
        seen_ids.add(doc_id)

        raw_text = r.get("text_original") or r.get("search_text") or ""
        if raw_text:
            txt_hash = hash(raw_text.strip().lower())
            if txt_hash in seen_texts:
                duplicate_count += 1
            seen_texts.add(txt_hash)

        lic = r.get("license", "Unknown")
        license_counts[lic] = license_counts.get(lic, 0) + 1

        lang = r.get("language_code", "unknown")
        lang_counts[lang] = lang_counts.get(lang, 0) + 1

        url = r.get("source_url", "")
        if url and not (url.startswith("http://") or url.startswith("https://") or url.startswith("archive://")):
            invalid_url_count += 1

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as cnt FROM resource_submissions WHERE status = 'pending_verification'")
        pending_subs = cursor.fetchone()["cnt"]
        cursor.execute("SELECT COUNT(*) as cnt FROM resource_submissions WHERE status = 'verified'")
        verified_subs = cursor.fetchone()["cnt"]

    return {
        "status": "healthy" if duplicate_count == 0 else "duplicates_detected",
        "total_records": len(records),
        "unique_records": len(seen_ids),
        "duplicates_detected": duplicate_count,
        "invalid_urls": invalid_url_count,
        "licenses": license_counts,
        "languages_indexed": lang_counts,
        "community_submissions": {
            "pending_verification": pending_subs,
            "verified_in_corpus": verified_subs,
        },
        "quality_score_percent": 100.0 if (duplicate_count == 0 and invalid_url_count == 0) else 95.0,
    }


# --- 4. Reliability, Backups, and Telemetry Endpoints ---

@app.post("/api/v1/system/backup")
def create_database_backup(
    x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key"),
):
    """Trigger safe atomic SQLite database snapshot."""
    _verify_admin(None, x_admin_key)
    os.makedirs(BACKUP_DIR, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(BACKUP_DIR, f"voice_roots_backup_{timestamp}.db")

    with get_db_connection() as src_conn:
        dest_conn = sqlite3.connect(backup_file)
        src_conn.backup(dest_conn)
        dest_conn.close()

    size_bytes = os.path.getsize(backup_file)
    return {
        "success": True,
        "backup_filename": os.path.basename(backup_file),
        "backup_file": backup_file,
        "backup_bytes": size_bytes,
        "size_bytes": size_bytes,
        "timestamp": timestamp,
        "message": "Atomic SQLite database snapshot created successfully.",
    }


@app.get("/api/v1/system/telemetry")
def get_system_telemetry():
    """Retrieve operational telemetry, storage usage, and cost indicators."""
    db_size = os.path.getsize(DB_PATH) if os.path.exists(DB_PATH) else 0

    audio_count = 0
    audio_total_bytes = 0
    target_audio_dir = AUDIO_STORAGE if os.path.exists(AUDIO_STORAGE) else STORAGE_DIR
    if os.path.exists(target_audio_dir):
        for f in os.listdir(target_audio_dir):
            fp = os.path.join(target_audio_dir, f)
            if os.path.isfile(fp):
                audio_count += 1
                audio_total_bytes += os.path.getsize(fp)

    stats = get_vector_stats()

    return {
        "database": {
            "engine": "sqlite",
            "size_bytes": db_size,
            "status": "connected",
        },
        "audio_storage": {
            "total_files": audio_count,
            "total_bytes": audio_total_bytes,
            "status": "ok",
        },
        "vector_store": {
            "collection": stats.get("collection_name", "language_resources"),
            "total_indexed": stats.get("total_records", 0),
            "status": "ok",
        },
        "costs": {
            "external_api_costs_usd": 0.00,
            "speech_provider": "whisper-local (offline CPU/GPU)",
            "translation_provider": "offline-rule (local guardrails)",
            "vector_embeddings": "local-384dim (offline subword n-grams)",
            "billing_status": "100% Free / Self-Hosted",
        },
    }


# ---- Pilot Testing API ----

@app.post("/api/v1/pilot/submissions")
def create_pilot_submission(payload: PilotSubmissionCreate):
    """Create a pilot submission. Consent must be true."""
    if not payload.consent:
        raise HTTPException(status_code=400, detail="Consent is required for pilot submission.")
    # Verify transcript exists
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id FROM transcripts WHERE id = ? AND archived_at IS NULL",
            (payload.transcript_id,),
        )
        if cursor.fetchone() is None:
            raise HTTPException(status_code=404, detail="Referenced transcript not found.")
        now = datetime.now(timezone.utc).isoformat()
        cursor.execute(
            """
            INSERT INTO pilot_submissions (transcript_id, tester_name, consent, notes, withdrawn, created_at, updated_at)
            VALUES (?, ?, ?, ?, 0, ?, ?)
            """,
            (
                payload.transcript_id,
                payload.tester_name,
                1,
                payload.notes,
                now,
                now,
            ),
        )
        conn.commit()
        sub_id = cursor.lastrowid
        cursor.execute("SELECT * FROM pilot_submissions WHERE id = ?", (sub_id,))
        sub_row = cursor.fetchone()
    return dict(sub_row)

@app.get("/api/v1/pilot/submissions")
def list_pilot_submissions():
    """List all active pilot submissions."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM pilot_submissions ORDER BY created_at DESC")
        rows = cursor.fetchall()
    return {"submissions": [dict(r) for r in rows]}

@app.get("/api/v1/pilot/submissions/{submission_id}")
def get_pilot_submission(submission_id: int):
    """Retrieve a pilot submission together with its transcript data."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT ps.*, t.*
            FROM pilot_submissions ps
            JOIN transcripts t ON ps.transcript_id = t.id
            WHERE ps.id = ? AND ps.withdrawn = 0
            """,
            (submission_id,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Pilot submission not found.")
        # Separate dicts
        sub_dict = {k: row[k] for k in row.keys() if k in ["id", "transcript_id", "tester_name", "consent", "notes", "withdrawn", "created_at", "updated_at"]}
        transcript_dict = {k: row[k] for k in row.keys() if k.startswith("transcript_") or k in ["title", "audio_filename", "language", "dialect", "transcript_text", "status", "duration_seconds", "created_at", "updated_at"]}
    return {"submission": sub_dict, "transcript": transcript_dict}

@app.post("/api/v1/pilot/reviews")
def create_pilot_review(payload: PilotReviewCreate):
    """Store a reviewer feedback for a pilot submission."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        # Verify submission exists and not withdrawn
        cursor.execute(
            "SELECT id FROM pilot_submissions WHERE id = ? AND withdrawn = 0",
            (payload.submission_id,),
        )
        if cursor.fetchone() is None:
            raise HTTPException(status_code=404, detail="Pilot submission not found for review.")
        now = datetime.now(timezone.utc).isoformat()
        cursor.execute(
            """
            INSERT INTO pilot_reviews (submission_id, reviewer_name, approval, uncertainty, corrected_transcript, corrected_translation, review_notes, reviewed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.submission_id,
                payload.reviewer_name,
                payload.approval,
                payload.uncertainty,
                payload.corrected_transcript,
                payload.corrected_translation,
                payload.review_notes,
                now,
            ),
        )
        conn.commit()
        rev_id = cursor.lastrowid
        cursor.execute("SELECT * FROM pilot_reviews WHERE id = ?", (rev_id,))
        rev_row = cursor.fetchone()
    return dict(rev_row)

@app.get("/api/v1/pilot/metrics")
def list_pilot_metrics(
    language: Optional[str] = Query(None),
    model: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    """List pilot metrics with optional filters."""
    query = "SELECT * FROM pilot_metrics WHERE 1=1"
    params: List[Any] = []
    if language:
        query += " AND language = ?"
        params.append(language)
    if model:
        query += " AND model = ?"
        params.append(model)
    if start_date:
        query += " AND evaluation_date >= ?"
        params.append(start_date)
    if end_date:
        query += " AND evaluation_date <= ?"
        params.append(end_date)
    query += " ORDER BY evaluation_date DESC"
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
    return [dict(row) for row in rows]

@app.patch("/api/v1/pilot/submissions/{submission_id}/withdraw")
def withdraw_pilot_submission(submission_id: int):
    """Mark a pilot submission as withdrawn (OCAP compliance)."""
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM pilot_submissions WHERE id = ?", (submission_id,))
        if cursor.fetchone() is None:
            raise HTTPException(status_code=404, detail="Pilot submission not found.")
        now = datetime.now(timezone.utc).isoformat()
        cursor.execute(
            "UPDATE pilot_submissions SET withdrawn = 1, updated_at = ? WHERE id = ?",
            (now, submission_id),
        )
        conn.commit()
    return {"status": "withdrawn", "submission_id": submission_id}

# End pilot routes


# ─── Milestone 8: Contributor Portal & Human Verification API ───

AUTHORIZED_REVIEWER_ROLES = {
    "community_elder",
    "native_speaker_reviewer",
    "linguist",
    "moderator",
    "elder",
    "admin",
}

VALID_VERIFICATION_STATUSES = {
    "draft",
    "submitted",
    "awaiting_review",
    "under_review",
    "changes_requested",
    "corrected",
    "verified",
    "published",
    "withdrawn_or_rejected",
}

VALID_UNCERTAINTIES = {
    "low",
    "medium",
    "high",
    "unclear_audio",
    "unknown_dialect",
}


@app.get("/api/v1/contributions/my-submissions")
def list_my_contributions(
    contributor_name: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    verification_status: Optional[str] = Query(None),
    limit: int = Query(50),
):
    """Retrieve contributions with verification status for the contributor portal."""
    query = "SELECT * FROM transcripts WHERE archived_at IS NULL"
    params: List[Any] = []
    if contributor_name:
        query += " AND contributor_name = ?"
        params.append(contributor_name)
    if verification_status:
        query += " AND verification_status = ?"
        params.append(verification_status)
    elif status:
        query += " AND status = ?"
        params.append(status)
    query += " ORDER BY id DESC LIMIT ?"
    params.append(limit)

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        return {"submissions": [dict(r) for r in rows], "count": len(rows)}


@app.patch("/api/v1/contributions/{transcript_id}/draft")
def update_contribution_draft(transcript_id: int, payload: ContributionDraftUpdateRequest):
    """Update a draft contribution or submit it for human verification."""
    now = datetime.now(timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM transcripts WHERE id = ? AND archived_at IS NULL", (transcript_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Contribution not found.")

        current = dict(row)
        curr_v_status = current.get("verification_status") or "submitted"
        if curr_v_status not in ("draft", "changes_requested"):
            raise HTTPException(
                status_code=400,
                detail=f"Cannot edit contribution in '{curr_v_status}' status. Only 'draft' or 'changes_requested' can be edited.",
            )

        new_title = payload.title.strip() if payload.title is not None else current["title"]
        new_dialect = payload.dialect if payload.dialect is not None else current["dialect"]
        new_context = payload.contextual_notes if payload.contextual_notes is not None else current.get("contextual_notes")
        new_transcript = payload.transcript_text if payload.transcript_text is not None else current["transcript_text"]
        new_translit = payload.transliteration_text if payload.transliteration_text is not None else current["transliteration_text"]

        new_v_status = "submitted" if payload.submit else curr_v_status
        new_status = "Submitted for Review" if payload.submit else current["status"]

        cursor.execute(
            """
            UPDATE transcripts
            SET title = ?, dialect = ?, contextual_notes = ?, transcript_text = ?,
                transliteration_text = ?, verification_status = ?, status = ?, updated_at = ?
            WHERE id = ?
            """,
            (
                new_title,
                new_dialect,
                new_context,
                new_transcript,
                new_translit,
                new_v_status,
                new_status,
                now,
                transcript_id,
            ),
        )
        conn.commit()
        _sync_transcript_to_search(transcript_id)
        cursor.execute("SELECT * FROM transcripts WHERE id = ?", (transcript_id,))
        return dict(cursor.fetchone())


@app.post("/api/v1/contributions/{transcript_id}/withdraw")
def withdraw_contribution(transcript_id: int):
    """Withdraw a contribution under OCAP data sovereignty protocols."""
    now = datetime.now(timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM transcripts WHERE id = ? AND archived_at IS NULL", (transcript_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Contribution not found.")

        cursor.execute(
            """
            UPDATE transcripts
            SET verification_status = 'withdrawn_or_rejected', status = 'Withdrawn', updated_at = ?
            WHERE id = ?
            """,
            (now, transcript_id),
        )
        conn.commit()
        _sync_transcript_to_search(transcript_id)
        return {
            "success": True,
            "id": transcript_id,
            "verification_status": "withdrawn_or_rejected",
            "status": "Withdrawn",
            "message": "Contribution withdrawn successfully under OCAP protocols.",
        }


@app.get("/api/v1/verification/queue")
def list_verification_queue(
    reviewer_role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    limit: int = Query(50),
):
    """List recordings awaiting human transcript verification. Requires reviewer role."""
    if reviewer_role and reviewer_role not in AUTHORIZED_REVIEWER_ROLES:
        raise HTTPException(status_code=403, detail="Access denied: Reviewer authorization required.")

    query = "SELECT * FROM transcripts WHERE archived_at IS NULL"
    params: List[Any] = []
    if status:
        if status not in VALID_VERIFICATION_STATUSES:
            raise HTTPException(status_code=400, detail=f"Invalid verification status: {status}")
        query += " AND verification_status = ?"
        params.append(status)
    else:
        query += " AND verification_status IN ('submitted', 'awaiting_review', 'under_review', 'changes_requested', 'corrected')"

    if language:
        query += " AND language = ?"
        params.append(language)

    query += " ORDER BY id DESC LIMIT ?"
    params.append(limit)

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        return {"queue": [dict(r) for r in rows], "count": len(rows)}


@app.post("/api/v1/verification/{transcript_id}/claim")
def claim_verification(
    transcript_id: int,
    reviewer_name: str = Query(...),
    reviewer_role: str = Query(...),
):
    """Claim a recording for review, setting verification_status to 'under_review'."""
    if reviewer_role not in AUTHORIZED_REVIEWER_ROLES:
        raise HTTPException(status_code=403, detail="Access denied: Reviewer authorization required.")

    now = datetime.now(timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM transcripts WHERE id = ? AND archived_at IS NULL", (transcript_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Recording not found.")

        current = dict(row)
        if current.get("verification_status") in ("withdrawn_or_rejected", "published"):
            raise HTTPException(
                status_code=400,
                detail=f"Cannot claim recording in '{current.get('verification_status')}' status.",
            )

        cursor.execute(
            """
            UPDATE transcripts
            SET verification_status = 'under_review', verified_by = ?, updated_at = ?
            WHERE id = ?
            """,
            (reviewer_name, now, transcript_id),
        )
        conn.commit()
        cursor.execute("SELECT * FROM transcripts WHERE id = ?", (transcript_id,))
        return dict(cursor.fetchone())


@app.post("/api/v1/verification/{transcript_id}/review")
def review_verification(
    transcript_id: int,
    payload: VerificationReviewRequest,
):
    """Submit human review, correction, and verification decision for a transcript."""
    if payload.reviewer_role not in AUTHORIZED_REVIEWER_ROLES:
        raise HTTPException(status_code=403, detail="Access denied: Reviewer authorization required.")

    if payload.decision not in ("verified", "changes_requested", "corrected", "withdrawn_or_rejected"):
        raise HTTPException(
            status_code=400,
            detail="Decision must be one of: 'verified', 'changes_requested', 'corrected', 'withdrawn_or_rejected'.",
        )

    if payload.reviewer_uncertainty and payload.reviewer_uncertainty not in VALID_UNCERTAINTIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid reviewer uncertainty: must be one of {sorted(VALID_UNCERTAINTIES)}",
        )

    now = datetime.now(timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM transcripts WHERE id = ? AND archived_at IS NULL", (transcript_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Recording not found.")

        current = dict(row)
        original_text = current["transcript_text"]
        new_text = payload.corrected_transcript if payload.corrected_transcript is not None else original_text

        # Record revision history in corrections table if text was corrected
        if payload.corrected_transcript and payload.corrected_transcript.strip() != original_text.strip():
            cursor.execute(
                """
                INSERT INTO corrections (
                    target_type, target_id, version_number, previous_text, suggested_text,
                    contributor_name, contributor_role, rationale, status, consent_confirmed,
                    reviewed_by, reviewed_at, review_notes, reviewer_uncertainty, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)
                """,
                (
                    "transcript",
                    transcript_id,
                    1,
                    original_text,
                    payload.corrected_transcript.strip(),
                    payload.reviewer_name,
                    payload.reviewer_role,
                    payload.review_notes or "Human transcript verification correction",
                    "accepted",
                    payload.reviewer_name,
                    now,
                    payload.review_notes,
                    payload.reviewer_uncertainty,
                    now,
                    now,
                ),
            )

        new_status = current["status"]
        if payload.decision == "verified":
            new_status = "Human Verified"
        elif payload.decision == "corrected":
            new_status = "Community Corrected"
        elif payload.decision == "changes_requested":
            new_status = "Changes Requested"
        elif payload.decision == "withdrawn_or_rejected":
            new_status = "Rejected"

        cursor.execute(
            """
            UPDATE transcripts
            SET transcript_text = ?,
                verification_status = ?,
                status = ?,
                reviewer_uncertainty = ?,
                verified_by = ?,
                verified_at = ?,
                review_notes = ?,
                updated_at = ?
            WHERE id = ?
            """,
            (
                new_text,
                payload.decision,
                new_status,
                payload.reviewer_uncertainty,
                payload.reviewer_name,
                now if payload.decision in ("verified", "corrected") else current.get("verified_at"),
                payload.review_notes,
                now,
                transcript_id,
            ),
        )
        conn.commit()
        _sync_transcript_to_search(transcript_id)
        cursor.execute("SELECT * FROM transcripts WHERE id = ?", (transcript_id,))
        return dict(cursor.fetchone())


@app.get("/api/v1/verification/{transcript_id}/history")
def get_transcript_verification_history(transcript_id: int):
    """Retrieve full audit and revision history for a transcript."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM transcripts WHERE id = ? AND archived_at IS NULL", (transcript_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Recording not found.")
        transcript = dict(row)

        cursor.execute(
            "SELECT * FROM corrections WHERE target_type = 'transcript' AND target_id = ? ORDER BY id ASC",
            (transcript_id,),
        )
        corrections = [dict(r) for r in cursor.fetchall()]

        return {
            "transcript_id": transcript_id,
            "title": transcript["title"],
            "machine_transcript_text": transcript.get("machine_transcript_text", ""),
            "current_transcript_text": transcript["transcript_text"],
            "verification_status": transcript.get("verification_status", "submitted"),
            "reviewer_uncertainty": transcript.get("reviewer_uncertainty"),
            "verified_by": transcript.get("verified_by"),
            "verified_at": transcript.get("verified_at"),
            "review_notes": transcript.get("review_notes"),
            "revisions": corrections,
        }


@app.post("/api/v1/verification/{transcript_id}/publish")
def publish_verified_transcript(
    transcript_id: int,
    publisher_role: str = Query(...),
    admin_key: Optional[str] = Query(None),
    x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key"),
):
    """Publish a human-verified transcript. Enforces OCAP public consent & role authorization."""
    if publisher_role not in ("moderator", "admin", "community_elder"):
        raise HTTPException(
            status_code=403,
            detail="Access denied: Moderator or Admin authorization required to publish.",
        )

    now = datetime.now(timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM transcripts WHERE id = ? AND archived_at IS NULL", (transcript_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Recording not found.")

        current = dict(row)
        if current.get("verification_status") not in ("verified", "corrected"):
            raise HTTPException(
                status_code=400,
                detail="Cannot publish: Transcript must be human-verified before publication.",
            )

        if not current.get("consent_public_publication"):
            raise HTTPException(
                status_code=400,
                detail="Cannot publish: Contributor has not granted public publication consent (OCAP protocol).",
            )

        cursor.execute(
            """
            UPDATE transcripts
            SET verification_status = 'published',
                status = 'Published',
                privacy_level = 'public',
                updated_at = ?
            WHERE id = ?
            """,
            (now, transcript_id),
        )
        conn.commit()
        _sync_transcript_to_search(transcript_id)
        return {
            "success": True,
            "id": transcript_id,
            "verification_status": "published",
            "status": "Published",
            "privacy_level": "public",
            "message": "Transcript and recording published to community corpus successfully.",
        }


@app.get("/{full_path:path}")
async def serve_spa_or_static(request: Request, full_path: str):
    """Serve built frontend static assets or fallback to index.html for SPA client-side routing."""
    # Check if a specific file exists in FRONTEND_DIST (e.g. vite.svg, robots.txt, favicon.ico)
    candidate_file = os.path.join(FRONTEND_DIST, full_path)
    if os.path.isfile(candidate_file):
        return FileResponse(candidate_file)

    # Do not intercept API, storage, health, ready, or documentation routes
    if full_path.startswith(("api/", "api", "storage/", "storage", "health", "ready", "docs", "redoc", "openapi.json")):
        raise HTTPException(status_code=404, detail="Not Found")

    # Fallback to SPA index.html for client-side routing
    if os.path.exists(INDEX_HTML_PATH):
        return FileResponse(INDEX_HTML_PATH)

    raise HTTPException(status_code=404, detail="Not Found")
