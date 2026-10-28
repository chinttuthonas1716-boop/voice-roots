"""
Voice Roots: Tests for Evaluation, Community Corrections, and Dataset Quality
==============================================================================
Verifies:
1. WER, CER, chrF, Levenshtein distance metrics.
2. Live multi-modal evaluation benchmark reports.
3. Community corrections submission, version audit trails, and elder review approval.
4. Contributor resource submission, sacred knowledge guardrails, and moderation indexing.
5. Dataset quality audit (duplicates, licenses, URLs).
6. Safe atomic SQLite database backups.
7. System telemetry and zero-cost billing status.
"""

import os
import json
import pytest
from fastapi.testclient import TestClient
from main import app
from evaluation import (
    compute_wer,
    compute_cer,
    compute_chrf,
    levenshtein_distance,
    get_evaluation_runner,
)

client = TestClient(app)


def test_levenshtein_distance_and_metrics():
    """Verify core evaluation metrics formulas."""
    assert levenshtein_distance([], []) == 0
    assert levenshtein_distance(["a", "b"], ["a", "b"]) == 0
    assert levenshtein_distance(["a"], ["b"]) == 1
    assert levenshtein_distance(["a", "b"], ["a"]) == 1

    # WER
    ref = "voice roots preserves oral languages"
    hyp_exact = "voice roots preserves oral languages"
    assert compute_wer(ref, hyp_exact) == 0.0

    hyp_one_diff = "voice roots preserves oral songs"
    assert compute_wer(ref, hyp_one_diff) == 0.2

    # CER for Indian / Dravidian Scripts
    gondi_ref = "నండ్రాయి గోండ్వానా"
    gondi_hyp = "నండ్రాయి గోండ్వానా"
    assert compute_cer(gondi_ref, gondi_hyp) == 0.0

    # chrF
    assert compute_chrf("hello world", "hello world") == 1.0
    assert compute_chrf("hello world", "goodbye world") < 1.0


def test_evaluation_runner_live_report():
    """Verify the language evaluation runner executes and outputs grounded metrics."""
    runner = get_evaluation_runner()
    report = runner.run_full_evaluation()

    assert "speech_recognition" in report
    assert "translation_and_guardrails" in report
    assert "semantic_vector_search" in report
    assert "unsupported_language_pairs" in report
    assert "methodology_disclaimer" in report

    # Guardrails must have 100% compliance on oral languages
    guardrails = report["translation_and_guardrails"]
    assert guardrails["guardrail_compliance_percent"] == 100.0

    # Search MRR must be positive
    search_metrics = report["semantic_vector_search"]
    assert search_metrics["total_queries"] > 0
    assert search_metrics["mrr"] > 0.0


def test_evaluation_api_endpoints():
    """Verify GET and POST evaluation endpoints."""
    res_latest = client.get("/api/v1/evaluation/latest")
    assert res_latest.status_code == 200
    data_latest = res_latest.json()
    assert "translation_and_guardrails" in data_latest

    res_run = client.post("/api/v1/evaluation/run")
    assert res_run.status_code == 200
    data_run = res_run.json()
    assert data_run["translation_and_guardrails"]["guardrail_compliance_percent"] == 100.0


def test_community_corrections_lifecycle():
    """Verify proposing, listing, and elder-approving transcript corrections."""
    # 1. Fetch an existing transcript or create one
    res_transcripts = client.get("/api/transcripts")
    data = res_transcripts.json()
    transcripts = data.get("transcripts", [])
    assert len(transcripts) > 0
    t = transcripts[0]
    t_id = t["id"]
    original_text = t["transcript_text"]

    # 2. Reject correction without consent
    res_no_consent = client.post(
        f"/api/v1/transcripts/{t_id}/corrections",
        json={
            "suggested_text": "Corrected phonetic text",
            "consent_confirmed": False,
        },
    )
    assert res_no_consent.status_code == 400
    assert "consent" in res_no_consent.json()["detail"].lower()

    # 3. Reject empty suggested text
    res_empty = client.post(
        f"/api/v1/transcripts/{t_id}/corrections",
        json={"suggested_text": "   ", "consent_confirmed": True},
    )
    assert res_empty.status_code == 400

    # 4. Propose valid correction
    corr_payload = {
        "suggested_text": f"Community corrected version: {original_text}",
        "contributor_name": "Lachhu Madavi",
        "contributor_role": "elder",
        "rationale": "Phonetic alignment with Adilabad oral dialect.",
        "consent_confirmed": True,
    }
    res_prop = client.post(f"/api/v1/transcripts/{t_id}/corrections", json=corr_payload)
    assert res_prop.status_code == 200
    corr = res_prop.json()
    corr_id = corr["id"]
    assert corr["status"] == "pending_review"
    assert corr["version_number"] >= 1
    assert corr["previous_text"] == original_text

    # 5. List corrections history
    res_hist = client.get(f"/api/v1/transcripts/{t_id}/corrections")
    assert res_hist.status_code == 200
    hist = res_hist.json()
    assert any(c["id"] == corr_id for c in hist["corrections"])

    # 6. Elder approves correction
    res_review = client.patch(
        f"/api/v1/corrections/{corr_id}/review",
        json={
            "status": "approved",
            "reviewed_by": "Council Elder Kumram",
            "review_notes": "Verified authentic pronunciation.",
        },
    )
    assert res_review.status_code == 200
    reviewed_corr = res_review.json()
    assert reviewed_corr["status"] == "approved"
    assert reviewed_corr["reviewed_by"] == "Council Elder Kumram"

    # 7. Check that active transcript text was updated
    res_updated_t = client.get(f"/api/transcripts/{t_id}")
    assert res_updated_t.status_code == 200
    assert res_updated_t.json()["transcript_text"] == corr_payload["suggested_text"]
    assert res_updated_t.json()["status"] == "Community Verified"


def test_resource_contributions_and_sacred_guardrails():
    """Verify resource submission workflow and sacred cultural protection."""
    # 1. Sacred/Restricted knowledge must be blocked
    res_sacred = client.post(
        "/api/v1/resources/submit",
        json={
            "submission_type": "folk_lore",
            "language_code": "gon",
            "language_name": "Gondi",
            "term_or_text": "Secret clan ceremonial chant",
            "attribution": "Clan elder",
            "speaker_consent_given": True,
            "is_sacred_or_restricted": True,
        },
    )
    assert res_sacred.status_code == 403
    assert "restricted or sacred" in res_sacred.json()["detail"].lower()

    # 2. Contributor without consent must be blocked
    res_no_consent = client.post(
        "/api/v1/resources/submit",
        json={
            "submission_type": "vocabulary",
            "language_code": "kff",
            "language_name": "Koya",
            "term_or_text": "Pedda (Elder)",
            "attribution": "Field notes",
            "speaker_consent_given": False,
            "is_sacred_or_restricted": False,
        },
    )
    assert res_no_consent.status_code == 400

    # 3. Valid community term submission
    valid_payload = {
        "submission_type": "vocabulary",
        "language_code": "gon",
        "language_name": "Gondi",
        "dialect": "Adilabad",
        "term_or_text": "నండ్రాయి (Nandrai)",
        "translation_text": "Greeting / Welcome / Elder respect",
        "cultural_context": "Traditional oral salutation in Central Gondwana",
        "contributor_name": "Deva Rao",
        "license": "CC BY 4.0",
        "attribution": "Adilabad Oral Documentation Group",
        "speaker_consent_given": True,
        "is_sacred_or_restricted": False,
    }
    res_submit = client.post("/api/v1/resources/submit", json=valid_payload)
    assert res_submit.status_code == 200
    sub_data = res_submit.json()
    sub_id = sub_data["id"]
    assert sub_data["status"] == "pending_verification"

    # 4. List pending submissions
    res_list = client.get("/api/v1/resources/submissions?status=pending_verification")
    assert res_list.status_code == 200
    subs = res_list.json()["submissions"]
    assert any(s["id"] == sub_id for s in subs)

    # 5. Moderator approves and verifies into ChromaDB
    try:
        res_mod = client.patch(
            f"/api/v1/resources/submissions/{sub_id}/moderate",
            json={"status": "verified", "reviewer_notes": "Verified against linguistic lexicon"},
        )
        assert res_mod.status_code == 200
        assert res_mod.json()["status"] == "verified"
    finally:
        from vector_store import delete_resource
        delete_resource(f"sub_{sub_id}_gon")


def test_dataset_quality_audit():
    """Verify dataset quality audit endpoint checks for duplicates and licenses."""
    res_audit = client.get("/api/v1/dataset/audit")
    assert res_audit.status_code == 200
    audit = res_audit.json()
    assert "total_records" in audit
    assert "unique_records" in audit
    assert "licenses" in audit
    assert "languages_indexed" in audit
    assert audit["total_records"] >= 20
    assert audit["quality_score_percent"] >= 90.0


def test_system_backup_and_telemetry():
    """Verify atomic database backups and operational telemetry."""
    # Telemetry
    res_telem = client.get("/api/v1/system/telemetry")
    assert res_telem.status_code == 200
    telem = res_telem.json()
    assert telem["database"]["engine"] == "sqlite"
    assert telem["costs"]["external_api_costs_usd"] == 0.00
    assert "Free" in telem["costs"]["billing_status"]

    # Backup
    res_backup = client.post("/api/v1/system/backup")
    assert res_backup.status_code == 200
    backup_data = res_backup.json()
    assert backup_data["success"] is True
    assert backup_data["size_bytes"] > 0
    assert "voice_roots_backup_" in backup_data["backup_filename"]


def test_native_speaker_review_uncertainty_and_immutable_separation():
    """Verify Stage 13 native-speaker review: uncertainty tracking, history preservation, and machine baseline separation."""
    # 1. Fetch an existing transcript
    res = client.get("/api/transcripts")
    assert res.status_code == 200
    transcripts = res.json().get("transcripts", [])
    assert len(transcripts) > 0
    t = transcripts[0]
    t_id = t["id"]
    machine_baseline = t.get("machine_transcript_text", "")

    # 2. Propose correction with original script & dialect
    res_prop = client.post(
        f"/api/v1/transcripts/{t_id}/corrections",
        json={
            "suggested_text": "నండ్రాయి గోండ్వానా పున్నెం (Adilabad Northern Dialect)",
            "contributor_name": "Tribal Elder Reviewer",
            "contributor_role": "elder",
            "rationale": "Authentic Masaram Gondi oral pronunciation.",
            "consent_confirmed": True,
        },
    )
    assert res_prop.status_code == 200
    corr_id = res_prop.json()["id"]

    # 3. Reviewer approves with uncertainty noted
    res_rev = client.patch(
        f"/api/v1/corrections/{corr_id}/review",
        json={
            "status": "approved",
            "reviewed_by": "Council Elder Pendur",
            "review_notes": "Accepted with regional phonetic caveat.",
            "reviewer_uncertainty": "uncertain_dialect_variation",
        },
    )
    assert res_rev.status_code == 200
    rev_data = res_rev.json()
    assert rev_data["status"] == "approved"
    assert rev_data["reviewer_uncertainty"] == "uncertain_dialect_variation"

    # 4. Verify transcript status reflects dialect caveat while machine transcript baseline is untouched
    res_t = client.get(f"/api/transcripts/{t_id}")
    assert res_t.status_code == 200
    t_data = res_t.json()
    assert "Dialect Caveat" in t_data["status"]
    assert t_data["machine_transcript_text"] == machine_baseline

    # 5. Propose a second correction and reject it to verify rejection leaves text untouched
    res_prop2 = client.post(
        f"/api/v1/transcripts/{t_id}/corrections",
        json={
            "suggested_text": "Non-authentic text to be rejected",
            "contributor_name": "Anonymous",
            "consent_confirmed": True,
        },
    )
    assert res_prop2.status_code == 200
    corr2_id = res_prop2.json()["id"]

    res_rej = client.patch(
        f"/api/v1/corrections/{corr2_id}/review",
        json={
            "status": "rejected",
            "reviewed_by": "Council Elder Pendur",
            "review_notes": "Inaccurate dialect usage.",
        },
    )
    assert res_rej.status_code == 200
    assert res_rej.json()["status"] == "rejected"

    # Verify transcript text is NOT changed to the rejected text
    res_t_after_rej = client.get(f"/api/transcripts/{t_id}")
    assert res_t_after_rej.json()["transcript_text"] != "Non-authentic text to be rejected"


def test_reviewer_permission_authorization_and_unauthorized_rejection():
    """Verify that unauthorized reviewer roles are rejected with HTTP 403 Forbidden."""
    res_transcripts = client.get("/api/transcripts")
    transcripts = res_transcripts.json().get("transcripts", [])
    assert len(transcripts) > 0
    t_id = transcripts[0]["id"]

    res_prop = client.post(
        f"/api/v1/transcripts/{t_id}/corrections",
        json={
            "suggested_text": "Phonetic variation proposal for permission testing",
            "contributor_name": "Speaker Contributor",
            "consent_confirmed": True,
        },
    )
    assert res_prop.status_code == 200
    corr_id = res_prop.json()["id"]

    # 1. Unauthorized reviewer role fails with 403 Forbidden
    res_unauth = client.patch(
        f"/api/v1/corrections/{corr_id}/review",
        json={
            "status": "approved",
            "reviewed_by": "Unverified Guest",
            "reviewer_role": "unauthorized",
        },
    )
    assert res_unauth.status_code == 403
    assert "not authorized" in res_unauth.json()["detail"].lower()

    # 2. Authorized role (native_speaker_reviewer) succeeds
    res_auth = client.patch(
        f"/api/v1/corrections/{corr_id}/review",
        json={
            "status": "approved",
            "reviewed_by": "Certified Speaker Elder",
            "reviewer_role": "native_speaker_reviewer",
            "review_notes": "Verified by recognized community speaker.",
        },
    )
    assert res_auth.status_code == 200
    assert res_auth.json()["status"] == "approved"


def test_contributor_correction_withdrawal_lifecycle():
    """Verify that contributors can withdraw submitted corrections under OCAP principles."""
    res_transcripts = client.get("/api/transcripts")
    transcripts = res_transcripts.json().get("transcripts", [])
    assert len(transcripts) > 0
    t_id = transcripts[0]["id"]

    res_prop = client.post(
        f"/api/v1/transcripts/{t_id}/corrections",
        json={
            "suggested_text": "Text to be withdrawn by contributor",
            "contributor_name": "Testing Contributor",
            "consent_confirmed": True,
        },
    )
    assert res_prop.status_code == 200
    corr_id = res_prop.json()["id"]

    # Withdraw correction
    res_with = client.post(f"/api/v1/corrections/{corr_id}/withdraw")
    assert res_with.status_code == 200
    data_with = res_with.json()
    assert data_with["success"] is True
    assert data_with["status"] == "withdrawn"

    # Subsequent withdrawal returns 400 already withdrawn
    res_repeat = client.post(f"/api/v1/corrections/{corr_id}/withdraw")
    assert res_repeat.status_code == 400


def test_resource_submission_withdrawal_lifecycle():
    """Verify that resource contributions can be withdrawn and purged under OCAP protocols."""
    sub_payload = {
        "submission_type": "vocabulary",
        "language_code": "gon",
        "language_name": "Gondi",
        "dialect": "Adilabad Northern",
        "term_or_text": "సండ్రాయి గోండ్వానా (Test Term)",
        "translation_text": "Gondwana ancestral homeland test",
        "contributor_name": "Elder Pendur",
        "license": "CC BY 4.0",
        "attribution": "Adilabad Elder Circle",
        "speaker_consent_given": True,
        "is_sacred_or_restricted": False,
    }
    res_sub = client.post("/api/v1/resources/submit", json=sub_payload)
    assert res_sub.status_code == 200
    sub_id = res_sub.json()["id"]

    # Withdraw resource submission
    res_with = client.post(f"/api/v1/resources/submissions/{sub_id}/withdraw")
    assert res_with.status_code == 200
    data_with = res_with.json()
    assert data_with["success"] is True
    assert data_with["status"] == "withdrawn"
    assert "withdrawn_at" in data_with

    # Repeat withdrawal returns 400
    res_repeat = client.post(f"/api/v1/resources/submissions/{sub_id}/withdraw")
    assert res_repeat.status_code == 400


def test_community_reviewed_evaluation_performance():
    """Verify grounded performance metrics computed on reviewer-approved transcripts."""
    res = client.get("/api/v1/evaluation/community-reviews")
    assert res.status_code == 200
    data = res.json()
    assert "total_reviewed_samples" in data
    assert "evaluation_date" in data
    assert "languages" in data
    assert "pilot_caveat" in data

    # Verify run_full_evaluation report also includes community_reviewed_performance
    res_full = client.get("/api/v1/evaluation/latest")
    assert res_full.status_code == 200
    full_data = res_full.json()
    assert "community_reviewed_performance" in full_data


def test_calculate_evaluation_endpoint():
    """Verify live ad-hoc calculation of WER, CER, chrF and edit distances."""
    res = client.post(
        "/api/v1/evaluation/calculate",
        json={
            "reference": "voice roots preserves oral languages",
            "hypothesis": "voice roots preserves oral songs",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["reference_word_count"] == 5
    assert data["hypothesis_word_count"] == 5
    assert data["word_edit_distance"] == 1
    assert data["wer"] == 0.2
    assert data["wer_percent"] == 20.0
    assert data["cer"] > 0.0
    assert 0.0 < data["chrf"] < 1.0

    # Test exact match
    res_exact = client.post(
        "/api/v1/evaluation/calculate",
        json={
            "reference": "నండ్రాయి గోండ్వానా",
            "hypothesis": "నండ్రాయి గోండ్వానా",
        },
    )
    assert res_exact.status_code == 200
    data_exact = res_exact.json()
    assert data_exact["wer"] == 0.0
    assert data_exact["wer_percent"] == 0.0
    assert data_exact["cer"] == 0.0
    assert data_exact["cer_percent"] == 0.0
    assert data_exact["chrf"] == 1.0


