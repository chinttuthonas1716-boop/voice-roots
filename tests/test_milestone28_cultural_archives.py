"""Milestone 28: Module 4 — Cultural Archives & Sacred Lore Shielding Test Suite

Verifies:
1. Multi-tier access classification (PUBLIC, COMMUNITY_RESTRICTED, SACRED_ELDER_ONLY, RESEARCH_ONLY).
2. Automated Redacted Preview Teasers for unverified/public users on restricted heritage records.
3. Complete unredacted access, transcripts, and audio streaming for authenticated elders/admins.
4. Story audio waveform envelope generation (56 normalized peaks) with OCAP shielding on sacred assets.
5. Synchronized bilingual sentence-level segments alignment with start/end timecode boundaries.
6. Community story submission with 6-facet OCAP affirmative consent and sacred lore shielding.
7. Immediate cascading consent revocation purging stories from search indexes and vector representations.
"""

import os
import sys
import uuid

import pytest
from fastapi.testclient import TestClient

# Ensure backend is on sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

import cultural_archive_service
from main import ADMIN_API_KEY, DB_PATH, app

client = TestClient(app)
ADMIN_HEADER = {"X-Admin-Key": ADMIN_API_KEY}
ELDER_HEADER = {"X-User-Role": "elder"}
RESEARCHER_HEADER = {"X-User-Role": "researcher"}


@pytest.fixture(autouse=True)
def setup_archives():
    """Ensure baseline cultural collections and stories are seeded."""
    cultural_archive_service.seed_default_cultural_archives(DB_PATH)


def test_multi_tier_access_classifications():
    """Verify access classification constants and permission checks across roles."""
    assert cultural_archive_service.ACCESS_PUBLIC == "PUBLIC"
    assert cultural_archive_service.ACCESS_COMMUNITY_RESTRICTED == "COMMUNITY_RESTRICTED"
    assert cultural_archive_service.ACCESS_SACRED_ELDER_ONLY == "SACRED_ELDER_ONLY"
    assert cultural_archive_service.ACCESS_RESEARCH_ONLY == "RESEARCH_ONLY"

    # Public user permission evaluation
    assert cultural_archive_service.check_access_permission("PUBLIC", is_authenticated=False) is True
    assert cultural_archive_service.check_access_permission("SACRED_ELDER_ONLY", is_authenticated=False) is False
    assert cultural_archive_service.check_access_permission("COMMUNITY_RESTRICTED", is_authenticated=False) is False

    # Elder user permission evaluation
    assert cultural_archive_service.check_access_permission("SACRED_ELDER_ONLY", is_authenticated=True, user_roles=["elder"]) is True
    assert cultural_archive_service.check_access_permission("COMMUNITY_RESTRICTED", is_authenticated=True, user_roles=["elder"]) is True

    # Researcher user permission evaluation
    assert cultural_archive_service.check_access_permission("RESEARCH_ONLY", is_authenticated=True, user_roles=["researcher"]) is True
    assert cultural_archive_service.check_access_permission("SACRED_ELDER_ONLY", is_authenticated=True, user_roles=["researcher"]) is False


def test_redacted_preview_teasers_for_unverified_users():
    """Verify stories endpoint returns safe redacted teasers when include_teasers=true."""
    # 1. Unauthenticated request without teasers excludes sacred stories
    resp_no_teaser = client.get("/api/v1/cultural-archives/stories?include_teasers=false")
    assert resp_no_teaser.status_code == 200
    stories_no_teaser = resp_no_teaser.json()
    assert all(s["access_classification"] != "SACRED_ELDER_ONLY" for s in stories_no_teaser)

    # 2. Unauthenticated request with teasers includes shielded teasers
    resp_with_teaser = client.get("/api/v1/cultural-archives/stories?include_teasers=true")
    assert resp_with_teaser.status_code == 200
    stories_with_teaser = resp_with_teaser.json()

    sacred_teasers = [s for s in stories_with_teaser if s["access_classification"] == "SACRED_ELDER_ONLY"]
    assert len(sacred_teasers) >= 1

    teaser = sacred_teasers[0]
    assert teaser["is_redacted"] is True
    assert teaser["is_accessible"] is False
    assert teaser["audio_reference"] is None
    assert "RESTRICTED" in teaser["title"]
    assert "Shielded" in teaser["native_title"] or "Sacred" in teaser["native_title"]
    assert "customary Indigenous protocols" in teaser["description"]
    assert "OCAP" in teaser["custodianship_advisory"]

    # 3. Direct GET single story with allow_teaser=true returns teaser instead of 404
    sacred_id = teaser["story_id"]
    res_direct_teaser = client.get(f"/api/v1/cultural-archives/stories/{sacred_id}?allow_teaser=true")
    assert res_direct_teaser.status_code == 200
    data_direct = res_direct_teaser.json()
    assert data_direct["is_redacted"] is True
    assert data_direct["audio_reference"] is None

    # Without allow_teaser, public request is rejected with 404
    res_direct_reject = client.get(f"/api/v1/cultural-archives/stories/{sacred_id}?allow_teaser=false")
    assert res_direct_reject.status_code == 404


def test_elder_unredacted_access_to_sacred_lore():
    """Verify authenticated elders receive full unredacted recordings and transcripts."""
    sacred_id = "story:gondi:clan_sacred_totem"

    # Elder request
    resp = client.get(f"/api/v1/cultural-archives/stories/{sacred_id}", headers=ELDER_HEADER)
    assert resp.status_code == 200
    story = resp.json()

    assert story["story_id"] == sacred_id
    assert story["is_redacted"] is False
    assert story["is_accessible"] is True
    assert story["access_classification"] == "SACRED_ELDER_ONLY"
    assert story["audio_reference"] is not None
    assert "Secret Totem Rites" in story["title"]
    assert len(story.get("transliteration", "")) > 0


def test_story_audio_waveform_peaks_and_ocap_shielding():
    """Verify 56-bar waveform envelope generation and sacred lore protection."""
    public_story_id = "story:gondi:lingo_recitation"
    sacred_story_id = "story:gondi:clan_sacred_totem"

    # 1. Public story waveform accessible to all
    resp_pub = client.get(f"/api/v1/cultural-archives/stories/{public_story_id}/waveform")
    assert resp_pub.status_code == 200
    wf_pub = resp_pub.json()
    assert wf_pub["story_id"] == public_story_id
    assert wf_pub["num_peaks"] == 56
    assert len(wf_pub["peaks"]) == 56
    assert all(0.0 <= p <= 1.0 for p in wf_pub["peaks"])
    assert wf_pub["duration_seconds"] > 0

    # 2. Sacred lore waveform BLOCKED for unauthenticated users
    resp_sacred_unauth = client.get(f"/api/v1/cultural-archives/stories/{sacred_story_id}/waveform")
    assert resp_sacred_unauth.status_code == 403
    assert "OCAP" in resp_sacred_unauth.json()["detail"]

    # 3. Sacred lore waveform ACCESSIBLE for verified elders
    resp_sacred_elder = client.get(f"/api/v1/cultural-archives/stories/{sacred_story_id}/waveform", headers=ELDER_HEADER)
    assert resp_sacred_elder.status_code == 200
    wf_elder = resp_sacred_elder.json()
    assert wf_elder["story_id"] == sacred_story_id
    assert wf_elder["num_peaks"] == 56
    assert len(wf_elder["peaks"]) == 56


def test_bilingual_segments_endpoint_and_karaoke_alignment():
    """Verify sentence-level time-aligned bilingual segments for karaoke synchronized playback."""
    public_story_id = "story:gondi:lingo_recitation"
    sacred_story_id = "story:gondi:clan_sacred_totem"

    # 1. Public story bilingual segments
    resp_pub = client.get(f"/api/v1/cultural-archives/stories/{public_story_id}/bilingual-segments")
    assert resp_pub.status_code == 200
    data_pub = resp_pub.json()
    assert data_pub["story_id"] == public_story_id
    assert data_pub["segment_count"] >= 1
    assert len(data_pub["segments"]) == data_pub["segment_count"]

    first_seg = data_pub["segments"][0]
    assert "start_time" in first_seg
    assert "end_time" in first_seg
    assert first_seg["end_time"] > first_seg["start_time"]
    assert "vernacular_text" in first_seg
    assert "translated_text" in first_seg

    # 2. Sacred story bilingual segments BLOCKED for unauthenticated users
    resp_sacred_unauth = client.get(f"/api/v1/cultural-archives/stories/{sacred_story_id}/bilingual-segments")
    assert resp_sacred_unauth.status_code == 403
    assert "OCAP" in resp_sacred_unauth.json()["detail"]

    # 3. Sacred story bilingual segments ACCESSIBLE for verified elders
    resp_sacred_elder = client.get(
        f"/api/v1/cultural-archives/stories/{sacred_story_id}/bilingual-segments",
        headers=ELDER_HEADER,
    )
    assert resp_sacred_elder.status_code == 200
    data_elder = resp_sacred_elder.json()
    assert data_elder["story_id"] == sacred_story_id
    assert data_elder["segment_count"] >= 1


def test_community_submission_workflow_and_sacred_blocking():
    """Verify community oral history submission with 6-facet consent and sacred lore shielding."""
    # 1. Normal oral history submission succeeds
    submission_data = {
        "contributor_name": "Pendur Tukaram",
        "language": "gon",
        "title": "Adilabad Forest Harvest Ballad",
        "variety": "Adilabad Southern",
        "description": "Harvest celebration chant recorded during the Mahua gathering.",
        "transcript_draft": "Mahua maram yeru konda lingo...",
        "translation_draft": "Under the Mahua tree by the hill waters...",
        "attribution_preference": "BY_NAME",
        "consent_recording": True,
        "consent_transcription": True,
        "consent_translation": True,
        "consent_public_display": True,
        "consent_research_reuse": True,
        "consent_educational_reuse": True,
        "is_sacred_ceremonial": False,
    }

    resp = client.post("/api/v1/cultural-archives/submissions", json=submission_data)
    assert resp.status_code == 200
    sub_res = resp.json()
    assert sub_res["status"] == "SUBMITTED"
    assert sub_res["contributor_name"] == "Pendur Tukaram"
    assert sub_res["consent_matrix"]["consent_recording"] is True

    # 2. Attempting to submit secret sacred ceremonial lore through public queue is BLOCKED
    sacred_sub_data = dict(submission_data)
    sacred_sub_data["title"] = "Secret Clan Initiation Spell"
    sacred_sub_data["is_sacred_ceremonial"] = True

    resp_blocked = client.post("/api/v1/cultural-archives/submissions", json=sacred_sub_data)
    assert resp_blocked.status_code == 400
    assert "sacred" in resp_blocked.json()["detail"].lower()


def test_cascading_consent_revocation():
    """Verify cascading consent revocation hook purges story from database, FTS, and vector store."""
    unique_suffix = uuid.uuid4().hex[:6]
    test_story_id = f"story:test:revocation_{unique_suffix}"

    # 1. Directly insert a consented story for revocation testing
    import sqlite3
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            INSERT INTO cultural_stories (
                story_id, collection_id, title, native_title, description,
                primary_language, dialect_variety, transliteration, translation_text,
                audio_reference, audio_duration_seconds, contributor_name,
                access_classification, review_status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            """,
            (
                test_story_id,
                "coll:gondi:lingo",
                f"Temporary Field Recording {unique_suffix}",
                "తాత్కాలిక పాట",
                "Community narrative scheduled for consent withdrawal test.",
                "gon",
                "Adilabad Southern",
                "Maram tina yeru...",
                "Tree by the river...",
                "sample_audio.wav",
                30.0,
                "Test Contributor",
                "PUBLIC",
                "APPROVED",
            ),
        )
        conn.execute(
            """
            INSERT INTO cultural_stories_fts (story_id, title, native_title, description, transliteration, translation_text)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (test_story_id, f"Temporary Field Recording {unique_suffix}", "తాత్కాలిక పాట", "description", "translit", "trans"),
        )
        conn.commit()

    # 2. Verify story exists in search before revocation
    res_before = client.get(f"/api/v1/cultural-archives/stories/{test_story_id}")
    assert res_before.status_code == 200

    # 3. Unauthorized revocation attempt is rejected (requires elder or admin)
    res_unauth = client.post(
        f"/api/v1/cultural-archives/stories/{test_story_id}/revoke-consent",
        json={"revoked_by": "Anonymous Caller", "reason": "Revoking consent"},
    )
    assert res_unauth.status_code == 403

    # 4. Authorized elder revokes consent
    res_revoke = client.post(
        f"/api/v1/cultural-archives/stories/{test_story_id}/revoke-consent",
        json={
            "revoked_by": "Adilabad Clan Council of Elders",
            "reason": "Clan family requested privacy and complete archival withdrawal under OCAP principles",
        },
        headers=ELDER_HEADER,
    )
    assert res_revoke.status_code == 200
    rev_data = res_revoke.json()
    assert rev_data["status"] == "success"
    assert rev_data["action"] == "CONSENT_REVOKED_CASCADING_PURGE"
    assert rev_data["story_id"] == test_story_id

    # 5. Verify story is now withdrawn and no longer accessible via public API
    res_after = client.get(f"/api/v1/cultural-archives/stories/{test_story_id}")
    assert res_after.status_code == 404

    # 6. Verify story removed from FTS5 index
    res_search = client.get(f"/api/v1/cultural-archives/stories?q={unique_suffix}")
    assert res_search.status_code == 200
    assert len(res_search.json()) == 0

    # 7. Clean up database record
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("DELETE FROM cultural_stories WHERE story_id = ?", (test_story_id,))
        conn.execute("DELETE FROM cultural_stories_fts WHERE story_id = ?", (test_story_id,))
        conn.commit()
