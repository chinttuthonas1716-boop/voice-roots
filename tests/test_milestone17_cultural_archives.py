"""Unit and integration tests for Milestone 17: Interactive Cultural and Oral History Archives.

Verifies:
- Cultural archive overview telemetry and categories
- Collections listing with access classification filtering
- Story full-text search with Indic Unicode support
- Sacred and ceremonial lore protection (OCAP)
- Audio streaming for authorized stories
- Community submission with 6-facet affirmative consent
- Sacred knowledge blocking in public submissions
- Elder review workflow (approval/rejection)
- Bi-directional synchronization with Milestone 16 Knowledge Graph
- OCAP withdrawal and consent revocation
"""

import main
import pytest
from cultural_archive_service import (
    ACCESS_SACRED_ELDER_ONLY,
    STATUS_APPROVED,
    STATUS_SUBMITTED,
    STATUS_WITHDRAWN,
    ConsentMatrix,
    create_cultural_submission,
    get_cultural_story,
    seed_default_cultural_archives,
)
from fastapi.testclient import TestClient

client = TestClient(main.app)
ADMIN_HEADER = {"X-Admin-Key": main.ADMIN_API_KEY}
ELDER_HEADER = {"X-User-Role": "elder"}
RESEARCHER_HEADER = {"X-User-Role": "researcher"}


@pytest.fixture(autouse=True)
def ensure_seeded_archives():
    """Ensure baseline cultural collections and stories are seeded."""
    seed_default_cultural_archives(main.DB_PATH)


def test_cultural_overview_metrics():
    """Verify cultural archives overview telemetry."""
    response = client.get("/api/v1/cultural-archives/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["total_collections"] >= 4
    assert data["total_stories"] >= 4
    assert data["total_audio_duration_seconds"] > 0
    assert len(data["languages_represented"]) >= 3
    assert len(data["categories"]) >= 4


def test_overview_sacred_lore_filtering():
    """Verify that unauthenticated overview hides sacred records while elder overview includes them."""
    public_res = client.get("/api/v1/cultural-archives/overview")
    assert public_res.status_code == 200
    pub_data = public_res.json()

    elder_res = client.get("/api/v1/cultural-archives/overview", headers=ELDER_HEADER)
    assert elder_res.status_code == 200
    elder_data = elder_res.json()

    # Elder overview should include sacred collections
    assert elder_data["total_collections"] >= pub_data["total_collections"]
    assert elder_data["total_stories"] >= pub_data["total_stories"]


def test_list_collections_access_levels():
    """Verify public cannot see SACRED_ELDER_ONLY collections, but elders can."""
    pub_res = client.get("/api/v1/cultural-archives/collections")
    assert pub_res.status_code == 200
    pub_colls = pub_res.json()
    for coll in pub_colls:
        assert coll["access_classification"] != ACCESS_SACRED_ELDER_ONLY

    elder_res = client.get("/api/v1/cultural-archives/collections", headers=ELDER_HEADER)
    assert elder_res.status_code == 200
    elder_colls = elder_res.json()
    has_sacred = any(c["access_classification"] == ACCESS_SACRED_ELDER_ONLY for c in elder_colls)
    assert has_sacred is True


def test_get_collection_details():
    """Retrieve curated collection with contained oral stories."""
    res = client.get("/api/v1/cultural-archives/collections/coll:gondi:lingo")
    assert res.status_code == 200
    data = res.json()
    assert data["collection_id"] == "coll:gondi:lingo"
    assert data["primary_language"] == "gon"
    assert "Pahandi Kupar Lingo" in data["title"]
    assert "stories" in data
    assert len(data["stories"]) >= 1


def test_create_collection_elder_admin_authorization():
    """Verify creating a collection requires elder or admin credentials."""
    payload = {
        "title": "Toda Buffalo Pastoral Chants",
        "primary_language": "tcx",
        "category": "Pastoral Chants & Rituals",
        "description": "Sacred dairy temple chants of the Nilgiri plateau.",
        "creator_name": "Toda Elder Council",
        "provenance_details": "Recorded with permission of Nilgiri elders.",
        "access_classification": "PUBLIC",
    }

    # Unauthorized attempt
    unauth_res = client.post("/api/v1/cultural-archives/collections", json=payload)
    assert unauth_res.status_code == 403

    # Authorized attempt with admin key
    auth_res = client.post("/api/v1/cultural-archives/collections", json=payload, headers=ADMIN_HEADER)
    assert auth_res.status_code == 200
    created = auth_res.json()
    assert created["title"] == payload["title"]
    assert created["primary_language"] == "tcx"


def test_list_stories_language_and_category_filters():
    """Verify filtering stories by primary language and category."""
    # Filter by Koya
    koya_res = client.get("/api/v1/cultural-archives/stories?language=kff")
    assert koya_res.status_code == 200
    koya_stories = koya_res.json()
    assert len(koya_stories) >= 1
    assert all(s["primary_language"] == "kff" for s in koya_stories)

    # Filter by Gondi
    gondi_res = client.get("/api/v1/cultural-archives/stories?language=gon")
    assert gondi_res.status_code == 200
    gondi_stories = gondi_res.json()
    assert len(gondi_stories) >= 1
    assert all(s["primary_language"] == "gon" for s in gondi_stories)


def test_story_unicode_fts_search():
    """Verify FTS5 full-text search with English, Telugu, and Santhali scripts."""
    # Search by English term
    res_flute = client.get("/api/v1/cultural-archives/stories?q=flute")
    assert res_flute.status_code == 200
    stories_flute = res_flute.json()
    assert len(stories_flute) >= 1
    assert "flute" in stories_flute[0]["title"].lower()

    # Search by Telugu script
    res_telugu = client.get("/api/v1/cultural-archives/stories?q=పిల్లనగ్రోవి")
    assert res_telugu.status_code == 200
    stories_telugu = res_telugu.json()
    assert len(stories_telugu) >= 1

    # Search by healer chant keyword
    res_healer = client.get("/api/v1/cultural-archives/stories?q=roots")
    assert res_healer.status_code == 200
    stories_healer = res_healer.json()
    assert len(stories_healer) >= 1


def test_sacred_story_protection():
    """Verify that sacred ceremonial stories are hidden from public and unauthenticated search."""
    # Unauthenticated search for sacred totem
    res_pub = client.get("/api/v1/cultural-archives/stories?q=Totem")
    assert res_pub.status_code == 200
    stories_pub = res_pub.json()
    assert len(stories_pub) == 0

    # Elder authorized search can discover it
    res_elder = client.get("/api/v1/cultural-archives/stories?q=Totem", headers=ELDER_HEADER)
    assert res_elder.status_code == 200
    stories_elder = res_elder.json()
    assert len(stories_elder) >= 1
    assert stories_elder[0]["access_classification"] == ACCESS_SACRED_ELDER_ONLY


def test_stream_cultural_story_audio():
    """Verify master audio streaming endpoint for approved oral recording."""
    res = client.get("/api/v1/cultural-archives/stories/story:gondi:lingo_recitation/audio")
    assert res.status_code == 200
    assert res.headers["content-type"] in ["audio/mpeg", "audio/wav"]
    assert len(res.content) > 1000


def test_community_submission_consent_validation():
    """Verify 6-facet consent matrix validation on submissions."""
    # Missing affirmative recording consent must fail
    no_consent_payload = {
        "contributor_name": "Test Contributor",
        "language": "gon",
        "title": "Unconsented Story",
        "consent_recording": False,
    }
    res_fail = client.post("/api/v1/cultural-archives/submissions", json=no_consent_payload)
    assert res_fail.status_code == 400
    assert "consent" in res_fail.json()["detail"].lower()

    # Sacred lore cannot be submitted through public queues
    sacred_payload = {
        "contributor_name": "Test Contributor",
        "language": "gon",
        "title": "Secret Ritual Song",
        "consent_recording": True,
        "is_sacred_ceremonial": True,
    }
    res_sacred = client.post("/api/v1/cultural-archives/submissions", json=sacred_payload)
    assert res_sacred.status_code == 400
    assert "sacred" in res_sacred.json()["detail"].lower()

    # Valid submission
    valid_payload = {
        "contributor_name": "Koya Elder Boddu",
        "language": "kff",
        "title": "Godavari Monsoon Flood Song",
        "variety": "Papikondalu Koya",
        "description": "Sung when the floodwaters enter the forest creeks.",
        "transcript_draft": "Eru vachindi koya podu cherindi.",
        "translation_draft": "The flood has arrived and the mountain fields are blessed.",
        "attribution_preference": "BY_NAME",
        "consent_recording": True,
        "consent_transcription": True,
        "consent_translation": True,
        "consent_public_display": True,
        "consent_research_reuse": True,
        "consent_educational_reuse": True,
    }
    res_valid = client.post("/api/v1/cultural-archives/submissions", json=valid_payload)
    assert res_valid.status_code == 200
    sub_data = res_valid.json()
    assert sub_data["status"] == STATUS_SUBMITTED
    assert sub_data["title"] == valid_payload["title"]
    assert sub_data["contributor_name"] == valid_payload["contributor_name"]


def test_elder_review_and_approval_workflow():
    """Verify that an elder approving a submission creates a story and syncs to KG."""
    # 1. Create a submission
    submission = create_cultural_submission(
        main.DB_PATH,
        contributor_name="Santhal Bard Soren",
        language="sat",
        title="Baha Flower Festival Melody",
        consent_matrix=ConsentMatrix(
            consent_recording=True,
            consent_transcription=True,
            consent_translation=True,
            consent_public_display=True,
            consent_research_reuse=True,
            consent_educational_reuse=True,
        ),
        variety="Mayurbhanj Santhali",
        description="Spring blossom song celebrating sal tree blossoms.",
        transcript_draft="Baha parab re sal baha korite.",
        translation_draft="During the Baha festival, we adore the fragrant sal blossoms.",
        collection_id="coll:santhali:sohrai",
    )
    sub_id = submission["submission_id"]

    # 2. Review and approve with elder credentials
    review_payload = {
        "decision": "APPROVED",
        "reviewer_name": "Santhal Language Advisory Elder",
        "review_notes": "Verified authentic oral tradition and accurate Ol Chiki phonetics.",
        "create_story_on_approval": True,
    }
    review_res = client.patch(
        f"/api/v1/cultural-archives/submissions/{sub_id}/review",
        json=review_payload,
        headers=ELDER_HEADER,
    )
    assert review_res.status_code == 200
    rev_data = review_res.json()
    assert rev_data["status"] == STATUS_APPROVED
    assert "created_story_id" in rev_data

    # 3. Verify story now exists in cultural_stories
    story_id = rev_data["created_story_id"]
    story = get_cultural_story(main.DB_PATH, story_id, is_authenticated=True, user_roles=["elder"])
    assert story is not None
    assert story["title"] == "Baha Flower Festival Melody"
    assert story["primary_language"] == "sat"

    # 4. Verify story was synced into Milestone 16 Knowledge Graph
    import sqlite3
    with sqlite3.connect(main.DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        kg_node = c.execute("SELECT * FROM kg_nodes WHERE node_id = ?", (story_id,)).fetchone()
        assert kg_node is not None
        assert kg_node["entity_type"] == "story"
        assert kg_node["primary_language"] == "sat"
        assert kg_node["verification_status"] in ("VERIFIED", "COMMUNITY_REVIEWED")

        # Check relationships
        rels = c.execute("SELECT * FROM kg_relationships WHERE source_id = ?", (story_id,)).fetchall()
        assert len(rels) >= 1
        assert any(r["relationship_type"] == "TRANSCRIBES" for r in rels)


def test_ocap_withdrawal_enforcement():
    """Verify that a withdrawal request immediately revokes public accessibility."""
    # 1. Create a submission
    submission = create_cultural_submission(
        main.DB_PATH,
        contributor_name="Revoking Contributor",
        language="lmn",
        title="Family Lore to be Withdrawn",
        consent_matrix=ConsentMatrix(),
    )
    sub_id = submission["submission_id"]

    # 2. Withdraw
    withdraw_payload = {
        "record_id": sub_id,
        "requester_name": "Revoking Contributor",
        "reason": "Personal family decision to revoke public sharing.",
    }
    w_res = client.post("/api/v1/cultural-archives/withdraw", json=withdraw_payload)
    assert w_res.status_code == 200
    assert w_res.json()["status"] == "success"

    # 3. Verify status in database is WITHDRAWN
    import sqlite3
    with sqlite3.connect(main.DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute("SELECT status FROM cultural_submissions WHERE submission_id = ?", (sub_id,)).fetchone()
        assert row["status"] == STATUS_WITHDRAWN


def test_jwt_session_elder_and_researcher_authorization():
    """Verify that JWT bearer tokens with reviewer (elder) and admin roles authorize access to sacred collections."""
    import auth_service

    # Generate JWT for an elder reviewer
    elder_token = auth_service.create_access_token(
        user_id="42",
        username="elder_gondi",
        email="elder.reviewer@gondi.org",
        role="reviewer",
        full_name="Elder Reviewer",
    )
    headers = {"Authorization": f"Bearer {elder_token}"}

    # Verify elder token unlocks sacred collections
    res = client.get("/api/v1/cultural-archives/collections", headers=headers)
    assert res.status_code == 200
    collections = res.json()
    assert any(c["access_classification"] == ACCESS_SACRED_ELDER_ONLY for c in collections)

    # Verify elder token authorizes review
    submission = create_cultural_submission(
        main.DB_PATH,
        contributor_name="JWT Test Contributor",
        language="gon",
        title="JWT Reviewed Story",
        consent_matrix=ConsentMatrix(),
    )
    sub_id = submission["submission_id"]

    review_res = client.patch(
        f"/api/v1/cultural-archives/submissions/{sub_id}/review",
        json={"decision": "APPROVED", "reviewer_name": "Elder Reviewer JWT"},
        headers=headers,
    )
    assert review_res.status_code == 200
    assert review_res.json()["status"] == "APPROVED"
