"""Voice Roots: Tests for Production Launch Task T1.3 (Move to PostgreSQL)
=============================================================================
Verifies:
1. URL normalization for Render PostgreSQL and asyncpg drivers.
2. Table discovery and foreign-key topological migration ordering.
3. Dry-run inspection and row counting across 37 tables.
4. Clean end-to-end Alembic migrations from base (4385e5315767) to head (5d6e7f8a9b0c).
5. Offline PostgreSQL DDL compilation without requiring live database.
6. Backend health and readiness checks supporting PostgreSQL and SQLite.
"""

import os
import subprocess
import sys
import tempfile
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from backend.main import app, health_check
from scripts.migrate_sqlite_to_postgres import (
    DEFAULT_SQLITE_PATH,
    get_sqlite_tables,
    migrate_data,
    normalize_pg_url,
)

client = TestClient(app)


def test_normalize_pg_url():
    """Verify postgres:// and postgresql+asyncpg:// are correctly normalized to standard postgresql://."""
    assert normalize_pg_url("postgres://user:pass@ep-123.render.com/db") == "postgresql://user:pass@ep-123.render.com/db"
    assert (
        normalize_pg_url("postgresql+asyncpg://user:pass@localhost:5432/voice_roots")
        == "postgresql://user:pass@localhost:5432/voice_roots"
    )
    assert (
        normalize_pg_url("postgresql://user:pass@localhost:5432/voice_roots")
        == "postgresql://user:pass@localhost:5432/voice_roots"
    )


def test_sqlite_table_discovery():
    """Verify table discovery extracts non-internal, non-FTS tables in topological order."""
    import sqlite3

    conn = sqlite3.connect(DEFAULT_SQLITE_PATH)
    tables = get_sqlite_tables(conn)
    conn.close()

    assert len(tables) >= 30
    assert "users" in tables
    assert "transcripts" in tables
    assert "translations" in tables
    assert "dictionary" in tables
    assert "cultural_stories" in tables

    # Verify order: users must precede user_sessions; transcripts must precede translations
    assert tables.index("users") < tables.index("user_sessions")
    assert tables.index("transcripts") < tables.index("translations")

    # Verify virtual FTS and sqlite internal tables are excluded
    for t in tables:
        assert not t.startswith("sqlite_")
        assert not t.endswith(("_fts", "_data", "_idx", "_content", "_docsize", "_config"))


def test_migrate_data_dry_run():
    """Verify dry-run migration mode inspects SQLite without writing to PostgreSQL."""
    results = migrate_data(
        sqlite_path=DEFAULT_SQLITE_PATH,
        pg_url=None,
        dry_run=True,
    )

    assert "transcripts" in results
    assert results["transcripts"]["sqlite_count"] > 0
    assert results["transcripts"]["status"] == "DRY_RUN"

    assert "users" in results
    assert results["users"]["sqlite_count"] > 0

    assert "corrections" in results
    assert results["corrections"]["sqlite_count"] > 0


def test_alembic_upgrade_sqlite_clean():
    """Verify Alembic migration chain runs from scratch to head on a fresh SQLite database."""
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        alembic_ini = os.path.join(repo_root, "backend", "alembic.ini")
        env = dict(os.environ, DATABASE_URL=f"sqlite:///{tmp_path}")

        res = subprocess.run(
            [sys.executable, "-m", "alembic", "-c", alembic_ini, "upgrade", "head"],
            env=env,
            capture_output=True,
            text=True,
        )

        assert res.returncode == 0, f"Alembic upgrade failed:\n{res.stderr}"

        # Verify alembic_version table is at head
        import sqlite3

        conn = sqlite3.connect(tmp_path)
        cur = conn.cursor()
        cur.execute("SELECT version_num FROM alembic_version")
        ver = cur.fetchone()[0]
        conn.close()

        assert ver == "5d6e7f8a9b0c"
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def test_alembic_offline_postgresql_generation():
    """Verify Alembic can compile static PostgreSQL DDL for all migrations up to head."""
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    alembic_ini = os.path.join(repo_root, "backend", "alembic.ini")
    env = dict(os.environ, DATABASE_URL="postgresql://voice_user:voice_pass@localhost:5432/voice_roots_prod")

    res = subprocess.run(
        [sys.executable, "-m", "alembic", "-c", alembic_ini, "upgrade", "head", "--sql"],
        env=env,
        capture_output=True,
        text=True,
    )

    assert res.returncode == 0, f"PostgreSQL DDL generation failed:\n{res.stderr}"
    sql_output = res.stdout

    # Verify PostgreSQL DDL statements
    assert "CREATE TABLE users" in sql_output
    assert "CREATE TABLE transcripts" in sql_output
    assert "CREATE TABLE translations" in sql_output
    assert "CREATE TABLE dictionary" in sql_output
    assert "CREATE TABLE cultural_stories" in sql_output
    assert "CREATE TABLE speech_alignments" in sql_output
    assert "5d6e7f8a9b0c" in sql_output


def test_health_check_sqlite_default():
    """Verify health check returns SQLite status when DATABASE_URL is unset."""
    with patch.dict(os.environ, {}, clear=False):
        os.environ.pop("DATABASE_URL", None)
        res = client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert data["database"] == "sqlite"
        assert data["database_status"] == "ok"


def test_health_check_postgresql_branch_healthy():
    """Verify health check recognizes PostgreSQL and checks connection when DATABASE_URL is set."""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

    mock_psycopg2 = MagicMock()
    mock_psycopg2.connect.return_value = mock_conn

    with (
        patch.dict(os.environ, {"DATABASE_URL": "postgresql://user:pass@render.com/db"}),
        patch.dict(sys.modules, {"psycopg2": mock_psycopg2}),
    ):
        res = health_check()
        assert res["database"] == "postgresql"
        assert res["database_status"] == "ok"
        assert res["status"] == "healthy"


def test_health_check_postgresql_branch_degraded():
    """Verify health check marks degraded when PostgreSQL connection fails."""
    mock_psycopg2 = MagicMock()
    mock_psycopg2.connect.side_effect = Exception("Connection refused")

    with (
        patch.dict(os.environ, {"DATABASE_URL": "postgresql://baduser:badpass@unreachable:5432/db"}),
        patch.dict(sys.modules, {"psycopg2": mock_psycopg2}),
    ):
        res = health_check()
        assert res["database"] == "postgresql"
        assert res["database_status"] == "error"
        assert res["status"] == "degraded"
