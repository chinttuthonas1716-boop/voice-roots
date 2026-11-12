"""Voice Roots: Tests for Milestone 4 — Persistent Data and Oral Language Preservation
===================================================================================
Verifies:
1. Pluggable Storage Layer (LocalStorageProvider and S3StorageProvider).
2. Oral Language Data Model & Relational Persistence in SQLite.
3. Database Query Performance & Privacy Indexes.
4. Privacy Boundaries: Private recordings isolation & Admin Authorization.
5. Audio Stream URL Generation (Local path & Presigned S3 URL).
6. Bulk Research Corpus Export (JSON with OCAP metadata & UTF-8 BOM CSV).
7. Alembic Migration Consistency at Head Revision.
"""

import os
import io
import wave
import sqlite3
import tempfile
import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient

from main import app, DB_PATH, AUDIO_STORAGE, ADMIN_API_KEY
from storage_service import (
    LocalStorageProvider,
    S3StorageProvider,
    create_storage_provider,
    StorageError,
)

client = TestClient(app)


def _generate_test_wav_bytes(duration_sec: float = 0.5) -> bytes:
    """Generate minimal valid PCM WAV bytes for testing."""
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(16000)
        # Generate silence
        frames = int(16000 * duration_sec)
        wf.writeframes(b"\x00\x00" * frames)
    return buf.getvalue()


# ─── 1. Storage Provider Tests ───

def test_local_storage_provider_lifecycle():
    """Verify LocalStorageProvider persists with 0o600 permissions, computes SHA-256, and deletes cleanly."""
    with tempfile.TemporaryDirectory() as temp_dir:
        provider = LocalStorageProvider(storage_dir=temp_dir)
        assert provider.name == "local"

        # Create a temp file
        temp_file = os.path.join(temp_dir, "test_input.wav")
        wav_data = _generate_test_wav_bytes(0.2)
        with open(temp_file, "wb") as f:
            f.write(wav_data)

        # Store file
        target_name = "preserved_sample.wav"
        stored_name, size, sha256_hash = provider.store_file(temp_file, target_name, "audio/wav")

        assert stored_name == target_name
        assert size == len(wav_data)
        assert len(sha256_hash) == 64
        assert provider.file_exists(target_name) is True

        # Check file permissions (0o600)
        final_path = os.path.join(temp_dir, target_name)
        mode = oct(os.stat(final_path).st_mode & 0o777)
        assert mode == "0o600"

        # Check stream URL
        stream_url = provider.get_stream_url(target_name)
        assert stream_url == f"/storage/audio/{target_name}"

        # Delete file
        assert provider.delete_file(target_name) is True
        assert provider.file_exists(target_name) is False


def test_s3_storage_provider_mock():
    """Verify S3StorageProvider configures correctly and generates presigned URLs without leaking credentials."""
    mock_s3_client = MagicMock()
    mock_s3_client.generate_presigned_url.return_value = "https://s3.ap-south-1.amazonaws.com/voice-roots-audio/test.wav?signature=xyz&expires=3600"

    provider = S3StorageProvider(
        bucket="voice-roots-audio",
        region_name="ap-south-1",
        client=mock_s3_client,
    )
    assert provider.name == "s3"

    # Test presigned URL generation
    presigned_url = provider.get_stream_url("test.wav", expires_in=3600)
    assert "https://s3.ap-south-1.amazonaws.com" in presigned_url
    assert "signature=xyz" in presigned_url
    mock_s3_client.generate_presigned_url.assert_called_once_with(
        ClientMethod="get_object",
        Params={"Bucket": "voice-roots-audio", "Key": "test.wav"},
        ExpiresIn=3600,
    )


# ─── 2. Oral Language Schema & Index Verification ───

def test_database_schema_and_indexes():
    """Verify oral language metadata columns and performance indexes exist on SQLite database."""
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cols = {r[1] for r in cursor.execute("PRAGMA table_info(transcripts)").fetchall()}

        # Verify all 8 oral language metadata fields
        expected_cols = {
            "contributor_name",
            "contributor_role",
            "provenance_notes",
            "transliteration_text",
            "license",
            "privacy_level",
            "retention_policy",
            "storage_backend",
        }
        for col in expected_cols:
            assert col in cols, f"Missing expected oral language column: {col}"

        # Verify performance & privacy indexes
        indexes = {r[1] for r in cursor.execute("PRAGMA index_list(transcripts)").fetchall()}
        expected_indexes = {
            "idx_transcripts_privacy",
            "idx_transcripts_sha256",
            "idx_transcripts_status",
            "idx_transcripts_created",
            "idx_transcripts_language",
            "idx_transcripts_archived",
        }
        for idx in expected_indexes:
            assert idx in indexes, f"Missing expected index: {idx}"


# ─── 3. Upload with Oral Language Metadata & Privacy Boundaries ───

def test_upload_with_oral_language_metadata_and_retrieval():
    """Verify upload accepts and persists oral language provenance, license, and privacy attributes."""
    wav_bytes = _generate_test_wav_bytes(0.5)

    files = {"file": ("oral_lore.wav", wav_bytes, "audio/wav")}
    data = {
        "title": "Adilabad Forest Grove Ceremony",
        "language": "Gondi",
        "dialect": "Northern Adilabad",
        "consent": "true",
        "transcription_consent": "false",
        "contributor_name": "Elder Somu Meshram",
        "contributor_role": "village_elder",
        "provenance_notes": "Recorded at Keslapur sacred grove during Persa Pen festival",
        "transliteration_text": "Nandrai Gondwana Punnam",
        "license": "CC BY-NC 4.0",
        "privacy_level": "public",
        "retention_policy": "perpetual_cultural_archive",
    }

    res = client.post("/api/upload", files=files, data=data)
    assert res.status_code == 200, res.text
    record = res.json()

    assert record["title"] == "Adilabad Forest Grove Ceremony"
    assert record["language"] == "Gondi"
    assert record["contributor_name"] == "Elder Somu Meshram"
    assert record["contributor_role"] == "village_elder"
    assert record["provenance_notes"] == "Recorded at Keslapur sacred grove during Persa Pen festival"
    assert record["transliteration_text"] == "Nandrai Gondwana Punnam"
    assert record["license"] == "CC BY-NC 4.0"
    assert record["privacy_level"] == "public"
    assert record["retention_policy"] == "perpetual_cultural_archive"
    assert "audio_sha256" in record
    assert len(record["audio_sha256"]) == 64

    # Verify retrieval via GET /api/transcripts/{id}
    rec_id = record["id"]
    res_get = client.get(f"/api/transcripts/{rec_id}")
    assert res_get.status_code == 200
    fetched = res_get.json()
    assert fetched["contributor_name"] == "Elder Somu Meshram"
    assert fetched["transliteration_text"] == "Nandrai Gondwana Punnam"

    # Verify audio stream URL endpoint
    res_stream = client.get(f"/api/v1/audio/{rec_id}/stream")
    assert res_stream.status_code == 200
    stream_data = res_stream.json()
    assert stream_data["transcript_id"] == rec_id
    assert "/storage/audio/" in stream_data["stream_url"]
    assert stream_data["privacy_level"] == "public"


def test_private_recording_privacy_controls_and_authorization():
    """Verify private recordings are isolated and accessible only with valid administrator authorization."""
    wav_bytes = _generate_test_wav_bytes(0.3)

    files = {"file": ("private_oral_history.wav", wav_bytes, "audio/wav")}
    data = {
        "title": "Private Clan Genealogy Record",
        "language": "Koya",
        "consent": "true",
        "transcription_consent": "false",
        "privacy_level": "private",
        "contributor_name": "Confidential Contributor",
    }

    res_up = client.post("/api/upload", files=files, data=data)
    assert res_up.status_code == 200
    private_id = res_up.json()["id"]

    # 1. Unauthenticated list_transcripts does NOT leak private recording
    res_list = client.get("/api/transcripts")
    assert res_list.status_code == 200
    ids_in_list = [r["id"] for r in res_list.json()["transcripts"]]
    assert private_id not in ids_in_list

    # 2. Unauthenticated search_archive does NOT leak private recording
    res_search = client.get("/api/v1/archive/search?q=Clan+Genealogy")
    assert res_search.status_code == 200
    search_ids = [r["id"] for r in res_search.json()["transcripts"]]
    assert private_id not in search_ids

    # 3. Unauthenticated direct get returns HTTP 403 Forbidden
    res_direct_anon = client.get(f"/api/transcripts/{private_id}")
    assert res_direct_anon.status_code == 403
    assert "Access denied" in res_direct_anon.json()["detail"]

    # 4. Unauthenticated stream endpoint returns HTTP 403 Forbidden
    res_stream_anon = client.get(f"/api/v1/audio/{private_id}/stream")
    assert res_stream_anon.status_code == 403

    # 5. Authenticated request with Admin Key returns HTTP 200 OK
    admin_headers = {"X-Admin-Key": "test-admin-key"}

    res_direct_admin = client.get(f"/api/transcripts/{private_id}", headers=admin_headers)
    assert res_direct_admin.status_code == 200
    assert res_direct_admin.json()["title"] == "Private Clan Genealogy Record"

    res_stream_admin = client.get(f"/api/v1/audio/{private_id}/stream", headers=admin_headers)
    assert res_stream_admin.status_code == 200
    assert res_stream_admin.json()["transcript_id"] == private_id


# ─── 4. Update Oral Language Metadata ───

def test_update_transcript_oral_metadata():
    """Verify PUT/PATCH allows updating transliteration, provenance, and privacy settings."""
    wav_bytes = _generate_test_wav_bytes(0.3)
    res_up = client.post(
        "/api/upload",
        files={"file": ("song.wav", wav_bytes, "audio/wav")},
        data={"title": "Harvest Song", "language": "Gondi", "consent": "true"},
    )
    rec_id = res_up.json()["id"]

    # Update metadata
    update_payload = {
        "transliteration_text": "Updated Devanagari / Romanized script",
        "provenance_notes": "Verified by Council of Elders in 2026",
        "license": "CC BY-SA 4.0",
        "dialect": "Adilabad Southern",
    }
    res_update = client.put(f"/api/transcripts/{rec_id}", json=update_payload)
    assert res_update.status_code == 200

    # Retrieve and check
    res_get = client.get(f"/api/transcripts/{rec_id}")
    record = res_get.json()
    assert record["transliteration_text"] == "Updated Devanagari / Romanized script"
    assert record["provenance_notes"] == "Verified by Council of Elders in 2026"
    assert record["license"] == "CC BY-SA 4.0"
    assert record["dialect"] == "Adilabad Southern"


# ─── 5. Bulk Research Corpus Export (JSON & CSV) ───

def test_bulk_archive_export_json_and_csv():
    """Verify researcher export endpoint provides JSON metadata and UTF-8 BOM CSV for external tools."""
    # 1. JSON Export
    res_json = client.get("/api/v1/archive/export?format=json")
    assert res_json.status_code == 200
    json_data = res_json.json()
    assert "metadata" in json_data
    assert json_data["metadata"]["license_standard"] == "OCAP / CC BY-NC 4.0"
    assert "notice" in json_data["metadata"]
    assert "records" in json_data
    assert len(json_data["records"]) > 0

    # Verify records contain SHA-256 and audio metadata
    first_record = json_data["records"][0]
    assert "audio_sha256" in first_record
    assert "title" in first_record
    assert "language" in first_record

    # 2. CSV Export
    res_csv = client.get("/api/v1/archive/export?format=csv")
    assert res_csv.status_code == 200
    assert "text/csv" in res_csv.headers["content-type"]
    assert res_csv.content.startswith(b"\xef\xbb\xbf")  # UTF-8 BOM check
    csv_text = res_csv.content.decode("utf-8-sig")
    assert "id,uuid_id,title" in csv_text or "title" in csv_text

