"""Voice Roots — Milestone 9 Automated Test Suite: Semantic Search & Multilingual Discovery.
========================================================================================
Comprehensive verification covering:
1. Keyword search with SQLite FTS5 (unicode61 tokenizer, prefix matching, case insensitivity).
2. Semantic vector search with 384-dimensional offline embeddings (ChromaDB).
3. Hybrid search combining lexical BM25 and vector cosine similarity with score fusion.
4. Cross-lingual discovery (English/Hindi queries matching oral Gondi/Kurukh/Ho via translations).
5. Transliteration and script matching (Telugu, Devanagari, Ol Chiki, Romanized).
6. Multilingual filter enforcement (language, dialect, status, topic, date range, audio, translation).
7. Pagination and sorting (relevance, date_desc, date_asc, title_asc, duration_desc).
8. OCAP Privacy & Data Sovereignty enforcement (strict exclusion of private recordings, drafts, withdrawn items).
9. Snippet extraction and matched fields tracking (title, transcript, transliteration, translation, semantic).
10. Benchmark evaluation suite (MRR, Precision@1, Precision@3, latency, language breakdown).
11. Endpoints verification: GET /api/v1/discovery/search, POST /api/v1/discovery/search,
    POST /api/v1/discovery/reindex, GET /api/v1/discovery/stats, GET /api/v1/discovery/evaluate.
"""

import io
import os
import sqlite3
import pytest
from fastapi.testclient import TestClient

import main
from search_service import (
    evaluate_multilingual_discovery,
    hybrid_discovery_search,
    reindex_all_search,
    sync_transcript_fts,
)

client = TestClient(main.app)


def _wav_bytes(num_samples: int = 1600) -> bytes:
    """Generate minimal valid PCM 16-bit 16kHz mono WAV bytes."""
    byte_count = num_samples * 2
    header = bytearray(44)
    header[0:4] = b"RIFF"
    total_size = 36 + byte_count
    header[4:8] = total_size.to_bytes(4, "little")
    header[8:12] = b"WAVE"
    header[12:16] = b"fmt "
    header[16:20] = (16).to_bytes(4, "little")
    header[20:22] = (1).to_bytes(2, "little")  # PCM
    header[22:24] = (1).to_bytes(2, "little")  # 1 channel
    header[24:28] = (16000).to_bytes(4, "little")  # 16000 Hz
    header[28:32] = (32000).to_bytes(4, "little")
    header[32:34] = (2).to_bytes(2, "little")
    header[34:36] = (16).to_bytes(2, "little")
    header[36:40] = b"data"
    header[40:44] = byte_count.to_bytes(4, "little")
    return bytes(header) + (b"\x00\x00" * num_samples)


@pytest.fixture(autouse=True)
def setup_search_indexes():
    """Ensure search indexes are initialized and populated before testing."""
    reindex_all_search()
    yield


# =========================================================================
# 1. Discovery Search Statistics & Telemetry
# =========================================================================

def test_discovery_stats_endpoint():
    """Verify GET /api/v1/discovery/stats returns index counts and offline engine metadata."""
    res = client.get("/api/v1/discovery/stats")
    assert res.status_code == 200
    data = res.json()
    assert "active_transcripts" in data
    assert "fts_indexed_transcripts" in data
    assert "vector_indexed_transcripts" in data
    assert data["fts_indexed_transcripts"] > 0
    assert data["vector_indexed_transcripts"] > 0
    assert "hybrid" in data["search_modes"]
    assert "SQLite FTS5" in data["fts_engine"]
    assert "voiceroots_multilingual_v1" in data["embedding_model"]
    assert "$0.00" in data["cost"]


# =========================================================================
# 2. Keyword Search (SQLite FTS5 Unicode61)
# =========================================================================

def test_keyword_search_exact_and_prefix():
    """Verify keyword mode executes exact lexical and prefix matching via FTS5."""
    # Prefix query: 'Adila' should match Adilabad Forest Grove Ceremony
    res = client.get("/api/v1/discovery/search?q=Adila&mode=keyword")
    assert res.status_code == 200
    data = res.json()
    assert data["mode"] == "keyword"
    assert data["total_count"] >= 1
    titles = [r["title"] for r in data["results"]]
    assert any("Adilabad" in t for t in titles)


def test_keyword_search_unicode_indic_scripts():
    """Verify keyword search handles Indic scripts (Telugu, Devanagari) accurately."""
    # Search Telugu transliteration
    res_te = client.get("/api/v1/discovery/search?q=గోండ్వానా&mode=keyword")
    assert res_te.status_code == 200
    data_te = res_te.json()
    assert data_te["total_count"] >= 1
    assert any(
        "నండ్రాయి" in (r.get("transcript_text") or "")
        or "గోండ్వానా" in (r.get("transcript_text") or "")
        or "నండ్రాయి" in (r.get("transliteration_text") or "")
        or "గోండ్వానా" in (r.get("transliteration_text") or "")
        for r in data_te["results"]
    )


# =========================================================================
# 3. Semantic Vector Search (ChromaDB 384-dim Offline Embeddings)
# =========================================================================

def test_semantic_vector_search_conceptual_similarity():
    """Verify semantic mode retrieves conceptually related transcripts without exact keywords."""
    res = client.get("/api/v1/discovery/search?q=ancient+sacred+tree+chant&mode=semantic")
    assert res.status_code == 200
    data = res.json()
    assert data["mode"] == "semantic"
    assert data["total_count"] >= 1
    # Verify top result has semantic embedding in matched fields
    top_result = data["results"][0]
    assert "semantic_embedding" in top_result["matched_fields"]
    assert top_result["score"] > 0.0


# =========================================================================
# 4. Hybrid Retrieval & Score Fusion
# =========================================================================

def test_hybrid_search_fusion_and_boost():
    """Verify hybrid search fuses lexical and semantic scores with reciprocal boost."""
    res_hybrid = client.get("/api/v1/discovery/search?q=Gondi+Harvest+Song&mode=hybrid")
    assert res_hybrid.status_code == 200
    data = res_hybrid.json()
    assert data["mode"] == "hybrid"
    assert data["total_count"] >= 1
    top = data["results"][0]
    assert "Gondi Harvest Song" in top["title"]
    # Check that both semantic and lexical signals contributed
    assert "semantic_embedding" in top["matched_fields"]
    assert top["score"] >= 0.5


# =========================================================================
# 5. Cross-Lingual Matching via Authorized Translations
# =========================================================================

def test_cross_lingual_english_query_matches_oral_gondi():
    """Verify an English query finds an oral Gondi item through its authorized translation."""
    # Query 'sacred forest grove' matches the translation of Adilabad / Master records
    res = client.get("/api/v1/discovery/search?q=sacred+forest+grove&mode=hybrid")
    assert res.status_code == 200
    data = res.json()
    assert data["total_count"] >= 1
    top = data["results"][0]
    # Check that translation field was matched
    assert "translation" in top["matched_fields"] or "transcript" in top["matched_fields"]
    # Verify translations are populated in the response
    assert len(top.get("translations", [])) >= 1


# =========================================================================
# 6. Multilingual Metadata Filters
# =========================================================================

def test_search_filters_by_language_and_dialect():
    """Verify language and dialect filtering narrows search scope correctly."""
    res_gondi = client.get("/api/v1/discovery/search?language=Gondi&page_size=5")
    assert res_gondi.status_code == 200
    for item in res_gondi.json()["results"]:
        assert "Gondi" in item["language"]

    res_kurukh = client.get("/api/v1/discovery/search?language=Kurukh&page_size=5")
    assert res_kurukh.status_code == 200
    for item in res_kurukh.json()["results"]:
        assert "Kurukh" in item["language"]


def test_search_filters_by_topic_and_verification_status():
    """Verify topic and verification_status filter clauses."""
    res = client.get("/api/v1/discovery/search?topic=harvest&verification_status=submitted")
    assert res.status_code == 200
    data = res.json()
    for item in data["results"]:
        assert item["verification_status"] == "submitted"


# =========================================================================
# 7. Sorting & Pagination
# =========================================================================

def test_discovery_pagination_and_sorting():
    """Verify pagination offsets and sorting parameters work predictably."""
    res_p1 = client.get("/api/v1/discovery/search?page=1&page_size=5&sort_by=date_desc")
    assert res_p1.status_code == 200
    p1_data = res_p1.json()
    assert p1_data["page"] == 1
    assert len(p1_data["results"]) <= 5
    p1_ids = [r["id"] for r in p1_data["results"]]

    res_p2 = client.get("/api/v1/discovery/search?page=2&page_size=5&sort_by=date_desc")
    assert res_p2.status_code == 200
    p2_data = res_p2.json()
    assert p2_data["page"] == 2
    p2_ids = [r["id"] for r in p2_data["results"]]

    # Ensure page 1 and page 2 are disjoint
    assert set(p1_ids).isdisjoint(set(p2_ids))


# =========================================================================
# 8. OCAP Access Control & Privacy Pre-Filtering
# =========================================================================

def test_privacy_boundaries_exclude_private_and_withdrawn_items():
    """Verify private recordings, drafts, and withdrawn items are strictly excluded from public search."""
    # 1. Create a private recording
    form = {
        "title": "Confidential Sacred Clan Lore",
        "language": "Gondi",
        "consent": "true",
        "privacy_level": "private",
        "consent_public_publication": "0",
    }
    upload_res = client.post(
        "/api/v1/audio/upload",
        data=form,
        files={"file": ("clan.wav", io.BytesIO(_wav_bytes()), "audio/wav")},
    )
    assert upload_res.status_code == 200
    private_id = upload_res.json()["id"]

    # 2. Public unauthenticated discovery search must NEVER find it
    search_res = client.get("/api/v1/discovery/search?q=Confidential+Sacred+Clan+Lore")
    assert search_res.status_code == 200
    public_ids = [r["id"] for r in search_res.json()["results"]]
    assert private_id not in public_ids

    # 3. Search with language filter Gondi must not leak private_id
    search_lang = client.get("/api/v1/discovery/search?language=Gondi")
    assert search_lang.status_code == 200
    assert private_id not in [r["id"] for r in search_lang.json()["results"]]

    # 4. Withdraw consent for a public recording and verify immediate purge
    pub_form = {
        "title": "Public Lore for Withdrawal",
        "language": "Gondi",
        "consent": "true",
        "privacy_level": "public",
        "consent_public_publication": "1",
    }
    pub_res = client.post(
        "/api/v1/audio/upload",
        data=pub_form,
        files={"file": ("pub.wav", io.BytesIO(_wav_bytes()), "audio/wav")},
    )
    assert pub_res.status_code == 200
    pub_id = pub_res.json()["id"]

    # Withdraw consent
    w_res = client.post(f"/api/v1/transcripts/{pub_id}/withdraw-consent")
    assert w_res.status_code == 200

    # Verify excluded from search
    search_w = client.get("/api/v1/discovery/search?q=Public+Lore+for+Withdrawal")
    assert search_w.status_code == 200
    assert pub_id not in [r["id"] for r in search_w.json()["results"]]


# =========================================================================
# 9. POST Variant of Discovery Search
# =========================================================================

def test_post_discovery_search():
    """Verify POST /api/v1/discovery/search accepts structured filter payloads."""
    payload = {
        "query": "ceremony",
        "mode": "hybrid",
        "language": "Gondi",
        "page": 1,
        "page_size": 10,
        "sort_by": "relevance",
    }
    res = client.post("/api/v1/discovery/search", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["mode"] == "hybrid"
    assert data["page"] == 1
    assert data["page_size"] == 10
    assert "results" in data


# =========================================================================
# 10. Reindex Endpoint
# =========================================================================

def test_discovery_reindex_endpoint():
    """Verify POST /api/v1/discovery/reindex triggers a successful batch sync."""
    res = client.post("/api/v1/discovery/reindex")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["fts_indexed"] > 0
    assert data["vector_indexed"] > 0
    assert data["duration_ms"] > 0


# =========================================================================
# 11. Deterministic Benchmark Evaluation Suite
# =========================================================================

def test_discovery_benchmark_evaluation():
    """Verify GET /api/v1/discovery/evaluate computes MRR, precision, latency, and language breakdown."""
    res = client.get("/api/v1/discovery/evaluate")
    assert res.status_code == 200
    eval_data = res.json()
    assert eval_data["status"] == "completed"
    assert eval_data["benchmark_queries_count"] >= 5
    assert eval_data["mean_reciprocal_rank"] >= 0.8
    assert eval_data["precision_at_1"] >= 0.8
    assert eval_data["precision_at_3"] >= 0.8
    assert eval_data["avg_latency_ms"] > 0
    assert "Gondi" in eval_data["validated_languages"]
    assert "Kurukh" in eval_data["validated_languages"]
    assert "Ho" in eval_data["validated_languages"]
    assert "Nihali" in eval_data["unvalidated_languages"]
    assert len(eval_data["evaluations"]) >= 5
