"""Voice Roots: Milestone 32 — End-to-End System Integration Test Suite.
=============================================================================
Validates seamless cross-module workflows across all 7 v2.0 modules:
- Module 1: Advanced Speech Intelligence
- Module 2: Multilingual Dictionary
- Module 3: Grounded AI Assistant & Archive RAG
- Module 4: Governed Cultural Archives & Sacred Lore Shielding
- Module 5: Interactive Language Explorer & Dialect Cartography
- Module 6: Advanced Learning Studio & Formant Lab
- Module 7: Institutional Command Center & Disaster Recovery

Also executes penetration tests: SQL injection resistance, path traversal shielding,
role-based access boundaries, and offline PWA asset integrity.
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


def test_cross_module_end_to_end_journey(client):
    """Execute complete end-to-end data lifecycle across all 7 v2.0 functional modules."""
    test_uid = uuid.uuid4().hex[:8]

    # ─────────────────────────────────────────────────────────────────────────
    # Module 1: Advanced Speech Intelligence & Transcription Pipeline
    # ─────────────────────────────────────────────────────────────────────────
    transcripts_resp = client.get("/api/transcripts")
    assert transcripts_resp.status_code == 200
    t_list = transcripts_resp.json().get("transcripts", [])
    assert len(t_list) > 0, "Expected at least one transcript in database"
    active_tid = t_list[0]["id"]

    align_resp = client.get(f"/api/v1/speech/alignments/{active_tid}")
    assert align_resp.status_code == 200, align_resp.text
    align_data = align_resp.json()
    assert "alignments" in align_data
    assert len(align_data["alignments"]) >= 1

    # Waveform peaks
    wf_resp = client.get(f"/api/v1/speech/waveform/{active_tid}")
    assert wf_resp.status_code == 200
    wf_data = wf_resp.json()
    assert "waveform_peaks" in wf_data or "peaks" in wf_data
    assert len(wf_data.get("waveform_peaks") or wf_data.get("peaks")) > 0

    # ─────────────────────────────────────────────────────────────────────────
    # Module 2: Multilingual Dictionary
    # ─────────────────────────────────────────────────────────────────────────
    dict_search = client.get("/api/v1/dictionary/search?q=maram")
    assert dict_search.status_code == 200, dict_search.text
    dict_results = dict_search.json()
    assert len(dict_results.get("results", [])) >= 1

    # Create new dictionary entry with provenance
    new_entry_resp = client.post(
        "/api/v1/dictionary/propose",
        json={
            "word": f"test_word_{test_uid}",
            "language_code": "gon",
            "dialect": "Adilabad Raj Gondi",
            "ipa": "/test.word/",
            "meanings": ["Sacred grove offering test item"],
            "contributor_name": "Elder Soyam",
            "contributor_role": "elder",
        },
    )
    assert new_entry_resp.status_code in (200, 201), new_entry_resp.text
    entry_data = new_entry_resp.json()
    assert "entry" in entry_data or "id" in entry_data

    # ─────────────────────────────────────────────────────────────────────────
    # Module 3: Grounded AI Assistant & Archive RAG
    # ─────────────────────────────────────────────────────────────────────────
    ask_resp = client.post(
        "/api/v1/assistant/query",
        json={
            "query": "What is the cultural role and sacred significance of Persapen in Gondi clan tradition?",
            "max_citations": 4,
        },
    )
    assert ask_resp.status_code == 200, ask_resp.text
    ans_data = ask_resp.json()
    assert "answer" in ans_data
    assert len(ans_data["answer"]) > 0
    assert "epistemic_status" in ans_data
    assert ans_data["epistemic_status"] in ("VERIFIED_ARCHIVE_GROUNDED", "PARTIALLY_GROUNDED")
    assert "citations" in ans_data

    # ─────────────────────────────────────────────────────────────────────────
    # Module 4: Governed Cultural Archives & Sacred Lore Shielding
    # ─────────────────────────────────────────────────────────────────────────
    stories_resp = client.get("/api/v1/cultural-archives/stories?include_teasers=true")
    assert stories_resp.status_code == 200, stories_resp.text
    stories_data = stories_resp.json()
    assert isinstance(stories_data, list)
    assert len(stories_data) >= 1

    # Verify waveform extraction for approved public story
    first_story = stories_data[0]
    wf_resp = client.get(f"/api/v1/cultural-archives/stories/{first_story['story_id']}/waveform")
    assert wf_resp.status_code == 200, wf_resp.text
    wf_data = wf_resp.json()
    assert len(wf_data["peaks"]) == 56

    # ─────────────────────────────────────────────────────────────────────────
    # Module 5: Interactive Language Explorer & Dialect Cartography
    # ─────────────────────────────────────────────────────────────────────────
    phylo_resp = client.get("/api/v1/explorer/phylogenetic-tree")
    assert phylo_resp.status_code == 200
    phylo_data = phylo_resp.json()
    assert phylo_data["total_languages"] == 44

    carto_resp = client.get("/api/v1/explorer/dialect-cartography")
    assert carto_resp.status_code == 200
    carto_data = carto_resp.json()
    assert len(carto_data["dialects"]) >= 4

    morph_resp = client.get("/api/v1/explorer/morphological-graph")
    assert morph_resp.status_code == 200
    morph_data = morph_resp.json()
    assert morph_data["total_nodes"] >= 15

    # ─────────────────────────────────────────────────────────────────────────
    # Module 6: Advanced Learning Studio & Spaced Repetition (SRS)
    # ─────────────────────────────────────────────────────────────────────────
    learner_id = f"learner_e2e_{test_uid}"
    srs_resp = client.get(f"/api/v1/learning/srs/queue?learner_id={learner_id}&include_future=true")
    assert srs_resp.status_code == 200
    srs_cards = srs_resp.json()["cards"]
    assert len(srs_cards) >= 6

    # Submit flashcard recall review
    rev_resp = client.post(
        "/api/v1/learning/srs/review",
        json={"card_id": srs_cards[0]["card_id"], "learner_id": learner_id, "grade": 4},
    )
    assert rev_resp.status_code == 200
    assert rev_resp.json()["updated_leitner_box"] == 2

    # Syntax drill submission
    drill_sub = client.post(
        "/api/v1/learning/drills/submit",
        json={
            "learner_id": learner_id,
            "drill_id": "drill:gon:01_clan_reverence",
            "assembled_tokens": ["మావ", "సగా పెన్", "మరమ్", "పూజ", "కీతోమ్"],
        },
    )
    assert drill_sub.status_code == 200
    assert drill_sub.json()["is_correct"] is True

    # ─────────────────────────────────────────────────────────────────────────
    # Module 7: Institutional Command Center & Disaster Recovery
    # ─────────────────────────────────────────────────────────────────────────
    overview_resp = client.get("/api/v1/command-center/overview")
    assert overview_resp.status_code == 200
    ov_data = overview_resp.json()
    assert ov_data["status"] == "healthy"
    assert ov_data["preservation_summary"]["registered_languages"] == 44

    # Trigger atomic snapshot
    snap_resp = client.post(
        "/api/v1/command-center/backups/create",
        json={"reason": f"E2E Integration Snapshot {test_uid}", "triggered_by": "E2E Tester"},
    )
    assert snap_resp.status_code == 200
    snap_data = snap_resp.json()
    assert snap_data["size_bytes"] > 0
    assert len(snap_data["sha256_checksum"]) == 64

    # Cleanup test-created dictionary proposal
    import sqlite3

    db_path = os.path.join(BACKEND_DIR, "voice_roots.db")
    with sqlite3.connect(db_path) as conn:
        conn.execute("DELETE FROM dictionary WHERE word = ?", (f"test_word_{test_uid}",))
        conn.execute("DELETE FROM dictionary_fts WHERE word = ?", (f"test_word_{test_uid}",))
        conn.commit()


def test_security_penetration_sanitization_and_isolation(client):
    """Test SQL injection resistance and path traversal boundary shielding."""
    # 1. SQL injection in dictionary search
    malicious_query = "'; DROP TABLE dictionary; --"
    resp_dict_sql = client.get(f"/api/v1/dictionary/search?q={malicious_query}")
    assert resp_dict_sql.status_code == 200
    dict_res = resp_dict_sql.json()
    assert isinstance(dict_res.get("results"), list)

    # 2. SQL injection in knowledge graph search
    resp_kg_sql = client.get(f"/api/v1/kg/search?q={malicious_query}")
    assert resp_kg_sql.status_code == 200

    # 3. Path traversal attack on audio master storage
    resp_path_trav = client.get("/api/v1/cultural-archives/stories/../../etc/passwd/waveform")
    assert resp_path_trav.status_code in (400, 404, 403)

    # 4. Role elevation attempt on elder moderation
    resp_elev = client.post(
        "/api/v1/command-center/moderation/resolve",
        json={
            "item_type": "transcript",
            "item_id": "1",
            "decision": "APPROVE",
            "reviewer_name": "Attacker",
            "reviewer_role": "guest",
        },
    )
    assert resp_elev.status_code == 403


def test_zero_cloud_cost_and_offline_pwa_readiness(client):
    """Verify $0.00 cloud API spend and offline PWA resource integrity."""
    # Check command center spend report
    resp_ov = client.get("/api/v1/command-center/overview")
    assert resp_ov.status_code == 200
    cloud_spend = resp_ov.json()["security_governance"]["cloud_spend_target"]
    assert "$0.00" in cloud_spend

    # Check PWA manifest asset existence on frontend
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    manifest_path = os.path.join(root_dir, "frontend", "public", "manifest.json")
    sw_path = os.path.join(root_dir, "frontend", "public", "sw.js")

    assert os.path.isfile(manifest_path), "PWA manifest.json missing"
    assert os.path.isfile(sw_path), "PWA service worker sw.js missing"

    with open(manifest_path, encoding="utf-8") as f:
        manifest_content = f.read()
        assert "Voice Roots" in manifest_content
        assert "standalone" in manifest_content
