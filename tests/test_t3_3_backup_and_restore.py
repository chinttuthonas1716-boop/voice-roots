import os
import sqlite3
import tempfile
from pathlib import Path

import backup_retention_service
import pytest
from fastapi.testclient import TestClient

from backend.main import DB_PATH, app, init_db

ADMIN_KEY = "voice-roots-admin-key"


@pytest.fixture(autouse=True)
def setup_test_db():
    init_db()


def test_backup_retention_service_atomic_snapshot():
    with tempfile.TemporaryDirectory() as tmpdir:
        res = backup_retention_service.create_atomic_backup(
            db_path=DB_PATH,
            backup_dir=tmpdir,
            prefix="test_snapshot",
        )
        assert res["success"] is True
        assert os.path.exists(res["backup_path"])
        assert res["size_bytes"] > 0

        # Verify integrity of generated backup
        check = backup_retention_service.verify_database_integrity(res["backup_path"])
        assert check["valid"] is True
        assert check["integrity_check"] == "ok"
        assert check["table_count"] >= 10


def test_real_database_restore_cycle_and_rollback():
    """Execute a real, end-to-end database snapshot, state mutation, and restore cycle."""
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_db_path = Path(tmpdir) / "active_test.db"
        tmp_backup_dir = Path(tmpdir) / "backups"
        tmp_backup_dir.mkdir(parents=True, exist_ok=True)

        # 1. Create a isolated test database with transcripts table
        with sqlite3.connect(tmp_db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                CREATE TABLE transcripts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    uuid_id TEXT UNIQUE NOT NULL,
                    title TEXT NOT NULL,
                    language TEXT NOT NULL,
                    status TEXT NOT NULL
                )
                """
            )
            # Insert golden baseline record
            cursor.execute(
                "INSERT INTO transcripts (uuid_id, title, language, status) VALUES (?, ?, ?, ?)",
                ("golden_uuid_001", "Ancestral Gondi Harvest Song", "Gondi", "verified"),
            )
            conn.commit()

        # 2. Take baseline atomic snapshot
        backup_res = backup_retention_service.create_atomic_backup(
            db_path=tmp_db_path,
            backup_dir=tmp_backup_dir,
            prefix="baseline",
        )
        backup_file = backup_res["backup_path"]

        # 3. Mutate the active database (insert canary record that should not survive restore)
        with sqlite3.connect(tmp_db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO transcripts (uuid_id, title, language, status) VALUES (?, ?, ?, ?)",
                ("canary_uuid_999", "Ephemeral Mutation Before Disaster", "Koya", "draft"),
            )
            conn.commit()

            cursor.execute("SELECT count(*) FROM transcripts")
            assert cursor.fetchone()[0] == 2

        # 4. Perform dry-run restore validation
        dry_res = backup_retention_service.restore_database_snapshot(
            backup_path=backup_file,
            target_db_path=tmp_db_path,
            dry_run=True,
        )
        assert dry_res["dry_run"] is True
        assert dry_res["status"] == "validated_ready_to_restore"
        assert dry_res["backup_records"] == 1
        assert dry_res["current_target_records"] == 2

        # 5. Execute real atomic restore
        restore_res = backup_retention_service.restore_database_snapshot(
            backup_path=backup_file,
            target_db_path=tmp_db_path,
            dry_run=False,
        )
        assert restore_res["success"] is True
        assert restore_res["record_count"] == 1

        # 6. Verify active database was restored exactly to baseline state
        with sqlite3.connect(tmp_db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT uuid_id, title FROM transcripts")
            rows = cursor.fetchall()
            assert len(rows) == 1
            assert rows[0][0] == "golden_uuid_001"
            assert rows[0][1] == "Ancestral Gondi Harvest Song"

            # Check that the ephemeral canary record was purged
            cursor.execute("SELECT count(*) FROM transcripts WHERE uuid_id = 'canary_uuid_999'")
            assert cursor.fetchone()[0] == 0


def test_restore_endpoint_authorization_and_dry_run():
    client = TestClient(app)

    # 1. Unauthenticated call must fail with 403/401
    res_no_auth = client.post(
        "/api/v1/system/restore",
        json={"backup_filename": "nonexistent.db", "dry_run": True},
    )
    assert res_no_auth.status_code == 403

    # 2. Non-existent backup with admin credentials returns 404
    res_not_found = client.post(
        "/api/v1/system/restore",
        json={"backup_filename": "missing_backup_20261107.db", "dry_run": True},
        headers={"X-Admin-Key": ADMIN_KEY},
    )
    assert res_not_found.status_code == 404
    assert "not found" in res_not_found.json()["detail"].lower()
