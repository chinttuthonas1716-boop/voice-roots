"""Milestone 27: Module 3 — Grounded AI Assistant & Archive RAG Test Suite

Verifies:
1. Offline vector sync across approved cultural stories, dictionary entries, and transcripts into ChromaDB.
2. Grounded question answering citing verified community archives with clickable citation pills.
3. Strict epistemic guardrails separating verified community lore from AI hypotheses.
4. OCAP sacred lore shielding (SACRED_ELDER_ONLY masked from unauthenticated users).
5. Zero cloud API spend constraint ($0.00).
6. FastAPI REST endpoints (/api/v1/assistant/query, /suggestions, /rag-stats, /sync-index).
"""

import os
import sys

import pytest
from fastapi.testclient import TestClient

# Ensure backend directory is in python search path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

import archive_rag_service
from main import app


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


def test_rag_sync_all_archives():
    """Verify offline vector synchronization over cultural stories, dictionary, and transcripts."""
    counts = archive_rag_service.sync_all_archives_to_vector_store()
    assert counts["cultural_stories"] >= 4, f"Expected at least 4 stories, got {counts['cultural_stories']}"
    assert counts["dictionary"] >= 20, f"Expected at least 20 dictionary terms, got {counts['dictionary']}"
    assert counts["transcripts"] >= 10, f"Expected transcripts to be indexed, got {counts['transcripts']}"
    assert counts["total"] >= 34


def test_grounded_answer_with_citations(client):
    """Verify answer synthesis with source citation pills for Gondi, Santhali, and Lambadi."""
    # 1. Query for Gondi Persapen
    res_gon = archive_rag_service.generate_grounded_answer(
        "What is the cultural role and sacred significance of Persapen in Gondi clan tradition?"
    )
    assert res_gon.epistemic_status in ("VERIFIED_ARCHIVE_GROUNDED", "PARTIALLY_GROUNDED")
    assert len(res_gon.citations) >= 1
    assert any("persapen" in c["title"].lower() or "persapen" in c["excerpt"].lower() for c in res_gon.citations)
    assert len(res_gon.verified_knowledge) >= 1
    assert "[CITE-1]" in res_gon.answer

    # 2. Query for Santhali Sarjom
    res_sat = archive_rag_service.generate_grounded_answer(
        "What is the meaning of Sarjom and its role in the Santhal Baha festival?"
    )
    assert res_sat.epistemic_status in ("VERIFIED_ARCHIVE_GROUNDED", "PARTIALLY_GROUNDED")
    assert len(res_sat.citations) >= 1
    assert any("sarjom" in c["title"].lower() or "sarjom" in c["excerpt"].lower() for c in res_sat.citations)

    # 3. Query for Lambadi Tanda
    res_lmn = archive_rag_service.generate_grounded_answer(
        "What is the tanda in traditional Lambadi Banjara heritage?"
    )
    assert res_lmn.epistemic_status in ("VERIFIED_ARCHIVE_GROUNDED", "PARTIALLY_GROUNDED")
    assert len(res_lmn.citations) >= 1
    assert any("tanda" in c["title"].lower() or "tanda" in c["excerpt"].lower() for c in res_lmn.citations)


def test_strict_epistemic_guardrail_unattested():
    """Verify epistemic guardrail returns UNATTESTED and 0 citations for topics absent from archives."""
    unattested_query = "Quantum mechanical wavefunctions in solid state semiconductor devices"
    res = archive_rag_service.generate_grounded_answer(unattested_query)

    assert res.epistemic_status == "UNATTESTED"
    assert res.confidence_score == 0.0
    assert len(res.citations) == 0
    assert "will not synthesize or hallucinate" in res.answer or "not currently attested" in res.answer or "no approved oral recordings" in res.answer


def test_ocap_sacred_lore_shielding():
    """Verify sacred ceremonial content (SACRED_ELDER_ONLY) is shielded from unauthenticated users."""
    sacred_query = "Secret Totem Rites of the Four-Fold Saga Phratries"

    # Public unauthenticated caller
    res_public = archive_rag_service.generate_grounded_answer(
        sacred_query, user_roles=[], is_authenticated=False
    )
    public_source_ids = [c["source_id"] for c in res_public.citations]
    assert not any("sacred_totem" in sid for sid in public_source_ids), "Sacred lore leaked to public user!"

    # Verified Elder caller
    res_elder = archive_rag_service.generate_grounded_answer(
        sacred_query, user_roles=["elder"], is_authenticated=True
    )
    elder_source_ids = [c["source_id"] for c in res_elder.citations]
    assert any("sacred_totem" in sid for sid in elder_source_ids), "Sacred lore unexpectedly withheld from verified elder!"


def test_zero_cloud_spend_and_telemetry():
    """Verify local zero-cloud operation telemetry reporting $0.00 spend."""
    telemetry = archive_rag_service.get_assistant_telemetry()
    assert telemetry["cloud_spend"] == "$0.00"
    assert "100% offline" in telemetry["embedding_model"]
    assert telemetry["embedding_dimensions"] == 384
    assert telemetry["database_counts"]["approved_dictionary_entries"] >= 20
    assert telemetry["database_counts"]["approved_cultural_stories"] >= 4


def test_assistant_api_endpoints(client):
    """Verify FastAPI assistant endpoints respond with valid schemas."""
    # 1. POST /api/v1/assistant/query
    query_resp = client.post(
        "/api/v1/assistant/query",
        json={"query": "What is the cultural role of Persapen in Gondi clans?", "max_citations": 4},
    )
    assert query_resp.status_code == 200
    q_data = query_resp.json()
    assert "answer" in q_data
    assert "epistemic_status" in q_data
    assert "citations" in q_data
    assert "verified_knowledge" in q_data
    assert "ai_hypothesis" in q_data
    assert q_data["epistemic_status"] in ("VERIFIED_ARCHIVE_GROUNDED", "PARTIALLY_GROUNDED")

    # 2. GET /api/v1/assistant/suggestions
    sugg_resp = client.get("/api/v1/assistant/suggestions")
    assert sugg_resp.status_code == 200
    s_data = sugg_resp.json()
    assert s_data["status"] == "success"
    assert len(s_data["suggestions"]) >= 4

    # 3. GET /api/v1/assistant/rag-stats
    stats_resp = client.get("/api/v1/assistant/rag-stats")
    assert stats_resp.status_code == 200
    stats_data = stats_resp.json()
    assert stats_data["cloud_spend"] == "$0.00"
    assert "database_counts" in stats_data

    # 4. POST /api/v1/assistant/sync-index
    sync_resp = client.post("/api/v1/assistant/sync-index")
    assert sync_resp.status_code == 200
    assert sync_resp.json()["status"] == "success"
