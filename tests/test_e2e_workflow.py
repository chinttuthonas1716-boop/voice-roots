"""End-to-End Workflow Integration Test Suite for Voice Roots.

Covers the complete 5-step user lifecycle:
Step A: Upload/Record audio with affirmative consent and validation
Step B: Speech transcription and acoustic language detection
Step C: Translation with OCAP elder-review guardrails and SQLite persistence
Step D: Persistence, retrieval, and independent community corrections
Step E: Semantic vector search, metadata filtering, citations, and ChromaDB health
Step F: Administrative protection on ingest and reindexing endpoints
"""

import io
import os
import wave
import pytest
from fastapi.testclient import TestClient

import main
from language_registry import get_language
from vector_store import search_resources, get_vector_stats

client = TestClient(main.app)


def _generate_synthetic_pcm_wav(duration_seconds: float = 1.0, sample_rate: int = 16000) -> bytes:
    """Generate valid 16kHz mono PCM WAV bytes for audio upload validation."""
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        num_frames = int(duration_seconds * sample_rate)
        # 16-bit PCM silence/low-level noise
        frames = b"\x00\x00" * num_frames
        wf.writeframes(frames)
    return buf.getvalue()


def test_workflow_step_a_audio_upload_validation_and_consent():
    """Verify Step A: Audio format validation, size boundary, and mandatory consent."""
    wav_bytes = _generate_synthetic_pcm_wav(1.5)

    # 1. Missing consent must fail with HTTP 400
    res_no_consent = client.post(
        "/api/upload",
        files={"file": ("test_oral.wav", wav_bytes, "audio/wav")},
        data={"title": "Oral Ballad", "language": "Telugu", "consent": "false"},
    )
    assert res_no_consent.status_code == 400
    assert "Consent is required" in res_no_consent.json()["detail"]

    # 2. Unsupported file type must fail with HTTP 415
    res_bad_format = client.post(
        "/api/upload",
        files={"file": ("test.txt", b"plain text is not audio", "text/plain")},
        data={"title": "Text File", "language": "Telugu", "consent": "true"},
    )
    assert res_bad_format.status_code == 415

    # 3. Valid upload with consent succeeds and registers in SQLite
    res_valid = client.post(
        "/api/upload",
        files={"file": ("test_oral.wav", wav_bytes, "audio/wav")},
        data={
            "title": "Koya Ethnobotanical Chant",
            "language": "Koya",
            "dialect": "Bhadrachalam",
            "consent": "true",
            "transcription_consent": "false",
        },
    )
    assert res_valid.status_code == 200
    data = res_valid.json()
    assert data["id"] > 0
    assert data["title"] == "Koya Ethnobotanical Chant"
    assert data["language"] == "Koya"
    assert data["transcription_status"] == "not_requested"
    assert data["audio_sha256"] is not None
    assert len(data["audio_sha256"]) == 64


def test_workflow_step_b_transcription_and_language_detection():
    """Verify Step B: Transcription trigger, acoustic language detection, and status management."""
    wav_bytes = _generate_synthetic_pcm_wav(2.0)
    upload_res = client.post(
        "/api/upload",
        files={"file": ("speech_rec.wav", wav_bytes, "audio/wav")},
        data={
            "title": "Language Detection Test",
            "language": "auto",
            "consent": "true",
            "transcription_consent": "true",
        },
    )
    assert upload_res.status_code == 200
    rec_id = upload_res.json()["id"]

    # Verify acoustic language detection endpoint
    detect_res = client.post(
        "/api/v1/detect-language",
        json={"transcript_id": rec_id},
    )
    # If whisper-local is configured, it returns 200 with probabilities; if unconfigured, 503
    assert detect_res.status_code in {200, 503}
    if detect_res.status_code == 200:
        det = detect_res.json()
        assert "detected_language_code" in det
        assert "confidence" in det
        assert "probabilities" in det

    # Verify transcription trigger endpoint
    transcribe_res = client.post(
        f"/api/transcripts/{rec_id}/transcribe",
        json={"transcription_consent": True},
    )
    assert transcribe_res.status_code == 200
    assert transcribe_res.json()["transcription_status"] in {"queued", "processing", "completed"}


def test_workflow_step_c_translation_with_elder_review_guardrails():
    """Verify Step C: Translation routing, oral language protection, and SQLite persistence."""
    # 1. Oral language (Gondi) without elder review must return HTTP 503 with restriction notice
    gondi_res = client.post(
        "/api/v1/translate",
        json={
            "text": "సగా పెన్ పూజ",
            "source_language": "gon",
            "target_language": "en",
        },
    )
    assert gondi_res.status_code == 503
    assert "elder" in gondi_res.json()["detail"].lower()

    # 2. Supported pair / Identity passthrough translates and stores in translations table
    # Create parent transcript row first
    wav_bytes = _generate_synthetic_pcm_wav(1.0)
    upload_res = client.post(
        "/api/upload",
        files={"file": ("translation_master.wav", wav_bytes, "audio/wav")},
        data={"title": "Master for Translation", "language": "English", "consent": "true"},
    )
    t_id = upload_res.json()["id"]

    trans_res = client.post(
        "/api/v1/translate",
        json={
            "transcript_id": t_id,
            "text": "Sacred forest grove songs.",
            "source_language": "en",
            "target_language": "en",
        },
    )
    assert trans_res.status_code == 200
    trans_data = trans_res.json()
    assert trans_data["transcript_id"] == t_id
    assert trans_data["translated_text"] == "Sacred forest grove songs."
    assert trans_data["provider"] == "identity"
    assert trans_data["id"] is not None

    # Retrieve translations for this transcript
    list_res = client.get(f"/api/v1/transcripts/{t_id}/translations")
    assert list_res.status_code == 200
    assert list_res.json()["count"] >= 1


def test_workflow_step_d_persistence_and_community_corrections():
    """Verify Step D: SQLite persistence survives reload and community edits do not overwrite master."""
    wav_bytes = _generate_synthetic_pcm_wav(1.0)
    upload_res = client.post(
        "/api/upload",
        files={"file": ("persistence_check.wav", wav_bytes, "audio/wav")},
        data={"title": "Persistence Lore", "language": "Telugu", "consent": "true"},
    )
    rec_id = upload_res.json()["id"]

    # Retrieve from SQLite
    get_res = client.get(f"/api/transcripts/{rec_id}")
    assert get_res.status_code == 200
    original_row = get_res.json()
    assert original_row["title"] == "Persistence Lore"

    # Community edit
    edit_res = client.put(
        f"/api/transcripts/{rec_id}",
        json={"transcript_text": "Community verified elder commentary on harvest lore."},
    )
    assert edit_res.status_code == 200
    assert edit_res.json()["success"] is True

    # Re-fetch from SQLite to confirm persistence
    reloaded_res = client.get(f"/api/transcripts/{rec_id}")
    assert reloaded_res.status_code == 200
    updated = reloaded_res.json()
    assert updated["status"] == "Community Edited"
    assert updated["transcript_text"] == "Community verified elder commentary on harvest lore."
    # Machine transcript remains unchanged
    assert updated["machine_transcript_text"] == original_row["machine_transcript_text"]


def test_workflow_step_e_semantic_vector_search_and_provenance():
    """Verify Step E: ChromaDB vector search with citations, license, and filtering."""
    # Health check
    health_res = client.get("/api/v1/resources/health")
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "healthy"
    assert health_res.json()["indexed_records"] >= 18

    # Search query
    search_res = client.post(
        "/api/v1/resources/search",
        json={"query": "sacred mahua tree harvest", "limit": 5},
    )
    assert search_res.status_code == 200
    data = search_res.json()
    assert data["count"] > 0
    first = data["resources"][0]
    assert "document_id" in first
    assert "source_title" in first
    assert "license" in first
    assert "attribution" in first
    assert "similarity_score" in first


def test_workflow_step_f_admin_endpoint_security():
    """Verify Step F: Admin ingest/reindex endpoints enforce authentication when configured."""
    os.environ["VOICE_ROOTS_ADMIN_KEY"] = "secret-roots-key-2026"
    try:
        # Request without key must fail with HTTP 403
        unauthorized = client.post("/api/v1/resources/reindex", json={})
        assert unauthorized.status_code == 403

        # Request with wrong key must fail with HTTP 403
        bad_key = client.post("/api/v1/resources/reindex", json={"admin_key": "wrong-key"})
        assert bad_key.status_code == 403

        # Request with valid header succeeds
        authorized_hdr = client.post(
            "/api/v1/resources/reindex",
            headers={"X-Admin-Key": "secret-roots-key-2026"},
        )
        assert authorized_hdr.status_code == 200
        assert authorized_hdr.json()["success"] is True

        # Request with valid body succeeds
        authorized_body = client.post(
            "/api/v1/resources/reindex",
            json={"admin_key": "secret-roots-key-2026"},
        )
        assert authorized_body.status_code == 200
        assert authorized_body.json()["success"] is True
    finally:
        os.environ.pop("VOICE_ROOTS_ADMIN_KEY", None)
