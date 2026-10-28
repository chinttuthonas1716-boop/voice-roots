"""Voice Roots: Milestone 8 Tests — Community Contribution Portal and Human Verification
========================================================================================
Verifies:
1. Contributor Portal: Oral story submission with multi-tier explicit consent (storage, community, public, AI training).
2. Draft saving, draft editing, and submission transition to review queue.
3. Anonymous attribution option preserving contributor privacy.
4. Mandatory consent enforcement (rejects uploads without storage consent).
5. Reviewer role authorization enforcement (rejects unauthorized review/claim with HTTP 403).
6. State machine progression: draft -> submitted -> under_review -> verified/corrected -> published.
7. Audit trail immutability: machine_transcript_text preserved while human corrections tracked in corrections table.
8. Reviewer uncertainty markers ('low', 'medium', 'high', 'unclear_audio', 'unknown_dialect').
9. OCAP Publication Gate: Prevents publication without verified status AND public publication consent.
10. OCAP Right to Withdraw: Contributor withdrawal sets status to withdrawn_or_rejected.
"""

import io
import wave
import pytest
from fastapi.testclient import TestClient

from main import app, get_db_connection

client = TestClient(app)


def _generate_synthetic_pcm_wav(duration_sec: float = 0.5) -> bytes:
    """Generate valid PCM WAV bytes for upload testing."""
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(16000)
        frames = int(16000 * duration_sec)
        wf.writeframes(b"\x00\x00" * frames)
    return buf.getvalue()


# ─── 1. Contributor Portal & Multi-Tier Consent Tests ───

def test_contributor_submission_with_multitier_consent():
    """Verify oral story submission with explicit multi-tier consent flags."""
    wav_bytes = _generate_synthetic_pcm_wav(0.4)
    res = client.post(
        "/api/upload",
        files={"file": ("story_gondi.wav", wav_bytes, "audio/wav")},
        data={
            "title": "Gondi Harvest Song",
            "language": "Gondi",
            "dialect": "Adilabad Gondi",
            "consent_private_storage": "true",
            "consent_community_access": "true",
            "consent_public_publication": "false",
            "consent_ai_training": "false",
            "contributor_name": "Lachhu Maravi",
            "contributor_role": "elder",
            "contextual_notes": "Recorded at harvest festival in Utnoor village.",
        },
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["success"] is True
    assert data["title"] == "Gondi Harvest Song"
    assert data["language"] == "Gondi"
    assert data["dialect"] == "Adilabad Gondi"
    assert data["verification_status"] == "submitted"
    assert data["consent_private_storage"] == 1
    assert data["consent_community_access"] == 1
    assert data["consent_public_publication"] == 0
    assert data["consent_ai_training"] == 0
    assert data["privacy_level"] == "community"
    assert data["contributor_name"] == "Lachhu Maravi"
    assert data["contextual_notes"] == "Recorded at harvest festival in Utnoor village."


def test_contributor_anonymous_attribution():
    """Verify anonymous attribution option obscures contributor name in preservation registry."""
    wav_bytes = _generate_synthetic_pcm_wav(0.3)
    res = client.post(
        "/api/upload",
        files={"file": ("anonymous_tale.wav", wav_bytes, "audio/wav")},
        data={
            "title": "Sacred Lineage Account",
            "language": "Koya",
            "consent_private_storage": "true",
            "consent_community_access": "true",
            "is_anonymous": "true",
            "contributor_name": "Should Be Hidden",
        },
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["contributor_name"] == "Anonymous Contributor"
    assert data["is_anonymous"] is True


def test_mandatory_consent_rejection():
    """Verify submission fails if mandatory storage consent is withheld."""
    wav_bytes = _generate_synthetic_pcm_wav(0.2)
    res = client.post(
        "/api/upload",
        files={"file": ("no_consent.wav", wav_bytes, "audio/wav")},
        data={
            "title": "Unconsented Speech",
            "language": "Toda",
            "consent": "false",
            "consent_private_storage": "false",
        },
    )
    assert res.status_code == 400
    assert "Consent is required" in res.json()["detail"]


def test_draft_saving_and_editing_lifecycle():
    """Verify contributor can save draft, edit draft details, and submit for verification."""
    wav_bytes = _generate_synthetic_pcm_wav(0.4)
    # 1. Save draft
    res_draft = client.post(
        "/api/upload",
        files={"file": ("draft_tale.wav", wav_bytes, "audio/wav")},
        data={
            "title": "Draft Folk Lore",
            "language": "Kurukh",
            "is_draft": "true",
            "consent_private_storage": "true",
            "contextual_notes": "Initial draft recorded on mobile.",
        },
    )
    assert res_draft.status_code == 200
    draft_data = res_draft.json()
    transcript_id = draft_data["id"]
    assert draft_data["verification_status"] == "draft"
    assert draft_data["status"] == "Draft"

    # 2. Edit draft without submitting
    res_edit = client.patch(
        f"/api/v1/contributions/{transcript_id}/draft",
        json={
            "title": "Refined Kurukh Creation Story",
            "dialect": "Oraon Western",
            "contextual_notes": "Completed speaker metadata and contextual background.",
            "transcript_text": "Kudux banna katha kahan.",
            "submit": False,
        },
    )
    assert res_edit.status_code == 200
    edited = res_edit.json()
    assert edited["title"] == "Refined Kurukh Creation Story"
    assert edited["dialect"] == "Oraon Western"
    assert edited["verification_status"] == "draft"

    # 3. Submit draft for verification
    res_submit = client.patch(
        f"/api/v1/contributions/{transcript_id}/draft",
        json={"submit": True},
    )
    assert res_submit.status_code == 200
    submitted = res_submit.json()
    assert submitted["verification_status"] == "submitted"
    assert submitted["status"] == "Submitted for Review"

    # 4. Attempting to edit once submitted should be rejected
    res_rejected_edit = client.patch(
        f"/api/v1/contributions/{transcript_id}/draft",
        json={"title": "Unauthorized Change Post-Submit"},
    )
    assert res_rejected_edit.status_code == 400
    assert "Cannot edit contribution" in res_rejected_edit.json()["detail"]


# ─── 2. Reviewer Authorization & Verification Workflow Tests ───

def test_reviewer_authorization_enforcement():
    """Verify only authorized reviewer roles can inspect queue, claim, or submit reviews."""
    # 1. Unauthorized queue access
    res_bad_queue = client.get("/api/v1/verification/queue?reviewer_role=guest")
    assert res_bad_queue.status_code == 403
    assert "Reviewer authorization required" in res_bad_queue.json()["detail"]

    res_contrib_queue = client.get("/api/v1/verification/queue?reviewer_role=contributor")
    assert res_contrib_queue.status_code == 403

    # 2. Authorized queue access
    for role in ("community_elder", "linguist", "native_speaker_reviewer", "moderator", "admin"):
        res_ok = client.get(f"/api/v1/verification/queue?reviewer_role={role}")
        assert res_ok.status_code == 200
        assert "queue" in res_ok.json()


def test_verification_workflow_lifecycle():
    """Verify complete review lifecycle: claim -> review with uncertainty -> correction audit -> publish."""
    wav_bytes = _generate_synthetic_pcm_wav(0.5)

    # 1. Contributor submits recording with public publication consent
    res_upload = client.post(
        "/api/upload",
        files={"file": ("ho_chant.wav", wav_bytes, "audio/wav")},
        data={
            "title": "Ho Invocation Ritual",
            "language": "Ho",
            "dialect": "Kolhan Ho",
            "consent_private_storage": "true",
            "consent_community_access": "true",
            "consent_public_publication": "true",
            "contributor_name": "Birsa Soy",
        },
    )
    assert res_upload.status_code == 200
    item = res_upload.json()
    transcript_id = item["id"]

    # 2. Reviewer checks queue
    res_queue = client.get("/api/v1/verification/queue?reviewer_role=linguist&language=Ho")
    assert res_queue.status_code == 200
    queue_items = res_queue.json()["queue"]
    assert any(q["id"] == transcript_id for q in queue_items)

    # 3. Unauthorized user cannot claim
    res_bad_claim = client.post(
        f"/api/v1/verification/{transcript_id}/claim?reviewer_name=Hacker&reviewer_role=unauthorized_user"
    )
    assert res_bad_claim.status_code == 403

    # 4. Authorized elder claims recording
    res_claim = client.post(
        f"/api/v1/verification/{transcript_id}/claim?reviewer_name=Dr.+Sunil+Linguist&reviewer_role=linguist"
    )
    assert res_claim.status_code == 200
    assert res_claim.json()["verification_status"] == "under_review"
    assert res_claim.json()["verified_by"] == "Dr. Sunil Linguist"

    # 5. Invalid uncertainty marker rejected
    res_bad_uncertainty = client.post(
        f"/api/v1/verification/{transcript_id}/review",
        json={
            "reviewer_name": "Dr. Sunil Linguist",
            "reviewer_role": "linguist",
            "decision": "verified",
            "reviewer_uncertainty": "not_a_valid_uncertainty",
        },
    )
    assert res_bad_uncertainty.status_code == 400
    assert "Invalid reviewer uncertainty" in res_bad_uncertainty.json()["detail"]

    # 6. Reviewer submits human verification with correction and uncertainty tag
    res_review = client.post(
        f"/api/v1/verification/{transcript_id}/review",
        json={
            "reviewer_name": "Dr. Sunil Linguist",
            "reviewer_role": "linguist",
            "decision": "verified",
            "corrected_transcript": "Desaun Bonga namaha ho birid.",
            "reviewer_uncertainty": "low",
            "review_notes": "Verified by comparison with Kolhan elder oral record. High audio fidelity.",
        },
    )
    assert res_review.status_code == 200
    reviewed = res_review.json()
    assert reviewed["verification_status"] == "verified"
    assert reviewed["status"] == "Human Verified"
    assert reviewed["transcript_text"] == "Desaun Bonga namaha ho birid."
    assert reviewed["reviewer_uncertainty"] == "low"
    assert reviewed["verified_by"] == "Dr. Sunil Linguist"
    assert reviewed["review_notes"] == "Verified by comparison with Kolhan elder oral record. High audio fidelity."

    # 7. Check audit history: original machine transcript preserved and revision logged
    res_history = client.get(f"/api/v1/verification/{transcript_id}/history")
    assert res_history.status_code == 200
    hist = res_history.json()
    assert hist["transcript_id"] == transcript_id
    assert hist["current_transcript_text"] == "Desaun Bonga namaha ho birid."
    assert len(hist["revisions"]) >= 1
    rev = hist["revisions"][0]
    assert rev["suggested_text"] == "Desaun Bonga namaha ho birid."
    assert rev["contributor_name"] == "Dr. Sunil Linguist"
    assert rev["contributor_role"] == "linguist"
    assert rev["reviewer_uncertainty"] == "low"

    # 8. Moderator publishes verified transcript to public corpus
    res_publish = client.post(
        f"/api/v1/verification/{transcript_id}/publish?publisher_role=moderator"
    )
    assert res_publish.status_code == 200
    pub_data = res_publish.json()
    assert pub_data["success"] is True
    assert pub_data["verification_status"] == "published"
    assert pub_data["status"] == "Published"
    assert pub_data["privacy_level"] == "public"


def test_publish_gate_enforces_consent_and_verification():
    """Verify publish gate blocks unverified items or items lacking public publication consent."""
    wav_bytes = _generate_synthetic_pcm_wav(0.4)

    # Item A: Not verified yet (in submitted state)
    res_a = client.post(
        "/api/upload",
        files={"file": ("unverified.wav", wav_bytes, "audio/wav")},
        data={
            "title": "Unverified Story",
            "language": "Santali",
            "consent_private_storage": "true",
            "consent_public_publication": "true",
        },
    )
    id_a = res_a.json()["id"]

    res_pub_a = client.post(f"/api/v1/verification/{id_a}/publish?publisher_role=moderator")
    assert res_pub_a.status_code == 400
    assert "must be human-verified" in res_pub_a.json()["detail"]

    # Item B: Human-verified, but contributor WITHHELD public publication consent
    res_b = client.post(
        "/api/upload",
        files={"file": ("private_sacred.wav", wav_bytes, "audio/wav")},
        data={
            "title": "Confidential Lineage Story",
            "language": "Santali",
            "consent_private_storage": "true",
            "consent_community_access": "true",
            "consent_public_publication": "false",  # Withheld!
        },
    )
    id_b = res_b.json()["id"]

    # Review and verify it
    client.post(
        f"/api/v1/verification/{id_b}/review",
        json={
            "reviewer_name": "Elder Reviewer",
            "reviewer_role": "community_elder",
            "decision": "verified",
            "reviewer_uncertainty": "low",
        },
    )

    # Attempt to publish must fail because consent_public_publication == 0
    res_pub_b = client.post(f"/api/v1/verification/{id_b}/publish?publisher_role=moderator")
    assert res_pub_b.status_code == 400
    assert "public publication consent" in res_pub_b.json()["detail"]

    # Non-moderator role cannot publish
    res_bad_role = client.post(f"/api/v1/verification/{id_b}/publish?publisher_role=contributor")
    assert res_bad_role.status_code == 403


def test_contributor_right_to_withdraw():
    """Verify contributor can withdraw submission under OCAP sovereignty principles."""
    wav_bytes = _generate_synthetic_pcm_wav(0.3)
    res_upload = client.post(
        "/api/upload",
        files={"file": ("to_withdraw.wav", wav_bytes, "audio/wav")},
        data={
            "title": "Story To Withdraw",
            "language": "Mundari",
            "consent_private_storage": "true",
        },
    )
    transcript_id = res_upload.json()["id"]

    # Withdraw
    res_withdraw = client.post(f"/api/v1/contributions/{transcript_id}/withdraw")
    assert res_withdraw.status_code == 200
    data = res_withdraw.json()
    assert data["success"] is True
    assert data["verification_status"] == "withdrawn_or_rejected"
    assert data["status"] == "Withdrawn"

    # Cannot claim a withdrawn item
    res_claim = client.post(
        f"/api/v1/verification/{transcript_id}/claim?reviewer_name=Elder&reviewer_role=community_elder"
    )
    assert res_claim.status_code == 400
    assert "withdrawn_or_rejected" in res_claim.json()["detail"]

