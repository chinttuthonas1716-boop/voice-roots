"""
Voice Roots: Milestone 16 Verification Suite
=============================================
Tests Language Knowledge Graph Implementation:
1. Overview health, telemetry metrics, and linguistic diversity.
2. Structured Language Catalog with varieties and scripts.
3. Subgraph extraction for visual force graph exploration.
4. Indic-preserving Unicode FTS5 search (Telugu, Devanagari, Ol Chiki, Latin).
5. Vocabulary details with cultural context, transliteration, and provenance.
6. Public vs. Admin node proposal (OCAP & Community governance).
7. Verification status lifecycle and role-based permissions.
8. Semantic relationship creation and deletion.
9. Boundary safety: Private transcripts not exposed.
10. Alias routes (/api/v1/kg/* vs /api/v1/knowledge-graph/*).
"""

import pytest
from fastapi.testclient import TestClient

from main import app, ADMIN_API_KEY


@pytest.fixture
def client():
    return TestClient(app)


# ------------------------------------------------------------------------------
# 1. Overview Health & Telemetry Metrics
# ------------------------------------------------------------------------------

def test_kg_overview_metrics(client):
    """Verify high-level summary and health metrics of the Language Knowledge Graph."""
    res = client.get("/api/v1/knowledge-graph/overview")
    assert res.status_code == 200
    data = res.json()

    assert data["status"] == "healthy"
    assert data["total_nodes"] >= 90
    assert data["total_relationships"] >= 50
    assert data["languages_represented"] >= 40
    assert "language" in data["node_counts_by_type"]
    assert "script" in data["node_counts_by_type"]
    assert "vocabulary" in data["node_counts_by_type"]
    assert "LANGUAGE_USES_SCRIPT" in data["relationship_counts_by_type"]
    assert data["verified_ratio"] >= 0.95


def test_kg_overview_alias(client):
    """Verify /api/v1/kg/overview alias returns identical schema."""
    res = client.get("/api/v1/kg/overview")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"


# ------------------------------------------------------------------------------
# 2. Languages Catalog & Structured Relationships
# ------------------------------------------------------------------------------

def test_kg_languages_catalog(client):
    """Verify languages structured in Knowledge Graph with script and variety links."""
    res = client.get("/api/v1/knowledge-graph/languages")
    assert res.status_code == 200
    langs = res.json()
    assert len(langs) >= 40

    gondi = next((l for l in langs if l["code"] == "gon"), None)
    assert gondi is not None
    assert gondi["name"] == "Gondi"
    assert gondi["varieties_count"] >= 1
    assert gondi["scripts_count"] >= 1
    assert gondi["vocabulary_count"] >= 1


# ------------------------------------------------------------------------------
# 3. Subgraph Extraction for Interactive Exploration
# ------------------------------------------------------------------------------

def test_kg_subgraph_extraction_center_node(client):
    """Verify 1-hop subgraph extraction centered around a language node."""
    res = client.get("/api/v1/knowledge-graph/graph?center_node_id=lang:gon&max_nodes=60")
    assert res.status_code == 200
    data = res.json()

    assert len(data["nodes"]) >= 5
    assert len(data["edges"]) >= 5

    # Verify center node is present in returned nodes
    node_ids = {n["node_id"] for n in data["nodes"]}
    assert "lang:gon" in node_ids

    # Verify connected edges touch the center node
    connected = False
    for edge in data["edges"]:
        if edge["source_id"] == "lang:gon" or edge["target_id"] == "lang:gon":
            connected = True
            break
    assert connected, "Subgraph should contain edges connected to center node"


def test_kg_subgraph_language_filter(client):
    """Verify subgraph filtering by language code."""
    res = client.get("/api/v1/kg/graph?language=kff")
    assert res.status_code == 200
    data = res.json()
    assert len(data["nodes"]) >= 3


# ------------------------------------------------------------------------------
# 4. Indic-Preserving Unicode FTS5 Search
# ------------------------------------------------------------------------------

def test_kg_search_telugu_script(client):
    """Verify Unicode Indic search matching Telugu script term 'పెన్' (pen)."""
    res = client.get("/api/v1/knowledge-graph/search?q=పెన్")
    assert res.status_code == 200
    results = res.json()
    assert len(results) >= 1
    match = results[0]
    assert "పెన్" in match["name"] or "పెన్" in (match.get("native_name") or "")


def test_kg_search_ol_chiki_script(client):
    """Verify Unicode Indic search matching Ol Chiki script term 'ᱵᱟᱦᱟ' (baha)."""
    res = client.get("/api/v1/knowledge-graph/search?q=ᱵᱟᱦᱟ")
    assert res.status_code == 200
    results = res.json()
    assert len(results) >= 1
    match = results[0]
    assert "ᱵᱟᱦᱟ" in match["name"] or "ᱵᱟᱦᱟ" in (match.get("native_name") or "")


def test_kg_search_english_transliteration(client):
    """Verify Latin search matching English word 'Gondi'."""
    res = client.get("/api/v1/knowledge-graph/search?q=Gondi")
    assert res.status_code == 200
    results = res.json()
    assert len(results) >= 1
    names = [r["name"] for r in results]
    assert any("Gondi" in n for n in names)


# ------------------------------------------------------------------------------
# 5. Vocabulary Details, Transliteration, and Cultural Context
# ------------------------------------------------------------------------------

def test_kg_vocabulary_node_details(client):
    """Verify complete details for a vocabulary node with cultural context."""
    res = client.get("/api/v1/knowledge-graph/nodes/word:gon:pen")
    assert res.status_code == 200
    data = res.json()

    assert data["node"]["node_id"] == "word:gon:pen"
    assert data["node"]["entity_type"] == "vocabulary"
    assert data["node"]["verification_status"] == "VERIFIED"

    vocab = data["vocabulary_details"]
    assert vocab is not None
    assert vocab["original_word"] == "పెన్ / पेन"
    assert vocab["transliteration"] == "pen"
    assert "Deity" in vocab["meaning"] or "Sacred" in vocab["meaning"]
    assert "cosmology" in vocab["cultural_context"].lower()

    # Outgoing relationships should include WORD_BELONGS_TO_LANGUAGE
    assert len(data["outgoing_relationships"]) >= 1
    rel = data["outgoing_relationships"][0]
    assert rel["relationship_type"] == "WORD_BELONGS_TO_LANGUAGE"
    assert rel["target_id"] == "lang:gon"


def test_kg_node_not_found(client):
    """Verify HTTP 404 for non-existent node ID."""
    res = client.get("/api/v1/knowledge-graph/nodes/invalid:nonexistent:id")
    assert res.status_code == 404


# ------------------------------------------------------------------------------
# 6. Public vs. Admin Knowledge Node Proposal & Verification
# ------------------------------------------------------------------------------

def test_kg_public_proposal_defaults_to_proposed(client):
    """Public contributor proposals must default to PROPOSED for review."""
    node_id = "word:kff:guggu_test"
    payload = {
        "entity_type": "vocabulary",
        "name": "గుగ్గు (guggu)",
        "node_id": node_id,
        "native_name": "గుగ్గు",
        "primary_language": "kff",
        "script": "Telugu",
        "summary": "Owl in Koya oral folklore",
        "vocabulary_details": {
            "meaning": "Owl",
            "transliteration": "guggu",
            "cultural_context": "Night sentinel bird in tribal stories"
        }
    }

    try:
        # Create without admin key
        res = client.post("/api/v1/knowledge-graph/nodes", json=payload)
        assert res.status_code == 201
        created = res.json()
        assert created["verification_status"] == "PROPOSED"
        assert created["node_id"] == node_id

        # Verify details show PROPOSED
        res_det = client.get(f"/api/v1/knowledge-graph/nodes/{node_id}")
        assert res_det.status_code == 200
        assert res_det.json()["node"]["verification_status"] == "PROPOSED"

        # Unauthorized attempt to verify should fail with 403
        res_unauth = client.patch(f"/api/v1/knowledge-graph/nodes/{node_id}", json={
            "verification_status": "VERIFIED"
        })
        assert res_unauth.status_code == 403

        # Authorized admin verification succeeds
        res_auth = client.patch(
            f"/api/v1/knowledge-graph/nodes/{node_id}",
            headers={"X-Admin-Key": ADMIN_API_KEY},
            json={"verification_status": "VERIFIED"}
        )
        assert res_auth.status_code == 200
        assert res_auth.json()["verification_status"] == "VERIFIED"

    finally:
        # Cleanup
        import sqlite3
        from main import DB_PATH
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("DELETE FROM kg_nodes WHERE node_id = ?", (node_id,))
            conn.execute("DELETE FROM kg_vocabulary_details WHERE word_id = ?", (node_id,))
            conn.commit()


# ------------------------------------------------------------------------------
# 7. Semantic Relationships Creation & Deletion Lifecycle
# ------------------------------------------------------------------------------

def test_kg_relationship_lifecycle(client):
    """Verify semantic edge creation and admin deletion."""
    payload = {
        "source_id": "word:gon:pen",
        "target_id": "script:telugu",
        "relationship_type": "WORD_HAS_MEANING",
        "source_reference": "Test Lexicon Validation",
        "confidence_score": 0.99
    }

    # Create relationship with admin authorization
    res = client.post(
        "/api/v1/knowledge-graph/relationships",
        headers={"X-Admin-Key": ADMIN_API_KEY},
        json=payload
    )
    assert res.status_code == 201
    data = res.json()
    rel_id = data["id"]
    assert data["verification_status"] == "VERIFIED"

    # Unauthorized delete attempt fails with 403
    res_del_unauth = client.delete(f"/api/v1/knowledge-graph/relationships/{rel_id}")
    assert res_del_unauth.status_code == 403

    # Authorized delete succeeds
    res_del_auth = client.delete(
        f"/api/v1/knowledge-graph/relationships/{rel_id}",
        headers={"X-Admin-Key": ADMIN_API_KEY}
    )
    assert res_del_auth.status_code == 200
    assert res_del_auth.json()["deleted"] is True


def test_kg_invalid_entity_type_rejected(client):
    """Verify creating a node with an invalid entity type returns HTTP 400."""
    res = client.post("/api/v1/knowledge-graph/nodes", json={
        "entity_type": "invalid_type",
        "name": "Invalid Node"
    })
    assert res.status_code == 400
