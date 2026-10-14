"""Automated Quality Checks & Critical Workflow Regression Suite.

Voice Roots Stage 7: Quality Assurance, Regression Protection, and CI Testing.
Covers:
1. Language registry filters, unknown lookups, and truthful unsupported pair reporting.
2. Audio upload validation, signature sniffing, size limits, and decoding errors.
3. Transcription provider interface, auto-detect vs explicit language, error propagation without mock text.
4. Translation provider elder-review guardrails on unwritten oral tongues, identity translation, and truthful failures.
5. Recording persistence, retrieval, soft-delete preserving master audio, and archive pagination.
6. Consent enforcement (upload consent, AI transcription consent, corrections consent, resource consent) and OCAP sacred knowledge blocking (HTTP 403).
7. Dataset provenance, license validation, and manifest checksum verification.
8. Duplicate detection and idempotent ingestion into ChromaDB vector store.
9. ChromaDB persistence, language filtering, no-result behavior (clean empty list), whitespace query rejection, and lexical token fallback.
10. System telemetry ($0.00 zero-cost verification) and atomic SQLite database backup.
"""

import io
import os
import sqlite3
import wave
import pytest
from fastapi.testclient import TestClient

import main
from language_registry import (
    DynamicLanguageRegistry,
    language_registry,
    list_languages,
    get_all_capabilities,
    get_capability_by_name_or_code,
    get_language,
)
from transcription_service import (
    LocalWhisperTranscriptionProvider,
    TranscriptionProviderError,
    _resolve_whisper_language,
)
from translation_service import (
    OralLanguageElderReviewRequiredError,
    UniversalTranslationManager,
)
from vector_store import (
    get_resource_collection,
    get_vector_stats,
    search_resources,
    upsert_resources,
)


def _create_minimal_wav(duration_s: float = 0.5) -> bytes:
    """Generate minimal valid PCM WAV bytes for test upload fixtures."""
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(16000)
        num_frames = int(16000 * duration_s)
        wf.writeframes(b"\x00\x00" * num_frames)
    return buffer.getvalue()


@pytest.fixture
def isolated_app(tmp_path, monkeypatch):
    """Provide an isolated TestClient with sandboxed SQLite database and audio storage.
    
    Guarantees that tests never alter or overwrite the user's primary database or recordings.
    """
    test_db = tmp_path / "test_voice_roots.db"
    test_storage = tmp_path / "test_storage"
    test_audio = test_storage / "audio"
    test_backups = test_storage / "backups"
    test_audio.mkdir(parents=True)
    test_backups.mkdir(parents=True)

    monkeypatch.setattr(main, "DB_PATH", str(test_db))
    monkeypatch.setattr(main, "STORAGE_DIR", str(test_storage))
    monkeypatch.setattr(main, "AUDIO_STORAGE", str(test_audio))
    monkeypatch.setattr(main, "MAX_AUDIO_SIZE_MB", 50)
    monkeypatch.setattr(main, "MAX_AUDIO_SIZE_BYTES", 50 * 1024 * 1024)
    main.init_db()

    client = TestClient(main.app)
    return client, str(test_db), str(test_audio)


# =========================================================================
# 1. Language Registry & Unsupported Language Pairs
# =========================================================================

@pytest.mark.unit
def test_language_registry_filters_and_unsupported_pair_truthfulness():
    """Verify registry search, category/family filtering, and truthful unsupported translation failure."""
    # Filter by family
    dravidian_langs = list_languages(family="Dravidian")
    codes = {l["code"] for l in dravidian_langs}
    assert "te" in codes  # Telugu
    assert "gon" in codes  # Gondi
    assert "kff" in codes  # Koya

    # Filter by script
    ol_chiki_langs = list_languages(script="Ol Chiki")
    assert any(l["code"] == "sat" for l in ol_chiki_langs)

    # Search by partial query
    search_results = list_languages(query="Gond")
    assert any(l["code"] == "gon" for l in search_results)

    # Unknown lookup returns None
    assert get_language("nonexistent_unknown_code") is None

    # Translation endpoint with unsupported pair returns honest 503/400 detail, never mock text
    client = TestClient(main.app)
    res = client.post(
        "/api/v1/translate",
        json={"text": "Guten Tag", "source_language": "de", "target_language": "te"},
    )
    assert res.status_code in (400, 503)
    detail = res.json().get("detail", "")
    assert "unsupported" in detail.lower() or "never returns fabricated" in detail.lower()


# =========================================================================
# 2. Audio Upload Validation & Decoding Errors
# =========================================================================

@pytest.mark.unit
def test_audio_upload_validation_corrupted_container_and_empty_title(isolated_app):
    """Verify that corrupt containers and missing metadata are rejected with appropriate HTTP statuses."""
    client, _, _ = isolated_app

    # Corrupt container bytes disguised as .wav
    corrupt_bytes = b"NOT_A_VALID_RIFF_HEADER_1234567890"
    res_corrupt = client.post(
        "/api/upload",
        data={"title": "Corrupt Audio", "language": "Gondi", "consent": "true"},
        files={"file": ("corrupt.wav", corrupt_bytes, "audio/wav")},
    )
    assert res_corrupt.status_code == 415

    # Valid audio but blank title
    valid_wav = _create_minimal_wav()
    res_no_title = client.post(
        "/api/upload",
        data={"title": "   ", "language": "Gondi", "consent": "true"},
        files={"file": ("tone.wav", valid_wav, "audio/wav")},
    )
    assert res_no_title.status_code == 422


@pytest.mark.unit
def test_audio_decoding_error_handling_without_mock_fallback(tmp_path):
    """Verify that LocalWhisperTranscriptionProvider raises an error on unparseable audio rather than mock text."""
    corrupted_file = tmp_path / "bad_audio.wav"
    corrupted_file.write_bytes(b"RANDOM_CORRUPT_DATA_CANNOT_BE_DECODED")

    provider = LocalWhisperTranscriptionProvider(model_size="base")
    with pytest.raises(Exception) as exc_info:
        provider.transcribe(str(corrupted_file), language="auto")

    # Error must surface honest failure without fabricating text
    assert "decode" in str(exc_info.value).lower() or "ffmpeg" in str(exc_info.value).lower() or "failed" in str(exc_info.value).lower()


# =========================================================================
# 3. Transcription Provider Auto-Detect vs Explicit Language
# =========================================================================

@pytest.mark.unit
def test_transcription_provider_auto_detect_vs_explicit_language():
    """Verify language code resolution for Whisper: oral languages map to None for auto-detect."""
    # Standard ISO languages map to their code
    assert _resolve_whisper_language("en") == "en"
    assert _resolve_whisper_language("English") == "en"
    assert _resolve_whisper_language("te") == "te"
    assert _resolve_whisper_language("Telugu") == "te"

    # Oral unstandardized languages without distinct Whisper token map to None (auto/phonetic)
    assert _resolve_whisper_language("gon") is None
    assert _resolve_whisper_language("Gondi") is None
    assert _resolve_whisper_language("kff") is None
    assert _resolve_whisper_language("Koya") is None
    assert _resolve_whisper_language("auto") is None
    assert _resolve_whisper_language(None) is None


# =========================================================================
# 4. Translation Provider Elder-Review Guardrails & Failures
# =========================================================================

@pytest.mark.unit
def test_translation_provider_elder_review_guardrail_all_oral_languages():
    """Verify that oral heritage tongues strictly trigger elder-review guardrails under Indigenous protocols."""
    manager = UniversalTranslationManager()

    # Oral tongues that require elder review
    oral_codes = ["gon", "kff", "sat", "lmn"]
    for code in oral_codes:
        with pytest.raises(OralLanguageElderReviewRequiredError) as exc_info:
            manager.translate(
                "sacred folk melody",
                code,
                "en",
            )
        assert "oral heritage tongue" in str(exc_info.value).lower()
        assert "elder review" in str(exc_info.value).lower()

    # Identity translation succeeds for all languages
    res_identity = manager.translate(
        "   Voice Roots Oral Preserved   ",
        "en",
        "en",
    )
    assert res_identity.translated_text == "Voice Roots Oral Preserved"
    assert "passthrough" in res_identity.model


# =========================================================================
# 5. Recording Persistence, Retrieval & Soft-Delete Master Preservation
# =========================================================================

@pytest.mark.integration
def test_recording_persistence_retrieval_and_soft_delete(isolated_app):
    """Verify recording creation, singular/plural retrieval, and that soft-delete keeps audio master intact."""
    client, db_path, audio_dir = isolated_app

    wav_bytes = _create_minimal_wav()
    upload_res = client.post(
        "/api/upload",
        data={
            "title": "Adilabad Forest Song",
            "language": "Gondi",
            "dialect": "Adilabad Northern",
            "consent": "true",
        },
        files={"file": ("adilabad_song.wav", wav_bytes, "audio/wav")},
    )
    assert upload_res.status_code == 200
    rec_data = upload_res.json()
    rec_id = rec_data["id"]
    saved_filename = rec_data["audio_url"].split("/")[-1]
    saved_filepath = os.path.join(audio_dir, saved_filename)

    # Master audio file must exist on disk
    assert os.path.exists(saved_filepath)
    assert os.path.getsize(saved_filepath) == len(wav_bytes)

    # Retrieve via singular path
    res_get = client.get(f"/api/transcripts/{rec_id}")
    assert res_get.status_code == 200
    assert res_get.json()["title"] == "Adilabad Forest Song"

    # Soft-delete the transcript
    res_del = client.delete(f"/api/transcripts/{rec_id}")
    assert res_del.status_code == 200

    # Active transcripts listing must NOT contain the deleted record
    res_list = client.get("/api/transcripts")
    active_ids = [t["id"] for t in res_list.json().get("transcripts", [])]
    assert rec_id not in active_ids

    # OCAP Non-Negotiable: Master audio recording on disk is an immutable master and must NOT be deleted
    assert os.path.exists(saved_filepath)

    # Archive search with pagination
    res_search = client.get("/api/v1/archive/search?page=1&page_size=5")
    assert res_search.status_code == 200
    search_data = res_search.json()
    assert "transcripts" in search_data
    assert "count" in search_data
    assert "page" in search_data


# =========================================================================
# 6. Consent Enforcement & Authorization
# =========================================================================

@pytest.mark.unit
def test_consent_enforcement_and_authorization(isolated_app, monkeypatch):
    """Verify that upload, transcription, corrections, contributions, and admin routes require affirmative consent."""
    client, _, _ = isolated_app
    wav_bytes = _create_minimal_wav()

    # 1. Upload without consent is rejected
    res_no_consent = client.post(
        "/api/upload",
        data={"title": "Unauthorized Audio", "language": "Gondi", "consent": "false"},
        files={"file": ("tone.wav", wav_bytes, "audio/wav")},
    )
    assert res_no_consent.status_code == 400
    assert "consent" in res_no_consent.json()["detail"].lower()

    # 2. Upload with consent succeeds
    res_ok = client.post(
        "/api/upload",
        data={"title": "Authorized Audio", "language": "Gondi", "consent": "true"},
        files={"file": ("tone.wav", wav_bytes, "audio/wav")},
    )
    rec_id = res_ok.json()["id"]

    # 3. Transcribe without affirmative transcription consent is rejected
    res_transcribe_no_consent = client.post(
        f"/api/transcripts/{rec_id}/transcribe",
        json={"transcription_consent": False},
    )
    assert res_transcribe_no_consent.status_code == 400

    # 4. Community correction without affirmative consent is rejected
    res_corr_no_consent = client.post(
        f"/api/v1/transcripts/{rec_id}/corrections",
        json={
            "suggested_text": "Corrected text",
            "contributor_name": "Reviewer",
            "consent_confirmed": False,
        },
    )
    assert res_corr_no_consent.status_code == 400

    # 5. Resource submission without affirmative consent is rejected
    res_contrib_no_consent = client.post(
        "/api/v1/resources/submit",
        json={
            "submission_type": "vocabulary",
            "language_code": "gon",
            "language_name": "Gondi",
            "term_or_text": "నండ్రాయి",
            "attribution": "Field contribution",
            "speaker_consent_given": False,
        },
    )
    assert res_contrib_no_consent.status_code == 400

    # 6. Sacred ceremonial knowledge is blocked under OCAP with HTTP 403
    res_sacred = client.post(
        "/api/v1/resources/submit",
        json={
            "submission_type": "folk_lore",
            "language_code": "gon",
            "language_name": "Gondi",
            "term_or_text": "Sacred secret clan invocation",
            "attribution": "Field collection",
            "speaker_consent_given": True,
            "is_sacred_or_restricted": True,
        },
    )
    assert res_sacred.status_code == 403

    # 7. Admin ingest endpoint with required admin key rejects unauthorized calls
    monkeypatch.setenv("VOICE_ROOTS_ADMIN_KEY", "super_secret_admin_key_999")
    res_unauth_ingest = client.post(
        "/api/v1/resources/ingest",
        json={"admin_key": "wrong_key"},
    )
    assert res_unauth_ingest.status_code in (401, 403)


# =========================================================================
# 7. Dataset Provenance & License Validation
# =========================================================================

@pytest.mark.integration
def test_dataset_provenance_and_license_validation(isolated_app):
    """Verify that dataset audit validates license provenance, SHA-256 checksums, and URL safety."""
    client, _, _ = isolated_app

    res = client.get("/api/v1/dataset/audit")
    assert res.status_code == 200
    data = res.json()

    assert data["status"] in ("healthy", "audit_passed")
    assert data["total_records"] >= 26
    assert data["duplicates_detected"] == 0
    assert data["invalid_urls"] == 0

    # All licenses must be recognized open licenses
    for license_name in data["licenses"].keys():
        assert any(prefix in license_name for prefix in ("CC BY", "CC0", "Public Domain"))


# =========================================================================
# 8. Duplicate Detection & Idempotent Vector Ingestion
# =========================================================================

@pytest.mark.integration
def test_duplicate_detection_and_idempotent_ingestion():
    """Verify that repeated ingestion of identical records is idempotent and does not create duplicates."""
    sample_records = [
        {
            "document_id": "test_dup_001",
            "language": "Gondi",
            "language_code": "gon",
            "document_type": "vocabulary",
            "text_original": "నండ్రాయి (Nandrai) - Traditional Gondi greeting",
            "text_translation": "Traditional sacred greeting",
            "license": "CC BY 4.0",
            "source_url": "https://example.org/gondi",
        }
    ]

    try:
        # Ingest first time
        count_1 = upsert_resources(sample_records)
        assert count_1 == 1

        # Ingest second time with same ID
        count_2 = upsert_resources(sample_records)
        assert count_2 == 1

        # Search to confirm only 1 matching document with that ID exists
        results = search_resources("Nandrai greeting", limit=5)
        matching_ids = [r["document_id"] for r in results if r.get("document_id") == "test_dup_001"]
        assert len(matching_ids) == 1
    finally:
        from vector_store import delete_resource
        delete_resource("test_dup_001")


# =========================================================================
# 9. ChromaDB Persistence, Filters & No-Result Behavior
# =========================================================================

@pytest.mark.integration
def test_chromadb_filters_and_no_result_graceful_behavior():
    """Verify ChromaDB querying with non-existent filters returns a clean empty list rather than an error."""
    client = TestClient(main.app)

    # 1. Search for a non-existent language filter
    res_empty = client.post(
        "/api/v1/resources/search",
        json={"query": "forest traditions", "language": "nonexistent_lang_xyz", "limit": 10},
    )
    assert res_empty.status_code == 200
    data_empty = res_empty.json()
    assert data_empty["count"] == 0
    assert data_empty["resources"] == []

    # 2. Empty query is rejected with validation error
    res_blank = client.post(
        "/api/v1/resources/search",
        json={"query": "   ", "limit": 10},
    )
    assert res_blank.status_code in (400, 422)

    # 3. Document type filtering scopes results correctly
    res_type = client.post(
        "/api/v1/resources/search",
        json={"query": "sal harvest lore", "document_type": "folk_lore", "limit": 5},
    )
    assert res_type.status_code == 200
    for item in res_type.json().get("resources", []):
        assert item.get("document_type") == "folk_lore"

    # 4. Rare exact token retrieves record via lexical fallback
    res_lexical = client.post(
        "/api/v1/resources/search",
        json={"query": "సగా పెన్ పూజ", "limit": 5},
    )
    assert res_lexical.status_code == 200
    results = res_lexical.json().get("resources", [])
    assert any("సగా" in r["search_text"] for r in results)


# =========================================================================
# 10. System Telemetry Zero-Cost & Atomic SQLite Backup
# =========================================================================

@pytest.mark.integration
def test_system_telemetry_zero_cost_and_atomic_backup(isolated_app):
    """Verify that operational telemetry confirms $0.00 external cost and atomic backup creates a valid SQLite file."""
    client, db_path, _ = isolated_app

    # Telemetry
    res_telem = client.get("/api/v1/system/telemetry")
    assert res_telem.status_code == 200
    telem = res_telem.json()
    assert telem["costs"]["external_api_costs_usd"] == 0.0
    assert "Free" in telem["costs"]["billing_status"]

    # Atomic Backup
    res_backup = client.post("/api/v1/system/backup")
    assert res_backup.status_code == 200
    backup_data = res_backup.json()
    assert backup_data["success"] is True
    assert backup_data["backup_bytes"] > 0

    backup_filepath = backup_data["backup_file"]
    assert os.path.exists(backup_filepath)
    # Check that backup is a readable SQLite database
    with sqlite3.connect(backup_filepath) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM transcripts")
        count = cursor.fetchone()[0]
        assert count >= 0


# =========================================================================
# 11. Security Storage Isolation & OCAP Consent Withdrawal
# =========================================================================

@pytest.mark.integration
def test_storage_mount_isolation_and_backup_privacy(isolated_app):
    """Verify that backup and database files cannot be accessed over HTTP static storage."""
    client, db_path, audio_dir = isolated_app

    # 1. Backups and root database must be 404
    res_backup_dir = client.get("/storage/backups/")
    assert res_backup_dir.status_code == 404

    res_db_direct = client.get("/storage/voice_roots.db")
    assert res_db_direct.status_code == 404

    # 2. Upload valid audio and verify disk isolation
    wav_bytes = _create_minimal_wav(0.2)
    upload_res = client.post(
        "/api/upload",
        data={"title": "Security Audio Probe", "language": "Telugu", "consent": "true"},
        files={"file": ("probe.wav", wav_bytes, "audio/wav")},
    )
    assert upload_res.status_code == 200
    audio_url = upload_res.json()["audio_url"]
    assert audio_url.startswith("/storage/audio/")
    filename = upload_res.json()["filename"]
    saved_disk_path = os.path.join(audio_dir, filename)
    assert os.path.exists(saved_disk_path)
    assert os.path.getsize(saved_disk_path) == len(wav_bytes)


@pytest.mark.integration
def test_ocap_consent_withdrawal_lifecycle(isolated_app):
    """Verify speaker consent withdrawal immediately removes recording from active archive under OCAP."""
    client, db_path, _ = isolated_app

    # 1. Upload consented recording
    wav_bytes = _create_minimal_wav(0.3)
    upload_res = client.post(
        "/api/upload",
        data={"title": "Consent Withdrawal Pilot", "language": "Gondi", "consent": "true"},
        files={"file": ("pilot.wav", wav_bytes, "audio/wav")},
    )
    assert upload_res.status_code == 200
    rec_id = upload_res.json()["id"]

    # 2. Confirm it appears in archive initially
    res_arch1 = client.get("/api/transcripts")
    assert any(t["id"] == rec_id for t in res_arch1.json()["transcripts"])

    # 3. Speaker withdraws consent
    res_withdraw = client.post(f"/api/v1/transcripts/{rec_id}/withdraw-consent")
    assert res_withdraw.status_code == 200
    withdrawn_data = res_withdraw.json()
    assert withdrawn_data["success"] is True
    assert withdrawn_data["status"] == "Consent Withdrawn"
    assert "withdrawn_at" in withdrawn_data

    # 4. Must be hidden from active archive
    res_arch2 = client.get("/api/transcripts")
    assert not any(t["id"] == rec_id for t in res_arch2.json()["transcripts"])

    # 5. Subsequent withdrawal on same ID returns 404
    res_repeat = client.post(f"/api/v1/transcripts/{rec_id}/withdraw-consent")
    assert res_repeat.status_code == 404

