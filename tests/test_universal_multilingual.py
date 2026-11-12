"""Comprehensive unit and integration tests for Voice Roots Universal Multilingual Foundation.

Covers:
1. Dynamic Language Registry: Registration validation, filtering, duplicate handling, capability queries.
2. Provider Adapter Decoupling: BaseTranscriptionProvider interface, LocalWhisper acoustic detection adapter.
3. Provider-Grounded Capabilities: Live evaluation of speech and translation viability without hardcoded claims.
4. Truthful Translation & Indigenous Protection: Oral language elder review enforcement and honest error responses.
5. SQLite Database Persistence: Independent `translations` table storage, retrieval, update, and deletion under OCAP.
"""

import io
import os
import sqlite3
import wave
from unittest.mock import patch, MagicMock

import numpy as np
import pytest
from fastapi.testclient import TestClient

import main
from language_registry import (
    DynamicLanguageRegistry,
    get_system_capabilities,
    is_oral_or_endangered,
    language_registry,
    register_language,
)
from transcription_service import (
    BaseTranscriptionProvider,
    LocalWhisperTranscriptionProvider,
    OpenAITranscriptionProvider,
    TranscriptionNotConfiguredError,
    get_speech_provider_status,
)
from translation_service import (
    IdentityTranslationAdapter,
    OralLanguageElderReviewRequiredError,
    UnsupportedLanguagePairError,
    translation_manager,
)


@pytest.fixture
def test_client_and_db(tmp_path):
    """Fixture providing isolated TestClient and temporary SQLite database."""
    db_file = str(tmp_path / "test_multilingual.db")
    storage_dir = str(tmp_path / "storage")
    audio_storage = str(tmp_path / "storage" / "audio")
    os.makedirs(audio_storage, exist_ok=True)

    with patch.object(main, "DB_PATH", db_file), patch.object(
        main, "STORAGE_DIR", storage_dir
    ), patch.object(main, "AUDIO_STORAGE", audio_storage):
        main.init_db()
        client = TestClient(main.app)
        yield client, db_file, audio_storage


def _create_wav_bytes(duration_s=0.5, sample_rate=16000):
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        t = np.linspace(0, duration_s, int(sample_rate * duration_s), endpoint=False)
        tone = (np.sin(2 * np.pi * 440 * t) * 16384).astype(np.int16)
        wf.writeframes(tone.tobytes())
    buf.seek(0)
    return buf.read()


# ─── 1. Dynamic Language Registry Tests ───

def test_language_registry_initialization():
    """Verify registry is seeded with global diverse languages."""
    reg = DynamicLanguageRegistry()
    languages = reg.list_languages()
    assert len(languages) >= 40
    codes = {l["code"] for l in languages}
    # Verify Indigenous, Scheduled, and World languages are present
    assert "gon" in codes  # Gondi
    assert "kff" in codes  # Koya
    assert "te" in codes   # Telugu
    assert "en" in codes   # English
    assert "qu" in codes   # Quechua


def test_language_registration_success():
    """Verify dynamic registration of a new world language at runtime."""
    reg = DynamicLanguageRegistry()
    new_lang = {
        "name": "Navajo (Diné Bizaad)",
        "code": "nv",
        "native": "Diné bizaad",
        "script": "Latin",
        "family": "Na-Dene (Athabaskan)",
        "region": "Southwestern United States",
        "category": "indigenous",
    }
    registered = reg.register_language(new_lang)
    assert registered["code"] == "nv"
    assert registered["name"] == "Navajo (Diné Bizaad)"

    found = reg.get_language("nv")
    assert found is not None
    assert found["name"] == "Navajo (Diné Bizaad)"


def test_language_registration_validation_errors():
    """Verify validation rejects empty fields or malformed language codes."""
    reg = DynamicLanguageRegistry()

    # Missing name
    with pytest.raises(ValueError, match="name"):
        reg.register_language({"name": "", "code": "xyz"})

    # Missing code
    with pytest.raises(ValueError, match="code"):
        reg.register_language({"name": "Test Language", "code": ""})

    # Malformed code (special characters or spaces)
    with pytest.raises(ValueError, match="Invalid language code"):
        reg.register_language({"name": "Invalid Code Lang", "code": "invalid code!"})


def test_language_registry_filtering():
    """Verify filtering by query, category, and script."""
    reg = DynamicLanguageRegistry()
    indigenous = reg.list_languages(category="indigenous")
    assert all(l["category"] == "indigenous" for l in indigenous)
    assert any(l["code"] == "gon" for l in indigenous)

    search_dravidian = reg.list_languages(query="dravidian")
    assert len(search_dravidian) > 0


# ─── 2. Provider Adapter Decoupling Tests ───

def test_base_transcription_provider_interface():
    """Verify BaseTranscriptionProvider defines expected contract."""
    class CustomProvider(BaseTranscriptionProvider):
        name = "custom"
        def transcribe(self, audio_path: str, language: str | None = None):
            return None

    prov = CustomProvider()
    assert prov.name == "custom"
    assert prov.supports_language_detection is False
    with pytest.raises(TranscriptionNotConfiguredError):
        prov.detect_language("dummy.wav")


def test_local_whisper_detect_language_adapter():
    """Verify LocalWhisperTranscriptionProvider implements detect_language."""
    provider = LocalWhisperTranscriptionProvider(model_size="base")
    assert provider.supports_language_detection is True

    # Test with mock whisper model to test data mapping without loading heavy weights
    mock_model = MagicMock()
    mock_model.device = "cpu"
    mock_model.detect_language.return_value = (None, {"te": 0.85, "hi": 0.10, "en": 0.05})

    with patch.object(provider, "_load_model", return_value=mock_model), \
         patch("whisper.load_audio", return_value=np.zeros(16000)), \
         patch("whisper.pad_or_trim", return_value=np.zeros(16000)), \
         patch("whisper.log_mel_spectrogram", return_value=MagicMock()):
        detection = provider.detect_language("dummy.wav")
        assert detection["detected_language_code"] == "te"
        assert detection["confidence"] == 0.85
        assert "te" in detection["probabilities"]
        assert detection["provider"] == "whisper-local"


# ─── 3. Provider-Grounded Capabilities Tests ───

def test_get_system_capabilities_offline():
    """Verify capability reporting correctly reflects active local providers."""
    speech_status = {
        "configured": True,
        "provider": "whisper-local",
        "model": "whisper-base",
        "supports_language_detection": True,
        "supports_auto_detection": True,
    }
    trans_providers = [
        {"name": "identity", "configured": True},
        {"name": "openai", "configured": False},
    ]

    caps = get_system_capabilities(speech_status, trans_providers)
    assert caps["active_speech_provider"] == "whisper-local"
    assert caps["supports_auto_detection"] is True
    assert caps["supports_language_detection"] is True

    # Check that Gondi (oral) is marked experimental for speech, elder_review_required for translation
    gondi_cap = next(l for l in caps["languages"] if l["code"] == "gon")
    assert gondi_cap["speech_recognition"] == "experimental"
    assert gondi_cap["translation"] == "elder_review_required"


def test_get_system_capabilities_disabled_speech():
    """Verify capability reporting when speech engine is disabled."""
    speech_status = {
        "configured": False,
        "provider": "disabled",
        "model": None,
        "supports_auto_detection": False,
        "supports_language_detection": False,
    }
    caps = get_system_capabilities(speech_status, [])
    assert caps["speech_provider_configured"] is False
    assert caps["supports_auto_detection"] is False
    for l in caps["languages"]:
        assert l["speech_recognition"] == "unconfigured"


# ─── 4. Truthful Translation & Elder Protection Tests ───

def test_identity_translation_passthrough():
    """Verify IdentityTranslationAdapter works for identical source and target."""
    result = translation_manager.translate("Namaste", "hi", "hi")
    assert result.translated_text == "Namaste"
    assert result.provider == "identity"
    assert result.verified is True


def test_oral_language_elder_review_protection():
    """Verify translation of oral tongues strictly raises elder review error."""
    # Gondi
    with pytest.raises(OralLanguageElderReviewRequiredError):
        translation_manager.translate("Sample text", "gon", "en")

    # Koya
    with pytest.raises(OralLanguageElderReviewRequiredError):
        translation_manager.translate("Sample text", "kff", "en")


def test_unsupported_language_pair_honest_failure():
    """Verify unsupported pairs raise honest error without fabricating translations."""
    with pytest.raises(UnsupportedLanguagePairError) as exc_info:
        translation_manager.translate("Hello world", "en", "es")
    assert "Language pair" in str(exc_info.value)
    assert "unsupported" in str(exc_info.value)


# ─── 5. SQLite Translation Persistence Tests ───

def test_sqlite_translation_persistence_and_retrieval(test_client_and_db):
    """Verify translation is persisted to translations table when transcript_id is supplied."""
    client, db_file, _ = test_client_and_db

    # 1. Create a transcript in SQLite
    wav_data = _create_wav_bytes(0.3)
    resp = client.post(
        "/api/v1/audio/upload",
        data={
            "title": "Oral Tale",
            "language": "Telugu",
            "consent": "true",
            "transcription_consent": "false",
        },
        files={"audio": ("story.wav", wav_data, "audio/wav")},
    )
    assert resp.status_code == 200
    t_id = resp.json()["id"]

    # 2. Translate text with transcript_id (using identity adapter for deterministic local execution)
    trans_resp = client.post(
        "/api/v1/translate",
        json={
            "text": "నమస్కారం",
            "source_language": "te",
            "target_language": "te",
            "transcript_id": t_id,
        },
    )
    assert trans_resp.status_code == 200
    data = trans_resp.json()
    assert data["id"] is not None
    assert data["transcript_id"] == t_id
    assert data["translated_text"] == "నమస్కారం"
    assert data["provider"] == "identity"
    trans_id = data["id"]

    # 3. Retrieve translations via GET /api/v1/transcripts/{id}/translations
    list_resp = client.get(f"/api/v1/transcripts/{t_id}/translations")
    assert list_resp.status_code == 200
    list_data = list_resp.json()
    assert list_data["count"] == 1
    assert list_data["translations"][0]["id"] == trans_id
    assert list_data["translations"][0]["source_text"] == "నమస్కారం"

    # 4. Verify original transcript in transcripts table was NOT altered (remains immutable)
    orig_resp = client.get(f"/api/transcripts/{t_id}")
    assert orig_resp.status_code == 200
    assert orig_resp.json()["language"] == "Telugu"

    # 5. Retrieve single translation
    single_resp = client.get(f"/api/v1/translations/{trans_id}")
    assert single_resp.status_code == 200
    assert single_resp.json()["id"] == trans_id

    # 6. Update translation with native speaker verification
    patch_resp = client.patch(
        f"/api/v1/translations/{trans_id}",
        json={"verified": True, "limitation_note": "Verified by community elder"},
    )
    assert patch_resp.status_code == 200
    updated_resp = client.get(f"/api/v1/translations/{trans_id}")
    assert updated_resp.json()["verified"] == 1
    assert updated_resp.json()["limitation_note"] == "Verified by community elder"

    # 7. Delete translation (child annotation layer)
    del_resp = client.delete(f"/api/v1/translations/{trans_id}")
    assert del_resp.status_code == 200

    # Ensure translation row is deleted, but transcript still exists
    assert client.get(f"/api/v1/translations/{trans_id}").status_code == 404
    assert client.get(f"/api/transcripts/{t_id}").status_code == 200


def test_api_languages_capabilities_endpoint(test_client_and_db):
    """Verify /api/v1/languages/capabilities returns structured provider info."""
    client, _, _ = test_client_and_db
    resp = client.get("/api/v1/languages/capabilities")
    assert resp.status_code == 200
    data = resp.json()
    assert "active_speech_provider" in data
    assert "supports_auto_detection" in data
    assert "languages" in data
    assert len(data["languages"]) >= 40
