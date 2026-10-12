"""Test suite for Voice Roots Milestone 1 backend endpoints."""

import os
import io
import sys
import tempfile
import hashlib
import sqlite3
import pytest
from fastapi.testclient import TestClient
from transcription_service import (
    TranscriptionNotConfiguredError,
    TranscriptionProviderError,
    TranscriptionResult,
)

# Add backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# Keep module-import initialization away from the repository's database too.
_TEST_ROOT = tempfile.TemporaryDirectory(prefix="voice-roots-tests-")
os.environ["VOICE_ROOTS_DB_PATH"] = os.path.join(_TEST_ROOT.name, "initial.db")
os.environ["VOICE_ROOTS_STORAGE_DIR"] = os.path.join(_TEST_ROOT.name, "initial-storage")
import main

client = TestClient(main.app)


@pytest.fixture(autouse=True)
def isolate_database_and_audio(tmp_path, monkeypatch):
    """Never let API tests mutate the repository's existing SQLite database."""
    storage = tmp_path / "storage" / "audio"
    storage.mkdir(parents=True)
    monkeypatch.setattr(main, "DB_PATH", str(tmp_path / "voice_roots.db"))
    monkeypatch.setattr(main, "STORAGE_DIR", str(tmp_path / "storage"))
    monkeypatch.setattr(main, "AUDIO_STORAGE", str(storage))
    monkeypatch.setattr(main, "MAX_AUDIO_SIZE_MB", 500)
    monkeypatch.setattr(main, "MAX_AUDIO_SIZE_BYTES", 500 * 1024 * 1024)
    main.init_db()


def upload_form(**overrides):
    values = {
        "title": "Telangana Gondi Clan Song",
        "language": "Gondi",
        "dialect": "Adilabad Southern",
        "consent": "true",
    }
    values.update(overrides)
    return values


def wav_bytes(payload=b"sample audio"):
    return b"RIFF\x00\x00\x00\x00WAVEfmt " + payload


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Voice Roots API"
    assert data["status"] == "online"


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "sqlite"
    assert data["database_status"] == "ok"


def test_health_endpoint_reports_degraded_when_database_is_unavailable(tmp_path, monkeypatch):
    monkeypatch.setattr(main, "DB_PATH", str(tmp_path / "missing" / "database.sqlite"))

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "degraded"
    assert response.json()["database_status"] == "error"


def test_vite_development_origin_cors_preflight_is_allowed():
    origin = "http://localhost:5173"
    response = client.options(
        "/api/upload",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == origin


def test_languages_endpoint():
    response = client.get("/api/languages")
    assert response.status_code == 200
    data = response.json()
    assert "languages" in data
    assert len(data["languages"]) >= 13


def test_upload_and_transcript_crud_cycle():
    # 1. Test Audio Upload with Multipart Form Data
    fake_audio = io.BytesIO(wav_bytes(b"....data....fake audio bytes"))
    upload_res = client.post(
        "/api/upload",
        data=upload_form(),
        files={"file": ("gondi_song.wav", fake_audio, "audio/wav")},
    )
    assert upload_res.status_code == 200
    upload_data = upload_res.json()
    assert upload_data["success"] is True
    assert upload_data["status"] == "Awaiting transcription"
    transcript_id = upload_data["id"]

    # 2. Test Get Transcripts List
    list_res = client.get("/api/transcripts")
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["count"] >= 1
    matched = [t for t in list_data["transcripts"] if t["id"] == transcript_id]
    assert len(matched) == 1

    # 3. Test Update Transcript Text
    updated_text = "Verified ancestral verse transcription updated by native speaker."
    update_res = client.put(
        f"/api/transcripts/{transcript_id}",
        json={"transcript_text": updated_text, "title": "Telangana Gondi Clan Song (Edited)"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["success"] is True

    # 4. Verify the update persisted in SQLite
    get_res = client.get(f"/api/transcripts/{transcript_id}")
    assert get_res.status_code == 200
    assert get_res.json()["transcript_text"] == updated_text
    assert get_res.json()["status"] == "Community Edited"
    original_file = os.path.join(main.AUDIO_STORAGE, get_res.json()["audio_filename"])
    assert os.path.exists(original_file)

    # 5. Test Delete Transcript
    del_res = client.delete(f"/api/transcripts/{transcript_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True
    assert "audio retained" in del_res.json()["message"]
    assert os.path.exists(original_file)
    with sqlite3.connect(main.DB_PATH) as conn:
        assert conn.execute(
            "SELECT archived_at FROM transcripts WHERE id = ?", (transcript_id,)
        ).fetchone()[0]

    # 6. Verify Deletion
    get_after_del = client.get(f"/api/transcripts/{transcript_id}")
    assert get_after_del.status_code == 404


def test_upload_requires_consent_before_storing_audio():
    response = client.post(
        "/api/v1/audio/upload",
        data=upload_form(consent="false"),
        files={"file": ("consent.wav", io.BytesIO(wav_bytes()), "audio/wav")},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Consent is required before the recording can be stored."
    with sqlite3.connect(main.DB_PATH) as conn:
        assert conn.execute("SELECT COUNT(*) FROM transcripts").fetchone()[0] == 0
    assert os.listdir(main.AUDIO_STORAGE) == []


def test_current_frontend_upload_fields_are_rejected_without_consent():
    response = client.post(
        "/api/upload",
        data={
            "title": "Frontend integration check",
            "language": "Gondi",
            "dialect": "",
        },
        files={"file": ("recording.wav", io.BytesIO(wav_bytes()), "audio/wav")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Consent is required before the recording can be stored."
    with sqlite3.connect(main.DB_PATH) as conn:
        assert conn.execute("SELECT COUNT(*) FROM transcripts").fetchone()[0] == 0
    assert os.listdir(main.AUDIO_STORAGE) == []


def test_upload_preserves_original_bytes_and_records_sha256():
    original = wav_bytes(b"exact bytes from the original recording")
    response = client.post(
        "/api/v1/audio/upload",
        data=upload_form(),
        files={"file": ("source.wav", io.BytesIO(original), "audio/wav")},
    )
    assert response.status_code == 200
    saved = response.json()
    row = client.get(f"/api/v1/transcriptions/{saved['id']}").json()
    stored_path = os.path.join(main.AUDIO_STORAGE, row["audio_filename"])
    with open(stored_path, "rb") as stored_file:
        stored = stored_file.read()
    assert stored == original
    assert saved["audio_sha256"] == hashlib.sha256(original).hexdigest()
    assert row["audio_sha256"] == saved["audio_sha256"]
    assert row["file_size_bytes"] == len(original)
    assert row["consent_version"] == main.CONSENT_VERSION
    assert row["consent_at"]
    assert row["transcript_text"] == ""


def test_consented_upload_saves_generated_transcript_without_changing_audio(monkeypatch):
    original = wav_bytes(b"authorized transcript fixture")

    class StubProvider:
        def transcribe(self, audio_path):
            with open(audio_path, "rb") as audio_file:
                assert audio_file.read() == original
            return TranscriptionResult(
                text="Mocked SDK transcript result.",
                provider="openai",
                model="whisper-1",
            )

    monkeypatch.setattr(main, "create_transcription_provider", lambda: StubProvider())
    response = client.post(
        "/api/upload",
        data=upload_form(transcription_consent="true"),
        files={"file": ("consented.wav", io.BytesIO(original), "audio/wav")},
    )
    assert response.status_code == 200
    assert response.json()["transcription_status"] == "queued"

    row = client.get(f"/api/transcripts/{response.json()['id']}").json()
    assert row["transcription_status"] == "completed"
    assert row["machine_transcript_text"] == "Mocked SDK transcript result."
    assert row["transcript_text"] == "Mocked SDK transcript result."
    assert row["transcription_provider"] == "openai"
    assert row["transcription_model"] == "whisper-1"
    assert row["transcription_consent_at"]
    assert row["transcription_consent_version"] == main.TRANSCRIPTION_CONSENT_VERSION
    assert row["transcribed_at"]
    assert open(os.path.join(main.AUDIO_STORAGE, row["audio_filename"]), "rb").read() == original


def test_transcription_requires_separate_consent_and_is_not_queued_by_default(monkeypatch):
    def unexpected_provider():
        raise AssertionError("provider must not be created without transcription consent")

    monkeypatch.setattr(main, "create_transcription_provider", unexpected_provider)
    response = client.post(
        "/api/upload",
        data=upload_form(),
        files={"file": ("not-opted-in.wav", io.BytesIO(wav_bytes()), "audio/wav")},
    )
    assert response.status_code == 200
    row = client.get(f"/api/transcripts/{response.json()['id']}").json()
    assert row["transcription_status"] == "not_requested"
    assert row["transcription_consent_at"] is None
    assert row["transcript_text"] == ""


def test_transcription_route_requires_consent_and_preserves_community_edit(monkeypatch):
    response = client.post(
        "/api/upload",
        data=upload_form(),
        files={"file": ("manual-consent.wav", io.BytesIO(wav_bytes()), "audio/wav")},
    )
    transcript_id = response.json()["id"]
    no_consent = client.post(
        f"/api/transcripts/{transcript_id}/transcribe",
        json={"transcription_consent": False},
    )
    assert no_consent.status_code == 400
    missing_consent = client.post(
        f"/api/transcripts/{transcript_id}/transcribe",
        json={},
    )
    assert missing_consent.status_code == 400

    client.put(
        f"/api/transcripts/{transcript_id}",
        json={"transcript_text": "Community corrected words."},
    )

    class StubProvider:
        def transcribe(self, _audio_path):
            return TranscriptionResult(
                text="Updated model words.", provider="openai", model="whisper-1"
            )

    monkeypatch.setattr(main, "create_transcription_provider", lambda: StubProvider())
    queued = client.post(
        f"/api/v1/transcriptions/{transcript_id}/transcribe",
        json={"transcription_consent": True},
    )
    assert queued.status_code == 200
    assert queued.json()["transcription_status"] == "queued"

    row = client.get(f"/api/v1/transcriptions/{transcript_id}").json()
    assert row["transcription_status"] == "completed"
    assert row["machine_transcript_text"] == "Updated model words."
    assert row["transcript_text"] == "Community corrected words."
    assert row["status"] == "Community Edited"


def test_provider_configuration_and_request_errors_are_persisted_without_fake_text(monkeypatch):
    response = client.post(
        "/api/upload",
        data=upload_form(transcription_consent="true"),
        files={"file": ("config-error.wav", io.BytesIO(wav_bytes()), "audio/wav")},
    )
    transcript_id = response.json()["id"]

    def not_configured():
        raise TranscriptionNotConfiguredError("Provider is disabled for this test.")

    monkeypatch.setattr(main, "create_transcription_provider", not_configured)
    main.process_saved_transcription(transcript_id)
    row = client.get(f"/api/transcripts/{transcript_id}").json()
    assert row["transcription_status"] == "not_configured"
    assert row["transcription_error"] == "Provider is disabled for this test."
    assert row["transcript_text"] == ""

    def failing_provider():
        class Provider:
            def transcribe(self, _audio_path):
                raise TranscriptionProviderError("Provider rejected this audio.")

        return Provider()

    monkeypatch.setattr(main, "create_transcription_provider", failing_provider)
    main.process_saved_transcription(transcript_id)
    failed_row = client.get(f"/api/transcripts/{transcript_id}").json()
    assert failed_row["transcription_status"] == "failed"
    assert failed_row["transcription_error"] == "Provider rejected this audio."
    assert failed_row["transcript_text"] == ""


def test_upload_rejects_non_audio_and_mismatched_mime():
    non_audio = client.post(
        "/api/upload",
        data=upload_form(),
        files={"file": ("notes.txt", io.BytesIO(b"not audio"), "text/plain")},
    )
    mismatch = client.post(
        "/api/upload",
        data=upload_form(),
        files={"file": ("source.wav", io.BytesIO(wav_bytes()), "audio/mpeg")},
    )
    assert non_audio.status_code == 415
    assert mismatch.status_code == 415
    assert os.listdir(main.AUDIO_STORAGE) == []


def test_upload_enforces_configured_size_limit(tmp_path, monkeypatch):
    monkeypatch.setattr(main, "MAX_AUDIO_SIZE_MB", 1)
    monkeypatch.setattr(main, "MAX_AUDIO_SIZE_BYTES", 32)
    too_large = wav_bytes(b"x" * 40)
    response = client.post(
        "/api/upload",
        data=upload_form(),
        files={"file": ("large.wav", io.BytesIO(too_large), "audio/wav")},
    )
    assert response.status_code == 413
    assert "upload limit" in response.json()["detail"]
    assert os.listdir(main.AUDIO_STORAGE) == []


@pytest.mark.parametrize(
    ("filename", "content_type", "contents", "stored_extension"),
    [
        ("audio.wav", "audio/wav", wav_bytes(), ".wav"),
        ("audio.mp3", "audio/mpeg", b"ID3\x04\x00\x00\x00\x00\x00\x00data", ".mp3"),
        ("audio.m4a", "audio/mp4", b"\x00\x00\x00\x18ftypM4A data", ".m4a"),
        ("audio.ogg", "audio/ogg", b"OggS" + b"\x00" * 16, ".ogg"),
        ("audio.webm", "audio/webm", b"\x1a\x45\xdf\xa3" + b"\x00" * 16, ".webm"),
        ("audio.flac", "audio/flac", b"fLaC" + b"\x00" * 16, ".flac"),
    ],
)
def test_upload_accepts_supported_container_signatures(
    filename, content_type, contents, stored_extension
):
    response = client.post(
        "/api/v1/audio/upload",
        data=upload_form(),
        files={"file": (filename, io.BytesIO(contents), content_type)},
    )
    assert response.status_code == 200, response.text
    row = client.get(f"/api/v1/transcriptions/{response.json()['id']}").json()
    assert row["audio_filename"].endswith(stored_extension)
    assert os.path.exists(os.path.join(main.AUDIO_STORAGE, row["audio_filename"]))


def test_archive_search_and_contract_aliases():
    response = client.post(
        "/api/v1/audio/upload",
        data=upload_form(title="Gondi archive song"),
        files={"file": ("source.wav", io.BytesIO(wav_bytes()), "audio/wav")},
    )
    assert response.status_code == 200
    assert client.get("/languages").status_code == 200
    search = client.get("/api/v1/archive/search", params={"q": "archive", "language": "Gondi"})
    assert search.status_code == 200
    assert search.json()["count"] == 1
    assert search.json()["transcripts"][0]["title"] == "Gondi archive song"


def test_cors_allows_configured_frontend_without_wildcard():
    allowed = client.options(
        "/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    rejected = client.options(
        "/health",
        headers={
            "Origin": "https://untrusted.invalid",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert allowed.headers["access-control-allow-origin"] == "http://localhost:5173"
    assert "access-control-allow-origin" not in rejected.headers


def test_schema_migration_keeps_existing_rows(tmp_path, monkeypatch):
    legacy_db = tmp_path / "legacy.db"
    with sqlite3.connect(legacy_db) as conn:
        conn.execute(
            """CREATE TABLE transcripts (
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
            )"""
        )
        conn.execute(
            """INSERT INTO transcripts (
                uuid_id, title, audio_filename, audio_url, language, dialect,
                transcript_text, status, duration_seconds, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            ("old-uuid", "Existing story", "old.wav", "/storage/audio/old.wav",
             "Gondi", None, "existing text", "Reviewed", 3.0, "old-date", "old-date"),
        )
    monkeypatch.setattr(main, "DB_PATH", str(legacy_db))
    main.init_db()
    with sqlite3.connect(legacy_db) as conn:
        row = conn.execute(
            """SELECT title, transcript_text, audio_sha256, archived_at,
                      machine_transcript_text, transcription_status,
                      transcription_consent_version
               FROM transcripts"""
        ).fetchone()
    assert row == (
        "Existing story", "existing text", None, None, "", "not_requested", None
    )
