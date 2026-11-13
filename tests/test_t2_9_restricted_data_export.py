import io
import os
import sqlite3
import uuid
import zipfile

import pytest
from fastapi.testclient import TestClient

from backend.main import DB_PATH, app, init_db

ADMIN_KEY = "voice-roots-admin-key"


@pytest.fixture(autouse=True)
def setup_test_db():
    init_db()


def test_restricted_export_admin_authorization_enforced():
    client = TestClient(app)

    # 1. Unauthenticated request must return 403
    res_no_auth = client.get("/api/v1/export/public-audio?dry_run=true")
    assert res_no_auth.status_code == 403
    assert "Administrator authorization required" in res_no_auth.json()["detail"]

    # 2. Invalid admin key must return 403
    res_bad_auth = client.get(
        "/api/v1/export/public-audio?dry_run=true",
        headers={"X-Admin-Key": "invalid-secret-key"},
    )
    assert res_bad_auth.status_code == 403


def test_restricted_export_dry_run_summary():
    client = TestClient(app)

    res = client.get(
        "/api/v1/export/public-audio?dry_run=true",
        headers={"X-Admin-Key": ADMIN_KEY},
    )
    assert res.status_code == 200
    data = res.json()

    assert data["dry_run"] is True
    assert data["status"] == "ready_for_export"
    assert "total_records" in data
    assert "audio_files_found" in data
    assert "total_audio_size_bytes" in data
    assert "languages" in data
    assert isinstance(data["records"], list)

    if data["records"]:
        rec = data["records"][0]
        assert "language" in rec
        assert "consent_confirmed" in rec
        assert "license" in rec
        assert "immutable_master_notice" in rec
        assert "The original voice recording is the immutable master asset" in rec["immutable_master_notice"]


def test_restricted_export_excludes_withdrawn_and_private_records():
    client = TestClient(app)
    test_uuid_private = f"priv_{uuid.uuid4().hex[:8]}"
    test_uuid_withdrawn = f"withdrawn_{uuid.uuid4().hex[:8]}"

    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            # Insert a private record
            cursor.execute(
                """
                INSERT INTO transcripts (
                    uuid_id, title, audio_filename, audio_url, language,
                    transcript_text, status, duration_seconds, created_at, updated_at,
                    consent_at, privacy_level, consent_public_publication
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    test_uuid_private,
                    "Private Secret Lore",
                    "priv.wav",
                    "/audio/priv.wav",
                    "Gondi",
                    "Secret sacred text",
                    "submitted",
                    10.0,
                    "2026-11-06T10:00:00Z",
                    "2026-11-06T10:00:00Z",
                    "2026-11-06T10:00:00Z",
                    "private",
                    0,
                ),
            )

            # Insert a withdrawn record
            cursor.execute(
                """
                INSERT INTO transcripts (
                    uuid_id, title, audio_filename, audio_url, language,
                    transcript_text, status, duration_seconds, created_at, updated_at,
                    consent_at, privacy_level, consent_public_publication, archived_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    test_uuid_withdrawn,
                    "Withdrawn Folktale",
                    "withdrawn.wav",
                    "/audio/withdrawn.wav",
                    "Koya",
                    "Withdrawn text",
                    "withdrawn",
                    12.0,
                    "2026-11-06T10:00:00Z",
                    "2026-11-06T10:00:00Z",
                    "2026-11-06T10:00:00Z",
                    "public",
                    1,
                    "2026-11-06T11:00:00Z",
                ),
            )
            conn.commit()

        # Query dry run
        res = client.get(
            "/api/v1/export/public-audio?dry_run=true",
            headers={"X-Admin-Key": ADMIN_KEY},
        )
        assert res.status_code == 200
        records = res.json()["records"]
        uuids = [r["uuid_id"] for r in records]

        assert test_uuid_private not in uuids, "Private tier records must not be exported."
        assert test_uuid_withdrawn not in uuids, "Consent-withdrawn records must not be exported."
    finally:
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("DELETE FROM transcripts WHERE uuid_id IN (?, ?)", (test_uuid_private, test_uuid_withdrawn))
            conn.commit()


def test_restricted_export_zip_package_generation():
    client = TestClient(app)

    # Insert a consented public audio record with a dummy audio file on disk
    test_uuid = f"export_{uuid.uuid4().hex[:8]}"
    test_audio_fn = f"export_test_{uuid.uuid4().hex[:6]}.wav"
    audio_storage = os.environ.get("VOICE_ROOTS_AUDIO_STORAGE", "backend/storage/audio")
    os.makedirs(audio_storage, exist_ok=True)
    audio_full_path = os.path.join(audio_storage, test_audio_fn)

    # Write dummy audio bytes
    with open(audio_full_path, "wb") as f:
        f.write(b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00")

    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO transcripts (
                    uuid_id, title, audio_filename, audio_url, language, dialect,
                    transcript_text, status, duration_seconds, created_at, updated_at,
                    consent_at, privacy_level, consent_public_publication, audio_sha256
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    test_uuid,
                    "Consented Public Story",
                    test_audio_fn,
                    f"/storage/audio/{test_audio_fn}",
                    "Gondi",
                    "Adilabad",
                    "Publicly shared oral story",
                    "submitted",
                    5.0,
                    "2026-11-06T10:00:00Z",
                    "2026-11-06T10:00:00Z",
                    "2026-11-06T10:00:00Z",
                    "public",
                    1,
                    "dummy_sha256_hash",
                ),
            )
            conn.commit()

        # Trigger ZIP export
        res = client.get(
            "/api/v1/export/public-audio?dry_run=false",
            headers={"X-Admin-Key": ADMIN_KEY},
        )
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/zip"
        assert "attachment; filename=" in res.headers["content-disposition"]

        # Inspect ZIP contents in memory
        zip_bytes = io.BytesIO(res.content)
        with zipfile.ZipFile(zip_bytes, "r") as zf:
            file_list = zf.namelist()
            assert "OCAP_GOVERNANCE.txt" in file_list
            assert "manifest.jsonl" in file_list
            assert "manifest.csv" in file_list
            assert f"audio/{test_audio_fn}" in file_list

            # Check OCAP governance notice text
            notice = zf.read("OCAP_GOVERNANCE.txt").decode("utf-8")
            assert "OCAP Principles" in notice
            assert "immutable master" in notice

            # Check JSONL content
            jsonl_data = zf.read("manifest.jsonl").decode("utf-8")
            assert test_uuid in jsonl_data
            assert "CC BY-NC 4.0" in jsonl_data
    finally:
        if os.path.exists(audio_full_path):
            os.remove(audio_full_path)
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("DELETE FROM transcripts WHERE uuid_id = ?", (test_uuid,))
            conn.commit()
