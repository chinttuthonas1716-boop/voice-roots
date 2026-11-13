"""Voice Roots: Milestone 30 — Advanced Learning Studio Test Suite.
=============================================================================
Tests Spaced Repetition System (SuperMemo SM-2 & Leitner Box), formant-based
pronunciation evaluation, audio-first listening comprehension quizzes,
sentence construction drills, and offline sync analytics.
"""

import os
import sys
import uuid

import pytest
from fastapi.testclient import TestClient

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from main import app  # noqa: E402


@pytest.fixture
def client():
    return TestClient(app)


def test_srs_queue_initialization_and_retrieval(client):
    """Verify SRS card queue initializes from seed inventory for new learners."""
    learner_id = f"learner_init_{uuid.uuid4().hex[:8]}"
    resp = client.get(f"/api/v1/learning/srs/queue?learner_id={learner_id}&include_future=true")
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["status"] == "success"
    assert data["learner_id"] == learner_id
    assert data["total_due"] >= 6

    cards = data["cards"]
    languages = {c["language"] for c in cards}
    assert "Gondi" in languages
    assert "Koya" in languages
    assert "Santhali" in languages
    assert "Lambadi" in languages

    first_card = cards[0]
    assert "front_prompt" in first_card
    assert "back_meaning" in first_card
    assert first_card["repetition_number"] == 0
    assert first_card["ease_factor"] >= 2.5
    assert first_card["interval_days"] == 1
    assert first_card["leitner_box"] == 1


def test_srs_sm2_review_progression(client):
    """Test SuperMemo SM-2 algorithm progression and Leitner box promotion/demotion."""
    learner_id = f"learner_sm2_{uuid.uuid4().hex[:8]}"
    # Fetch queue
    q_resp = client.get(f"/api/v1/learning/srs/queue?learner_id={learner_id}&include_future=true")
    assert q_resp.status_code == 200
    card = q_resp.json()["cards"][0]
    card_id = card["card_id"]

    # First review with grade 4 (Good)
    rev1 = client.post(
        "/api/v1/learning/srs/review",
        json={"card_id": card_id, "learner_id": learner_id, "grade": 4},
    )
    assert rev1.status_code == 200, rev1.text
    r1_data = rev1.json()
    assert r1_data["updated_repetition"] == 1
    assert r1_data["updated_interval_days"] == 1
    assert r1_data["updated_leitner_box"] == 2

    # Second review with grade 5 (Perfect)
    rev2 = client.post(
        "/api/v1/learning/srs/review",
        json={"card_id": card_id, "learner_id": learner_id, "grade": 5},
    )
    assert rev2.status_code == 200
    r2_data = rev2.json()
    assert r2_data["updated_repetition"] == 2
    assert r2_data["updated_interval_days"] == 6
    assert r2_data["updated_leitner_box"] == 3

    # Third review with grade 1 (Lapse / Failure)
    rev3 = client.post(
        "/api/v1/learning/srs/review",
        json={"card_id": card_id, "learner_id": learner_id, "grade": 1},
    )
    assert rev3.status_code == 200
    r3_data = rev3.json()
    assert r3_data["updated_repetition"] == 0
    assert r3_data["updated_interval_days"] == 1
    assert r3_data["updated_leitner_box"] == 1


def test_formant_pronunciation_evaluation(client):
    """Verify acoustic formant matching against native elder benchmarks."""
    # 1. Close match to Gondi /a/ (730Hz F1, 1280Hz F2, 135Hz F0)
    resp_match = client.post(
        "/api/v1/learning/formants/evaluate",
        json={
            "phoneme_or_word": "Open Low-Central Vowel /a/",
            "student_f0": 136.0,
            "student_f1": 732.0,
            "student_f2": 1275.0,
            "language": "Gondi",
        },
    )
    assert resp_match.status_code == 200, resp_match.text
    data_match = resp_match.json()
    assert data_match["acoustic_match_percentage"] >= 95.0
    assert data_match["is_verified_mastery"] is True
    assert any("Excellent" in tip for tip in data_match["diagnostic_feedback"])

    # 2. Significant formant deviation (F1 too low, F2 too high)
    resp_deviate = client.post(
        "/api/v1/learning/formants/evaluate",
        json={
            "phoneme_or_word": "Open Low-Central Vowel /a/",
            "student_f0": 190.0,
            "student_f1": 450.0,
            "student_f2": 2100.0,
            "language": "Gondi",
        },
    )
    assert resp_deviate.status_code == 200
    data_deviate = resp_deviate.json()
    assert data_deviate["acoustic_match_percentage"] < 70.0
    assert data_deviate["is_verified_mastery"] is False
    assert len(data_deviate["diagnostic_feedback"]) >= 2


def test_sentence_construction_drills_and_validation(client):
    """Verify sentence construction drills with indigenous SOV syntax validation."""
    resp_list = client.get("/api/v1/learning/drills?language=Gondi")
    assert resp_list.status_code == 200, resp_list.text
    drills = resp_list.json()
    assert len(drills) >= 1

    drill = drills[0]
    assert drill["drill_id"] == "drill:gon:01_clan_reverence"
    assert "SOV" in drill["syntax_pattern"]
    assert len(drill["scrambled_tokens"]) == 5

    # 1. Submit correct order
    correct_tokens = ["మావ", "సగా పెన్", "మరమ్", "పూజ", "కీతోమ్"]
    resp_sub_ok = client.post(
        "/api/v1/learning/drills/submit",
        json={
            "learner_id": "learner_test_drill",
            "drill_id": drill["drill_id"],
            "assembled_tokens": correct_tokens,
        },
    )
    assert resp_sub_ok.status_code == 200
    res_ok = resp_sub_ok.json()
    assert res_ok["is_correct"] is True
    assert "harvesting" in res_ok["cultural_context"].lower()
    assert "clan deity" in res_ok["translation_english"].lower()

    # 2. Submit wrong order
    wrong_tokens = ["కీతోమ్", "మరమ్", "మావ", "పూజ", "సగా పెన్"]
    resp_sub_fail = client.post(
        "/api/v1/learning/drills/submit",
        json={
            "learner_id": "learner_test_drill",
            "drill_id": drill["drill_id"],
            "assembled_tokens": wrong_tokens,
        },
    )
    assert resp_sub_fail.status_code == 200
    res_fail = resp_sub_fail.json()
    assert res_fail["is_correct"] is False


def test_audio_first_listening_quizzes(client):
    """Verify audio-first listening comprehension quizzes testing oral comprehension."""
    resp_list = client.get("/api/v1/learning/quizzes?language=Gondi")
    assert resp_list.status_code == 200, resp_list.text
    quizzes = resp_list.json()
    assert len(quizzes) >= 1

    quiz = quizzes[0]
    assert "audio_prompt_url" in quiz
    assert quiz["audio_duration_seconds"] > 0
    assert len(quiz["options"]) == 4

    correct_opt = next(o for o in quiz["options"] if o.get("is_correct"))
    resp_sub = client.post(
        "/api/v1/learning/quizzes/submit",
        json={
            "learner_id": "learner_test_quiz",
            "quiz_id": quiz["quiz_id"],
            "selected_option_id": correct_opt["id"],
        },
    )
    assert resp_sub.status_code == 200
    res = resp_sub.json()
    assert res["is_correct"] is True
    assert len(res["cultural_note"]) > 0


def test_offline_event_sync_and_analytics(client):
    """Verify batch offline synchronization and learner mastery analytics."""
    learner_id = f"learner_sync_{uuid.uuid4().hex[:8]}"

    # Seed learner cards first
    client.get(f"/api/v1/learning/srs/queue?learner_id={learner_id}&include_future=true")

    # Simulate batch of actions performed offline on client
    offline_events = [
        {
            "type": "srs_review",
            "payload": {
                "card_id": f"{learner_id}:srs:gon:maram",
                "grade": 5,
            },
        },
        {
            "type": "sentence_drill",
            "payload": {
                "drill_id": "drill:gon:01_clan_reverence",
                "tokens": ["మావ", "సగా పెన్", "మరమ్", "పూజ", "కీతోమ్"],
            },
        },
        {
            "type": "listening_quiz",
            "payload": {
                "quiz_id": "quiz:gon:oral_01",
                "option_id": "opt_1",
            },
        },
    ]

    resp_sync = client.post(
        "/api/v1/learning/offline-sync",
        json={"learner_id": learner_id, "events": offline_events},
    )
    assert resp_sync.status_code == 200, resp_sync.text
    sync_data = resp_sync.json()
    assert sync_data["total_events_received"] == 3
    assert sync_data["synced_counts"]["srs_reviews"] == 1
    assert sync_data["synced_counts"]["sentence_drills"] == 1
    assert sync_data["synced_counts"]["listening_quizzes"] == 1

    # Check analytics endpoint
    resp_analytics = client.get(f"/api/v1/learning/analytics/{learner_id}")
    assert resp_analytics.status_code == 200
    analytics = resp_analytics.json()
    assert analytics["total_reviews_completed"] >= 1
    assert analytics["retention_rate_pct"] == 100.0
    assert analytics["leitner_box_distribution"]["box_2_semiweekly"] >= 1


def test_backwards_compatibility_milestone19_learning(client):
    """Ensure existing Milestone 19 educational endpoints continue functioning."""
    resp_overview = client.get("/api/v1/learning/overview")
    assert resp_overview.status_code == 200
    ov = resp_overview.json()
    assert "total_collections" in ov

    resp_cols = client.get("/api/v1/learning/collections")
    assert resp_cols.status_code == 200
    cols = resp_cols.json()
    assert len(cols) >= 1
