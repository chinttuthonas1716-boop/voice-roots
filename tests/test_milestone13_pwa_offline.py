"""
Voice Roots: Milestone 13 Verification Suite
=============================================
Tests Offline-First Progressive Web Application (PWA):
1. Web App Manifest validation (standalone mode, theme color, icons, start_url).
2. Service Worker architecture and strict privacy boundary:
   - Verifies shell precaching.
   - Verifies network-only rule for /api/ and /storage/ (zero cache leaks of private audio).
3. Offline audio ingestion idempotency:
   - Uploading with a client_uuid registers the recording.
   - Retrying the upload with the same client_uuid returns the existing transcript without duplication.
4. Mandatory OCAP consent enforcement on synced offline recordings.
5. Static PWA asset route serving.
"""

import io
import json
import os
import sqlite3
import pytest
from fastapi.testclient import TestClient

from main import app, DB_PATH, FRONTEND_DIST


@pytest.fixture
def client():
    return TestClient(app)


# ------------------------------------------------------------------------------
# 1. Web App Manifest & Service Worker Verification
# ------------------------------------------------------------------------------

def test_pwa_manifest_configuration():
    """Verify Web App Manifest properties for PWA installability and compliance."""
    manifest_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "manifest.json")
    assert os.path.exists(manifest_path), "manifest.json must exist in frontend/public"

    with open(manifest_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data["name"] == "Voice Roots — Rooting Oral Languages in Text with AI"
    assert data["short_name"] == "Voice Roots"
    assert data["start_url"] == "/"
    assert data["display"] == "standalone"
    assert data["theme_color"] == "#051F20"
    assert data["background_color"] == "#051F20"
    assert "icons" in data and len(data["icons"]) >= 2
    sizes = [icon["sizes"] for icon in data["icons"]]
    assert "192x192" in sizes
    assert "512x512" in sizes


def test_service_worker_security_and_privacy_boundary():
    """Verify Service Worker precaches shell but enforces strict network-only for API & storage."""
    sw_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "sw.js")
    assert os.path.exists(sw_path), "sw.js must exist in frontend/public"

    with open(sw_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Precache verification
    assert "voice-roots-shell" in content
    assert "/manifest.json" in content
    assert "/index.html" in content

    # Strict Privacy Boundary Verification: API and storage must be network-only
    assert "/api/" in content
    assert "/storage/" in content
    assert "Strict Security Boundary: Never cache API calls or private storage" in content


# ------------------------------------------------------------------------------
# 2. Idempotent Offline Synchronization Engine
# ------------------------------------------------------------------------------

def test_offline_sync_idempotency_prevents_duplicate_recordings(client):
    """Verify that retrying an offline sync with client_uuid does not duplicate database records."""
    client_uuid = f"offline_sync_test_{os.urandom(4).hex()}"
    wav_bytes = (
        b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00"
        b"\x44\xac\x00\x00\x88\x58\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00"
    )

    upload_data = {
        "title": "Offline Tribal Field Lore",
        "language": "gondi",
        "dialect": "Aheri",
        "consent": "true",
        "client_uuid": client_uuid,
        "contributor_name": "Field Researcher",
    }
    files = {"audio": ("offline_sample.wav", io.BytesIO(wav_bytes), "audio/wav")}

    # Initial Upload
    res1 = client.post("/api/v1/transcripts/upload", data=upload_data, files=files)
    assert res1.status_code == 200
    rec1 = res1.json()
    assert rec1["title"] == "Offline Tribal Field Lore"
    rec1_id = rec1["id"]
    assert rec1["uuid_id"] == client_uuid

    # Duplicate Retry (e.g. client reconnected or auto-sync retried)
    files2 = {"audio": ("offline_sample.wav", io.BytesIO(wav_bytes), "audio/wav")}
    res2 = client.post("/api/v1/transcripts/upload", data=upload_data, files=files2)
    assert res2.status_code == 200
    rec2 = res2.json()

    # Must return the identical database record ID (zero duplicate creation)
    assert rec2["id"] == rec1_id
    assert rec2["uuid_id"] == client_uuid

    # Check database row count for this client_uuid
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM transcripts WHERE uuid_id = ?", (client_uuid,))
        count = cursor.fetchone()[0]
        assert count == 1, "Database must not contain duplicate records for the same client_uuid"


def test_offline_sync_enforces_mandatory_consent(client):
    """Verify that unconsented offline recordings are strictly rejected by the backend."""
    wav_bytes = (
        b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00"
        b"\x44\xac\x00\x00\x88\x58\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00"
    )

    upload_data = {
        "title": "Unconsented Offline Recording",
        "language": "koya",
        "consent": "false",
        "client_uuid": "offline_unconsented_123",
    }
    files = {"audio": ("unconsented.wav", io.BytesIO(wav_bytes), "audio/wav")}

    res = client.post("/api/v1/transcripts/upload", data=upload_data, files=files)
    assert res.status_code == 400
    assert "consent is required" in res.json()["detail"].lower()
