"""Tests for Milestone 19: Language Learning & Interactive Practice.

Verifies:
- Educational collections catalog, proficiency filters, and language filtering.
- Strict OCAP educational reuse consent gating (consent_educational_reuse == 1).
- Interactive quiz submission, instant scoring, and cultural context note returns.
- Learner progress tracking, multi-attempt scoring, and mastery certification.
- 404 and error boundaries.
"""

import main
from fastapi.testclient import TestClient

client = TestClient(main.app)


def test_learning_overview_endpoint():
    """Verify ecosystem learning overview metrics and OCAP consent enforcement status."""
    resp = client.get("/api/v1/learning/overview")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_collections"] >= 4
    assert data["total_modules"] >= 8
    assert data["consent_gated"] is True
    assert "Gondi" in data["languages"]
    assert "Koya" in data["languages"]
    assert "Santhali" in data["languages"]
    assert "Lambadi" in data["languages"]


def test_learning_collections_listing_and_filtering():
    """Verify listing collections and filtering by language and proficiency level."""
    resp = client.get("/api/v1/learning/collections")
    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] >= 4
    all_col_ids = [c["collection_id"] for c in data["collections"]]
    assert "learn_gon_01" in all_col_ids

    # Language filter
    gon_resp = client.get("/api/v1/learning/collections?language=Gondi")
    assert gon_resp.status_code == 200
    gon_data = gon_resp.json()
    assert len(gon_data["collections"]) >= 1
    assert all(c["language"] == "Gondi" for c in gon_data["collections"])

    # Proficiency filter
    beg_resp = client.get("/api/v1/learning/collections?proficiency=BEGINNER")
    assert beg_resp.status_code == 200
    beg_data = beg_resp.json()
    assert len(beg_data["collections"]) >= 4


def test_learning_collection_details_and_not_found():
    """Verify retrieval of collection details with embedded verified modules."""
    resp = client.get("/api/v1/learning/collections/learn_gon_01")
    assert resp.status_code == 200
    data = resp.json()
    assert data["collection_id"] == "learn_gon_01"
    assert data["language"] == "Gondi"
    assert data["module_count"] >= 3
    assert len(data["modules"]) >= 3

    # Check module attributes
    first_mod = data["modules"][0]
    assert "module_id" in first_mod
    assert "prompt_latin" in first_mod
    assert "options" in first_mod
    assert len(first_mod["options"]) == 4
    assert first_mod["consent_educational_reuse"] is True

    # 404 for unknown collection
    not_found = client.get("/api/v1/learning/collections/non_existent_collection_999")
    assert not_found.status_code == 404


def test_learning_modules_endpoint_and_consent_gating():
    """Verify /modules endpoint enforces educational consent boundary."""
    resp = client.get("/api/v1/learning/collections/learn_koy_01/modules")
    assert resp.status_code == 200
    data = resp.json()
    assert data["collection_id"] == "learn_koy_01"
    assert data["count"] >= 2
    for mod in data["modules"]:
        assert mod["consent_educational_reuse"] is True
        assert len(mod["options"]) >= 2
        assert len(mod["correct_answer"]) > 0


def test_practice_quiz_submission_correct_and_incorrect():
    """Verify submitting answers evaluates correctness and updates progress record."""
    import uuid
    learner_id = f"test_learner_m19_{uuid.uuid4().hex[:8]}"
    module_id = "mod_gon_01_mava"

    # Submit correct answer
    correct_resp = client.post(
        "/api/v1/learning/practice/submit",
        json={
            "learner_id": learner_id,
            "module_id": module_id,
            "selected_answer": "Our / Ours",
        },
    )
    assert correct_resp.status_code == 200
    c_data = correct_resp.json()
    assert c_data["is_correct"] is True
    assert c_data["correct_answer"] == "Our / Ours"
    assert "cultural_note" in c_data
    assert c_data["progress"]["status"] in ("COMPLETED", "MASTERED")
    assert c_data["progress"]["score"] == 100.0

    # Submit incorrect answer with a different learner
    other_learner = f"test_learner_m19_wrong_{uuid.uuid4().hex[:8]}"
    incorrect_resp = client.post(
        "/api/v1/learning/practice/submit",
        json={
            "learner_id": other_learner,
            "module_id": module_id,
            "selected_answer": "Wrong Option",
        },
    )
    assert incorrect_resp.status_code == 200
    i_data = incorrect_resp.json()
    assert i_data["is_correct"] is False
    assert i_data["progress"]["status"] == "IN_PROGRESS"


def test_learner_progress_tracking_and_mastery():
    """Verify progress endpoint tracks cumulative learner milestones."""
    import uuid
    learner_id = f"test_learner_m19_mastery_{uuid.uuid4().hex[:8]}"

    # Practice module 1
    client.post(
        "/api/v1/learning/practice/submit",
        json={
            "learner_id": learner_id,
            "module_id": "mod_sat_01_johar",
            "selected_answer": "Traditional Greeting",
        },
    )
    # Practice module 1 second time (reinforcement for mastery)
    client.post(
        "/api/v1/learning/practice/submit",
        json={
            "learner_id": learner_id,
            "module_id": "mod_sat_01_johar",
            "selected_answer": "Traditional Greeting",
        },
    )

    prog_resp = client.get(f"/api/v1/learning/progress/{learner_id}")
    assert prog_resp.status_code == 200
    p_data = prog_resp.json()
    assert p_data["learner_id"] == learner_id
    assert p_data["total_modules_attempted"] >= 1
    assert p_data["completed_count"] >= 1
    assert p_data["mastered_count"] >= 1
    assert p_data["average_score"] == 100.0


def test_practice_submit_invalid_module_returns_404():
    """Verify 404 response on unknown module submission."""
    resp = client.post(
        "/api/v1/learning/practice/submit",
        json={
            "learner_id": "any_learner",
            "module_id": "mod_invalid_unknown_9999",
            "selected_answer": "Any Answer",
        },
    )
    assert resp.status_code == 404
