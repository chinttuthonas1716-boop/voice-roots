"""Tests for Task T2.1: Honest Translation Policy & IndicTrans2 Review Badges.

Validates:
1. IndicTrans2 adapter coverage for 22 scheduled Indic languages (+ English).
2. Unreviewed machine translations marked review_status='unreviewed_draft', badge_label='Draft (Unreviewed)'.
3. Unwritten oral heritage languages (Gondi, Koya, Lambadi) route to community phrasebooks:
   - Known phrasebook entries return HTTP 200 with review_status='elder_approved', badge_label='Elder Approved'.
   - Unregistered oral phrases return HTTP 422 Unprocessable Entity stating elder review is required.
4. Response shape conforms to MASTER_SPECIFICATION and frontend expectations.
"""

from fastapi.testclient import TestClient

from backend import main
from backend.translation_service import (
    INDICTRANS2_COVERED_LANGUAGES,
    IndicTrans2TranslationAdapter,
    UniversalTranslationManager,
)

client = TestClient(main.app)


def test_indictrans2_covered_languages_contains_22_scheduled():
    """Verify IndicTrans2 adapter covers all 22 Eighth Schedule languages + English."""
    scheduled_22 = [
        "assamese", "bengali", "bodo", "dogri", "gujarati", "hindi",
        "kannada", "kashmiri", "konkani", "maithili", "malayalam", "manipuri",
        "marathi", "nepali", "odia", "punjabi", "sanskrit", "santali",
        "sindhi", "tamil", "telugu", "urdu",
    ]
    for lang in scheduled_22:
        assert lang in INDICTRANS2_COVERED_LANGUAGES, f"Expected {lang} in IndicTrans2 coverage"

    adapter = IndicTrans2TranslationAdapter()
    assert adapter.is_pair_supported("te", "en")
    assert adapter.is_pair_supported("hi", "en")
    assert adapter.is_pair_supported("ta", "te")


def test_scheduled_language_translation_returns_unreviewed_draft_badge():
    """Scheduled language machine translations must be honestly flagged as unreviewed draft."""
    resp = client.post(
        "/api/v1/translate",
        json={
            "text": "భారతీయ సాంస్కృతిక వారసత్వం",
            "source_language": "telugu",
            "target_language": "english",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["review_status"] == "unreviewed_draft"
    assert data["badge_label"] == "Draft (Unreviewed)"
    assert data["is_elder_approved"] is False
    assert "draft" in data["limitation_note"].lower() or "elder" in data["limitation_note"].lower()


def test_gondi_phrasebook_translation_returns_elder_approved():
    """Community phrasebook matches for Gondi return HTTP 200 with elder approved badge."""
    resp = client.post(
        "/api/v1/translate",
        json={
            "text": "సేవా జోహార్",
            "source_language": "gon",
            "target_language": "en",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["review_status"] == "elder_approved"
    assert data["badge_label"] == "Elder Approved"
    assert data["is_elder_approved"] is True
    assert "Sacred greetings" in data["translated_text"]


def test_koya_phrasebook_translation_returns_elder_approved():
    """Community phrasebook matches for Koya return HTTP 200 with elder approved badge."""
    resp = client.post(
        "/api/v1/translate",
        json={
            "text": "వనమూలిక",
            "source_language": "koy",
            "target_language": "en",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["review_status"] == "elder_approved"
    assert data["badge_label"] == "Elder Approved"
    assert data["is_elder_approved"] is True
    assert "Ethnobotanical" in data["translated_text"]


def test_lambadi_phrasebook_translation_returns_elder_approved():
    """Community phrasebook matches for Lambadi return HTTP 200 with elder approved badge."""
    resp = client.post(
        "/api/v1/translate",
        json={
            "text": "రామ్ రామ్",
            "source_language": "lam",
            "target_language": "en",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["review_status"] == "elder_approved"
    assert data["badge_label"] == "Elder Approved"
    assert data["is_elder_approved"] is True
    assert "Banjara" in data["translated_text"]


def test_unreviewed_oral_language_returns_http_422_restriction():
    """Unregistered oral phrases must raise HTTP 422 with elder review requirement."""
    resp = client.post(
        "/api/v1/translate",
        json={
            "text": "Unregistered oral utterance for testing guardrails",
            "source_language": "gon",
            "target_language": "en",
        },
    )
    assert resp.status_code == 422
    data = resp.json()
    assert "elder" in data["detail"].lower() or "restricted" in data["detail"].lower()


def test_translation_manager_oral_protection_routing():
    """UniversalTranslationManager direct unit tests for phrasebook vs oral protection."""
    mgr = UniversalTranslationManager()

    # Supported oral phrase in dictionary
    res_phrase = mgr.translate("sewa johar", "gon", "en")
    assert res_phrase.review_status == "elder_approved"
    assert res_phrase.verified is True

    # Check pair status reports phrasebook supported
    status = mgr.check_pair_support("gon", "en")
    assert status["supported"] is True
    assert status["pair_status"] == "phrasebook_supported"
