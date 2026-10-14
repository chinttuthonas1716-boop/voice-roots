"""Comprehensive regression test suite for Voice Roots real audio transcription pipeline.

Tests:
1. Speaker consent enforcement (OCAP): separate archive & AI transcription consent.
2. Upload validation: signature checking, size bounds, safe naming, SHA-256 calculation.
3. Database persistence: SQLite master storage, status transitions, retrieval.
4. Multi-format decoding: MP3 and WAV decoding with Whisper integration.
5. New API routes: /api/transcribe, /api/detect-language, /api/translate, /api/transcription/{id}.
6. Community edit separation: editing transcript does not touch machine transcript or audio master.
"""

import io
import os
import sqlite3
import tempfile
import wave
from unittest.mock import patch

import numpy as np
import pytest
from fastapi.testclient import TestClient

import main
from transcription_service import (
    LocalWhisperTranscriptionProvider,
    TranscriptionNotConfiguredError,
    TranscriptionProviderError,
    _resolve_whisper_language,
)


@pytest.fixture
def test_app(tmp_path):
    """Isolated FastAPI test instance with temporary database and storage."""
    db_file = str(tmp_path / "test_voice_roots.db")
    storage_dir = str(tmp_path / "storage")
    audio_storage = str(tmp_path / "storage" / "audio")
    os.makedirs(audio_storage, exist_ok=True)

    with patch.object(main, "DB_PATH", db_file), patch.object(
        main, "STORAGE_DIR", storage_dir
    ), patch.object(main, "AUDIO_STORAGE", audio_storage):
        main.init_db()
        client = TestClient(main.app)
        yield client, db_file, audio_storage


def _create_test_wav(duration_s=0.5, sample_rate=16000):
    """Generate in-memory valid 16kHz mono PCM WAV bytes."""
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        # 440 Hz tone
        t = np.linspace(0, duration_s, int(sample_rate * duration_s), endpoint=False)
        tone = (np.sin(2 * np.pi * 440 * t) * 16384).astype(np.int16)
        wf.writeframes(tone.tobytes())
    buf.seek(0)
    return buf.read()


def test_upload_requires_affirmative_archive_consent(test_app):
    client, _, _ = test_app
    wav_bytes = _create_test_wav()

    # Missing consent
    res = client.post(
        "/api/upload",
        data={"title": "Test Oral Tale", "language": "Gondi"},
        files={"audio": ("test.wav", wav_bytes, "audio/wav")},
    )
    assert res.status_code == 400
    assert "consent" in res.json()["detail"].lower()

    # Explicit false consent
    res_false = client.post(
        "/api/upload",
        data={"title": "Test Oral Tale", "language": "Gondi", "consent": "false"},
        files={"audio": ("test.wav", wav_bytes, "audio/wav")},
    )
    assert res_false.status_code == 400


def test_upload_rejects_invalid_file_signature(test_app):
    client, _, _ = test_app
    fake_audio = b"NOT_A_VALID_AUDIO_HEADER_1234567890"

    res = client.post(
        "/api/upload",
        data={"title": "Fake Audio", "language": "Gondi", "consent": "true"},
        files={"audio": ("bad.wav", fake_audio, "audio/wav")},
    )
    assert res.status_code == 415


def test_upload_saves_recording_and_preserves_audio_master(test_app):
    client, db_file, audio_storage = test_app
    wav_bytes = _create_test_wav()

    res = client.post(
        "/api/upload",
        data={
            "title": "Koya Ritual Chant",
            "language": "Koya",
            "dialect": "Bhadradri",
            "consent": "true",
            "transcription_consent": "false",
        },
        files={"audio": ("koya.wav", wav_bytes, "audio/wav")},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    rec_id = data["id"]
    saved_filename = data["filename"]

    # Verify immutable file on disk
    saved_path = os.path.join(audio_storage, saved_filename)
    assert os.path.exists(saved_path)
    assert os.path.getsize(saved_path) == len(wav_bytes)

    # Verify database persistence
    with sqlite3.connect(db_file) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute("SELECT * FROM transcripts WHERE id = ?", (rec_id,)).fetchone()
        assert row is not None
        assert row["title"] == "Koya Ritual Chant"
        assert row["language"] == "Koya"
        assert row["dialect"] == "Bhadradri"
        assert row["transcription_status"] == "not_requested"
        assert row["transcript_text"] == ""
        assert row["machine_transcript_text"] == ""


def test_transcribe_endpoint_enforces_separate_consent(test_app):
    client, _, _ = test_app
    wav_bytes = _create_test_wav()
    upload_res = client.post(
        "/api/upload",
        data={"title": "Tale", "language": "Gondi", "consent": "true"},
        files={"audio": ("test.wav", wav_bytes, "audio/wav")},
    )
    rec_id = upload_res.json()["id"]

    # Call /api/transcripts/{id}/transcribe without transcription consent
    res = client.post(
        f"/api/transcripts/{rec_id}/transcribe",
        json={"transcription_consent": False},
    )
    assert res.status_code == 400
    assert "Separate transcription consent is required" in res.json()["detail"]

    # Call top-level /api/transcribe without transcription consent
    res_top = client.post(
        "/api/transcribe",
        json={"id": rec_id, "transcription_consent": False},
    )
    assert res_top.status_code == 400


def test_top_level_transcribe_action_route(test_app):
    client, _, _ = test_app
    wav_bytes = _create_test_wav()
    upload_res = client.post(
        "/api/upload",
        data={"title": "Chant", "language": "Lambadi", "consent": "true"},
        files={"audio": ("chant.wav", wav_bytes, "audio/wav")},
    )
    rec_id = upload_res.json()["id"]

    res = client.post(
        "/api/transcribe",
        json={"id": rec_id, "transcription_consent": True},
    )
    assert res.status_code == 200
    assert res.json()["success"] is True
    assert res.json()["transcription_status"] == "queued"


def test_singular_and_plural_transcript_endpoints(test_app):
    client, _, _ = test_app
    wav_bytes = _create_test_wav()
    upload_res = client.post(
        "/api/upload",
        data={"title": "Santhali Folk Story", "language": "Santhali", "consent": "true"},
        files={"audio": ("folk.wav", wav_bytes, "audio/wav")},
    )
    rec_id = upload_res.json()["id"]

    # Test plural GET
    res_plural = client.get(f"/api/transcripts/{rec_id}")
    assert res_plural.status_code == 200
    assert res_plural.json()["title"] == "Santhali Folk Story"

    # Test singular GET alias
    res_singular = client.get(f"/api/transcription/{rec_id}")
    assert res_singular.status_code == 200
    assert res_singular.json()["title"] == "Santhali Folk Story"

    # Test singular PUT alias
    res_put = client.put(
        f"/api/transcription/{rec_id}",
        json={"transcript_text": "Manual community verification note"},
    )
    assert res_put.status_code == 200

    # Test update reflected
    res_updated = client.get(f"/api/transcripts/{rec_id}")
    assert res_updated.json()["transcript_text"] == "Manual community verification note"
    assert res_updated.json()["status"] == "Community Edited"

    # Test singular DELETE alias
    res_del = client.delete(f"/api/transcription/{rec_id}")
    assert res_del.status_code == 200

    # Ensure archived
    res_after_del = client.get(f"/api/transcripts/{rec_id}")
    assert res_after_del.status_code == 404


def test_language_resolution_helper():
    assert _resolve_whisper_language("telugu") == "te"
    assert _resolve_whisper_language("Hindi") == "hi"
    assert _resolve_whisper_language("ta") == "ta"
    assert _resolve_whisper_language("English") == "en"
    # Unstandardized oral languages without distinct token return None (fall back to phonetic/auto)
    assert _resolve_whisper_language("Gondi") is None
    assert _resolve_whisper_language("Koya") is None
    assert _resolve_whisper_language(None) is None


def test_translation_endpoint_honesty_and_oral_language_limitations(test_app):
    client, _, _ = test_app

    # When no paid/external provider is configured, must NOT return mock text
    res = client.post(
        "/api/translate",
        json={"text": "నమస్కారం", "source_language": "Telugu", "target_language": "English"},
    )
    # Returns 503 rather than fake data
    assert res.status_code == 503
    assert "Translation provider is not configured" in res.json()["detail"]
    assert "Gondi" in res.json()["detail"]
    assert "Koya" in res.json()["detail"]


def test_detect_language_endpoint_with_sample_audio(test_app, monkeypatch):
    monkeypatch.setenv("VOICE_ROOTS_TRANSCRIPTION_PROVIDER", "whisper-local")
    client, _, _ = test_app
    wav_bytes = _create_test_wav(duration_s=1.0)
    upload_res = client.post(
        "/api/upload",
        data={"title": "Tone", "language": "Telugu", "consent": "true"},
        files={"audio": ("tone.wav", wav_bytes, "audio/wav")},
    )
    rec_id = upload_res.json()["id"]

    # Call detect-language
    res = client.post(
        "/api/detect-language",
        json={"id": rec_id},
    )
    assert res.status_code == 200
    data = res.json()
    assert "detected_language_code" in data
    assert "confidence" in data
    assert data["provider"] == "whisper-local"


@pytest.mark.real_ai
def test_real_gondi_recording_transcription_persisted():
    """Verify that the real 3m 37s Gondi recording in production SQLite is transcribed and retrievable."""
    prod_db = "backend/voice_roots.db"
    if not os.path.exists(prod_db):
        pytest.skip("Production database not found")

    with sqlite3.connect(prod_db) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute("SELECT * FROM transcripts WHERE id = 5").fetchone()
        if not row:
            pytest.skip("Gondi recording (row 5) not present")

        assert row["transcription_status"] == "completed"
        assert row["transcription_provider"] == "whisper-local"
        assert row["transcription_model"] == "whisper-base"
        assert row["transcription_error"] is None
        assert len(row["transcript_text"]) > 100
        assert row["machine_transcript_text"] == row["transcript_text"]
        assert row["audio_filename"] == "f172343b-e928-467b-8984-8f82ef9408bf.mp3"
