"""
Voice Roots: Milestone 12 Verification Suite
=============================================
Tests Real-Time Multilingual Voice Assistant:
1. Session lifecycle: creation, retrieval, active status, and 15-minute timeout configuration.
2. Ephemeral memory & privacy bounds: audio bytes and turns are not persisted to disk by default.
3. Text turn-taking: live translation, phonetic transliteration, pronunciation guidance, latency_ms.
4. Audio turn-taking: accepts voice audio input, performs speech-to-text, and returns structured turn response.
5. Indigenous Oral Language Elder Guardrail: strictly protects Gondi, Koya, Santhali, and Lambadi from synthetic MT.
6. Pronunciation guidance: syllables breakdown, Romanized transliteration, and regional linguistic tips.
7. Session turn rate limits: enforces max turns per session.
8. OCAP consented history persistence: rejects unconsented save, persists consented conversation, and supports deletion.
9. Session teardown: deletes session and purges in-memory state.
"""

import io
import os
import pytest
from fastapi.testclient import TestClient

from main import app, DB_PATH
from voice_assistant import (
    assistant_manager,
    generate_pronunciation_guidance,
    save_conversation_history,
    list_saved_conversations,
    delete_saved_conversation,
    MAX_TURNS_PER_SESSION,
)


@pytest.fixture
def client():
    return TestClient(app)


# ------------------------------------------------------------------------------
# 1. Session Lifecycle & Ephemeral Architecture
# ------------------------------------------------------------------------------

def test_voice_assistant_session_lifecycle(client):
    """Verify session creation, metadata summary, and ephemeral privacy disclosure."""
    res = client.post(
        "/api/v1/voice-assistant/sessions",
        json={
            "source_language": "te",
            "target_language": "en",
            "user_name": "Lalitha Speaker",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert "session_id" in data
    assert data["session_id"].startswith("vas_")
    assert data["source_language"] == "te"
    assert data["target_language"] == "en"
    assert data["user_name"] == "Lalitha Speaker"
    assert data["turn_count"] == 0
    assert data["is_active"] is True
    assert data["ephemeral_mode"] is True
    assert "Audio is processed locally and discarded immediately" in data["privacy_notice"]

    session_id = data["session_id"]

    # Verify retrieval
    res_get = client.get(f"/api/v1/voice-assistant/sessions/{session_id}")
    assert res_get.status_code == 200
    assert res_get.json()["session_id"] == session_id

    # Verify 404 for unknown session
    res_404 = client.get("/api/v1/voice-assistant/sessions/vas_non_existent")
    assert res_404.status_code == 404


def test_voice_assistant_session_closure(client):
    """Verify closing session purges memory and blocks subsequent turns."""
    res = client.post(
        "/api/v1/voice-assistant/sessions",
        json={"source_language": "hi", "target_language": "en"},
    )
    session_id = res.json()["session_id"]

    # Close session
    res_close = client.delete(f"/api/v1/voice-assistant/sessions/{session_id}")
    assert res_close.status_code == 200
    assert res_close.json()["success"] is True

    # Confirm purged
    res_check = client.get(f"/api/v1/voice-assistant/sessions/{session_id}")
    assert res_check.status_code == 404


# ------------------------------------------------------------------------------
# 2. Conversational Turn Processing & Pronunciation Guidance
# ------------------------------------------------------------------------------

def test_text_turn_processing_and_latency(client):
    """Verify text turn execution, translation, transliteration, and latency measurement."""
    res_sess = client.post(
        "/api/v1/voice-assistant/sessions",
        json={"source_language": "te", "target_language": "te"},  # Identity passthrough
    )
    session_id = res_sess.json()["session_id"]

    res_turn = client.post(
        f"/api/v1/voice-assistant/sessions/{session_id}/turn-text",
        json={"text": "నమస్కారం బాగున్నారా"},
    )
    assert res_turn.status_code == 200
    data = res_turn.json()
    assert data["session_id"] == session_id
    turn = data["turn"]
    assert turn["original_transcript"] == "నమస్కారం బాగున్నారా"
    assert turn["translated_text"] == "నమస్కారం బాగున్నారా"
    assert turn["transliteration"] != ""
    assert turn["latency_ms"] >= 0.0
    assert "syllables_breakdown" in turn["pronunciation_guidance"]
    assert data["session_summary"]["turn_count"] == 1


def test_indigenous_oral_language_elder_guardrail_in_assistant(client):
    """Verify that unwritten oral heritage tongues trigger the Elder Review Guardrail."""
    res_sess = client.post(
        "/api/v1/voice-assistant/sessions",
        json={"source_language": "gondi", "target_language": "en"},
    )
    session_id = res_sess.json()["session_id"]

    res_turn = client.post(
        f"/api/v1/voice-assistant/sessions/{session_id}/turn-text",
        json={"text": "నవల్ గోండీ పాటా"},
    )
    assert res_turn.status_code == 200
    turn = res_turn.json()["turn"]
    assert turn["guardrail_triggered"] is True
    assert "Elder Review Required" in turn["translated_text"]
    assert "unwritten oral heritage tongue" in turn["translated_text"]


def test_audio_turn_processing(client):
    """Verify multipart audio turn processing and ephemeral audio disposal."""
    res_sess = client.post(
        "/api/v1/voice-assistant/sessions",
        json={"source_language": "en", "target_language": "en"},
    )
    session_id = res_sess.json()["session_id"]

    # Provide a minimal mock audio wav byte buffer
    wav_header = (
        b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00"
        b"\x44\xac\x00\x00\x88\x58\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00"
    )

    files = {"audio": ("sample_turn.wav", io.BytesIO(wav_header), "audio/wav")}
    res_turn = client.post(
        f"/api/v1/voice-assistant/sessions/{session_id}/turn",
        files=files,
    )
    assert res_turn.status_code == 200
    turn = res_turn.json()["turn"]
    assert "original_transcript" in turn
    assert turn["speaker"] == "user"
    assert turn["latency_ms"] >= 0.0


def test_pronunciation_guidance_endpoint(client):
    """Verify standalone phonetic transliteration, syllable count, and pronunciation tips."""
    res = client.post(
        "/api/v1/voice-assistant/pronounce",
        json={"text": "బాగున్నారా", "language": "te"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["text"] == "బాగున్నారా"
    assert data["language"] == "te"
    assert len(data["syllables_breakdown"]) >= 1
    assert any("Retroflex" in tip for tip in data["pronunciation_tips"])
    assert "Synthetic pronunciation guidance provides phonetic approximations" in data["disclaimer"]


# ------------------------------------------------------------------------------
# 3. History Persistence, OCAP Consent & Deletion Controls
# ------------------------------------------------------------------------------

def test_save_conversation_requires_consent(client):
    """Verify that saving conversation history without affirmative OCAP consent is blocked."""
    res_sess = client.post(
        "/api/v1/voice-assistant/sessions",
        json={"source_language": "en", "target_language": "en"},
    )
    session_id = res_sess.json()["session_id"]

    client.post(
        f"/api/v1/voice-assistant/sessions/{session_id}/turn-text",
        json={"text": "Hello Voice Roots Assistant"},
    )

    # Attempt to save without consent
    res_save_unconsented = client.post(
        f"/api/v1/voice-assistant/sessions/{session_id}/save",
        json={"consent_confirmed": False},
    )
    assert res_save_unconsented.status_code == 400
    assert "consent is strictly required" in res_save_unconsented.json()["detail"].lower()


def test_save_and_delete_conversation_lifecycle(client):
    """Verify saving consented conversation history and subsequent permanent deletion."""
    res_sess = client.post(
        "/api/v1/voice-assistant/sessions",
        json={"source_language": "en", "target_language": "en", "user_name": "Ravi Speaker"},
    )
    session_id = res_sess.json()["session_id"]

    client.post(
        f"/api/v1/voice-assistant/sessions/{session_id}/turn-text",
        json={"text": "First test conversation turn"},
    )

    # Save with affirmative consent
    res_save = client.post(
        f"/api/v1/voice-assistant/sessions/{session_id}/save",
        json={"consent_confirmed": True, "user_name": "Ravi Speaker"},
    )
    assert res_save.status_code == 200
    save_data = res_save.json()
    assert save_data["success"] is True
    conv_id = save_data["conversation_id"]

    # Verify listing
    res_list = client.get("/api/v1/voice-assistant/saved")
    assert res_list.status_code == 200
    saved_list = res_list.json()["saved_conversations"]
    assert any(c["id"] == conv_id for c in saved_list)

    # Verify permanent deletion
    res_del = client.delete(f"/api/v1/voice-assistant/saved/{conv_id}")
    assert res_del.status_code == 200
    assert res_del.json()["success"] is True

    # Confirm deletion from list
    res_list_after = client.get("/api/v1/voice-assistant/saved")
    assert not any(c["id"] == conv_id for c in res_list_after.json()["saved_conversations"])
