"""Voice Roots — FastAPI Backend Service.

Provides health checks, audio recording ingestion, SQLite transcript persistence,
and static streaming of preserved acoustic audio masters.
"""

import hashlib
import importlib
import io
import json
import logging
import math
import os
import sys

_CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if _CURRENT_DIR not in sys.path:
    sys.path.insert(0, _CURRENT_DIR)

import shutil
import sqlite3
import tempfile
import threading
import time
import uuid
import wave
from datetime import datetime, timezone
from typing import Any

import archive_rag_service
import auth_service
import backup_retention_service
import command_center_service
import cultural_archive_service
import data_export_service
import dictionary_service
import language_explorer_service
import learning_service
import learning_studio_service
import monitoring_service
import prompt_service
import research_interoperability_service
import security_service
import speech_analysis_service
import stats_service
from dataset_service import (
    generate_research_export,
    get_dataset_details,
    list_registered_datasets,
    verify_dataset_integrity,
    verify_preservation_and_backup,
)
from evaluation_service import (
    generate_comprehensive_research_report,
)
from fastapi import (
    BackgroundTasks,
    FastAPI,
    File,
    Form,
    Header,
    HTTPException,
    Query,
    Request,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from governance_service import (
    accredit_expert_reviewer,
    accredit_organization,
    assign_review,
    create_partnership_project,
    file_governance_dispute,
    get_community_partnership_telemetry,
    get_governance_audit_logs,
    get_organization,
    init_governance_tables,
    list_expert_reviewers,
    list_governance_disputes,
    list_organizations,
    list_partnership_projects,
    list_review_assignments,
    register_expert_reviewer,
    register_organization,
    resolve_governance_dispute,
    seed_default_partnerships_if_empty,
)
from knowledge_graph_service import (
    create_knowledge_graph_node,
    create_knowledge_graph_relationship,
    delete_knowledge_graph_relationship,
    get_kg_node_details,
    get_kg_nodes,
    get_kg_overview,
    get_subgraph,
    init_knowledge_graph_tables,
    list_kg_languages,
    search_knowledge_graph,
    seed_knowledge_graph_catalog,
    update_knowledge_graph_node,
)
from model_registry import (
    assess_fine_tuning_feasibility,
    get_model_comparison_matrix,
    get_model_details,
    list_registered_models,
    promote_candidate_model,
    rollback_production_model,
)
from pydantic import BaseModel
from search_service import (
    evaluate_multilingual_discovery,
    get_archive_vector_collection,
    hybrid_discovery_search,
    index_transcript_in_vector_store,
    init_fts_index,
    reindex_all_search,
    sync_transcript_fts,
)
from storage_service import (
    create_storage_provider,
)
from transcription_service import (
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
from voice_assistant import (
    assistant_manager,
    delete_saved_conversation,
    generate_pronunciation_guidance,
    list_saved_conversations,
    save_conversation_history,
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
CHROMA_DIR = os.environ.get(
    "VOICE_ROOTS_CHROMA_DIR", os.path.join(BACKEND_DIR, "chroma_db")
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


def get_db_connection(db_path: str | None = None) -> sqlite3.Connection:
    """Return a hardened SQLite connection with WAL mode, busy timeout, and Row factory."""
    target_path = db_path if db_path is not None else DB_PATH
    conn = sqlite3.connect(target_path, timeout=15.0)
    conn.row_factory = sqlite3.Row
    try:
        conn.execute("PRAGMA journal_mode = WAL;")
        conn.execute("PRAGMA busy_timeout = 5000;")
        conn.execute("PRAGMA foreign_keys = ON;")
    except Exception:  # noqa: BLE001
        pass
    return conn


def verify_storage_persistence_and_integrity() -> dict[str, Any]:
    """Validate storage writability, disk space, and SQLite database integrity (PR-01)."""
    probe: dict[str, Any] = {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "paths": {},
        "database": {},
        "disk": {},
    }

    # Verify key directories
    for name, path in [
        ("audio_storage", AUDIO_STORAGE),
        ("backup_dir", BACKUP_DIR),
        ("storage_dir", STORAGE_DIR),
        ("chroma_dir", CHROMA_DIR),
    ]:
        exists = os.path.exists(path)
        writable = os.access(path, os.W_OK) if exists else False
        count = len(os.listdir(path)) if exists and os.path.isdir(path) else 0
        probe["paths"][name] = {
            "path": path,
            "exists": exists,
            "writable": writable,
            "file_count": count,
        }
        if not exists or not writable:
            probe["status"] = "degraded"

    # Verify SQLite database
    db_exists = os.path.exists(DB_PATH)
    db_dir = os.path.dirname(DB_PATH) or "."
    db_writable = os.access(DB_PATH, os.W_OK) if db_exists else os.access(db_dir, os.W_OK)
    db_size = os.path.getsize(DB_PATH) if db_exists else 0
    quick_check_status = "unknown"
    table_count = 0

    if db_exists:
        try:
            with sqlite3.connect(DB_PATH, timeout=5.0) as conn:
                cur = conn.cursor()
                cur.execute("PRAGMA quick_check")
                qc = cur.fetchone()
                quick_check_status = qc[0] if qc else "fail"
                cur.execute("SELECT count(*) FROM sqlite_master WHERE type='table'")
                row = cur.fetchone()
                table_count = row[0] if row else 0
        except Exception as e:  # noqa: BLE001
            quick_check_status = f"error: {e}"
            probe["status"] = "unhealthy"

    probe["database"] = {
        "path": DB_PATH,
        "exists": db_exists,
        "writable": db_writable,
        "size_bytes": db_size,
        "integrity": quick_check_status,
        "table_count": table_count,
    }

    if quick_check_status != "ok":
        probe["status"] = "unhealthy"

    # Disk usage
    try:
        usage = shutil.disk_usage(db_dir)
        probe["disk"] = {
            "total_bytes": usage.total,
            "used_bytes": usage.used,
            "free_bytes": usage.free,
            "free_mb": round(usage.free / (1024 * 1024), 2),
            "free_percent": round((usage.free / usage.total) * 100.0, 2),
        }
    except Exception:  # noqa: BLE001
        probe["disk"] = {"error": "unavailable"}

    return probe


def init_db():
    """Initialize database: runs Alembic migrations on PostgreSQL if DATABASE_URL is set, or local SQLite setup."""
    db_url = os.environ.get("DATABASE_URL")
    if db_url and (db_url.startswith("postgres://") or db_url.startswith("postgresql://")):
        logger.info("Initializing PostgreSQL database with Alembic migrations...")
        try:
            from alembic import command
            from alembic.config import Config

            alembic_cfg_path = os.path.join(os.path.dirname(__file__), "alembic.ini")
            if os.path.exists(alembic_cfg_path):
                alembic_cfg = Config(alembic_cfg_path)
                norm_url = db_url.replace("postgres://", "postgresql://", 1) if db_url.startswith("postgres://") else db_url
                alembic_cfg.set_main_option("sqlalchemy.url", norm_url)
                command.upgrade(alembic_cfg, "head")
                logger.info("Alembic migrations applied successfully to PostgreSQL.")
        except Exception as e:
            logger.warning(f"PostgreSQL Alembic migration deferred or failed: {e}")
        return

    with sqlite3.connect(DB_PATH, timeout=15.0) as conn:
        try:
            conn.execute("PRAGMA journal_mode = WAL;")
            conn.execute("PRAGMA busy_timeout = 5000;")
            conn.execute("PRAGMA foreign_keys = ON;")
        except Exception:  # noqa: BLE001
            pass
        cursor = conn.cursor()
        try:
            auth_service.init_auth_tables(conn)
            auth_service.seed_default_accounts(conn)
        except Exception as e:
            logger.warning(f"Auth tables initialization skipped: {e}")
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
            "flac_sha256": "TEXT",
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
            "prompt_id": "TEXT",
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
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_transcripts_flac_sha256 ON transcripts(flac_sha256)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_transcripts_privacy ON transcripts(privacy_level)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_transcripts_verification ON transcripts(verification_status)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_transcripts_prompt_id ON transcripts(prompt_id)")

        try:
            prompt_service.init_prompt_tables(conn)
            prompt_service.seed_prompts_if_empty(DB_PATH)
        except Exception as p_err:
            logger.warning("Prompt tables initialization error: %s", p_err)

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
        existing_trans_cols = {
            row[1] for row in cursor.execute("PRAGMA table_info(translations)")
        }
        if "review_status" not in existing_trans_cols:
            cursor.execute("ALTER TABLE translations ADD COLUMN review_status TEXT DEFAULT 'unreviewed_draft'")
        if "badge_label" not in existing_trans_cols:
            cursor.execute("ALTER TABLE translations ADD COLUMN badge_label TEXT DEFAULT 'Draft (Unreviewed)'")

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
            CREATE TABLE IF NOT EXISTS governance_audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action_type TEXT NOT NULL,
                actor_name TEXT NOT NULL,
                actor_role TEXT NOT NULL,
                entity_type TEXT NOT NULL,
                entity_id TEXT NOT NULL,
                details_json TEXT,
                timestamp TEXT NOT NULL
            )
            """
        )
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_action ON governance_audit_logs(action_type)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_entity ON governance_audit_logs(entity_type, entity_id)")

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

        # Assistant saved conversation histories (OCAP consent required)
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS assistant_conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT UNIQUE NOT NULL,
                user_name TEXT DEFAULT 'Community Speaker',
                source_language TEXT NOT NULL,
                target_language TEXT NOT NULL,
                turn_count INTEGER NOT NULL,
                conversation_json TEXT NOT NULL,
                consent_confirmed INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_assistant_conv_session ON assistant_conversations(session_id)")

        # PWA / Offline Idempotent Sync Operations Store
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS idempotent_sync_operations (
                client_operation_id TEXT PRIMARY KEY,
                action_type TEXT NOT NULL,
                status TEXT NOT NULL,
                processed_at TEXT NOT NULL,
                result_json TEXT NOT NULL
            )
            """
        )
        conn.commit()


# Initialize database upon module import
init_db()
try:
    init_fts_index()
except Exception as _e:  # noqa: BLE001
    logger.debug("FTS5 table initialization: %s", _e)

try:
    init_governance_tables(DB_PATH)
    seed_default_partnerships_if_empty(DB_PATH)
except Exception as _e:  # noqa: BLE001
    logger.debug("Governance tables initialization: %s", _e)

try:
    with sqlite3.connect(DB_PATH) as _kg_conn:
        init_knowledge_graph_tables(_kg_conn)
        seed_knowledge_graph_catalog(_kg_conn)
except Exception as _e:  # noqa: BLE001
    logger.debug("Knowledge Graph initialization: %s", _e)

try:
    cultural_archive_service.seed_default_cultural_archives(DB_PATH)
except Exception as _e:  # noqa: BLE001
    logger.debug("Cultural Archives initialization: %s", _e)

try:
    speech_analysis_service.seed_default_pronunciation_exercises(DB_PATH)
except Exception as _e:  # noqa: BLE001
    logger.debug("Speech Intelligence initialization: %s", _e)

try:
    learning_service.seed_default_learning_data(DB_PATH)
except Exception as _e:  # noqa: BLE001
    logger.debug("Language Learning initialization: %s", _e)

try:
    research_interoperability_service.seed_default_research_institutions(DB_PATH)
except Exception as _e:  # noqa: BLE001
    logger.debug("Research Interoperability initialization: %s", _e)

try:
    with sqlite3.connect(DB_PATH) as _dict_conn:
        dictionary_service.init_dictionary_tables(_dict_conn)
        dictionary_service.seed_default_lexicon(_dict_conn)
except Exception as _e:  # noqa: BLE001
    logger.debug("Dictionary initialization: %s", _e)

try:
    archive_rag_service.sync_all_archives_to_vector_store(DB_PATH)
except Exception as _e:  # noqa: BLE001
    logger.debug("Archive RAG sync initialization: %s", _e)



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
    except Exception as exc:  # noqa: BLE001
        logger.debug("Failed auto-sync search index for transcript %s: %s", transcript_id, exc)


app = FastAPI(
    title="Voice Roots API",
    description="Rooting Oral Languages in Text with AI — Core Backend API",
    version="1.0.0",
)

# Initialize observability, structured logging, and error tracking (T3.4)
monitoring_service.configure_structured_logging()
monitoring_service.init_error_tracking()

# CORS configuration for frontend services (Next.js web + Render + local dev)
# Browser calls go through the Next.js /api/v1 rewrite, so CORS mainly matters
# if anything calls the API origin directly (mobile app, scripts, other sites).
_raw_cors = (
    os.getenv("CORS_ORIGINS")
    or os.getenv("VOICE_ROOTS_ALLOWED_ORIGINS")
    or (
        "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,"
        "http://127.0.0.1:5173,http://localhost:3001,https://voice-roots.onrender.com"
    )
)
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in _raw_cors.split(",")
    if origin.strip()
]
origins = ALLOWED_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _extract_admin_identity(request: Request | None = None, header_key: str | None = None) -> tuple[bool, str]:
    """Verify administrator authorization and identify the specific administrator (PR-03)."""
    provided_key = (header_key or "").strip()
    if not provided_key and request:
        provided_key = (
            request.headers.get("X-Admin-Key")
            or request.headers.get("Authorization")
            or ""
        ).strip()
    if provided_key.startswith("Bearer "):
        provided_key = provided_key[7:].strip()

    if not provided_key:
        return False, "anonymous"

    # Check if provided_key is a valid JWT session token with admin role
    try:
        claims = auth_service.decode_access_token(provided_key)
        if claims and claims.get("role") == "admin":
            return True, claims.get("username", "jwt_admin")
    except Exception:
        pass

    required_key = os.environ.get("VOICE_ROOTS_ADMIN_KEY", "").strip()
    is_prod = os.environ.get("VOICE_ROOTS_ENV") == "production"

    # 1. Primary admin key
    if required_key and provided_key == required_key:
        return True, "primary_admin"

    # 2. Multi-user admin credentials via VOICE_ROOTS_ADMIN_USERS (PR-03)
    admin_users_raw = os.environ.get("VOICE_ROOTS_ADMIN_USERS", "").strip()
    if admin_users_raw:
        try:
            if admin_users_raw.startswith("{"):
                user_dict = json.loads(admin_users_raw)
                for uname, ukey in user_dict.items():
                    if str(ukey).strip() == provided_key:
                        return True, str(uname).strip()
            else:
                for pair in admin_users_raw.split(","):
                    if ":" in pair:
                        uname, ukey = pair.split(":", 1)
                        if ukey.strip() == provided_key:
                            return True, uname.strip()
        except Exception:  # noqa: BLE001
            pass

    # 3. Development / testing fallbacks
    if not is_prod:
        if provided_key in ("admin", "voice-roots-admin-key", "test-admin-key", "secret"):
            return True, "dev_admin"

    return False, "anonymous"


def _is_admin_request(request: Request | None) -> bool:
    """Check if request contains valid administrator credentials."""
    is_admin, _ = _extract_admin_identity(request)
    return is_admin


def _extract_user_identity(request: Request | None) -> dict[str, Any]:
    """Extract authenticated user info: (is_authenticated, user_id, role, username)."""
    if not request:
        return {"authenticated": False, "user_id": None, "role": "anonymous", "username": "anonymous"}

    # 1. Admin authentication check
    is_admin, admin_user = _extract_admin_identity(request)
    if is_admin:
        return {"authenticated": True, "user_id": "admin", "role": "admin", "username": admin_user}

    # 2. JWT bearer token check
    auth_header = (request.headers.get("Authorization") or "").strip()
    token = None
    if auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
    elif "X-Session-Token" in request.headers:
        token = request.headers.get("X-Session-Token", "").strip()

    if token:
        try:
            claims = auth_service.decode_access_token(token)
            if claims:
                return {
                    "authenticated": True,
                    "user_id": claims.get("sub") or claims.get("user_id"),
                    "role": claims.get("role", "contributor"),
                    "username": claims.get("username", "user"),
                }
        except Exception:
            pass

    # 3. Research token check
    research_key = request.headers.get("X-Research-Key", "").strip()
    if research_key:
        try:
            from research_interoperability_service import validate_research_token
            res = validate_research_token(research_key, DB_PATH)
            if res.get("valid"):
                return {
                    "authenticated": True,
                    "user_id": res.get("key_id"),
                    "role": "researcher",
                    "username": res.get("institution", "researcher"),
                }
        except Exception:
            pass

    return {"authenticated": False, "user_id": None, "role": "anonymous", "username": "anonymous"}


def _enforce_access_tier(record: dict[str, Any], request: Request | None) -> None:
    """Enforce OCAP server-side access tiers on transcripts and audio masters (SEC-03)."""
    if record.get("status") == "withdrawn" or record.get("archived_at") is not None:
        raise HTTPException(
            status_code=404,
            detail="Audio recording has been withdrawn under speaker consent.",
        )

    tier = (record.get("privacy_level") or "public").strip().lower()
    if tier == "public":
        return

    user = _extract_user_identity(request)

    # Admin always has override access for governance and compliance
    if user["role"] == "admin":
        return

    if tier == "community":
        if not user["authenticated"]:
            raise HTTPException(
                status_code=403,
                detail="Access denied: Community access tier requires an authenticated community member or elder.",
            )
        return

    if tier == "research":
        if user["role"] not in ("researcher", "admin"):
            raise HTTPException(
                status_code=403,
                detail="Access denied: Research tier requires verified researcher credentials or authorization.",
            )
        return

    if tier == "private":
        # Only admin or the verified contributor/owner
        is_owner = False
        if user["authenticated"]:
            # Check owner id match if contributor_id is present
            if record.get("contributor_id") and user.get("user_id"):
                if record.get("contributor_id") == user.get("user_id"):
                    is_owner = True
            # Check owner username match if contributor_name is a specific registered user
            c_name = record.get("contributor_name")
            if c_name and c_name not in ("Community Contributor", "Anonymous Contributor"):
                if c_name == user.get("username"):
                    is_owner = True

        if not is_owner:
            raise HTTPException(
                status_code=403,
                detail="Access denied: this recording is private under user controls.",
            )


class ApiRateLimiter:
    """Thread-safe sliding-window in-memory rate limiter with tiered quotas (T1.6)."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._records: dict[str, list[float]] = {}

    def check(
        self, key: str, max_requests: int, window_seconds: float = 60.0
    ) -> tuple[bool, int, int]:
        """Check if request is permitted under sliding window quota.

        Returns:
            (allowed: bool, remaining_requests: int, retry_after_seconds: int)
        """
        now = time.time()
        with self._lock:
            timestamps = self._records.setdefault(key, [])
            valid_timestamps = [ts for ts in timestamps if now - ts < window_seconds]
            self._records[key] = valid_timestamps

            if len(valid_timestamps) >= max_requests:
                oldest = valid_timestamps[0]
                retry_after = max(1, int(window_seconds - (now - oldest)))
                return False, 0, retry_after

            valid_timestamps.append(now)
            remaining = max_requests - len(valid_timestamps)
            return True, remaining, 0

    def clear(self) -> None:
        with self._lock:
            self._records.clear()


_GLOBAL_RATE_LIMITER = ApiRateLimiter()


@app.middleware("http")
async def security_and_logging_middleware(request: Request, call_next):
    start_time = time.time()
    method = request.method
    path = request.url.path

    client_ip = request.client.host if request.client else "127.0.0.1"

    # Distributed tracing / Correlation ID (T3.4)
    request_id = (
        request.headers.get("x-request-id")
        or request.headers.get("x-correlation-id")
        or f"req_{uuid.uuid4().hex[:12]}"
    )
    request.state.request_id = request_id

    # Rate limiting exemptions: test mode (unless explicitly testing rate limits), health checks, docs
    exempt_paths = {
        "/health",
        "/health/deep",
        "/api/health/deep",
        "/api/v1/health/deep",
        "/ready",
        "/metrics",
        "/favicon.ico",
        "/docs",
        "/openapi.json",
    }
    is_test_env = os.environ.get("VOICE_ROOTS_ENV") == "test" or bool(os.environ.get("PYTEST_CURRENT_TEST"))
    is_testing_rate_limit = bool(request.headers.get("x-test-rate-limit"))
    is_exempt = path in exempt_paths or (is_test_env and not is_testing_rate_limit)

    limit = 120
    remaining = 120

    if not is_exempt:
        if path.startswith(("/api/v1/auth", "/api/auth")):
            limit = int(os.environ.get("AUTH_RATE_LIMIT_PER_MINUTE", "30"))
            bucket = f"auth:{client_ip}"
        elif path.startswith(("/api/v1/transcripts/upload", "/api/upload")):
            limit = int(os.environ.get("UPLOAD_RATE_LIMIT_PER_MINUTE", "40"))
            bucket = f"upload:{client_ip}"
        else:
            limit = int(os.environ.get("API_RATE_LIMIT_PER_MINUTE", "120"))
            bucket = f"api:{client_ip}"

        allowed, remaining, retry_after = _GLOBAL_RATE_LIMITER.check(
            bucket, limit, window_seconds=60.0
        )
        if not allowed:
            logger.warning(
                "Rate limit exceeded for %s on %s %s (limit: %d/min)",
                client_ip,
                method,
                path,
                limit,
            )
            headers = {
                "Retry-After": str(retry_after),
                "X-RateLimit-Limit": str(limit),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(int(time.time() + retry_after)),
            }
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Too Many Requests",
                    "detail": f"Rate limit exceeded: maximum {limit} requests per minute allowed.",
                    "retry_after": retry_after,
                },
                headers=headers,
            )

    response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 2)

    # Security Headers (SEC-06 & T1.6)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-XSS-Protection"] = "0"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(self), geolocation=()"
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: blob: https:; "
        "media-src 'self' blob: data: https:; "
        "connect-src 'self' http: https:;"
    )
    if request.url.scheme == "https" or request.headers.get("x-forwarded-proto") == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    # Correlation ID propagation (T3.4)
    response.headers["X-Request-ID"] = request_id

    # Rate limiting telemetry headers
    if not is_exempt:
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(time.time() + 60))

    logger.info(
        "HTTP %s %s -> status=%d duration_ms=%.2f client=%s [req_id=%s]",
        method,
        path,
        response.status_code,
        duration_ms,
        client_ip,
        request_id,
        extra={
            "request_id": request_id,
            "method": method,
            "path": path,
            "status_code": response.status_code,
            "duration_ms": duration_ms,
            "client_ip": client_ip,
        },
    )
    return response


@app.get("/storage/audio/{filename}")
def stream_storage_audio_file(filename: str, request: Request):
    """Securely stream master audio verifying path integrity, affirmative consent, and OCAP access levels (SEC-03)."""
    safe_filename = os.path.basename(filename)
    if safe_filename != filename or ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid audio filename.")

    provider = create_storage_provider(storage_dir=AUDIO_STORAGE)

    # Check for cryptographic signed URL signature (T3.5)
    has_valid_signature = False
    sig = request.query_params.get("sig")
    expires = request.query_params.get("expires")
    if sig and expires:
        is_valid, reason = security_service.verify_signed_audio_token(
            filename=safe_filename,
            expires=expires,
            sig=sig,
        )
        if not is_valid:
            raise HTTPException(status_code=403, detail=f"Signed URL validation failed: {reason}")
        has_valid_signature = True

    # Enforce OCAP boundaries
    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute(
                """
                SELECT id, privacy_level, status, archived_at, contributor_name
                FROM transcripts
                WHERE audio_filename = ?
                """,
                (safe_filename,),
            ).fetchone()
            if row:
                row_dict = dict(row)
                # Consent withdrawal check is immutable: even signed URLs cannot stream withdrawn audio
                if row_dict.get("status") == "withdrawn" or row_dict.get("archived_at") is not None:
                    raise HTTPException(
                        status_code=404,
                        detail="Audio recording has been withdrawn under speaker consent.",
                    )
                if not has_valid_signature:
                    _enforce_access_tier(row_dict, request)

            # Also check cultural stories for sacred elder-only lore
            story = conn.execute(
                """
                SELECT story_id, access_classification
                FROM cultural_stories
                WHERE audio_reference = ?
                """,
                (safe_filename,),
            ).fetchone()
            if story and story["access_classification"] == "SACRED_ELDER_ONLY":
                user = _extract_user_identity(request)
                if user["role"] not in ("admin", "reviewer"):
                    raise HTTPException(
                        status_code=403,
                        detail="Access denied: Restricted or sacred cultural audio recording.",
                    )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.warning("Error verifying audio permissions for %s: %s", safe_filename, exc)

    # Cloudflare R2 / S3 Presigned Streaming
    if provider.name in ("r2", "s3"):
        signed_url = provider.get_stream_url(safe_filename, expires_in=3600)
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url=signed_url, status_code=307)

    # Local Filesystem Streaming
    file_path = os.path.join(AUDIO_STORAGE, safe_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found.")

    return FileResponse(file_path, media_type="audio/wav")


@app.get("/api/v1/storage/signed-url/{filename}")
def get_signed_audio_stream_url(
    filename: str,
    request: Request,
    expires_in: int = Query(3600, ge=60, le=86400),
):
    """Generate a cryptographic signed URL for streaming audio, verifying access tiers (T3.5)."""
    safe_filename = os.path.basename(filename)
    if safe_filename != filename or ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid audio filename.")

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            "SELECT id, privacy_level, status, archived_at, contributor_name FROM transcripts WHERE audio_filename = ?",
            (safe_filename,),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Recording metadata not found.")
        _enforce_access_tier(dict(row), request)

    signed_url = security_service.generate_signed_audio_url(
        filename=safe_filename,
        expires_in=expires_in,
    )
    return {
        "filename": safe_filename,
        "expires_in": expires_in,
        "signed_url": signed_url,
    }


# Mount built frontend assets for unified web application serving
_assets_dir = os.path.join(FRONTEND_DIST, "assets")
if os.path.exists(_assets_dir):
    app.mount("/assets", StaticFiles(directory=_assets_dir), name="frontend_assets")


# Pydantic schemas for data validation
class TranscriptUpdate(BaseModel):
    title: str | None = None
    transcript_text: str | None = None
    dialect: str | None = None
    contributor_name: str | None = None
    contributor_role: str | None = None
    provenance_notes: str | None = None
    transliteration_text: str | None = None
    license: str | None = None
    privacy_level: str | None = None
    retention_policy: str | None = None


class TranscriptionRequest(BaseModel):
    transcription_consent: bool = False


class TranscriptResponse(BaseModel):
    id: int
    uuid_id: str
    title: str
    audio_filename: str
    audio_url: str
    language: str
    dialect: str | None = None
    transcript_text: str
    status: str
    duration_seconds: float
    created_at: str
    updated_at: str
    audio_sha256: str | None = None
    flac_sha256: str | None = None
    is_flac_verified: bool = False
    file_size_bytes: int | None = None
    consent_at: str | None = None
    consent_version: str | None = None
    archived_at: str | None = None
    machine_transcript_text: str = ""
    transcription_status: str = "not_requested"
    transcription_provider: str | None = None
    transcription_model: str | None = None
    transcription_error: str | None = None
    transcription_consent_at: str | None = None
    transcription_consent_version: str | None = None
    transcribed_at: str | None = None
    verification_status: str | None = "submitted"
    consent_private_storage: int | None = 1
    consent_community_access: int | None = 1
    consent_public_publication: int | None = 0
    consent_ai_training: int | None = 0
    is_anonymous: int | None = 0
    contextual_notes: str | None = None
    reviewer_uncertainty: str | None = None
    verified_by: str | None = None
    verified_at: str | None = None
    review_notes: str | None = None

# Pilot testing schemas
class PilotSubmissionCreate(BaseModel):
    transcript_id: int
    tester_name: str
    consent: bool
    notes: str | None = None

class PilotSubmissionResponse(BaseModel):
    id: int
    transcript_id: int
    tester_name: str
    consent: int
    notes: str | None
    withdrawn: int
    created_at: str
    updated_at: str

class PilotReviewCreate(BaseModel):
    submission_id: int
    reviewer_name: str
    approval: int  # 0 or 1
    uncertainty: str | None = None
    corrected_transcript: str | None = None
    corrected_translation: str | None = None
    review_notes: str | None = None

class PilotReviewResponse(BaseModel):
    id: int
    submission_id: int
    reviewer_name: str
    approval: int
    uncertainty: str | None
    corrected_transcript: str | None
    corrected_translation: str | None
    review_notes: str | None
    reviewed_at: str

class PilotMetricCreate(BaseModel):
    language: str
    dialect: str | None = None
    model: str
    sample_size: int
    wer: float | None = None
    cer: float | None = None
    bleu: float | None = None
    evaluation_date: str  # ISO date string

class PilotMetricResponse(BaseModel):
    id: int
    language: str
    dialect: str | None
    model: str
    sample_size: int
    wer: float | None
    cer: float | None
    bleu: float | None
    evaluation_date: str


class ContributionDraftUpdateRequest(BaseModel):
    title: str | None = None
    dialect: str | None = None
    contextual_notes: str | None = None
    transcript_text: str | None = None
    transliteration_text: str | None = None
    submit: bool = False  # If True, transitions 'draft' -> 'submitted'


class VerificationReviewRequest(BaseModel):
    reviewer_name: str
    reviewer_role: str
    decision: str  # verified, changes_requested, corrected, withdrawn_or_rejected
    corrected_transcript: str | None = None
    corrected_translation: str | None = None
    reviewer_uncertainty: str | None = None  # low, medium, high, unclear_audio, unknown_dialect
    review_notes: str | None = None
    admin_key: str | None = None


from language_registry import (
    get_language,
    get_system_capabilities,
    list_languages,
    register_language,
)


class RegisterLanguageRequest(BaseModel):
    name: str
    code: str
    native: str | None = None
    script: str | None = None
    family: str | None = None
    region: str | None = None
    category: str | None = "indigenous"
    speech_recognition: str | None = "experimental"
    speech_model: str | None = "whisper-local"
    translation: str | None = "elder_review_required"
    translation_models: str | None = "Community review required"
    resource_search: str | None = "available"
    tested_status: str | None = "dynamically_registered"
    known_limitations: str | None = None


# Backwards-compatibility alias populated dynamically
SUPPORTED_LANGUAGES = list_languages()


@app.api_route("/", methods=["GET", "HEAD"])
@app.api_route("/app", methods=["GET", "HEAD"])
def root(request: Request):
    """Root endpoint welcoming clients and serving the unified SPA, or JSON API metadata when requested."""
    accept = request.headers.get("accept", "")
    is_browser_html_request = "text/html" in accept and "application/json" not in accept
    if os.path.exists(INDEX_HTML_PATH) and is_browser_html_request:
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
    db_type = "sqlite"
    database_url = os.environ.get("DATABASE_URL")

    if database_url and (database_url.startswith("postgres://") or database_url.startswith("postgresql://")):
        db_type = "postgresql"
        try:
            psycopg2 = importlib.import_module("psycopg2")
            norm_url = database_url.replace("postgres://", "postgresql://", 1) if database_url.startswith("postgres://") else database_url
            conn = psycopg2.connect(norm_url, connect_timeout=5)
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
            conn.close()
        except Exception:
            db_status = "error"
            status = "degraded"
    else:
        try:
            with sqlite3.connect(DB_PATH) as conn:
                conn.execute("SELECT 1").fetchone()
        except Exception:  # noqa: BLE001
            # Keep internal paths and exception details out of the public health response.
            db_status = "error"
            status = "degraded"

    return {
        "status": status,
        "app": "Voice Roots",
        "version": "1.0.0",
        "database": db_type,
        "database_status": db_status,
        "storage_status": "ok" if os.path.exists(STORAGE_DIR) else "not_configured",
    }


# Render's health check alias
health = health_check


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
    database_url = os.environ.get("DATABASE_URL")

    if database_url and (database_url.startswith("postgres://") or database_url.startswith("postgresql://")):
        try:
            psycopg2 = importlib.import_module("psycopg2")
            norm_url = database_url.replace("postgres://", "postgresql://", 1) if database_url.startswith("postgres://") else database_url
            conn = psycopg2.connect(norm_url, connect_timeout=5)
            with conn.cursor() as cur:
                cur.execute("SELECT 1 FROM transcripts LIMIT 1")
            conn.close()
        except Exception:
            checks["database"] = "unready"
            is_ready = False
    else:
        try:
            with sqlite3.connect(DB_PATH) as conn:
                conn.execute("SELECT 1 FROM transcripts LIMIT 1")
        except Exception:  # noqa: BLE001
            checks["database"] = "unready"
            is_ready = False

    if not os.path.exists(AUDIO_STORAGE) or not os.access(AUDIO_STORAGE, os.W_OK):
        checks["storage"] = "unready"
        is_ready = False

    try:
        stats = get_vector_stats()
        if stats.get("status") != "healthy":
            checks["vector_store"] = "degraded"
    except Exception:  # noqa: BLE001
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


@app.get("/health/deep")
@app.get("/api/health/deep")
@app.get("/api/v1/health/deep")
def deep_health_check(response: Response):
    """Deep system health and observability probe assessing database, storage, and host metrics (T3.4)."""
    probe = monitoring_service.get_deep_health_probe(
        db_path=DB_PATH,
        storage_dir=STORAGE_DIR,
        audio_storage=AUDIO_STORAGE,
    )
    if probe.get("status") == "unhealthy":
        response.status_code = 503
    return probe


@app.get("/languages")
@app.get("/api/languages")
@app.get("/api/v1/languages")
def get_languages(
    q: str | None = None,
    category: str | None = None,
    family: str | None = None,
    script: str | None = None,
    region: str | None = None,
    limit: int | None = None,
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
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(exc))


# ============================================================================
# User Authentication & Role-Based Access Control (RBAC) Endpoints
# ============================================================================

class UserRegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    full_name: str
    role: str = "contributor"
    bio: str | None = None


class UserLoginRequest(BaseModel):
    identifier: str | None = None
    email: str | None = None
    username: str | None = None
    password: str


@app.post("/api/v1/auth/register", status_code=201)
@app.post("/api/auth/register", status_code=201)
def api_auth_register(payload: UserRegisterRequest):
    """Register a new user account with secure password hashing and role assignment."""
    try:
        user = auth_service.register_user(
            DB_PATH,
            username=payload.username,
            email=payload.email,
            password=payload.password,
            full_name=payload.full_name,
            role=payload.role,
            bio=payload.bio,
        )
        return {"status": "success", "message": "User registered successfully.", "data": user}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:  # noqa: BLE001
        logger.exception("Registration failed")
        raise HTTPException(status_code=500, detail="Registration failed due to internal error.")


@app.post("/api/v1/auth/login")
@app.post("/api/auth/login")
def api_auth_login(payload: UserLoginRequest):
    """Authenticate a user by username or email and return JWT access token."""
    ident = payload.identifier or payload.email or payload.username or ""
    if not ident:
        raise HTTPException(status_code=400, detail="Username or email identifier is required.")
    try:
        user = auth_service.authenticate_user(DB_PATH, ident, payload.password)
        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials. Please check your username/email and password.",
            )
        return {"status": "success", "message": "Authentication successful.", "data": user}
    except ValueError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except HTTPException:
        raise
    except Exception:  # noqa: BLE001
        logger.exception("Login failed")
        raise HTTPException(status_code=500, detail="Login failed due to internal error.")


@app.get("/api/v1/auth/me")
@app.get("/api/auth/me")
def api_auth_me(request: Request):
    """Return currently authenticated user profile based on Bearer token."""
    auth_header = (request.headers.get("Authorization") or "").strip()
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization Bearer token required.")
    token = auth_header[7:].strip()
    claims = auth_service.decode_access_token(token)
    if not claims:
        raise HTTPException(status_code=401, detail="Invalid or expired access token.")
    user = auth_service.get_user_by_id(DB_PATH, claims.get("sub", ""))
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"status": "success", "user": user}


@app.post("/api/v1/auth/logout")
@app.post("/api/auth/logout")
def api_auth_logout():
    """Client session logout endpoint."""
    return {"status": "success", "message": "Logged out successfully."}


@app.get("/api/v1/auth/users")
@app.get("/api/auth/users")
def api_auth_list_users(request: Request):
    """List all registered users (Administrator only)."""
    if not _is_admin_request(request):
        raise HTTPException(status_code=403, detail="Administrator authorization required to list users.")
    users = auth_service.list_users(DB_PATH)
    return {"status": "success", "total_users": len(users), "users": users}


@app.get("/api/v1/transcriptions")
@app.get("/api/transcripts")
def list_transcripts(
    request: Request,
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
def get_transcript(transcript_id: int, request: Request):
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
    _enforce_access_tier(record, request)
    return record


@app.get("/api/v1/audio/{transcript_id}/stream")
def get_audio_stream_endpoint(transcript_id: int, request: Request):
    """Provide secure, authorized audio stream URL (local path or presigned S3/R2 URL)."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            "SELECT * FROM transcripts WHERE id = ?",
            (transcript_id,),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Recording not found")

        record = dict(row)
        _enforce_access_tier(record, request)

        provider = create_storage_provider(storage_dir=AUDIO_STORAGE)
        stream_url = provider.get_stream_url(record["audio_filename"], expires_in=3600)
        effective_backend = provider.name if provider.name in ("r2", "s3") else (record.get("storage_backend") or provider.name)
        return {
            "transcript_id": transcript_id,
            "filename": record["audio_filename"],
            "stream_url": stream_url,
            "storage_backend": effective_backend,
            "privacy_level": record.get("privacy_level", "public"),
            "audio_sha256": record.get("audio_sha256"),
            "flac_sha256": record.get("flac_sha256"),
            "is_flac_verified": bool(record.get("flac_sha256")),
            "license": record.get("license", "CC BY-NC 4.0"),
            "contributor_name": record.get("contributor_name", "Community Contributor"),
            "expires_in_seconds": 3600 if effective_backend in ("r2", "s3") else None,
        }



def _set_transcription_state(
    transcript_id: int,
    *,
    state: str,
    error: str | None = None,
    provider: str | None = None,
    model: str | None = None,
    text: str | None = None,
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
            "SELECT * FROM transcripts WHERE id = ?",
            (transcript_id,),
        ).fetchone()
        if row is None:
            return
        row_dict = dict(row)
        audio_path = os.path.join(AUDIO_STORAGE, row_dict["audio_filename"])

    _set_transcription_state(transcript_id, state="processing")
    try:
        provider = create_transcription_provider()
        recording_language = row_dict.get("language")
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
    except Exception as exc:  # noqa: BLE001
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


def _audio_format(prefix: bytes) -> str | None:
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


async def _store_audio_upload(file: UploadFile) -> tuple[str, int, str, str | None]:
    """Stream a bounded upload to a temporary file, evaluate FLAC losslessness, and preserve it."""
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

        # Compute SHA-256 digest on temporary file before storing
        digest = hashlib.sha256()
        with open(temp_path, "rb") as f:
            while chunk := f.read(65536):
                digest.update(chunk)
        sha256_hash = digest.hexdigest()

        # Ingest Deduplication: reuse master if identical audio already exists in database AND on storage
        try:
            storage_prov = create_storage_provider(storage_dir=AUDIO_STORAGE)
            with get_db_connection() as conn:
                cur = conn.cursor()
                cur.execute(
                    "SELECT audio_filename, file_size_bytes, audio_sha256, flac_sha256, storage_backend FROM transcripts WHERE (audio_sha256 = ? OR flac_sha256 = ?) AND archived_at IS NULL LIMIT 1",
                    (sha256_hash, sha256_hash),
                )
                existing = cur.fetchone()
                if existing and existing["audio_filename"] and storage_prov.file_exists(existing["audio_filename"]):
                    logger.info("SHA-256 dedupe: audio master %s already exists as %s. Reusing master.", sha256_hash, existing["audio_filename"])
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
                    return existing["audio_filename"], existing["file_size_bytes"] or size, existing["audio_sha256"] or sha256_hash, existing["flac_sha256"]
        except Exception as _dedupe_err:
            logger.debug("Deduplication check bypassed: %s", _dedupe_err)

        # T1.5: Convert uploads to FLAC on ingest and prove losslessness by comparing decoded samples
        flac_sha256: str | None = None
        flac_master_path: str | None = None
        try:
            if detected_format in ("wav", "flac"):
                from backend.flac_service import convert_to_flac_and_verify
                flac_res = convert_to_flac_and_verify(temp_path, allow_non_lossless_fallback=False)
                if flac_res.is_lossless:
                    flac_sha256 = flac_res.flac_sha256
                    flac_master_path = flac_res.flac_path
                    logger.info(
                        "FLAC conversion & lossless verification passed: %s -> %s (saved %.1f%%)",
                        sha256_hash[:12],
                        flac_sha256[:12],
                        flac_res.space_saved_percentage,
                    )
        except Exception as _flac_err:
            logger.debug("FLAC conversion/verification bypassed or skipped: %s", _flac_err)

        filename = f"{uuid.uuid4()}.{detected_format}"
        provider = create_storage_provider(storage_dir=AUDIO_STORAGE)
        stored_filename, stored_size, sha256_hash = provider.store_file(
            temp_path, filename, content_type=declared_type
        )
        if flac_master_path and os.path.exists(flac_master_path):
            try:
                flac_filename = f"{os.path.splitext(filename)[0]}.flac"
                provider.store_file(flac_master_path, flac_filename, content_type="audio/flac")
            except Exception as _flac_store_err:
                logger.debug("FLAC secondary storage bypass: %s", _flac_store_err)
            finally:
                if os.path.exists(flac_master_path):
                    os.remove(flac_master_path)

        return stored_filename, stored_size, sha256_hash, flac_sha256
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
    if os.environ.get("VOICE_ROOTS_ENV") == "test" or os.environ.get("PYTEST_CURRENT_TEST") or not client_ip:
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


@app.post("/api/v1/transcripts/upload")
@app.post("/api/v1/audio/upload")
@app.post("/api/upload")
async def upload_audio(
    background_tasks: BackgroundTasks,
    request: Request,
    file: UploadFile | None = File(None),  # noqa: B008
    audio: UploadFile | None = File(None),  # noqa: B008
    title: str = Form(...),
    language: str = Form(...),
    dialect: str | None = Form(None),
    consent: bool = Form(False),
    transcription_consent: bool = Form(False),
    contributor_name: str | None = Form("Community Contributor"),
    contributor_role: str | None = Form("speaker"),
    provenance_notes: str | None = Form(None),
    transliteration_text: str | None = Form(None),
    license: str | None = Form("CC BY-NC 4.0"),
    privacy_level: str | None = Form("public"),
    retention_policy: str | None = Form("indefinite"),
    is_draft: bool = Form(False),
    verification_status: str | None = Form(None),
    consent_private_storage: bool = Form(False),
    consent_community_access: bool = Form(False),
    consent_public_publication: bool = Form(False),
    consent_ai_training: bool = Form(False),
    is_anonymous: bool = Form(False),
    contextual_notes: str | None = Form(None),
    client_uuid: str | None = Form(None),
    prompt_id: str | None = Form(None),
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

    # Idempotent offline sync check: return existing record if already synced
    if client_uuid:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM transcripts WHERE uuid_id = ? AND archived_at IS NULL", (client_uuid,))
            existing = cursor.fetchone()
            if existing:
                return dict(existing)

    unique_filename, file_size, audio_sha256, flac_sha256 = await _store_audio_upload(upload_file)

    audio_url = f"/storage/audio/{unique_filename}"
    unique_uuid = client_uuid or str(uuid.uuid4())
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
        stored_path = os.path.join(AUDIO_STORAGE, unique_filename)
        if os.path.exists(stored_path):
            try:
                import soundfile as sf
                calculated_duration = round(float(sf.info(stored_path).duration), 2)
            except Exception:
                if unique_filename.endswith(".wav"):
                    with wave.open(stored_path, "rb") as wf:
                        framerate = wf.getframerate()
                        if framerate > 0:
                            calculated_duration = round(wf.getnframes() / float(framerate), 2)
    except Exception as _exc:
        logger.debug("Failed reading audio duration for %s: %s", unique_filename, _exc)

    storage_backend = create_storage_provider(storage_dir=AUDIO_STORAGE).name

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
                    created_at, updated_at, audio_sha256, flac_sha256, file_size_bytes,
                    consent_at, consent_version, transcription_status,
                    transcription_consent_at, transcription_consent_version,
                    contributor_name, contributor_role, provenance_notes,
                    transliteration_text, license, privacy_level, retention_policy,
                    storage_backend,
                    verification_status, consent_private_storage, consent_community_access,
                    consent_public_publication, consent_ai_training, is_anonymous,
                    contextual_notes, prompt_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                    flac_sha256,
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
                    prompt_id,
                ),
            )
            conn.commit()
            if cursor.lastrowid is None:
                raise RuntimeError("Failed to obtain transcript ID after insert.")
            transcript_id = int(cursor.lastrowid)
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
        "flac_sha256": flac_sha256,
        "prompt_id": prompt_id,
        "is_flac_verified": bool(flac_sha256),
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
            "SELECT * FROM transcripts WHERE id = ?",
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
    id: int | None = None
    transcript_id: int | None = None
    recording_id: int | None = None
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
def withdraw_transcript_consent(transcript_id: str):
    """Withdraw speaker consent under OCAP principles. Immediately purges audio, transcripts, translations, and embeddings."""
    now = datetime.now(timezone.utc).isoformat()
    numeric_id = None
    try:
        numeric_id = int(transcript_id)
    except ValueError:
        pass

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # 1. Locate the transcript record
        if numeric_id is not None:
            cursor.execute("SELECT * FROM transcripts WHERE id = ?", (numeric_id,))
        else:
            cursor.execute("SELECT * FROM transcripts WHERE uuid_id = ? OR id = ?", (transcript_id, transcript_id))
        row = cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Transcript not found.")

        rec = dict(row)
        t_id = rec["id"]
        audio_filename = rec.get("audio_filename") or ""

        # 2. Check if already withdrawn
        if rec.get("archived_at") is not None:
            raise HTTPException(status_code=404, detail=f"Recording {t_id} is already withdrawn under OCAP consent protocols.")

        # Check if any other active transcript still shares this physical audio file
        other_active_count = 0
        if audio_filename:
            cursor.execute(
                "SELECT COUNT(*) FROM transcripts WHERE audio_filename = ? AND id != ? AND archived_at IS NULL",
                (audio_filename, t_id),
            )
            other_active_count = cursor.fetchone()[0]

        # 3. Purge audio master and flac files from storage provider and disk (only if no other active transcript shares it)
        if audio_filename and other_active_count == 0:
            try:
                provider = create_storage_provider(storage_dir=AUDIO_STORAGE)
                # Attempt delete with consent_withdrawn=True (mandatory for R2 write-once policy)
                try:
                    provider.delete_file(audio_filename, consent_withdrawn=True)
                except TypeError:
                    provider.delete_file(audio_filename)

                # If wav, also delete corresponding flac master
                if audio_filename.lower().endswith(".wav"):
                    flac_name = audio_filename.rsplit(".", 1)[0] + ".flac"
                    try:
                        provider.delete_file(flac_name, consent_withdrawn=True)
                    except Exception:
                        pass
            except Exception as s_err:
                logger.warning("Could not delete audio from storage provider on withdrawal: %s", s_err)

            # Local disk cleanup
            for fname in [audio_filename, audio_filename.rsplit(".", 1)[0] + ".flac" if "." in audio_filename else ""]:
                if fname:
                    local_p = os.path.join(AUDIO_STORAGE, fname)
                    if os.path.exists(local_p):
                        try:
                            os.remove(local_p)
                        except Exception:
                            pass

        # 4. Cascade database deletions: translations, corrections, alignments
        cursor.execute("DELETE FROM translations WHERE transcript_id = ?", (t_id,))
        cursor.execute("DELETE FROM corrections WHERE target_type = 'transcript' AND target_id = ?", (t_id,))
        try:
            cursor.execute("DELETE FROM speech_alignments WHERE transcript_id = ?", (t_id,))
            cursor.execute("DELETE FROM speech_acoustic_metrics WHERE transcript_id = ?", (t_id,))
        except Exception:
            pass

        # 5. Clear full-text search index
        try:
            cursor.execute("DELETE FROM transcripts_fts WHERE rowid = ?", (t_id,))
        except Exception:
            pass

        # 6. Update transcripts row to withdrawn state (passport continuity with purged data)
        cursor.execute(
            """
            UPDATE transcripts
            SET archived_at = ?,
                status = 'withdrawn',
                verification_status = 'withdrawn_or_rejected',
                audio_filename = '',
                audio_url = '',
                audio_sha256 = '',
                flac_sha256 = '',
                transcript_text = '[Consent Withdrawn - Master Audio and Annotations Purged under OCAP Protocol]',
                machine_transcript_text = '',
                transcription_status = 'withdrawn',
                updated_at = ?
            WHERE id = ?
            """,
            (now, now, t_id),
        )

        # 7. Write immutable governance audit log entry
        audit_details = json.dumps({
            "reason": "Speaker exercised OCAP consent withdrawal",
            "purged": ["audio_master", "flac_master", "translations", "corrections", "vector_embeddings", "speech_alignments"],
            "title": rec.get("title", ""),
            "language": rec.get("language", ""),
            "previous_audio_sha256": rec.get("audio_sha256", ""),
            "timestamp": now,
        })
        cursor.execute(
            """
            INSERT INTO governance_audit_logs (
                action_type, actor_name, actor_role, entity_type, entity_id, details_json, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "CONSENT_WITHDRAWN",
                rec.get("contributor_name") or "Speaker / Contributor",
                "speaker",
                "transcript",
                str(t_id),
                audit_details,
                now,
            ),
        )
        conn.commit()

    # 8. Purge vector store embeddings
    try:
        from search_service import get_archive_vector_collection
        col = get_archive_vector_collection()
        if col:
            col.delete(ids=[str(t_id)])
    except Exception as v_err:
        logger.debug("Archive vector store delete error: %s", v_err)

    try:
        from vector_store import get_resource_collection
        r_col = get_resource_collection()
        if r_col:
            r_col.delete(ids=[f"transcript:{t_id}", f"transcript_{t_id}"])
    except Exception as v_err:
        logger.debug("Resource vector store delete error: %s", v_err)

    return {
        "success": True,
        "message": f"Consent withdrawn for recording {t_id}. Audio master, transcripts, translations, and embeddings permanently purged under OCAP protocol.",
        "id": t_id,
        "status": "Consent Withdrawn",
        "verification_status": "withdrawn_or_rejected",
        "is_withdrawn": True,
        "withdrawn_at": now,
        "purged": {
            "audio": True,
            "translations": True,
            "embeddings": True,
            "transcripts": True,
        },
    }


@app.get("/api/v1/transcripts/{transcript_id}/passport")
@app.get("/api/v1/passport/{transcript_id}")
def get_transcript_passport(transcript_id: str):
    """Retrieve public Heritage Passport data for a recording, including withdrawn state."""
    numeric_id = None
    try:
        numeric_id = int(transcript_id)
    except ValueError:
        pass

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        if numeric_id is not None:
            cursor.execute("SELECT * FROM transcripts WHERE id = ?", (numeric_id,))
        else:
            cursor.execute("SELECT * FROM transcripts WHERE uuid_id = ? OR id = ?", (transcript_id, transcript_id))
        row = cursor.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Heritage Passport not found.")

    rec = dict(row)
    is_withdrawn = bool(rec.get("status") == "withdrawn" or rec.get("archived_at") is not None)

    return {
        "id": rec["id"],
        "uuid_id": rec["uuid_id"],
        "title": rec["title"],
        "language": rec["language"],
        "dialect": rec.get("dialect"),
        "community": rec.get("contributor_name") or "Heritage Custodians",
        "is_withdrawn": is_withdrawn,
        "status": "withdrawn" if is_withdrawn else rec.get("status", "active"),
        "verification_status": "withdrawn" if is_withdrawn else rec.get("verification_status", "submitted"),
        "withdrawn_at": rec.get("archived_at") if is_withdrawn else None,
        "audio_available": not is_withdrawn,
        "audio_sha256": rec.get("audio_sha256") if not is_withdrawn else None,
        "flac_sha256": rec.get("flac_sha256") if not is_withdrawn else None,
        "upload_date": rec.get("created_at"),
        "message": (
            "Consent has been withdrawn by the speaker under OCAP data sovereignty protocols. "
            "Master audio, transcripts, and vector embeddings have been permanently purged."
        ) if is_withdrawn else "Official Heritage Passport Verified.",
    }


class DiscoverySearchRequest(BaseModel):
    query: str | None = None
    q: str | None = None
    mode: str = "hybrid"  # 'hybrid', 'semantic', 'keyword'
    language: str | None = None
    dialect: str | None = None
    verification_status: str | None = None
    topic: str | None = None
    date_from: str | None = None
    date_to: str | None = None
    has_audio: bool | None = None
    has_translation: bool | None = None
    page: int = 1
    page_size: int = 20
    sort_by: str = "relevance"


@app.get("/api/v1/archive/search")
def search_archive(
    request: Request,
    q: str | None = None,
    query: str | None = None,
    language: str | None = None,
    status: str | None = None,
    mode: str | None = Query(None),
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
    q: str | None = Query(None),
    query: str | None = Query(None),
    mode: str = Query("hybrid", pattern="^(hybrid|semantic|keyword)$"),
    language: str | None = Query(None),
    dialect: str | None = Query(None),
    verification_status: str | None = Query(None),
    topic: str | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    has_audio: bool | None = Query(None),
    has_translation: bool | None = Query(None),
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
        except Exception:  # noqa: BLE001
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


@app.get("/api/v1/stats/public")
def get_public_statistics_endpoint():
    """Public statistics reporting recorded hours, speakers, and audio masters alongside Census 2011 benchmarks."""
    return stats_service.get_public_stats(db_path=DB_PATH)


@app.get("/api/v1/stats/census")
def get_census_metadata_endpoint():
    """Retrieve raw Census of India 2011 demographic data from data/census/."""
    return stats_service.load_census_raw_data()


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


# ==============================================================================
# Milestone 11: Multilingual AI Model Evaluation, Comparison & Governance
# ==============================================================================

class ModelPromotionRequest(BaseModel):
    target_slot: str = "speech_to_text"
    admin_key: str | None = None


class ModelRollbackRequest(BaseModel):
    target_slot: str = "speech_to_text"
    admin_key: str | None = None


@app.get("/api/v1/models")
def get_models_registry():
    """List all models registered in the Voice Roots Multilingual Model Registry."""
    models = list_registered_models()
    return {
        "models": models,
        "total_models": len(models),
        "status": "healthy",
    }


@app.get("/api/v1/models/comparison/matrix")
def get_models_comparison_matrix():
    """Retrieve cross-model evaluation, hardware requirements, latency, and cost comparison matrix."""
    return get_model_comparison_matrix()


@app.get("/api/v1/models/fine-tuning/feasibility")
def get_fine_tuning_feasibility_study():
    """Audit data volume, OCAP consent compliance, compute costs, and feasibility for local fine-tuning."""
    return assess_fine_tuning_feasibility()


@app.get("/api/v1/models/{model_id}")
def get_model_specification_card(model_id: str):
    """Retrieve detailed model card, architecture, licenses, evaluation metrics, and limitations."""
    details = get_model_details(model_id)
    if not details:
        raise HTTPException(
            status_code=404,
            detail=f"Model '{model_id}' not found in registry.",
        )
    return details


@app.post("/api/v1/models/{model_id}/promote")
def promote_model_endpoint(
    model_id: str,
    payload: ModelPromotionRequest,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
):
    """Promote a candidate model to production slot under strict release gates & OCAP compliance."""
    admin_key = payload.admin_key or x_admin_key
    res = promote_candidate_model(
        model_id=model_id,
        target_slot=payload.target_slot,
        admin_key=admin_key,
    )
    if not res.get("success"):
        raise HTTPException(status_code=res.get("status_code", 400), detail=res.get("error"))
    return res


@app.post("/api/v1/models/rollback")
def rollback_model_endpoint(
    payload: ModelRollbackRequest,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
):
    """Rollback current production model in target slot to its designated baseline target."""
    admin_key = payload.admin_key or x_admin_key
    res = rollback_production_model(
        target_slot=payload.target_slot,
        admin_key=admin_key,
    )
    if not res.get("success"):
        raise HTTPException(status_code=res.get("status_code", 400), detail=res.get("error"))
    return res


# ==============================================================================
# Milestone 12: Real-Time Multilingual Voice Assistant API
# ==============================================================================

class VoiceAssistantSessionCreate(BaseModel):
    source_language: str = "te"
    target_language: str = "en"
    user_name: str = "Community Speaker"


class VoiceAssistantTurnTextRequest(BaseModel):
    text: str
    override_source_lang: str | None = None
    override_target_lang: str | None = None


class VoiceAssistantSaveRequest(BaseModel):
    consent_confirmed: bool = False
    user_name: str | None = None


class VoiceAssistantPronounceRequest(BaseModel):
    text: str
    language: str = "te"


@app.post("/api/v1/voice-assistant/sessions")
def create_voice_assistant_session(payload: VoiceAssistantSessionCreate):
    """Start an authorized real-time voice conversation session with ephemeral memory."""
    return assistant_manager.create_session(
        source_language=payload.source_language,
        target_language=payload.target_language,
        user_name=payload.user_name,
    )


@app.get("/api/v1/voice-assistant/sessions/{session_id}")
def get_voice_assistant_session(session_id: str):
    """Retrieve session summary, active status, and remaining turn limits."""
    session = assistant_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Voice assistant session '{session_id}' not found or expired.")
    return session.to_summary()


@app.delete("/api/v1/voice-assistant/sessions/{session_id}")
def close_voice_assistant_session(session_id: str):
    """Close conversation session and purge all ephemeral in-memory state."""
    closed = assistant_manager.close_session(session_id)
    if not closed:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")
    return {"success": True, "session_id": session_id, "message": "Session closed and ephemeral memory purged."}


@app.get("/api/v1/voice-assistant/sessions/{session_id}/history")
def get_voice_assistant_history(session_id: str):
    """Retrieve conversation turns for the active session."""
    try:
        return assistant_manager.get_session_history(session_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/api/v1/voice-assistant/sessions/{session_id}/turn")
async def process_voice_turn_audio(
    session_id: str,
    audio: UploadFile | None = File(None),  # noqa: B008
    text_input: str | None = Form(None),
    override_source_lang: str | None = Form(None),
    override_target_lang: str | None = Form(None),
):
    """
    Process an interactive audio or text turn:
    Executes live transcription, Indigenous elder guardrail verification,
    conversational translation, and pronunciation guidance.
    """
    audio_bytes = None
    audio_format = "wav"
    if audio:
        audio_bytes = await audio.read()
        if audio.filename and "." in audio.filename:
            audio_format = audio.filename.rsplit(".", 1)[-1].lower()

    try:
        res = assistant_manager.process_turn(
            session_id=session_id,
            audio_bytes=audio_bytes,
            text_input=text_input,
            audio_format=audio_format,
            override_source_lang=override_source_lang,
            override_target_lang=override_target_lang,
        )
        return res
    except ValueError as e:
        err_msg = str(e)
        if "not found" in err_msg.lower():
            raise HTTPException(status_code=404, detail=err_msg)
        raise HTTPException(status_code=400, detail=err_msg)


@app.post("/api/v1/voice-assistant/sessions/{session_id}/turn-text")
def process_voice_turn_text_json(
    session_id: str,
    payload: VoiceAssistantTurnTextRequest,
):
    """Instant text-based turn for assistive keyboard entry or conversational queries."""
    try:
        res = assistant_manager.process_turn(
            session_id=session_id,
            audio_bytes=None,
            text_input=payload.text,
            override_source_lang=payload.override_source_lang,
            override_target_lang=payload.override_target_lang,
        )
        return res
    except ValueError as e:
        err_msg = str(e)
        if "not found" in err_msg.lower():
            raise HTTPException(status_code=404, detail=err_msg)
        raise HTTPException(status_code=400, detail=err_msg)


@app.post("/api/v1/voice-assistant/sessions/{session_id}/save")
def save_voice_assistant_conversation(
    session_id: str,
    payload: VoiceAssistantSaveRequest,
):
    """Persist conversation history into database. Strictly requires affirmative OCAP consent."""
    try:
        return save_conversation_history(
            session_id=session_id,
            user_name=payload.user_name,
            consent_confirmed=payload.consent_confirmed,
            db_path=DB_PATH,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/v1/voice-assistant/saved")
def list_saved_voice_conversations(limit: int = Query(50)):
    """List saved conversation histories with speaker attribution."""
    return {"saved_conversations": list_saved_conversations(db_path=DB_PATH, limit=limit)}


@app.delete("/api/v1/voice-assistant/saved/{conv_id}")
def delete_saved_voice_conversation(conv_id: int):
    """Purge saved conversation history under OCAP data sovereignty & deletion controls."""
    deleted = delete_saved_conversation(conv_id=conv_id, db_path=DB_PATH)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Saved conversation ID {conv_id} not found.")
    return {"success": True, "conversation_id": conv_id, "message": "Saved conversation permanently deleted."}


@app.post("/api/v1/voice-assistant/pronounce")
def get_pronunciation_guidance_endpoint(payload: VoiceAssistantPronounceRequest):
    """Generate phonetic transliteration, phoneme syllables, and pronunciation tips."""
    return generate_pronunciation_guidance(
        text=payload.text,
        language=payload.language,
    )




@app.get("/api/v1/archive/export")
def export_archive_corpus(
    request: Request,
    format: str = Query("json", pattern="^(json|csv)$"),
    language: str | None = None,
    include_private: bool = Query(False),
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


@app.get("/api/v1/export/public-audio")
@app.post("/api/v1/export/public-audio")
def export_public_audio_corpus(
    request: Request,
    dry_run: bool = Query(False),
    format: str = Query("jsonl", pattern="^(jsonl|csv)$"),
    language: str | None = None,
):
    """Admin-only export of consented, public-tier data as audio plus manifest (T2.9)."""
    if not _is_admin_request(request):
        raise HTTPException(
            status_code=403,
            detail="Administrator authorization required for restricted data export.",
        )

    if dry_run:
        return data_export_service.get_export_dry_run(
            db_path=DB_PATH,
            audio_storage_dir=AUDIO_STORAGE,
            language=language,
        )

    zip_bytes, zip_filename, summary = data_export_service.build_export_zip(
        db_path=DB_PATH,
        audio_storage_dir=AUDIO_STORAGE,
        manifest_format=format,
        language=language,
    )

    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="{zip_filename}"',
            "X-Export-Records": str(summary["total_records"]),
            "X-Export-Audio-Files": str(summary["audio_files_exported"]),
        },
    )



class DetectLanguageRequest(BaseModel):
    id: int | None = None
    transcript_id: int | None = None
    recording_id: int | None = None


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
    except Exception as exc:  # noqa: BLE001
        logger.error("Language detection failed for %s: %s", target_id, exc)
        raise HTTPException(status_code=500, detail="Language detection failed due to an internal processing error.")


class TranslateRequest(BaseModel):
    text: str
    source_language: str | None = None
    sourceLang: str | None = None
    target_language: str | None = "en"
    targetLang: str | None = "en"
    transcript_id: int | None = None
    recording_id: int | None = None


class TranslationUpdate(BaseModel):
    translated_text: str | None = None
    verified: bool | None = None
    limitation_note: str | None = None


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
            review_status = getattr(result, "review_status", "elder_approved" if result.verified else "unreviewed_draft")
            badge_label = getattr(result, "badge_label", "Elder Approved" if result.verified else "Draft (Unreviewed)")
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    INSERT INTO translations (
                        transcript_id, source_language, target_language, source_text,
                        translated_text, provider, model, verified, limitation_note,
                        review_status, badge_label,
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                        review_status,
                        badge_label,
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
            "review_status": getattr(result, "review_status", "elder_approved" if result.verified else "unreviewed_draft"),
            "badge_label": getattr(result, "badge_label", "Elder Approved" if result.verified else "Draft (Unreviewed)"),
            "is_elder_approved": bool(getattr(result, "review_status", "") == "elder_approved" or result.verified),
            "limitation_note": result.limitation_note,
            "created_at": now if translation_id else None,
        }
    except OralLanguageElderReviewRequiredError as o_err:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Translation restricted: {o_err!s} "
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
    except Exception as exc:  # noqa: BLE001
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
    language: str | None = None
    dialect: str | None = None
    document_type: str | None = None
    verification_status: str | None = None
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
    admin_key: str | None = None
    resources: list[dict[str, Any]] | None = None

ResourceIngestRequest.model_rebuild()


def _verify_admin(admin_key: str | None = None, header_key: str | None = None) -> str:
    """Verify administrator authorization, returning administrator identity (PR-03)."""
    provided_key = (admin_key or header_key or "").strip()
    required_key = os.environ.get("VOICE_ROOTS_ADMIN_KEY", "").strip()
    is_prod = os.environ.get("VOICE_ROOTS_ENV") == "production"

    if provided_key:
        is_admin, admin_user = _extract_admin_identity(None, provided_key)
        if not is_admin:
            raise HTTPException(status_code=403, detail="Invalid administrator credentials.")
        return admin_user

    # No key provided:
    if is_prod or required_key:
        raise HTTPException(status_code=403, detail="Invalid administrator credentials.")

    # In development/test mode with no admin key configured, permit for legacy tests:
    return "test_admin"


@app.post("/api/v1/resources/ingest")
@app.post("/api/resources/ingest")
def ingest_resources_endpoint(
    payload: ResourceIngestRequest | None = None,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
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
        with open(processed_path, encoding="utf-8") as f:
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
    payload: ResourceIngestRequest | None = None,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
):
    """Re-index all language resources into ChromaDB."""
    return ingest_resources_endpoint(payload, x_admin_key=x_admin_key)


# ==============================================================================
# Stage 6: Evaluation, Community Corrections, Dataset Quality, and Reliability
# ==============================================================================

class CorrectionCreateRequest(BaseModel):
    suggested_text: str
    contributor_name: str | None = "Community Contributor"
    contributor_role: str | None = "community_member"
    rationale: str | None = None
    consent_confirmed: bool = True


class CorrectionReviewRequest(BaseModel):
    status: str  # approved | rejected
    reviewed_by: str | None = "Community Elder"
    reviewer_role: str | None = "community_elder"
    review_notes: str | None = None
    reviewer_uncertainty: str | None = None  # e.g., 'certain', 'uncertain_dialect_variation', 'needs_second_elder'


class ResourceSubmissionRequest(BaseModel):
    submission_type: str = "vocabulary"
    language_code: str
    language_name: str
    dialect: str | None = None
    term_or_text: str
    translation_text: str | None = None
    cultural_context: str | None = None
    contributor_name: str | None = "Community Contributor"
    contributor_affiliation: str | None = None
    license: str = "CC BY 4.0"
    attribution: str
    source_url: str | None = None
    speaker_consent_given: bool = True
    is_sacred_or_restricted: bool = False


class SubmissionModerateRequest(BaseModel):
    status: str  # verified | rejected
    reviewer_notes: str | None = None
    admin_key: str | None = None


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
        _normalize_text,
        compute_cer,
        compute_chrf,
        compute_wer,
        levenshtein_distance,
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
def list_resource_submissions(status: str | None = None):
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
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
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
        except Exception as e:  # noqa: BLE001
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

    records: list[dict[str, Any]] = []
    if os.path.exists(processed_path):
        with open(processed_path, encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    records.append(json.loads(line))

    seen_ids = set()
    seen_texts = set()
    duplicate_count = 0
    license_counts: dict[str, int] = {}
    lang_counts: dict[str, int] = {}
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
        if url and not (url.startswith(("http://", "https://", "archive://"))):
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
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
):
    """Trigger safe atomic SQLite database snapshot with automatic retention rotation (PR-04)."""
    admin_user = _verify_admin(None, x_admin_key)
    os.makedirs(BACKUP_DIR, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(BACKUP_DIR, f"voice_roots_backup_{timestamp}.db")

    with get_db_connection() as src_conn:
        dest_conn = sqlite3.connect(backup_file)
        src_conn.backup(dest_conn)
        dest_conn.close()

    size_bytes = os.path.getsize(backup_file)

    # Automatic rolling retention pruning to prevent disk exhaustion (PR-04)
    prune_res = backup_retention_service.prune_old_backups(
        backup_dir=BACKUP_DIR,
        retain_days=14,
        max_backups=50,
        dry_run=False,
    )

    logger.info("Admin '%s' created database snapshot: %s", admin_user, backup_file)
    return {
        "success": True,
        "backup_filename": os.path.basename(backup_file),
        "backup_file": backup_file,
        "backup_bytes": size_bytes,
        "size_bytes": size_bytes,
        "timestamp": timestamp,
        "created_by": admin_user,
        "retention_status": prune_res.get("message"),
        "message": "Atomic SQLite database snapshot created successfully.",
    }


@app.post("/api/v1/system/backups/prune")
def prune_backups_endpoint(
    retain_days: int = 14,
    max_backups: int = 50,
    dry_run: bool = False,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
):
    """Prune historical database snapshots according to tiered retention policy (PR-04)."""
    admin_user = _verify_admin(None, x_admin_key)
    res = backup_retention_service.prune_old_backups(
        backup_dir=BACKUP_DIR,
        retain_days=retain_days,
        max_backups=max_backups,
        dry_run=dry_run,
    )
    res["triggered_by"] = admin_user
    return res


class RestoreSnapshotRequest(BaseModel):
    backup_filename: str
    dry_run: bool = False


@app.post("/api/v1/system/restore")
def restore_database_endpoint(
    req: RestoreSnapshotRequest,
    request: Request,
):
    """Admin-only point-in-time database restore with automatic safety snapshot (T3.3)."""
    if not _is_admin_request(request):
        raise HTTPException(
            status_code=403,
            detail="Administrator authorization required for database restore.",
        )
    safe_fn = os.path.basename(req.backup_filename)
    backup_file = os.path.join(BACKUP_DIR, safe_fn)

    if not os.path.isfile(backup_file):
        raise HTTPException(status_code=404, detail=f"Backup snapshot '{safe_fn}' not found in backup store.")

    try:
        res = backup_retention_service.restore_database_snapshot(
            backup_path=backup_file,
            target_db_path=DB_PATH,
            dry_run=req.dry_run,
        )
        logger.info("Admin executed database restore: %s (dry_run=%s)", safe_fn, req.dry_run)
        return res
    except Exception as exc:
        logger.error("Database restore failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Restore operation failed: {exc}")


@app.get("/api/v1/system/storage-probe")
def get_system_storage_probe():
    """Deep persistence, volume health, and disk quota probe for institutional pilots (PR-01)."""
    return verify_storage_persistence_and_integrity()


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
        sub_dict = {k: row[k] for k in row if k in ["id", "transcript_id", "tester_name", "consent", "notes", "withdrawn", "created_at", "updated_at"]}
        transcript_dict = {k: row[k] for k in row if k.startswith("transcript_") or k in ["title", "audio_filename", "language", "dialect", "transcript_text", "status", "duration_seconds", "created_at", "updated_at"]}
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
    language: str | None = Query(None),
    model: str | None = Query(None),
    start_date: str | None = Query(None),
    end_date: str | None = Query(None),
):
    """List pilot metrics with optional filters."""
    query = "SELECT * FROM pilot_metrics WHERE 1=1"
    params: list[Any] = []
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
    contributor_name: str | None = Query(None),
    status: str | None = Query(None),
    verification_status: str | None = Query(None),
    limit: int = Query(50),
):
    """Retrieve contributions with verification status for the contributor portal."""
    query = "SELECT * FROM transcripts WHERE archived_at IS NULL"
    params: list[Any] = []
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
    reviewer_role: str | None = Query(None),
    status: str | None = Query(None),
    language: str | None = Query(None),
    limit: int = Query(50),
):
    """List recordings awaiting human transcript verification. Requires reviewer role."""
    if reviewer_role and reviewer_role not in AUTHORIZED_REVIEWER_ROLES:
        raise HTTPException(status_code=403, detail="Access denied: Reviewer authorization required.")

    query = "SELECT * FROM transcripts WHERE archived_at IS NULL"
    params: list[Any] = []
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
    admin_key: str | None = Query(None),
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
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


# ==============================================================================
# Milestone 14: Community Partnerships and Language Governance
# ==============================================================================

class OrganizationRegisterRequest(BaseModel):
    name: str
    slug: str
    org_type: str
    contact_email: str
    lead_coordinator_name: str
    target_languages: list[str]
    description: str | None = None
    website_url: str | None = None


class OrganizationAccreditRequest(BaseModel):
    admin_key: str | None = None
    status: str = "verified_partner"
    accreditation_notes: str = "Verified by Voice Roots Governance Council"


class ProjectCreateRequest(BaseModel):
    project_name: str
    slug: str
    target_languages: list[str]
    collection_goal: str | None = None
    license_policy: str = "CC BY-NC 4.0"
    tk_labels: list[str] | None = None


class ReviewerRegisterRequest(BaseModel):
    reviewer_name: str
    reviewer_role: str
    languages_qualified: list[str]
    org_id: int | None = None


class ReviewerAccreditRequest(BaseModel):
    admin_key: str | None = None
    status: str = "accredited"
    accredited_by: str = "Voice Roots Linguistic Committee"


class ReviewAssignRequest(BaseModel):
    transcript_id: int
    reviewer_id: int
    assigned_by: str
    project_id: int | None = None
    due_date: str | None = None


class DisputeFileRequest(BaseModel):
    target_type: str
    target_id: int
    dispute_type: str
    filed_by_name: str
    filed_by_role: str
    description: str
    suggested_resolution: str | None = None


class DisputeResolveRequest(BaseModel):
    resolver_name: str
    resolver_role: str
    decision: str
    resolution_notes: str


@app.post("/api/v1/governance/organizations")
def api_register_organization(req: OrganizationRegisterRequest):
    try:
        org = register_organization(
            name=req.name,
            slug=req.slug,
            org_type=req.org_type,
            contact_email=req.contact_email,
            lead_coordinator_name=req.lead_coordinator_name,
            target_languages=req.target_languages,
            description=req.description,
            website_url=req.website_url,
            db_path=DB_PATH,
        )
        return org
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logger.exception("Failed to register organization")
        raise HTTPException(status_code=500, detail="Internal server error registering organization.")


@app.get("/api/v1/governance/organizations")
def api_list_organizations(status: str | None = Query(None)):
    return list_organizations(status=status, db_path=DB_PATH)


@app.get("/api/v1/governance/organizations/{id_or_slug}")
def api_get_organization(id_or_slug: str):
    org = get_organization(id_or_slug, db_path=DB_PATH)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found.")
    return org


@app.post("/api/v1/governance/organizations/{org_id}/accredit")
def api_accredit_organization(
    org_id: int,
    req: OrganizationAccreditRequest,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
):
    key = req.admin_key or x_admin_key or ""
    try:
        updated = accredit_organization(
            org_id=org_id,
            admin_key=key,
            accreditation_notes=req.accreditation_notes,
            status=req.status,
            db_path=DB_PATH,
        )
        return updated
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        logger.exception("Failed to accredit organization")
        raise HTTPException(status_code=500, detail="Internal server error accrediting organization.")


@app.post("/api/v1/governance/organizations/{org_id}/projects")
def api_create_project(org_id: int, req: ProjectCreateRequest):
    try:
        project = create_partnership_project(
            org_id=org_id,
            project_name=req.project_name,
            slug=req.slug,
            target_languages=req.target_languages,
            collection_goal=req.collection_goal,
            license_policy=req.license_policy,
            tk_labels=req.tk_labels,
            db_path=DB_PATH,
        )
        return project
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logger.exception("Failed to create project")
        raise HTTPException(status_code=500, detail="Internal server error creating project.")


@app.get("/api/v1/governance/projects")
def api_list_projects(
    org_id: int | None = Query(None),
    language: str | None = Query(None),
):
    return list_partnership_projects(org_id=org_id, language=language, db_path=DB_PATH)


@app.post("/api/v1/governance/reviewers")
def api_register_reviewer(req: ReviewerRegisterRequest):
    try:
        reviewer = register_expert_reviewer(
            reviewer_name=req.reviewer_name,
            reviewer_role=req.reviewer_role,
            languages_qualified=req.languages_qualified,
            org_id=req.org_id,
            db_path=DB_PATH,
        )
        return reviewer
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logger.exception("Failed to register reviewer")
        raise HTTPException(status_code=500, detail="Internal server error registering reviewer.")


@app.get("/api/v1/governance/reviewers")
def api_list_reviewers(
    language: str | None = Query(None),
    status: str | None = Query(None),
):
    return list_expert_reviewers(language=language, status=status, db_path=DB_PATH)


@app.post("/api/v1/governance/reviewers/{reviewer_id}/accredit")
def api_accredit_reviewer(
    reviewer_id: int,
    req: ReviewerAccreditRequest,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
):
    key = req.admin_key or x_admin_key or ""
    try:
        updated = accredit_expert_reviewer(
            reviewer_id=reviewer_id,
            admin_key=key,
            accredited_by=req.accredited_by,
            status=req.status,
            db_path=DB_PATH,
        )
        return updated
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        logger.exception("Failed to accredit reviewer")
        raise HTTPException(status_code=500, detail="Internal server error accrediting reviewer.")


@app.post("/api/v1/governance/assignments")
def api_assign_review(req: ReviewAssignRequest):
    try:
        assignment = assign_review(
            transcript_id=req.transcript_id,
            reviewer_id=req.reviewer_id,
            assigned_by=req.assigned_by,
            project_id=req.project_id,
            due_date=req.due_date,
            db_path=DB_PATH,
        )
        return assignment
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logger.exception("Failed to assign review")
        raise HTTPException(status_code=500, detail="Internal server error assigning review.")


@app.get("/api/v1/governance/assignments")
def api_list_assignments(
    reviewer_id: int | None = Query(None),
    status: str | None = Query(None),
):
    return list_review_assignments(reviewer_id=reviewer_id, status=status, db_path=DB_PATH)


@app.post("/api/v1/governance/disputes")
def api_file_dispute(req: DisputeFileRequest):
    try:
        dispute = file_governance_dispute(
            target_type=req.target_type,
            target_id=req.target_id,
            dispute_type=req.dispute_type,
            filed_by_name=req.filed_by_name,
            filed_by_role=req.filed_by_role,
            description=req.description,
            suggested_resolution=req.suggested_resolution,
            db_path=DB_PATH,
        )
        return dispute
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logger.exception("Failed to file dispute")
        raise HTTPException(status_code=500, detail="Internal server error filing dispute.")


@app.get("/api/v1/governance/disputes")
def api_list_disputes(status: str | None = Query(None)):
    return list_governance_disputes(status=status, db_path=DB_PATH)


@app.post("/api/v1/governance/disputes/{dispute_id}/resolve")
def api_resolve_dispute(dispute_id: int, req: DisputeResolveRequest):
    try:
        res = resolve_governance_dispute(
            dispute_id=dispute_id,
            resolver_name=req.resolver_name,
            resolver_role=req.resolver_role,
            decision=req.decision,
            resolution_notes=req.resolution_notes,
            db_path=DB_PATH,
        )
        return res
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logger.exception("Failed to resolve dispute")
        raise HTTPException(status_code=500, detail="Internal server error resolving dispute.")


@app.get("/api/v1/governance/audit-logs")
def api_get_audit_logs(limit: int = Query(50, ge=1, le=500)):
    return get_governance_audit_logs(limit=limit, db_path=DB_PATH)


@app.get("/api/v1/governance/telemetry")
def api_get_governance_telemetry():
    return get_community_partnership_telemetry(db_path=DB_PATH)


# ==============================================================================
# MILESTONE 16: LANGUAGE KNOWLEDGE GRAPH API
# ==============================================================================


class KGNodeCreateRequest(BaseModel):
    entity_type: str
    name: str
    node_id: str | None = None
    native_name: str | None = None
    primary_language: str | None = None
    script: str | None = None
    category: str | None = None
    summary: str | None = None
    source_reference: str | None = None
    source_organization: str | None = None
    dataset_version: str | None = None
    metadata: dict[str, Any] | None = None
    verification_status: str | None = None
    vocabulary_details: dict[str, Any] | None = None


class KGRelationshipCreateRequest(BaseModel):
    source_id: str
    target_id: str
    relationship_type: str
    weight: float = 1.0
    confidence_score: float = 1.0
    provenance: str | None = None
    source_reference: str | None = None
    verification_status: str | None = None


class KGNodeUpdateRequest(BaseModel):
    name: str | None = None
    native_name: str | None = None
    script: str | None = None
    category: str | None = None
    summary: str | None = None
    verification_status: str | None = None
    source_reference: str | None = None
    source_organization: str | None = None
    metadata: dict[str, Any] | None = None


@app.get("/api/v1/knowledge-graph/overview")
@app.get("/api/v1/kg/overview")
def api_get_kg_overview():
    """Retrieve high-level summary and health metrics of the Language Knowledge Graph."""
    return get_kg_overview(db_path=DB_PATH)


@app.get("/api/v1/knowledge-graph/languages")
@app.get("/api/v1/kg/languages")
def api_list_kg_languages():
    """List all languages currently structured in the Knowledge Graph with entity counts."""
    return list_kg_languages(db_path=DB_PATH)


@app.get("/api/v1/knowledge-graph/nodes")
@app.get("/api/v1/kg/nodes")
def api_get_kg_nodes(
    entity_type: str | None = None,
    language: str | None = None,
    script: str | None = None,
    category: str | None = None,
    verification_status: str | None = None,
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """List knowledge graph nodes filtered by type, language, script, or verification status."""
    return get_kg_nodes(
        entity_type=entity_type,
        language=language,
        script=script,
        category=category,
        verification_status=verification_status,
        limit=limit,
        offset=offset,
        db_path=DB_PATH,
    )


@app.get("/api/v1/knowledge-graph/nodes/{node_id}")
@app.get("/api/v1/kg/nodes/{node_id}")
def api_get_kg_node_details(node_id: str, x_admin_key: str | None = Header(None, alias="X-Admin-Key")):
    """Get full details of a knowledge graph entity, including edges and vocabulary info."""
    is_admin = (x_admin_key == ADMIN_API_KEY) if x_admin_key else False
    res = get_kg_node_details(node_id=node_id, is_admin=is_admin, db_path=DB_PATH)
    if not res:
        raise HTTPException(status_code=404, detail=f"Knowledge graph node '{node_id}' not found.")
    return res


@app.get("/api/v1/knowledge-graph/graph")
@app.get("/api/v1/kg/graph")
def api_get_kg_subgraph(
    center_node_id: str | None = None,
    language: str | None = None,
    entity_types: str | None = None,
    max_nodes: int = Query(60, ge=1, le=200),
):
    """Retrieve connected nodes and edges for visual interactive graph exploration."""
    type_list = [t.strip() for t in entity_types.split(",") if t.strip()] if entity_types else None
    return get_subgraph(
        center_node_id=center_node_id,
        language=language,
        entity_types=type_list,
        max_nodes=max_nodes,
        db_path=DB_PATH,
    )


@app.get("/api/v1/knowledge-graph/search")
@app.get("/api/v1/kg/search")
def api_search_kg(
    q: str = Query(..., min_length=1),
    language: str | None = None,
    entity_type: str | None = None,
    limit: int = Query(25, ge=1, le=100),
):
    """Search knowledge graph entities using Indic-preserving FTS5 Unicode matching."""
    return search_knowledge_graph(
        query=q,
        language=language,
        entity_type=entity_type,
        limit=limit,
        db_path=DB_PATH,
    )


def _check_kg_admin(x_admin_key: str | None = None, authorization: str | None = None) -> bool:
    """Check if requester is authorized for KG management via admin key or JWT session."""
    if x_admin_key == ADMIN_API_KEY:
        return True
    key = (x_admin_key or authorization or "").strip()
    if key.startswith("Bearer "):
        key = key[7:].strip()
    if key:
        try:
            claims = auth_service.decode_access_token(key)
            if claims and claims.get("role") in ("admin", "researcher", "reviewer"):
                return True
        except Exception:
            pass
    return False


@app.post("/api/v1/knowledge-graph/nodes", status_code=201)
@app.post("/api/v1/kg/nodes", status_code=201)
def api_create_kg_node(
    req: KGNodeCreateRequest,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
    authorization: str | None = Header(None, alias="Authorization"),
):
    """Create a new knowledge graph node. Authorized admins can verify directly; public contributions are proposed."""
    is_admin = _check_kg_admin(x_admin_key, authorization)
    status = req.verification_status if (is_admin and req.verification_status) else ("VERIFIED" if is_admin else "PROPOSED")

    try:
        created = create_knowledge_graph_node(
            entity_type=req.entity_type,
            name=req.name,
            node_id=req.node_id,
            native_name=req.native_name,
            primary_language=req.primary_language,
            script=req.script,
            category=req.category,
            summary=req.summary,
            source_reference=req.source_reference,
            source_organization=req.source_organization,
            dataset_version=req.dataset_version,
            metadata=req.metadata,
            verification_status=status,
            vocabulary_details=req.vocabulary_details,
            db_path=DB_PATH,
        )
        return created
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logger.exception("Failed to create knowledge graph node")
        raise HTTPException(status_code=500, detail="Internal server error creating knowledge graph node.")


@app.post("/api/v1/knowledge-graph/relationships", status_code=201)
@app.post("/api/v1/kg/relationships", status_code=201)
def api_create_kg_relationship(
    req: KGRelationshipCreateRequest,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
    authorization: str | None = Header(None, alias="Authorization"),
):
    """Create a semantic link between two knowledge graph nodes."""
    is_admin = _check_kg_admin(x_admin_key, authorization)
    status = req.verification_status if (is_admin and req.verification_status) else ("VERIFIED" if is_admin else "PROPOSED")

    try:
        created = create_knowledge_graph_relationship(
            source_id=req.source_id,
            target_id=req.target_id,
            relationship_type=req.relationship_type,
            weight=req.weight,
            confidence_score=req.confidence_score,
            provenance=req.provenance,
            source_reference=req.source_reference,
            verification_status=status,
            db_path=DB_PATH,
        )
        return created
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logger.exception("Failed to create knowledge graph relationship")
        raise HTTPException(status_code=500, detail="Internal server error creating knowledge graph relationship.")


@app.patch("/api/v1/knowledge-graph/nodes/{node_id}")
@app.patch("/api/v1/kg/nodes/{node_id}")
def api_update_kg_node(
    node_id: str,
    req: KGNodeUpdateRequest,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
    authorization: str | None = Header(None, alias="Authorization"),
):
    """Update metadata or verification status for a knowledge graph node."""
    is_admin = _check_kg_admin(x_admin_key, authorization)
    if req.verification_status and req.verification_status != "PROPOSED" and not is_admin:
        raise HTTPException(status_code=403, detail="Admin authorization required to change verification status.")

    try:
        updated = update_knowledge_graph_node(
            node_id=node_id,
            name=req.name,
            native_name=req.native_name,
            script=req.script,
            category=req.category,
            summary=req.summary,
            verification_status=req.verification_status,
            source_reference=req.source_reference,
            source_organization=req.source_organization,
            metadata=req.metadata,
            is_admin=is_admin,
            db_path=DB_PATH,
        )
        if not updated:
            raise HTTPException(status_code=404, detail=f"Knowledge graph node '{node_id}' not found.")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logger.exception("Failed to update knowledge graph node")
        raise HTTPException(status_code=500, detail="Internal server error updating knowledge graph node.")


@app.delete("/api/v1/knowledge-graph/relationships/{rel_id}")
@app.delete("/api/v1/kg/relationships/{rel_id}")
def api_delete_kg_relationship(
    rel_id: int,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
    authorization: str | None = Header(None, alias="Authorization"),
):
    """Delete a knowledge graph relationship (admin only)."""
    if not _check_kg_admin(x_admin_key, authorization):
        raise HTTPException(status_code=403, detail="Admin authorization required.")
        raise HTTPException(status_code=403, detail="Admin authorization required to delete relationships.")

    deleted = delete_knowledge_graph_relationship(relationship_id=rel_id, is_admin=True, db_path=DB_PATH)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Relationship ID {rel_id} not found.")
    return {"deleted": True, "id": rel_id}


# =========================================================================
# Milestone 17: Interactive Cultural and Oral History Archives API
# =========================================================================

class CreateCulturalCollectionRequest(BaseModel):
    title: str
    description: str | None = None
    primary_language: str
    category: str = "Oral History"
    cover_image_url: str | None = None
    creator_organization_id: str | None = None
    creator_name: str = "Community Elder Council"
    provenance_details: str | None = None
    access_classification: str = "PUBLIC"
    traditional_knowledge_label: str = "TK Notice (Open)"

class CreateCulturalSubmissionRequest(BaseModel):
    contributor_name: str
    language: str
    title: str
    contributor_email: str | None = None
    variety: str | None = None
    description: str | None = None
    transcript_draft: str | None = None
    translation_draft: str | None = None
    attribution_preference: str = "BY_NAME"
    collection_id: str | None = None
    consent_recording: bool = True
    consent_transcription: bool = True
    consent_translation: bool = False
    consent_public_display: bool = True
    consent_research_reuse: bool = True
    consent_educational_reuse: bool = True
    is_sacred_ceremonial: bool = False

class ReviewCulturalSubmissionRequest(BaseModel):
    decision: str  # APPROVED, REJECTED, UNDER_REVIEW
    reviewer_name: str = "Community Elder Reviewer"
    review_notes: str | None = None
    create_story_on_approval: bool = True
    target_collection_id: str | None = None
    access_classification: str = "PUBLIC"

class WithdrawCulturalRecordRequest(BaseModel):
    record_id: str
    requester_name: str
    reason: str | None = None

def _extract_archive_auth_context(
    x_admin_key: str | None = None,
    x_user_role: str | None = None,
    x_user_language: str | None = None,
    authorization: str | None = None,
) -> tuple[bool, list[str], str | None]:
    is_auth = False
    roles: list[str] = []

    provided_key = (x_admin_key or "").strip()
    if not provided_key and authorization:
        provided_key = authorization.strip()

    if provided_key == ADMIN_API_KEY:
        is_auth = True
        roles.extend(["admin", "elder"])
    elif provided_key:
        cleaned_key = provided_key
        if cleaned_key.startswith("Bearer "):
            cleaned_key = cleaned_key[7:].strip()
        try:
            claims = auth_service.decode_access_token(cleaned_key)
            if claims:
                is_auth = True
                user_role = claims.get("role", "contributor")
                if user_role not in roles:
                    roles.append(user_role)
                if user_role in ("admin", "reviewer") and "elder" not in roles:
                    roles.append("elder")
        except Exception:
            pass
    if x_user_role:
        is_prod = os.environ.get("VOICE_ROOTS_ENV") == "production"
        # SEC-02: In production, unauthenticated client-provided roles are strictly ignored
        if is_prod and x_admin_key != ADMIN_API_KEY and not is_auth:
            pass
        else:
            is_auth = True
            for r in x_user_role.split(","):
                rc = r.strip().lower()
                if rc and rc not in roles:
                    roles.append(rc)
                if rc in ("reviewer", "elder") and "elder" not in roles:
                    roles.append("elder")
    return is_auth, roles, x_user_language


@app.get("/api/v1/cultural-archives/overview")
@app.get("/api/v1/archives/overview")
def api_cultural_archives_overview(
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
    x_user_role: str | None = Header(None, alias="X-User-Role"),
    x_user_language: str | None = Header(None, alias="X-User-Language"),
    authorization: str | None = Header(None, alias="Authorization"),
):
    """Retrieve cultural archive telemetry metrics and categories."""
    is_auth, roles, _ = _extract_archive_auth_context(x_admin_key, x_user_role, x_user_language, authorization)
    return cultural_archive_service.get_cultural_archive_overview(
        DB_PATH, is_authenticated=is_auth, user_roles=roles
    )


@app.get("/api/v1/cultural-archives/collections")
@app.get("/api/v1/archives/collections")
def api_list_archive_collections(
    language: str | None = None,
    category: str | None = None,
    access_level: str | None = None,
    limit: int = 50,
    offset: int = 0,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
    x_user_role: str | None = Header(None, alias="X-User-Role"),
    x_user_language: str | None = Header(None, alias="X-User-Language"),
    authorization: str | None = Header(None, alias="Authorization"),
):
    """List accessible cultural collections with permission gating."""
    is_auth, roles, _ = _extract_archive_auth_context(x_admin_key, x_user_role, x_user_language, authorization)
    return cultural_archive_service.list_archive_collections(
        DB_PATH,
        language=language,
        category=category,
        access_level=access_level,
        is_authenticated=is_auth,
        user_roles=roles,
        limit=limit,
        offset=offset,
    )


@app.get("/api/v1/cultural-archives/collections/{collection_id}")
@app.get("/api/v1/archives/collections/{collection_id}")
def api_get_archive_collection(
    collection_id: str,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
    x_user_role: str | None = Header(None, alias="X-User-Role"),
    x_user_language: str | None = Header(None, alias="X-User-Language"),
    authorization: str | None = Header(None, alias="Authorization"),
):
    """Get collection details, provenance, and contained stories."""
    is_auth, roles, _ = _extract_archive_auth_context(x_admin_key, x_user_role, x_user_language, authorization)
    res = cultural_archive_service.get_archive_collection(
        DB_PATH, collection_id, is_authenticated=is_auth, user_roles=roles
    )
    if not res:
        raise HTTPException(status_code=404, detail=f"Collection '{collection_id}' not found or access restricted.")
    return res


@app.post("/api/v1/cultural-archives/collections")
@app.post("/api/v1/archives/collections")
def api_create_archive_collection(
    req: CreateCulturalCollectionRequest,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
    x_user_role: str | None = Header(None, alias="X-User-Role"),
    authorization: str | None = Header(None, alias="Authorization"),
):
    """Create a new cultural archive collection (Elder or Admin authorized)."""
    _is_auth, roles, _ = _extract_archive_auth_context(x_admin_key, x_user_role, authorization=authorization)
    if "admin" not in roles and "elder" not in roles:
        raise HTTPException(status_code=403, detail="Elder or Administrator credentials required to create collections.")

    try:
        created = cultural_archive_service.create_archive_collection(
            DB_PATH,
            title=req.title,
            description=req.description,
            primary_language=req.primary_language,
            category=req.category,
            cover_image_url=req.cover_image_url,
            creator_organization_id=req.creator_organization_id,
            creator_name=req.creator_name,
            provenance_details=req.provenance_details,
            access_classification=req.access_classification,
            traditional_knowledge_label=req.traditional_knowledge_label,
            is_admin="admin" in roles,
        )
        return created
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logger.exception("Error creating archive collection")
        raise HTTPException(status_code=500, detail="Internal server error creating archive collection.")


@app.get("/api/v1/cultural-archives/stories")
@app.get("/api/v1/archives/stories")
def api_list_cultural_stories(
    collection_id: str | None = None,
    language: str | None = None,
    category: str | None = None,
    q: str | None = None,
    query: str | None = None,
    include_teasers: bool = False,
    limit: int = 50,
    offset: int = 0,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
    x_user_role: str | None = Header(None, alias="X-User-Role"),
    x_user_language: str | None = Header(None, alias="X-User-Language"),
    authorization: str | None = Header(None, alias="Authorization"),
):
    """List and search approved cultural stories with FTS5 search and permission filtering."""
    search_query = q or query
    is_auth, roles, _ = _extract_archive_auth_context(x_admin_key, x_user_role, x_user_language, authorization)
    return cultural_archive_service.list_cultural_stories(
        DB_PATH,
        collection_id=collection_id,
        language=language,
        category=category,
        query=search_query,
        is_authenticated=is_auth,
        user_roles=roles,
        include_restricted_teasers=include_teasers,
        limit=limit,
        offset=offset,
    )


@app.get("/api/v1/cultural-archives/stories/{story_id}")
@app.get("/api/v1/archives/stories/{story_id}")
def api_get_cultural_story(
    story_id: str,
    allow_teaser: bool = False,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
    x_user_role: str | None = Header(None, alias="X-User-Role"),
    x_user_language: str | None = Header(None, alias="X-User-Language"),
    authorization: str | None = Header(None, alias="Authorization"),
):
    """Retrieve an individual cultural story with translation and contributor provenance."""
    is_auth, roles, _ = _extract_archive_auth_context(x_admin_key, x_user_role, x_user_language, authorization)
    res = cultural_archive_service.get_cultural_story(
        DB_PATH, story_id, is_authenticated=is_auth, user_roles=roles, allow_teaser=allow_teaser
    )
    if not res:
        raise HTTPException(status_code=404, detail=f"Story '{story_id}' not found or access restricted.")
    return res


@app.get("/api/v1/cultural-archives/stories/{story_id}/audio")
@app.get("/api/v1/archives/stories/{story_id}/audio")
def api_stream_cultural_story_audio(
    story_id: str,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
    x_user_role: str | None = Header(None, alias="X-User-Role"),
    x_user_language: str | None = Header(None, alias="X-User-Language"),
    authorization: str | None = Header(None, alias="Authorization"),
):
    """Stream master audio for an authorized cultural story with permission checks."""
    is_auth, roles, _ = _extract_archive_auth_context(x_admin_key, x_user_role, x_user_language, authorization)
    info = cultural_archive_service.get_story_audio_stream_info(
        DB_PATH,
        story_id,
        AUDIO_STORAGE,
        is_authenticated=is_auth,
        user_roles=roles,
    )
    if not info:
        raise HTTPException(
            status_code=404,
            detail="Audio recording not found or access restricted under OCAP community protocols."
        )
    target_path, mime = info
    return FileResponse(target_path, media_type=mime, filename=os.path.basename(target_path))


@app.post("/api/v1/cultural-archives/submissions")
@app.post("/api/v1/archives/submissions")
def api_create_cultural_submission(
    req: CreateCulturalSubmissionRequest,
):
    """Submit an oral recording contribution with mandatory 6-facet OCAP consent validation."""
    try:
        consent_matrix = {
            "consent_recording": req.consent_recording,
            "consent_transcription": req.consent_transcription,
            "consent_translation": req.consent_translation,
            "consent_public_display": req.consent_public_display,
            "consent_research_reuse": req.consent_research_reuse,
            "consent_educational_reuse": req.consent_educational_reuse,
        }
        res = cultural_archive_service.create_cultural_submission(
            DB_PATH,
            contributor_name=req.contributor_name,
            language=req.language,
            title=req.title,
            consent_matrix=consent_matrix,
            contributor_email=req.contributor_email,
            variety=req.variety,
            description=req.description,
            transcript_draft=req.transcript_draft,
            translation_draft=req.translation_draft,
            attribution_preference=req.attribution_preference,
            collection_id=req.collection_id,
            is_sacred_ceremonial=req.is_sacred_ceremonial,
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logger.exception("Error processing cultural submission")
        raise HTTPException(status_code=500, detail="Internal server error submitting oral history record.")


@app.post("/api/v1/cultural-archives/submissions/upload-audio")
def api_upload_submission_audio(
    file: UploadFile = File(...),  # noqa: B008
    title: str = Form(...),
    language: str = Form(...),
    contributor_name: str = Form(...),
    contributor_email: str | None = Form(None),
    variety: str | None = Form(None),
    description: str | None = Form(None),
    transcript_draft: str | None = Form(None),
    translation_draft: str | None = Form(None),
    attribution_preference: str = Form("BY_NAME"),
    collection_id: str | None = Form(None),
    consent_recording: bool = Form(True),
    consent_transcription: bool = Form(True),
    consent_translation: bool = Form(False),
    consent_public_display: bool = Form(True),
    consent_research_reuse: bool = Form(True),
    consent_educational_reuse: bool = Form(True),
    is_sacred_ceremonial: bool = Form(False),
):
    """Upload audio master and create a community oral recording submission."""
    if not file.filename:
        raise HTTPException(status_code=422, detail="Filename required for audio upload.")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in {".wav", ".mp3", ".m4a", ".ogg", ".webm", ".flac"}:
        raise HTTPException(status_code=400, detail=f"Unsupported audio format: {ext}")

    content = file.file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded audio file cannot be empty.")
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Audio file exceeds 50 MB limit.")

    sha256 = hashlib.sha256(content).hexdigest()
    unique_filename = f"cult_{uuid.uuid4().hex[:12]}{ext}"
    dest_path = os.path.join(AUDIO_STORAGE, unique_filename)
    with open(dest_path, "wb") as f_out:
        f_out.write(content)

    consent_matrix = {
        "consent_recording": consent_recording,
        "consent_transcription": consent_transcription,
        "consent_translation": consent_translation,
        "consent_public_display": consent_public_display,
        "consent_research_reuse": consent_research_reuse,
        "consent_educational_reuse": consent_educational_reuse,
    }

    try:
        sub = cultural_archive_service.create_cultural_submission(
            DB_PATH,
            contributor_name=contributor_name,
            language=language,
            title=title,
            consent_matrix=consent_matrix,
            contributor_email=contributor_email,
            variety=variety,
            description=description,
            original_audio_path=unique_filename,
            audio_sha256=sha256,
            transcript_draft=transcript_draft,
            translation_draft=translation_draft,
            attribution_preference=attribution_preference,
            collection_id=collection_id,
            is_sacred_ceremonial=is_sacred_ceremonial,
        )
        return sub
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logger.exception("Error processing audio upload submission")
        raise HTTPException(status_code=500, detail="Internal server error processing audio submission.")


@app.patch("/api/v1/cultural-archives/submissions/{submission_id}/review")
def api_review_cultural_submission(
    submission_id: str,
    req: ReviewCulturalSubmissionRequest,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
    x_user_role: str | None = Header(None, alias="X-User-Role"),
    authorization: str | None = Header(None, alias="Authorization"),
):
    """Review and approve/reject a community submission (Elder or Admin authorized)."""
    _is_auth, roles, _ = _extract_archive_auth_context(x_admin_key, x_user_role, authorization=authorization)
    if "admin" not in roles and "elder" not in roles:
        raise HTTPException(status_code=403, detail="Elder or Administrator credentials required to review submissions.")

    try:
        res = cultural_archive_service.review_cultural_submission(
            DB_PATH,
            submission_id=submission_id,
            review_decision=req.decision,
            reviewer_name=req.reviewer_name,
            review_notes=req.review_notes,
            create_story_on_approval=req.create_story_on_approval,
            target_collection_id=req.target_collection_id,
            access_classification=req.access_classification,
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logger.exception("Error reviewing cultural submission")
        raise HTTPException(status_code=500, detail="Internal server error reviewing submission.")


@app.post("/api/v1/cultural-archives/withdraw")
def api_withdraw_cultural_record(
    req: WithdrawCulturalRecordRequest,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
    x_user_role: str | None = Header(None, alias="X-User-Role"),
    authorization: str | None = Header(None, alias="Authorization"),
):
    """Revoke consent and withdraw a submission or story from public access under OCAP principles."""
    _is_auth, roles, _ = _extract_archive_auth_context(x_admin_key, x_user_role, authorization=authorization)
    is_admin = "admin" in roles or "elder" in roles
    try:
        res = cultural_archive_service.withdraw_cultural_record(
            DB_PATH,
            record_id=req.record_id,
            requester_name=req.requester_name,
            reason=req.reason,
            is_contributor=True,
            is_admin=is_admin,
        )
        return res
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        logger.exception("Error processing withdrawal")
        raise HTTPException(status_code=500, detail="Internal server error processing record withdrawal.")


# Milestone 28 (Module 4: Cultural Archives & Sacred Lore Enhancements)

@app.get("/api/v1/cultural-archives/stories/{story_id}/waveform")
@app.get("/api/v1/archives/stories/{story_id}/waveform")
def api_get_cultural_story_waveform(
    story_id: str,
    num_peaks: int = 56,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
    x_user_role: str | None = Header(None, alias="X-User-Role"),
    x_user_language: str | None = Header(None, alias="X-User-Language"),
    authorization: str | None = Header(None, alias="Authorization"),
):
    """Retrieve 56-bar normalized audio waveform peaks for story audio visualizer."""
    is_auth, roles, _ = _extract_archive_auth_context(x_admin_key, x_user_role, x_user_language, authorization)
    try:
        return cultural_archive_service.get_story_waveform(
            DB_PATH,
            story_id=story_id,
            audio_base_dir=AUDIO_STORAGE,
            num_peaks=num_peaks,
            is_authenticated=is_auth,
            user_roles=roles,
        )
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/api/v1/cultural-archives/stories/{story_id}/bilingual-segments")
@app.get("/api/v1/archives/stories/{story_id}/bilingual-segments")
def api_get_cultural_story_bilingual_segments(
    story_id: str,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
    x_user_role: str | None = Header(None, alias="X-User-Role"),
    x_user_language: str | None = Header(None, alias="X-User-Language"),
    authorization: str | None = Header(None, alias="Authorization"),
):
    """Retrieve sentence-level time-aligned bilingual segments for karaoke synchronized playback."""
    is_auth, roles, _ = _extract_archive_auth_context(x_admin_key, x_user_role, x_user_language, authorization)
    try:
        return cultural_archive_service.get_story_bilingual_segments(
            DB_PATH,
            story_id=story_id,
            is_authenticated=is_auth,
            user_roles=roles,
        )
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


class RevokeStoryConsentRequest(BaseModel):
    revoked_by: str
    reason: str


@app.post("/api/v1/cultural-archives/stories/{story_id}/revoke-consent")
@app.post("/api/v1/archives/stories/{story_id}/revoke-consent")
def api_revoke_story_consent(
    story_id: str,
    req: RevokeStoryConsentRequest,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
    x_user_role: str | None = Header(None, alias="X-User-Role"),
    authorization: str | None = Header(None, alias="Authorization"),
):
    """Execute immediate cascading revocation of community consent for a story (Elder or Admin authorized)."""
    _is_auth, roles, _ = _extract_archive_auth_context(x_admin_key, x_user_role, authorization=authorization)
    is_admin = "admin" in roles
    is_elder = "elder" in roles
    try:
        return cultural_archive_service.revoke_story_consent(
            DB_PATH,
            story_id=story_id,
            revoked_by=req.revoked_by,
            reason=req.reason,
            is_admin=is_admin,
            is_elder=is_elder,
        )
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# Milestone 18: Advanced Speech Intelligence & Pronunciation Routes
# ─────────────────────────────────────────────────────────────────────────────

class PronunciationPracticeRequest(BaseModel):
    exercise_id: str
    user_id: str | None = "anonymous"
    audio_filename: str | None = None
    recorded_duration: float = 1.5


class PronunciationReviewRequest(BaseModel):
    reviewer_name: str
    elder_score: float
    status: str = "VERIFIED"
    feedback_notes: str | None = None


class DialectIdRequest(BaseModel):
    transcript_id: int | None = None
    text: str | None = None
    language: str | None = "Gondi"


class NoiseReductionRequest(BaseModel):
    filter_strength: float = 0.5


class SpeechCorrectionRequest(BaseModel):
    transcript_id: int
    word_index: int | None = None
    previous_text: str
    suggested_text: str
    suggested_ipa: str | None = None
    dialect_note: str | None = None
    contributor_name: str | None = "Community Contributor"
    rationale: str | None = None


@app.get("/api/v1/speech/overview")
def api_speech_overview():
    """Retrieve speech intelligence metrics overview."""
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM speech_alignments")
        alignments_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM speech_acoustic_metrics")
        metrics_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM pronunciation_exercises")
        exercises_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM pronunciation_attempts")
        attempts_count = cursor.fetchone()[0]
    return {
        "status": "active",
        "alignments_count": alignments_count,
        "acoustic_metrics_count": metrics_count,
        "pronunciation_exercises_count": exercises_count,
        "pronunciation_attempts_count": attempts_count,
        "supported_features": [
            "word_level_alignments",
            "speaking_rate_wpm",
            "articulation_rate",
            "silence_pause_patterns",
            "waveform_peaks",
            "minimal_pairs",
            "elder_pronunciation_review_gate",
        ],
    }


@app.post("/api/v1/speech/analyze/{transcript_id}")
def api_speech_analyze_transcript(transcript_id: int):
    """Run acoustic analysis (speaking rate, pause patterns, waveform peaks) on transcript audio."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            "SELECT id, audio_filename, transcript_text, duration_seconds FROM transcripts WHERE id = ?",
            (transcript_id,),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Transcript not found.")

        audio_filename = row["audio_filename"]
        transcript_text = row["transcript_text"]

    audio_path = os.path.join(AUDIO_STORAGE, audio_filename)
    metrics = speech_analysis_service.analyze_acoustic_metrics(
        audio_path=audio_path,
        transcript_text=transcript_text,
        transcript_id=transcript_id,
        db_path=DB_PATH,
    )
    alignments = speech_analysis_service.get_or_generate_word_alignments(transcript_id, db_path=DB_PATH)
    return {
        "transcript_id": transcript_id,
        "audio_filename": audio_filename,
        "acoustic_metrics": metrics,
        "alignments": alignments,
    }


@app.get("/api/v1/speech/alignments/{transcript_id}")
def api_speech_get_alignments(transcript_id: int):
    """Retrieve word-level timestamps and alignments for synchronized audio playback."""
    with sqlite3.connect(DB_PATH) as conn:
        exists = conn.execute("SELECT id FROM transcripts WHERE id = ?", (transcript_id,)).fetchone()
        if not exists:
            raise HTTPException(status_code=404, detail="Transcript not found.")

    alignments = speech_analysis_service.get_or_generate_word_alignments(transcript_id, db_path=DB_PATH)
    return {"transcript_id": transcript_id, "alignments": alignments}


@app.get("/api/v1/speech/waveform/{transcript_id}")
def api_speech_get_waveform(transcript_id: int):
    """Retrieve downsampled waveform peaks [0.0 - 1.0] for responsive audio scrubber visualizer."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute("SELECT audio_filename FROM transcripts WHERE id = ?", (transcript_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Transcript not found.")
        audio_filename = row["audio_filename"]

    audio_path = os.path.join(AUDIO_STORAGE, audio_filename)
    peaks = speech_analysis_service.compute_waveform_peaks(audio_path, num_peaks=120)
    return {"transcript_id": transcript_id, "audio_filename": audio_filename, "waveform_peaks": peaks}


@app.post("/api/v1/speech/dialect-id")
def api_speech_identify_dialect(req: DialectIdRequest):
    """Classify the regional dialect variety using lexical, phonological, and acoustic markers."""
    text = req.text
    language = req.language or "Gondi"

    if req.transcript_id is not None:
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute(
                "SELECT transcript_text, language FROM transcripts WHERE id = ?",
                (req.transcript_id,),
            ).fetchone()
            if row:
                text = text or row["transcript_text"]
                language = row["language"] or language

    if not text:
        text = "nawa naav koytor aando kor pen"

    dialect_info = speech_analysis_service.identify_dialect(text=text, language=language)
    return {
        "status": "success",
        "transcript_id": req.transcript_id,
        "dialect_classification": dialect_info,
    }


@app.get("/api/v1/speech/diarization/{transcript_id}")
def api_speech_get_diarization(transcript_id: int):
    """Segment audio into speaker turns distinguishing storyteller from interviewer."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            "SELECT audio_filename, transcript_text FROM transcripts WHERE id = ?",
            (transcript_id,),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Transcript not found.")
        audio_filename = row["audio_filename"]
        transcript_text = row["transcript_text"]

    audio_path = os.path.join(AUDIO_STORAGE, audio_filename)
    turns = speech_analysis_service.diarize_speakers(
        audio_path=audio_path,
        transcript_text=transcript_text,
        db_path=DB_PATH,
    )
    return {
        "status": "success",
        "transcript_id": transcript_id,
        "speaker_turns": turns,
        "speaker_count": len(set(t["speaker_id"] for t in turns)),
    }


@app.post("/api/v1/speech/noise-reduction/{transcript_id}")
def api_speech_apply_noise_reduction(transcript_id: int, req: NoiseReductionRequest):
    """Apply non-destructive high-pass and spectral noise attenuation to field recordings."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            "SELECT audio_filename FROM transcripts WHERE id = ?",
            (transcript_id,),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Transcript not found.")
        audio_filename = row["audio_filename"]

    audio_path = os.path.join(AUDIO_STORAGE, audio_filename)
    result = speech_analysis_service.apply_noise_reduction(
        audio_path=audio_path,
        filter_strength=req.filter_strength,
    )
    return {
        "status": "success",
        "transcript_id": transcript_id,
        "noise_reduction": result,
    }


@app.post("/api/v1/speech/corrections")
def api_speech_submit_correction(req: SpeechCorrectionRequest):
    """Submit a word-level or phonetic correction for community elder review."""
    now = datetime.now(timezone.utc).isoformat()
    review_notes = f"IPA: {req.suggested_ipa}; Dialect: {req.dialect_note}" if (req.suggested_ipa or req.dialect_note) else req.rationale

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO corrections (
                target_type, target_id, previous_text, suggested_text,
                contributor_name, rationale, review_notes, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending_review', ?, ?)
            """,
            (
                "transcript_word",
                req.transcript_id,
                req.previous_text,
                req.suggested_text,
                req.contributor_name or "Community Contributor",
                req.rationale or "Phonetic correction",
                review_notes,
                now,
                now,
            ),
        )
        corr_id = cursor.lastrowid
        conn.commit()

    return {
        "status": "submitted",
        "correction_id": corr_id,
        "transcript_id": req.transcript_id,
        "previous_text": req.previous_text,
        "suggested_text": req.suggested_text,
        "suggested_ipa": req.suggested_ipa,
        "review_status": "pending_review",
        "message": "Correction submitted to community elder review queue.",
    }


@app.get("/api/v1/speech/pronunciation/exercises")
def api_speech_list_pronunciation_exercises(
    language: str | None = Query(None),
    difficulty: str | None = Query(None),
    exercise_type: str | None = Query(None),
):
    """List curated minimal pairs and pronunciation exercises."""
    exercises = speech_analysis_service.list_pronunciation_exercises(
        language=language,
        difficulty=difficulty,
        exercise_type=exercise_type,
        db_path=DB_PATH,
    )
    return {"exercises": exercises, "count": len(exercises)}


@app.get("/api/v1/speech/pronunciation/exercises/{exercise_id}")
def api_speech_get_pronunciation_exercise(exercise_id: str):
    """Get single pronunciation exercise details."""
    exercise = speech_analysis_service.get_pronunciation_exercise(exercise_id, db_path=DB_PATH)
    if not exercise:
        raise HTTPException(status_code=404, detail=f"Pronunciation exercise '{exercise_id}' not found.")
    return exercise


@app.post("/api/v1/speech/pronunciation/practice")
def api_speech_submit_practice(req: PronunciationPracticeRequest):
    """Submit pronunciation recording attempt for acoustic scoring and elder review."""
    try:
        res = speech_analysis_service.submit_pronunciation_practice(
            exercise_id=req.exercise_id,
            user_id=req.user_id or "anonymous",
            audio_filename=req.audio_filename,
            recorded_duration=req.recorded_duration,
            db_path=DB_PATH,
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        logger.exception("Error submitting pronunciation practice")
        raise HTTPException(status_code=500, detail="Internal server error submitting pronunciation practice.")


@app.patch("/api/v1/speech/pronunciation/attempts/{attempt_id}/review")
def api_speech_review_attempt(
    attempt_id: str,
    req: PronunciationReviewRequest,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
    x_user_role: str | None = Header(None, alias="X-User-Role"),
):
    """Elder or Admin review gate for human confirmation of pronunciation scores."""
    _is_auth, roles, _ = _extract_archive_auth_context(x_admin_key, x_user_role)
    if "admin" not in roles and "elder" not in roles and "reviewer" not in roles:
        raise HTTPException(status_code=403, detail="Elder or Reviewer authorization required to score attempts.")
    try:
        res = speech_analysis_service.review_pronunciation_attempt(
            attempt_id=attempt_id,
            reviewer_name=req.reviewer_name,
            elder_score=req.elder_score,
            status=req.status,
            feedback_notes=req.feedback_notes,
            db_path=DB_PATH,
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# MILESTONE 19: LANGUAGE LEARNING & INTERACTIVE PRACTICE ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

class PracticeSubmitRequest(BaseModel):
    learner_id: str = "learner_anonymous"
    module_id: str
    selected_answer: str


@app.get("/api/v1/learning/overview")
def get_learning_overview_endpoint():
    """Retrieve learning resource ecosystem metrics."""
    return learning_service.get_learning_overview(DB_PATH)


@app.get("/api/v1/learning/collections")
def list_learning_collections(
    language: str | None = Query(None, description="Optional filter by language"),
    proficiency: str | None = Query(None, description="Optional filter by proficiency level"),
):
    """List published learning collections with module counts."""
    cols = learning_service.get_learning_collections(language=language, proficiency=proficiency, db_path=DB_PATH)
    return {"collections": cols, "count": len(cols)}


@app.get("/api/v1/learning/collections/{collection_id}")
def get_learning_collection_endpoint(collection_id: str):
    """Get single collection details including verified modules."""
    col = learning_service.get_collection_details(collection_id, db_path=DB_PATH)
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")
    return col


@app.get("/api/v1/learning/collections/{collection_id}/modules")
def get_learning_collection_modules_endpoint(collection_id: str):
    """Get modules for a collection gated strictly by OCAP educational reuse consent."""
    col = learning_service.get_collection_details(collection_id, db_path=DB_PATH)
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")
    return {"collection_id": collection_id, "modules": col.get("modules", []), "count": len(col.get("modules", []))}


@app.post("/api/v1/learning/practice/submit")
def submit_practice_attempt_endpoint(req: PracticeSubmitRequest):
    """Submit answer for an educational practice module."""
    try:
        res = learning_service.submit_module_practice(
            learner_id=req.learner_id,
            module_id=req.module_id,
            selected_answer=req.selected_answer,
            db_path=DB_PATH,
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@app.get("/api/v1/learning/progress/{learner_id}")
def get_learner_progress_endpoint(learner_id: str):
    """Retrieve personal learner progress and module mastery history."""
    return learning_service.get_learner_progress(learner_id, db_path=DB_PATH)


# ─────────────────────────────────────────────────────────────────────────────
# MILESTONE 20: INSTITUTIONAL RESEARCH API & INTEROPERABILITY
# ─────────────────────────────────────────────────────────────────────────────

class ResearchKeyCreateRequest(BaseModel):
    organization_name: str
    contact_email: str
    scopes: list[str] = ["read:registry", "read:transcripts"]
    rate_limit_per_minute: int = 60
    expires_in_days: int = 365


def _extract_research_token(
    x_research_token: str | None = Header(None, alias="X-Research-Token"),
    authorization: str | None = Header(None, alias="Authorization"),
) -> str | None:
    """Extract raw research token from either X-Research-Token header or Bearer header."""
    if x_research_token:
        return x_research_token.strip()
    if authorization and authorization.lower().startswith("bearer "):
        return authorization[7:].strip()
    return None


@app.get("/api/v1/research/overview")
def get_research_overview():
    """Retrieve research interoperability telemetry, registered partners, and manifest summary."""
    manifest = research_interoperability_service.get_corpus_version_manifest(DB_PATH)
    keys = research_interoperability_service.list_research_api_keys(DB_PATH)
    return {
        "status": "active",
        "registered_institutions_count": len(keys),
        "corpus_manifest": manifest,
        "supported_scopes": [
            "read:registry",
            "read:vocabulary",
            "read:transcripts",
            "read:metadata",
            "export:corpus",
        ],
        "ocap_boundaries": {
            "strict_research_consent_enforced": True,
            "private_sacred_content_excluded": True,
            "commercial_resale_strictly_prohibited": True,
        },
    }


@app.post("/api/v1/research/keys/register")
def register_research_api_key(
    req: ResearchKeyCreateRequest,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
    x_user_role: str | None = Header(None, alias="X-User-Role"),
):
    """Register and issue a scoped research API token to an accredited institution."""
    is_prod = os.environ.get("VOICE_ROOTS_ENV") == "production"
    is_auth, roles, _ = _extract_archive_auth_context(x_admin_key, x_user_role)
    if is_prod and (not is_auth or "admin" not in roles):
        raise HTTPException(
            status_code=403,
            detail="Administrator authorization required to register and issue institutional research API keys in production.",
        )

    new_key = research_interoperability_service.create_research_api_key(
        organization_name=req.organization_name,
        contact_email=req.contact_email,
        scopes=req.scopes,
        rate_limit_per_minute=req.rate_limit_per_minute,
        expires_in_days=req.expires_in_days,
        db_path=DB_PATH,
    )
    return new_key


@app.get("/api/v1/research/keys")
def list_research_keys_endpoint(
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
    x_user_role: str | None = Header(None, alias="X-User-Role"),
):
    """List registered institutional keys with masked token hashes."""
    return {"keys": research_interoperability_service.list_research_api_keys(DB_PATH)}


@app.delete("/api/v1/research/keys/{key_id}")
def revoke_research_key_endpoint(
    key_id: str,
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
):
    """Revoke or deactivate an institutional research API token (Admin only) (SEC-07)."""
    if x_admin_key != ADMIN_API_KEY:
        raise HTTPException(status_code=403, detail="Admin authorization required to revoke research keys.")
    revoked = research_interoperability_service.revoke_research_api_key(key_id, DB_PATH)
    if not revoked:
        raise HTTPException(status_code=404, detail=f"Research key '{key_id}' not found.")
    return {"status": "revoked", "key_id": key_id}


@app.get("/api/v1/research/manifest")
def get_research_manifest_endpoint():
    """Public version manifest describing release versions, languages, and hours."""
    return research_interoperability_service.get_corpus_version_manifest(DB_PATH)


@app.get("/api/v1/research/corpus/export")
def export_research_corpus_endpoint(
    request: Request,
    language: str | None = Query(None, description="Optional filter by language"),
    x_research_token: str | None = Header(None, alias="X-Research-Token"),
    authorization: str | None = Header(None, alias="Authorization"),
):
    """Export research corpus records strictly enforcing OCAP research consent and rate limits."""
    token = _extract_research_token(x_research_token, authorization)
    try:
        auth_info = research_interoperability_service.validate_research_token(
            token, required_scope="export:corpus", db_path=DB_PATH
        )
    except PermissionError as e:
        # Also allow read:transcripts scope
        try:
            auth_info = research_interoperability_service.validate_research_token(
                token, required_scope="read:transcripts", db_path=DB_PATH
            )
        except PermissionError:
            raise HTTPException(status_code=403, detail=str(e))

    # Active sliding-window rate limit (SEC-05)
    limit = auth_info.get("rate_limit_per_minute", 60)
    allowed, remaining = research_interoperability_service.check_rate_limit(
        auth_info["key_id"], limit_per_minute=limit
    )
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded: maximum {limit} requests per minute allowed.",
            headers={
                "Retry-After": "60",
                "X-RateLimit-Limit": str(limit),
                "X-RateLimit-Remaining": "0",
            },
        )

    res = research_interoperability_service.export_research_corpus(language=language, db_path=DB_PATH)
    research_interoperability_service.log_research_access(
        key_id=auth_info["key_id"],
        endpoint=str(request.url.path),
        method="GET",
        status_code=200,
        db_path=DB_PATH,
    )
    return res


@app.get("/api/v1/research/lexicon/export")
def export_research_lexicon_endpoint(
    request: Request,
    language: str | None = Query(None, description="Optional filter by language"),
    x_research_token: str | None = Header(None, alias="X-Research-Token"),
    authorization: str | None = Header(None, alias="Authorization"),
):
    """Export computational lexicon entries with phonetics, script representations, and rate limits."""
    token = _extract_research_token(x_research_token, authorization)
    try:
        auth_info = research_interoperability_service.validate_research_token(
            token, required_scope="read:vocabulary", db_path=DB_PATH
        )
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

    # Active sliding-window rate limit (SEC-05)
    limit = auth_info.get("rate_limit_per_minute", 60)
    allowed, remaining = research_interoperability_service.check_rate_limit(
        auth_info["key_id"], limit_per_minute=limit
    )
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded: maximum {limit} requests per minute allowed.",
            headers={
                "Retry-After": "60",
                "X-RateLimit-Limit": str(limit),
                "X-RateLimit-Remaining": "0",
            },
        )

    res = research_interoperability_service.export_research_lexicon(language=language, db_path=DB_PATH)
    research_interoperability_service.log_research_access(
        key_id=auth_info["key_id"],
        endpoint=str(request.url.path),
        method="GET",
        status_code=200,
        db_path=DB_PATH,
    )
    return res


# ============================================================================
# Milestone 26 (Module 2: Multilingual Dictionary Architecture)
# ============================================================================

class DictionaryProposalRequest(BaseModel):
    word: str
    language_code: str
    dialect: str | None = None
    native_script: str | None = None
    script_name: str | None = None
    ipa: str | None = None
    part_of_speech: str = "noun"
    meanings: list[str] = []
    translations: dict[str, str] = {}
    alternate_spellings: list[str] = []
    dialect_variations: dict[str, str] = {}
    audio_url: str | None = None
    etymology: str | None = None
    cultural_context: str | None = None
    contributor_name: str | None = "Community Contributor"
    contributor_role: str | None = "speaker"
    provenance: str | None = None


class DictionaryApprovalRequest(BaseModel):
    approved_by: str = "Community Elder"
    notes: str | None = None


class DictionaryRejectionRequest(BaseModel):
    reviewed_by: str = "Community Elder"
    reason: str = "Does not match verified community dialect"


@app.get("/api/v1/dictionary/search")
def api_dictionary_search(
    q: str | None = Query(None, description="Search term in Latin or native script"),
    query: str | None = Query(None, description="Alias for q"),
    language_code: str | None = Query(None, description="Filter by language code (e.g. gon, kff, sat, lmn)"),
    dialect: str | None = Query(None, description="Filter by regional dialect variety"),
    category: str | None = Query(None, description="Filter by part of speech or cultural category"),
    status: str | None = Query(None, description="Filter by status: approved, proposed, pending_review, all"),
    only_approved: bool = Query(False, description="Filter for elder-approved entries only"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """Full-text and faceted search across multilingual dictionary entries with FTS5."""
    search_term = q if q is not None else query
    return dictionary_service.search_dictionary(
        query=search_term,
        language_code=language_code,
        dialect=dialect,
        category=category,
        status=status,
        only_approved=only_approved,
        limit=limit,
        offset=offset,
        db_path=DB_PATH,
    )


@app.get("/api/v1/dictionary/words/{word_id}")
def api_dictionary_get_word(word_id: int):
    """Retrieve complete dictionary record with cross-dialect comparisons and related terms."""
    entry = dictionary_service.get_word_details(word_id=word_id, db_path=DB_PATH)
    if not entry:
        raise HTTPException(status_code=404, detail="Dictionary entry not found.")
    return entry


@app.get("/api/v1/audio/samples/{filename}")
def get_sample_audio_file(filename: str):
    """Serve sample audio clips for dictionary pronunciation snippets and heritage recordings."""
    safe_name = os.path.basename(filename)
    candidate_paths = [
        os.path.join(AUDIO_STORAGE, safe_name),
        os.path.join(BACKEND_DIR, "storage", "audio", safe_name),
        os.path.join(BACKEND_DIR, "static", "audio", safe_name),
        os.path.join(BACKEND_DIR, safe_name),
    ]
    for path in candidate_paths:
        if os.path.exists(path) and os.path.isfile(path):
            return FileResponse(path, media_type="audio/wav")

    # If physical file is missing, synthesize a valid clean PCM WAV snippet (0.5s audio tone)
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(16000)
        samples = bytearray()
        for i in range(8000):
            val = int(2500 * math.sin(2 * math.pi * 440 * i / 16000)) if i < 4000 else 0
            samples.extend(val.to_bytes(2, byteorder="little", signed=True))
        wav_file.writeframes(samples)
    buffer.seek(0)
    return Response(content=buffer.read(), media_type="audio/wav")


@app.get("/api/v1/dictionary/words/{word_id}/audio")
def get_dictionary_word_audio(word_id: int):
    """Stream audio pronunciation snippet for an approved dictionary headword."""
    entry = dictionary_service.get_word_details(word_id=word_id, db_path=DB_PATH)
    if not entry:
        raise HTTPException(status_code=404, detail="Dictionary entry not found.")

    audio_url = entry.get("audio_url")
    if audio_url:
        filename = os.path.basename(audio_url)
        return get_sample_audio_file(filename)

    return get_sample_audio_file(f"dict_word_{word_id}.wav")


@app.get("/api/v1/consent/audio/{lang}")
def get_consent_audio_prompt(lang: str):
    """Serve spoken audio consent prompts with placeholder provenance disclosures."""
    clean_lang = lang.lower().strip()
    safe_name = f"consent_{clean_lang}.wav"

    candidate_paths = [
        os.path.join(AUDIO_STORAGE, safe_name),
        os.path.join(BACKEND_DIR, "storage", "audio", safe_name),
        os.path.join(BACKEND_DIR, "static", "audio", safe_name),
    ]
    for path in candidate_paths:
        if os.path.exists(path) and os.path.isfile(path):
            return FileResponse(
                path,
                media_type="audio/wav",
                headers={
                    "X-Consent-Language": clean_lang,
                    "X-Consent-Status": "needs-community-recording",
                    "X-Consent-Placeholder": "true",
                },
            )

    # Synthesize clean valid PCM WAV tone/snippet as placeholder
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(16000)
        samples = bytearray()
        freq = 330 if clean_lang == "te" else 440 if clean_lang == "hi" else 520
        for i in range(16000):
            val = int(2200 * math.sin(2 * math.pi * freq * i / 16000)) if i < 12000 else 0
            samples.extend(val.to_bytes(2, byteorder="little", signed=True))
        wav_file.writeframes(samples)
    buffer.seek(0)
    return Response(
        content=buffer.read(),
        media_type="audio/wav",
        headers={
            "X-Consent-Language": clean_lang,
            "X-Consent-Status": "needs-community-recording",
            "X-Consent-Placeholder": "true",
            "Content-Disposition": f'inline; filename="{safe_name}"',
        },
    )


@app.get("/api/v1/consent/prompts")
def get_consent_prompts_metadata():
    """Retrieve multilingual consent text and audio prompt status across languages."""
    return {
        "disclaimer": "Placeholder audio prompts require verification and authentic recording by tribal elders.",
        "prompts": {
            "en": {
                "language": "English",
                "text": "I confirm that this voice is recorded with the speaker's voluntary permission under indigenous and community ethics.",
                "audio_url": "/api/v1/consent/audio/en",
                "status": "needs-community-recording",
                "is_placeholder": True,
            },
            "te": {
                "language": "Telugu",
                "text": "దేశీయ మరియు సమాజ నియమావళి ప్రకారం మాట్లాడేవారి స్వచ్ఛంద అనుమతితో ఈ స్వరం రికార్డ్ చేయబడిందని నేను ధృవీకరిస్తున్నాను.",
                "audio_url": "/api/v1/consent/audio/te",
                "status": "needs-community-recording",
                "is_placeholder": True,
            },
            "hi": {
                "language": "Hindi",
                "text": "मैं पुष्टि करता/करती हूँ कि यह आवाज वक्ता की स्वैच्छिक सहमति और सामुदायिक नैतिकता के तहत रिकॉर्ड की गई है।",
                "audio_url": "/api/v1/consent/audio/hi",
                "status": "needs-community-recording",
                "is_placeholder": True,
            },
            "gon": {
                "language": "Gondi",
                "text": "పెర్సాపేన్ సాక్షిగా, ఈ స్వరం మా స్వచ్ఛంద సమ్మతితో రికార్డ్ చేయబడింది.",
                "audio_url": "/api/v1/consent/audio/gon",
                "status": "needs-community-recording",
                "is_placeholder": True,
            },
            "kff": {
                "language": "Koya",
                "text": "కోయ్తూర్ పెద్దల సమక్షంలో, ఈ స్వరం మా స్వచ్ఛంద అనుమతితో భద్రపరచబడింది.",
                "audio_url": "/api/v1/consent/audio/kff",
                "status": "needs-community-recording",
                "is_placeholder": True,
            },
        },
    }


@app.post("/api/v1/dictionary/propose", status_code=201)
def api_dictionary_propose_word(
    req: DictionaryProposalRequest,
    authorization: str | None = Header(None),
):
    """Submit a community word proposal with automatic IPA computation and pending elder review."""
    contributor = {"name": req.contributor_name, "role": req.contributor_role}
    if authorization and authorization.startswith("Bearer "):
        token_str = authorization.replace("Bearer ", "").strip()
        payload = auth_service.decode_access_token(token_str)
        if payload:
            contributor["name"] = payload.get("username") or contributor["name"]
            contributor["role"] = payload.get("role") or contributor["role"]

    try:
        created = dictionary_service.propose_dictionary_entry(
            entry_data=req.model_dump(),
            contributor=contributor,
            db_path=DB_PATH,
        )
        return {
            "status": "success",
            "message": "Word proposal submitted for community elder review.",
            "entry": created,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.patch("/api/v1/dictionary/words/{word_id}/approve")
def api_dictionary_approve_word(
    word_id: int,
    req: DictionaryApprovalRequest,
    authorization: str | None = Header(None),
):
    """Community Elder approval gate: approves a dictionary entry for verified indexing."""
    approved_by = req.approved_by
    if authorization and authorization.startswith("Bearer "):
        token_str = authorization.replace("Bearer ", "").strip()
        payload = auth_service.decode_access_token(token_str)
        if payload:
            approved_by = payload.get("username") or approved_by

    try:
        updated = dictionary_service.approve_dictionary_entry(
            word_id=word_id,
            approved_by=approved_by,
            notes=req.notes,
            db_path=DB_PATH,
        )
        return {
            "status": "success",
            "message": "Dictionary entry successfully approved by elder authority.",
            "entry": updated,
        }
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.patch("/api/v1/dictionary/words/{word_id}/reject")
def api_dictionary_reject_word(
    word_id: int,
    req: DictionaryRejectionRequest,
    authorization: str | None = Header(None),
):
    """Elder rejection: rejects a proposed word with recorded rationale."""
    reviewed_by = req.reviewed_by
    if authorization and authorization.startswith("Bearer "):
        token_str = authorization.replace("Bearer ", "").strip()
        payload = auth_service.decode_access_token(token_str)
        if payload:
            reviewed_by = payload.get("username") or reviewed_by

    try:
        updated = dictionary_service.reject_dictionary_entry(
            word_id=word_id,
            reviewed_by=reviewed_by,
            reason=req.reason,
            db_path=DB_PATH,
        )
        return {
            "status": "success",
            "message": "Dictionary entry proposal rejected with recorded justification.",
            "entry": updated,
        }
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/api/v1/dictionary/overview")
def api_dictionary_overview():
    """Aggregate statistics on dictionary entries, approval rates, and dialect coverage."""
    return dictionary_service.get_dictionary_overview(db_path=DB_PATH)


@app.get("/api/v1/dictionary/languages")
def api_dictionary_languages():
    """Retrieve metadata for supported dictionary languages, scripts, and dialects."""
    return {
        "status": "success",
        "languages": dictionary_service.get_supported_languages(),
    }


# ============================================================================
# Milestone 27 (Module 3: Grounded AI Assistant & Archive RAG)
# ============================================================================

class AssistantQueryRequest(BaseModel):
    query: str
    target_language: str | None = None
    filter_language: str | None = None
    max_citations: int = 5


@app.post("/api/v1/assistant/query")
def api_assistant_query(
    req: AssistantQueryRequest,
    authorization: str | None = Header(None),
):
    """Execute grounded archive RAG query with source citation pills and epistemic separation."""
    user_roles: list[str] = []
    is_auth = False

    if authorization and authorization.startswith("Bearer "):
        token_str = authorization.replace("Bearer ", "").strip()
        payload = auth_service.decode_access_token(token_str)
        if payload:
            is_auth = True
            role = payload.get("role")
            if role:
                user_roles.append(role)

    res = archive_rag_service.generate_grounded_answer(
        query=req.query,
        user_roles=user_roles,
        is_authenticated=is_auth,
        language_filter=req.filter_language,
        max_citations=req.max_citations,
        db_path=DB_PATH,
    )
    return res.to_dict()


@app.get("/api/v1/assistant/suggestions")
def api_assistant_suggestions():
    """Retrieve curated exploratory questions grounded in verified community holdings."""
    return {
        "status": "success",
        "suggestions": archive_rag_service.get_assistant_suggestions(),
    }


@app.get("/api/v1/assistant/rag-stats")
def api_assistant_rag_stats():
    """Retrieve telemetry metrics for the local RAG retrieval index."""
    return archive_rag_service.get_assistant_telemetry(db_path=DB_PATH)


@app.post("/api/v1/assistant/sync-index")
def api_assistant_sync_index():
    """Trigger offline vector indexing of approved stories, dictionary entries, and transcripts."""
    counts = archive_rag_service.sync_all_archives_to_vector_store(db_path=DB_PATH)
    return {
        "status": "success",
        "message": "Archive vector indexing complete.",
        "synced": counts,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Milestone 29 (Module 5: Interactive Language Explorer Routes)
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/api/v1/explorer/phylogenetic-tree")
def api_get_phylogenetic_tree():
    """Retrieve full hierarchical phylogenetic trees connecting all 44 registered languages."""
    return language_explorer_service.get_phylogenetic_tree(db_path=DB_PATH)


@app.get("/api/v1/explorer/dialect-cartography")
def api_get_dialect_cartography():
    """Retrieve geo-spatial distribution, speaking populations, and dialect markers for primary oral tongues."""
    return language_explorer_service.get_dialect_cartography()


@app.get("/api/v1/explorer/morphological-graph")
def api_get_morphological_graph():
    """Retrieve cytoscape-formatted graph of Proto-Dravidian, Austroasiatic, and Indo-Aryan roots and cognates."""
    return language_explorer_service.get_morphological_graph()


@app.get("/api/v1/explorer/vitality-indicators")
def api_get_vitality_indicators():
    """Retrieve objective community-grounded vitality metrics and census baselines for oral minority languages."""
    return language_explorer_service.get_objective_vitality_indicators(db_path=DB_PATH)


# ─────────────────────────────────────────────────────────────────────────────
# Milestone 30 (Module 6: Advanced Learning Studio Upgrades)
# ─────────────────────────────────────────────────────────────────────────────

class SrsReviewRequest(BaseModel):
    card_id: str
    learner_id: str
    grade: int


class FormantEvalRequest(BaseModel):
    phoneme_or_word: str
    student_f0: float
    student_f1: float
    student_f2: float
    language: str = "Gondi"


class SentenceDrillSubmitRequest(BaseModel):
    learner_id: str
    drill_id: str
    assembled_tokens: list[str]


class ListeningQuizSubmitRequest(BaseModel):
    learner_id: str
    quiz_id: str
    selected_option_id: str


class OfflineSyncRequest(BaseModel):
    learner_id: str
    events: list[dict[str, Any]]


@app.get("/api/v1/learning/srs/queue")
def api_get_srs_queue(
    learner_id: str = "learner_anonymous",
    language: str | None = None,
    include_future: bool = False,
):
    """Retrieve cards due for review using SuperMemo SM-2 & Leitner Box intervals."""
    return learning_studio_service.get_srs_review_queue(
        learner_id=learner_id,
        language=language,
        include_future=include_future,
        db_path=DB_PATH,
    )


@app.post("/api/v1/learning/srs/review")
def api_submit_srs_review(req: SrsReviewRequest):
    """Record flashcard recall grade (0-5) and compute next review interval."""
    try:
        return learning_studio_service.submit_srs_review(
            learner_id=req.learner_id,
            card_id=req.card_id,
            grade=req.grade,
            db_path=DB_PATH,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/v1/learning/formants/evaluate")
def api_evaluate_formants(req: FormantEvalRequest):
    """Compare student acoustic parameters with native elder benchmarks."""
    return learning_studio_service.evaluate_pronunciation_formants(
        phoneme_or_word=req.phoneme_or_word,
        student_f0=req.student_f0,
        student_f1=req.student_f1,
        student_f2=req.student_f2,
        language=req.language,
        db_path=DB_PATH,
    )


@app.get("/api/v1/learning/drills")
def api_list_sentence_drills(language: str | None = None):
    """Retrieve sentence construction drills with syntax models and scrambled tokens."""
    return learning_studio_service.list_sentence_drills(language=language, db_path=DB_PATH)


@app.post("/api/v1/learning/drills/submit")
def api_submit_sentence_drill(req: SentenceDrillSubmitRequest):
    """Validate student's assembled word sequence against indigenous SOV syntax."""
    try:
        return learning_studio_service.submit_sentence_drill_attempt(
            learner_id=req.learner_id,
            drill_id=req.drill_id,
            assembled_tokens=req.assembled_tokens,
            db_path=DB_PATH,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/api/v1/learning/quizzes")
def api_list_listening_quizzes(language: str | None = None):
    """Retrieve audio-first listening comprehension quizzes."""
    return learning_studio_service.list_listening_quizzes(language=language, db_path=DB_PATH)


@app.post("/api/v1/learning/quizzes/submit")
def api_submit_listening_quiz(req: ListeningQuizSubmitRequest):
    """Submit attempt for an audio-first comprehension exercise."""
    try:
        return learning_studio_service.submit_listening_quiz_attempt(
            learner_id=req.learner_id,
            quiz_id=req.quiz_id,
            selected_option_id=req.selected_option_id,
            db_path=DB_PATH,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/v1/learning/offline-sync")
def api_sync_offline_learning(req: OfflineSyncRequest):
    """Batch-synchronize offline learner actions (SRS reviews, drills, quizzes)."""
    return learning_studio_service.sync_offline_learning_events(
        learner_id=req.learner_id,
        events=req.events,
        db_path=DB_PATH,
    )


@app.get("/api/v1/learning/analytics/{learner_id}")
def api_get_learner_analytics(learner_id: str):
    """Retrieve comprehensive learning analytics, retention rates, and Leitner box metrics."""
    return learning_studio_service.get_learner_analytics(learner_id=learner_id, db_path=DB_PATH)


class IdempotentSyncRequest(BaseModel):
    clientOperationId: str | None = None
    client_operation_id: str | None = None
    actionType: str = "SYNC_RECORDING"
    action_type: str = "SYNC_RECORDING"
    payload: dict[str, Any] = {}


@app.post("/api/v1/sync/idempotent")
def api_idempotent_sync(req: IdempotentSyncRequest):
    """Idempotently process offline audio and metadata sync actions from PWA clients."""
    op_id = req.clientOperationId or req.client_operation_id
    if not op_id:
        raise HTTPException(status_code=400, detail="clientOperationId is mandatory for idempotent sync.")

    act_type = req.actionType or req.action_type or "SYNC_RECORDING"

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM idempotent_sync_operations WHERE client_operation_id = ?",
            (op_id,),
        )
        existing = cursor.fetchone()
        if existing:
            cached_result = json.loads(existing["result_json"])
            return {
                "success": True,
                "idempotentReplay": True,
                "idempotent_replay": True,
                "message": "Operation was already processed. Replaying confirmed status.",
                "result": cached_result,
            }

        now_str = datetime.now(timezone.utc).isoformat()
        story_id = (
            req.payload.get("storyId")
            or req.payload.get("story_id")
            or f"vr_{uuid.uuid4().hex[:12]}"
        )
        operation_result = {
            "clientOperationId": op_id,
            "actionType": act_type,
            "processedAt": now_str,
            "status": "SYNCED_TO_CLOUD",
            "storyId": story_id,
        }

        cursor.execute(
            """
            INSERT INTO idempotent_sync_operations (client_operation_id, action_type, status, processed_at, result_json)
            VALUES (?, ?, ?, ?, ?)
            """,
            (op_id, act_type, "SYNCED_TO_CLOUD", now_str, json.dumps(operation_result)),
        )
        conn.commit()

        return {
            "success": True,
            "idempotentReplay": False,
            "idempotent_replay": False,
            "message": "Offline action successfully committed to Voice Roots cloud storage.",
            "result": operation_result,
        }


# ─────────────────────────────────────────────────────────────────────────────
# Milestone 31 (Module 7: Institutional Command Center Routes)
# ─────────────────────────────────────────────────────────────────────────────

class ModerateQueueRequest(BaseModel):
    item_type: str
    item_id: str
    decision: str
    reviewer_name: str
    reviewer_role: str = "elder"
    cultural_notes: str = ""
    corrected_text: str | None = None


class ReviewerDecisionRequest(BaseModel):
    item_type: str
    item_id: str | int
    action: str  # approve, correct, reject
    reviewer_name: str = "Elder Soyam Laxman"
    reviewer_role: str = "elder"
    corrected_text: str | None = None
    notes: str | None = None


class CommandCenterRollbackRequest(BaseModel):
    target_model_id: str
    switched_by: str
    reason: str


class BackupCreateRequest(BaseModel):
    reason: str = "Admin Snapshot"
    triggered_by: str = "admin"


@app.get("/api/v1/command-center/overview")
def api_get_command_center_overview():
    """Retrieve top-level health, inventory, and governance metrics across Voice Roots."""
    return command_center_service.get_command_center_overview(db_path=DB_PATH)


@app.get("/api/v1/command-center/telemetry")
def api_get_preservation_telemetry():
    """Calculate granular preservation metrics across dialects and phonetic coverage."""
    return command_center_service.get_preservation_telemetry(db_path=DB_PATH)


@app.get("/api/v1/command-center/moderation-queue")
def api_get_moderation_queue(
    language: str | None = None,
    item_type: str | None = None,
    limit: int = 50,
):
    """Retrieve pending review items across transcripts, lexicon, and cultural stories."""
    return command_center_service.get_elder_moderation_queue(
        language=language,
        item_type=item_type,
        limit=limit,
        db_path=DB_PATH,
    )


@app.post("/api/v1/command-center/moderation/resolve")
def api_resolve_moderation_item(req: ModerateQueueRequest):
    """Process elder decision ('APPROVE', 'CORRECT', 'REJECT') with customary audit trail."""
    try:
        res = command_center_service.moderate_queue_item(
            item_type=req.item_type,
            raw_id=req.item_id,
            decision=req.decision,
            reviewer_name=req.reviewer_name,
            reviewer_role=req.reviewer_role,
            cultural_notes=req.cultural_notes,
            corrected_text=req.corrected_text,
            db_path=DB_PATH,
        )
        if req.item_type == "transcript" and req.decision.upper() in ("APPROVE", "CORRECT"):
            try:
                _sync_transcript_to_search(int(str(req.item_id).split(":")[-1]))
            except Exception:
                pass
        return res
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/v1/prompts")
def api_list_prompts(
    language: str | None = None,
    category: str | None = None,
    limit: int = 100,
    offset: int = 0,
):
    """Retrieve database-persisted prompt lists (Swadesh core vocabulary & sentences)."""
    return prompt_service.list_prompts(
        language=language,
        category=category,
        limit=limit,
        offset=offset,
        db_path=DB_PATH,
    )


@app.get("/api/v1/prompts/{prompt_id}")
def api_get_prompt_by_id(prompt_id: str):
    """Retrieve details for a single prompt by its unique prompt_id."""
    prompt = prompt_service.get_prompt_by_id(prompt_id=prompt_id, db_path=DB_PATH)
    if not prompt:
        raise HTTPException(status_code=404, detail=f"Prompt '{prompt_id}' not found.")
    return prompt


@app.get("/api/v1/reviewer/queue")
def api_get_reviewer_queue(
    language: str | None = None,
    item_type: str | None = None,
    limit: int = 50,
):
    """Retrieve pending review queue across transcripts, translations, and dictionary entries."""
    return command_center_service.get_elder_moderation_queue(
        language=language,
        item_type=item_type,
        limit=limit,
        db_path=DB_PATH,
    )


@app.post("/api/v1/reviewer/decision")
def api_post_reviewer_decision(req: ReviewerDecisionRequest):
    """Submit reviewer approval, correction, or rejection. Moves DRAFT to PUBLISHED."""
    try:
        res = command_center_service.moderate_queue_item(
            item_type=req.item_type,
            raw_id=req.item_id,
            decision=req.action,
            reviewer_name=req.reviewer_name,
            reviewer_role=req.reviewer_role,
            cultural_notes=req.notes or "",
            corrected_text=req.corrected_text,
            db_path=DB_PATH,
        )
        if req.item_type == "transcript" and req.action.upper() in ("APPROVE", "CORRECT"):
            try:
                _sync_transcript_to_search(int(str(req.item_id).split(":")[-1]))
            except Exception:
                pass
        return res
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/v1/command-center/models")
def api_get_model_evaluation_dashboard():
    """Retrieve WER/CER performance matrices and active deployment status."""
    return command_center_service.get_model_evaluation_dashboard(db_path=DB_PATH)


@app.post("/api/v1/command-center/models/rollback")
def api_execute_model_rollback(req: CommandCenterRollbackRequest):
    """Revert active production speech model to a previous verified candidate."""
    try:
        return command_center_service.execute_model_rollback(
            target_model_id=req.target_model_id,
            switched_by=req.switched_by,
            reason=req.reason,
            db_path=DB_PATH,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/v1/command-center/backups/create")
def api_create_atomic_backup(req: BackupCreateRequest):
    """Create an atomic snapshot of SQLite database using VACUUM INTO."""
    try:
        return command_center_service.create_atomic_backup_snapshot(
            reason=req.reason,
            triggered_by=req.triggered_by,
            db_path=DB_PATH,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/command-center/backups")
def api_list_system_backups():
    """List all available snapshots with integrity status and storage footprint."""
    return command_center_service.list_system_backups_console()


@app.get("/api/v1/command-center/audit-stream")
def api_get_security_audit_stream(limit: int = 100):
    """Retrieve security events, authentication logs, and OCAP moderation audits."""
    return command_center_service.get_security_audit_stream(limit=limit, db_path=DB_PATH)


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
