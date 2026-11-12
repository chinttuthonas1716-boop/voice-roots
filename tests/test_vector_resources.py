"""Test suite for ChromaDB Vector Store, Semantic Search & Language Registry."""

import pytest
from fastapi.testclient import TestClient

import main
from language_registry import get_all_capabilities, get_capability_by_name_or_code
from vector_store import (
    get_vector_stats,
    search_resources,
    upsert_resources,
)

client = TestClient(main.app)


def test_language_capability_registry():
    capabilities = get_all_capabilities()
    assert len(capabilities) >= 13
    codes = {c["code"] for c in capabilities}
    # All 13 core languages must be present
    assert {"gon", "kff", "sat", "lmn", "te", "hi", "en", "ta", "kn", "ml", "mr", "or", "bn"}.issubset(codes)
    # Universal world languages must also be present
    assert {"qu", "sw", "es", "ar"}.issubset(codes)

    # Gondi & Koya must be honestly marked
    gondi = get_capability_by_name_or_code("Gondi")
    assert gondi is not None
    assert gondi["speech_recognition"] == "experimental"
    assert gondi["translation"] == "restricted"
    assert "oral" in gondi["known_limitations"].lower()

    koya = get_capability_by_name_or_code("kff")
    assert koya is not None
    assert koya["name"] == "Koya"
    assert koya["translation"] == "restricted"


def test_languages_capabilities_endpoint():
    res = client.get("/api/v1/languages/capabilities")
    assert res.status_code == 200
    data = res.json()
    assert "languages" in data
    assert len(data["languages"]) >= 13
    endpoint_codes = {c["code"] for c in data["languages"]}
    assert {"gon", "kff", "sat", "lmn", "te", "hi", "en"}.issubset(endpoint_codes)


def test_resources_health_endpoint():
    res = client.get("/api/v1/resources/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["vector_engine"] == "chromadb"
    assert data["collection"] == "language_resources"
    assert data["indexed_records"] >= 18


def test_resources_stats_endpoint():
    res = client.get("/api/v1/resources/stats")
    assert res.status_code == 200
    data = res.json()
    assert data["total_records"] >= 18
    assert "Gondi" in data["languages_indexed"]
    assert "Koya" in data["languages_indexed"]
    assert "Santhali" in data["languages_indexed"]
    assert "Telugu" in data["languages_indexed"]
    assert data["embedding_dimensions"] == 384


def test_semantic_search_with_query_and_language_filter():
    # Query for Gondi Mahua sacred tree
    res = client.post(
        "/api/v1/resources/search",
        json={"query": "Mahua tree sacred saga", "language": "Gondi"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["count"] >= 1
    top = data["resources"][0]
    assert top["language"] == "Gondi"
    assert "Maikal Hills" in top["source_title"] or "Mahua" in top["search_text"]
    assert "document_id" in top
    assert "source_url" in top
    assert "license" in top
    assert "similarity_score" in top
    assert top["similarity_score"] > 0


def test_semantic_search_empty_query_rejected():
    res = client.post("/api/v1/resources/search", json={"query": "   "})
    assert res.status_code == 400


def test_semantic_search_koya_traditional_medicine():
    res = client.post(
        "/api/v1/resources/search",
        json={"query": "forest herbs healing roots", "language": "Koya"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["count"] >= 1
    top = data["resources"][0]
    assert top["language"] == "Koya"
    assert "traditional_medicine" in top["document_type"] or "Godavari" in top["search_text"]


def test_semantic_search_santhali_sal_blossom():
    res = client.post(
        "/api/v1/resources/search",
        json={"query": "Baha festival Sal blossoms", "language": "Santhali"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["count"] >= 1
    top = data["resources"][0]
    assert top["language"] == "Santhali"
    assert "festival_chant" in top["document_type"] or "Baha" in top["search_text"]


def test_ingest_idempotency_does_not_duplicate_records():
    stats_before = get_vector_stats()
    count_before = stats_before["total_records"]

    # Re-ingest the same test document
    sample_doc = [{
        "document_id": "test-idempotent-doc-1",
        "language": "Telugu",
        "language_code": "te",
        "dialect": "Coastal",
        "text_original": "సముద్ర తీర జాలరుల జానపద పాట.",
        "text_translation": "Folk ballad of coastal seafaring fishermen.",
        "document_type": "folk_song",
        "source_title": "Coastal Telugu Folk Archive",
        "source_url": "https://ai4bharat.iitm.ac.in/",
        "license": "CC BY 4.0",
        "attribution": "Voice Roots Research",
        "consent_status": "Consented Archive",
        "verification_status": "Human Verified",
        "checksum": "abc123hash",
        "created_at": "2026-10-12T00:00:00Z",
    }]

    # Ingest twice
    upsert_resources(sample_doc)
    stats_after_1 = get_vector_stats()

    upsert_resources(sample_doc)
    stats_after_2 = get_vector_stats()

    # Second upsert should not change count
    assert stats_after_1["total_records"] == stats_after_2["total_records"]
    assert stats_after_2["total_records"] == count_before + 1

    # Search for the newly ingested doc
    found = search_resources("coastal seafaring fishermen", language="Telugu")
    assert any(d["document_id"] == "test-idempotent-doc-1" for d in found)

    # Clean up test doc
    from vector_store import delete_resource
    assert delete_resource("test-idempotent-doc-1") is True
    stats_final = get_vector_stats()
    assert stats_final["total_records"] == count_before


def test_community_contribution_and_elder_moderation_queue():
    """Verify community submission, elder moderation approval into ChromaDB, and rejection isolation."""
    from vector_store import delete_resource

    # 1. Submit clearly marked test word
    payload = {
        "submission_type": "vocabulary",
        "language_code": "kff",
        "language_name": "Koya",
        "dialect": "Bhadradri Godavari",
        "term_or_text": "గంగిరెద్దు (Gangireddu - TEST ENTRY)",
        "translation_text": "Traditional ceremonial bull associated with festive harvest lore",
        "cultural_context": "Haridasu festive harvest tradition in Koya tribal regions",
        "contributor_name": "Voice Roots Community Tester",
        "license": "CC BY 4.0",
        "attribution": "ITDA Bhadrachalam Community Field Test",
        "speaker_consent_given": True,
        "is_sacred_or_restricted": False,
    }
    res = client.post("/api/v1/resources/submit", json=payload)
    assert res.status_code == 200
    sub = res.json()
    sub_id = sub["id"]
    assert sub["status"] == "pending_verification"
    assert sub["language_code"] == "kff"
    assert sub["attribution"] == payload["attribution"]

    # 2. Verify it cannot be found in ChromaDB search prior to approval
    search_pre = client.post("/api/v1/resources/search", json={"query": "Gangireddu ceremonial bull"})
    assert search_pre.status_code == 200
    matches_pre = [r for r in search_pre.json()["resources"] if r.get("document_id") == f"sub_{sub_id}_kff"]
    assert len(matches_pre) == 0

    # 3. Approve via moderation workflow
    res_mod = client.patch(
        f"/api/v1/resources/submissions/{sub_id}/moderate",
        json={"status": "verified", "reviewer_notes": "Council Elder verified harvest terminology."},
    )
    assert res_mod.status_code == 200
    mod_data = res_mod.json()
    assert mod_data["status"] == "verified"

    # 4. Confirm searchable in ChromaDB with complete provenance
    search_post = client.post("/api/v1/resources/search", json={"query": "Gangireddu ceremonial bull"})
    assert search_post.status_code == 200
    matches_post = [r for r in search_post.json()["resources"] if r.get("document_id") == f"sub_{sub_id}_kff"]
    assert len(matches_post) == 1
    top = matches_post[0]
    assert "Gangireddu" in top["search_text"]
    assert "Voice Roots Community Tester" in top["attribution"]
    assert top["license"] == "CC BY 4.0"
    assert top["verification_status"] == "community_verified"

    # 5. Test rejection workflow
    reject_payload = {
        "submission_type": "vocabulary",
        "language_code": "kff",
        "language_name": "Koya",
        "dialect": "Bhadradri",
        "term_or_text": "బావా (Bava - TEST REJECT ENTRY)",
        "translation_text": "Kinship cousin term",
        "cultural_context": "Kinship test entry",
        "contributor_name": "Test Contributor",
        "license": "CC BY 4.0",
        "attribution": "Test Field Notes",
        "speaker_consent_given": True,
        "is_sacred_or_restricted": False,
    }
    res_rej_sub = client.post("/api/v1/resources/submit", json=reject_payload)
    assert res_rej_sub.status_code == 200
    rej_id = res_rej_sub.json()["id"]

    res_rej_mod = client.patch(
        f"/api/v1/resources/submissions/{rej_id}/moderate",
        json={"status": "rejected", "reviewer_notes": "Rejected: Incomplete community provenance"},
    )
    assert res_rej_mod.status_code == 200
    assert res_rej_mod.json()["status"] == "rejected"

    # Confirm rejected entry is NOT in ChromaDB
    search_rej = client.post("/api/v1/resources/search", json={"query": "Bava kinship cousin"})
    assert search_rej.status_code == 200
    matches_rej = [r for r in search_rej.json()["resources"] if r.get("document_id") == f"sub_{rej_id}_kff"]
    assert len(matches_rej) == 0

    # Clean up test entries from ChromaDB
    delete_resource(f"sub_{sub_id}_kff")
    delete_resource(f"sub_{rej_id}_kff")

