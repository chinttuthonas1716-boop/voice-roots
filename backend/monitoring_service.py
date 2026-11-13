"""Production Monitoring, Structured Logging, and Error Tracking Service.

Implements Task T3.4:
- Structured JSON logging format with correlation / Request IDs.
- Sentry error tracking integration with graceful fallback when unconfigured.
- Deep uptime and readiness health checks with database latency and storage probes.
"""

from __future__ import annotations

import json
import logging
import os
import resource
import shutil
import sqlite3
import sys
import time
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger("voice_roots.monitoring")


class JSONLogFormatter(logging.Formatter):
    """Custom logging formatter that serializes log records to structured JSON."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Contextual request metadata
        for field in ("request_id", "method", "path", "status_code", "duration_ms", "client_ip", "event"):
            val = getattr(record, field, None)
            if val is not None:
                payload[field] = val

        # Exception information if present
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(payload)


def configure_structured_logging(force: bool = False, level: str | None = None) -> bool:
    """Configure structured JSON logging if STRUCTURED_LOGGING is enabled in env or forced."""
    is_enabled = force or os.environ.get("STRUCTURED_LOGGING", "").lower() in ("true", "1", "yes")
    log_level_name = (level or os.environ.get("LOG_LEVEL", "INFO")).upper()
    log_level = getattr(logging, log_level_name, logging.INFO)

    if not is_enabled:
        return False

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONLogFormatter())
    handler.setLevel(log_level)

    # Attach to voice_roots loggers
    root_vr_logger = logging.getLogger("voice_roots")
    root_vr_logger.setLevel(log_level)
    # Remove existing stream handlers to avoid duplication
    root_vr_logger.handlers = [h for h in root_vr_logger.handlers if not isinstance(h, logging.StreamHandler)]
    root_vr_logger.addHandler(handler)
    root_vr_logger.propagate = False

    return True


def init_error_tracking() -> dict[str, Any]:
    """Initialize Sentry error tracking if SENTRY_DSN is provided."""
    dsn = os.environ.get("SENTRY_DSN")
    env = os.environ.get("VOICE_ROOTS_ENV", "production")
    traces_sample_rate = float(os.environ.get("SENTRY_TRACES_SAMPLE_RATE", "0.1"))

    if not dsn:
        return {
            "enabled": False,
            "provider": "none",
            "message": "SENTRY_DSN not configured; error tracking disabled.",
        }

    try:
        import sentry_sdk  # type: ignore[import-not-found]
        from sentry_sdk.integrations.fastapi import FastApiIntegration  # type: ignore[import-not-found]
        from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration  # type: ignore[import-not-found]

        sentry_sdk.init(
            dsn=dsn,
            environment=env,
            traces_sample_rate=traces_sample_rate,
            integrations=[FastApiIntegration(), SqlalchemyIntegration()],
            send_default_pii=False,  # OCAP protection: Never send audio or PII to third-party APM
        )
        logger.info("Sentry error tracking successfully initialized for environment: %s", env)
        return {
            "enabled": True,
            "provider": "sentry",
            "environment": env,
            "traces_sample_rate": traces_sample_rate,
        }
    except ImportError:
        logger.warning("sentry-sdk is not installed; error tracking will operate in fallback mode.")
        return {
            "enabled": False,
            "provider": "sentry",
            "error": "sentry_sdk package not installed in environment",
        }
    except Exception as exc:  # noqa: BLE001
        logger.error("Failed to initialize Sentry: %s", exc)
        return {
            "enabled": False,
            "provider": "sentry",
            "error": str(exc),
        }


def get_deep_health_probe(
    db_path: str = "storage/transcripts.db",
    storage_dir: str = "storage",
    audio_storage: str = "storage/audio",
) -> dict[str, Any]:
    """Execute a comprehensive, deep system health probe."""
    now_iso = datetime.now(timezone.utc).isoformat()
    probe: dict[str, Any] = {
        "status": "healthy",
        "timestamp": now_iso,
        "app": "Voice Roots",
        "version": "1.0.0",
        "checks": {},
        "metrics": {},
    }

    # 1. Database Connectivity & Latency Probe
    database_url = os.environ.get("DATABASE_URL")
    db_type = "postgresql" if database_url and ("postgres://" in database_url or "postgresql://" in database_url) else "sqlite"
    t_start = time.perf_counter()
    db_status = "ok"
    db_integrity = "ok"
    table_count = 0
    transcript_count = 0
    db_latency_ms = 0.0

    if db_type == "postgresql":
        try:
            import psycopg2  # type: ignore[import-not-found]
            norm_url = database_url.replace("postgres://", "postgresql://", 1) if database_url.startswith("postgres://") else database_url  # type: ignore[union-attr]
            conn = psycopg2.connect(norm_url, connect_timeout=5)
            with conn.cursor() as cur:
                cur.execute("SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'")
                table_count = cur.fetchone()[0]
                cur.execute("SELECT count(*) FROM transcripts")
                transcript_count = cur.fetchone()[0]
            conn.close()
            db_latency_ms = round((time.perf_counter() - t_start) * 1000, 2)
        except Exception as exc:  # noqa: BLE001
            db_status = f"error: {exc}"
            db_integrity = "fail"
            probe["status"] = "unhealthy"
    else:
        try:
            if os.path.exists(db_path):
                with sqlite3.connect(db_path, timeout=5.0) as conn:
                    cur = conn.cursor()
                    cur.execute("PRAGMA quick_check")
                    qc_res = cur.fetchone()
                    db_integrity = qc_res[0] if qc_res else "unknown"
                    cur.execute("SELECT count(*) FROM sqlite_master WHERE type='table'")
                    table_count = cur.fetchone()[0]
                    # Verify transcripts table
                    cur.execute("SELECT count(*) FROM transcripts")
                    transcript_count = cur.fetchone()[0]
                db_latency_ms = round((time.perf_counter() - t_start) * 1000, 2)
                if db_integrity != "ok":
                    probe["status"] = "degraded"
            else:
                db_status = "not_found"
                probe["status"] = "degraded"
        except Exception as exc:  # noqa: BLE001
            db_status = f"error: {exc}"
            db_integrity = "fail"
            probe["status"] = "unhealthy"

    probe["checks"]["database"] = {
        "engine": db_type,
        "status": db_status,
        "integrity": db_integrity,
        "latency_ms": db_latency_ms,
        "table_count": table_count,
        "transcript_count": transcript_count,
    }

    # 2. Storage System Probe
    audio_exists = os.path.exists(audio_storage)
    audio_writable = os.access(audio_storage, os.W_OK) if audio_exists else False
    audio_count = len(os.listdir(audio_storage)) if audio_exists and os.path.isdir(audio_storage) else 0

    storage_provider = "cloudflare_r2" if os.environ.get("R2_BUCKET") else "local_disk"

    probe["checks"]["storage"] = {
        "provider": storage_provider,
        "audio_dir_exists": audio_exists,
        "audio_dir_writable": audio_writable,
        "audio_files_cached": audio_count,
    }
    if not audio_exists or not audio_writable:
        probe["checks"]["storage"]["status"] = "degraded"
        if probe["status"] == "healthy":
            probe["status"] = "degraded"
    else:
        probe["checks"]["storage"]["status"] = "ok"

    # 3. Disk & Memory Utilization
    disk_dir = os.path.dirname(os.path.abspath(db_path)) if os.path.exists(db_path) else "."
    try:
        disk_usage = shutil.disk_usage(disk_dir)
        probe["metrics"]["disk"] = {
            "total_gb": round(disk_usage.total / (1024**3), 2),
            "free_gb": round(disk_usage.free / (1024**3), 2),
            "free_percent": round((disk_usage.free / disk_usage.total) * 100, 1),
        }
        if probe["metrics"]["disk"]["free_percent"] < 5.0:
            probe["status"] = "degraded"
            probe["metrics"]["disk"]["warning"] = "Low disk space (<5% remaining)"
    except Exception:  # noqa: BLE001
        probe["metrics"]["disk"] = {"status": "unavailable"}

    try:
        usage = resource.getrusage(resource.RUSAGE_SELF)
        # maxrss is in kilobytes on Linux, bytes on macOS
        rss_mb = round(usage.ru_maxrss / (1024 * 1024 if sys.platform == "darwin" else 1024), 2)
        probe["metrics"]["memory"] = {
            "max_rss_mb": rss_mb,
        }
    except Exception:  # noqa: BLE001
        probe["metrics"]["memory"] = {"status": "unavailable"}

    # 4. Error Tracking & Logging Status
    sentry_configured = bool(os.environ.get("SENTRY_DSN"))
    structured_logging_enabled = os.environ.get("STRUCTURED_LOGGING", "").lower() in ("true", "1", "yes")

    probe["checks"]["observability"] = {
        "structured_logging": structured_logging_enabled,
        "error_tracking_configured": sentry_configured,
        "environment": os.environ.get("VOICE_ROOTS_ENV", "production"),
    }

    return probe
