"""Voice Roots: Milestone 29 — Interactive Language Explorer Test Suite.
=============================================================================
Tests phylogenetic family trees, dialect cartography, morphological cognate graphs,
and objective community-grounded vitality indicators across all 44 registered languages.
"""

import os
import sys

import pytest
from fastapi.testclient import TestClient

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from main import app  # noqa: E402


@pytest.fixture
def client():
    return TestClient(app)


def test_phylogenetic_tree_structure_and_coverage(client):
    """Verify phylogenetic tree contains all 44 languages across 5 macro-families."""
    resp = client.get("/api/v1/explorer/phylogenetic-tree")
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["status"] == "success"
    assert data["total_registered_languages"] == 44
    assert len(data["families"]) == 5

    family_names = [f["name"] for f in data["families"]]
    assert any("Dravidian" in name for name in family_names)
    assert any("Austroasiatic" in name for name in family_names)
    assert any("Indo-Aryan" in name for name in family_names)
    assert any("Indigenous" in name for name in family_names)
    assert any("World" in name for name in family_names)

    # Flatten languages across all families
    all_codes = set()
    for fam in data["families"]:
        for subfam in fam["subfamilies"]:
            for lang in subfam["languages"]:
                all_codes.add(lang["code"])

    assert "gon" in all_codes  # Gondi
    assert "kff" in all_codes  # Koya
    assert "sat" in all_codes  # Santhali
    assert "lmn" in all_codes  # Lambadi
    assert "te" in all_codes   # Telugu
    assert "ta" in all_codes   # Tamil
    assert "en" in all_codes   # English
    assert len(all_codes) == 44


def test_dravidian_dialect_relationships(client):
    """Verify Central, South-Central, and South Dravidian subfamilies and regional varieties."""
    resp = client.get("/api/v1/explorer/phylogenetic-tree")
    assert resp.status_code == 200
    data = resp.json()

    dravidian = next(f for f in data["families"] if "Dravidian" in f["name"])
    subfams = {s["id"]: s for s in dravidian["subfamilies"]}

    assert "subfamily:central_dravidian" in subfams
    assert "subfamily:south_central_dravidian" in subfams
    assert "subfamily:south_dravidian" in subfams

    # Central Dravidian must have Gondi varieties
    central = subfams["subfamily:central_dravidian"]
    assert "gon" in [l["code"] for l in central["languages"]]
    gondi_varieties = central.get("varieties", [])
    variety_ids = [v["id"] for v in gondi_varieties]
    assert "variety:gon:adilabad" in variety_ids
    assert "variety:gon:betul" in variety_ids
    assert "variety:gon:bastar_maria" in variety_ids

    # South-Central Dravidian must have Koya and Telugu
    south_central = subfams["subfamily:south_central_dravidian"]
    sc_codes = [l["code"] for l in south_central["languages"]]
    assert "kff" in sc_codes
    assert "te" in sc_codes
    koya_varieties = [v["id"] for v in south_central.get("varieties", [])]
    assert "variety:kff:godavari" in koya_varieties
    assert "variety:kff:malkangiri" in koya_varieties


def test_dialect_cartography_endpoints_and_coordinates(client):
    """Verify geo-spatial dialect cartography covering primary oral languages."""
    resp = client.get("/api/v1/explorer/dialect-cartography")
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["status"] == "success"
    languages = data["languages"]
    assert "gondi" in languages
    assert "koya" in languages
    assert "santhali" in languages
    assert "lambadi" in languages

    for lang_key in ["gondi", "koya", "santhali", "lambadi"]:
        lang_data = languages[lang_key]
        assert lang_data["census_speakers"] > 0
        assert len(lang_data["varieties"]) > 0

        for var in lang_data["varieties"]:
            assert "name" in var
            assert "coordinates" in var
            lat = var["coordinates"]["lat"]
            lon = var["coordinates"]["lon"]
            # Valid coordinate boundaries for South Asia
            assert 8.0 <= lat <= 35.0, f"Latitude {lat} out of range for {var['name']}"
            assert 68.0 <= lon <= 95.0, f"Longitude {lon} out of range for {var['name']}"
            assert var["speaker_population"] > 0
            assert len(var["territory"]) > 0
            assert len(var["phonological_markers"]) > 0


def test_morphological_cognate_graph(client):
    """Verify cytoscape-formatted graph with proto-roots, cognates, and ecological terms."""
    resp = client.get("/api/v1/explorer/morphological-graph")
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["status"] == "success"
    elements = data["elements"]
    nodes = elements["nodes"]
    edges = elements["edges"]

    assert len(nodes) >= 15
    assert len(edges) >= 15

    # Check for proto-root nodes
    node_ids = {n["data"]["id"] for n in nodes}
    assert "root:maram" in node_ids   # *mar-am (tree/wood)
    assert "root:neeru" in node_ids   # *nīr- / *yer (water)
    assert "root:konda" in node_ids   # *konda (hill/mountain)

    # Check edge relationships
    edge_types = {e["data"]["relationship"] for e in edges}
    assert "ETYMOLOGICAL_ROOT" in edge_types
    assert "COGNATE_OF" in edge_types

    # Verify Gondi and Koya cognates exist for water/tree
    labels = {n["data"]["label"] for n in nodes}
    assert any("maran" in l.lower() or "maram" in l.lower() for l in labels)
    assert any("yer" in l.lower() or "nīr" in l.lower() or "neer" in l.lower() for l in labels)


def test_objective_vitality_indicators_anti_extinction(client):
    """Verify community-grounded vitality indicators and explicit anti-extinction policy."""
    resp = client.get("/api/v1/explorer/vitality-indicators")
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["status"] == "success"
    assert "anti_extinction_policy" in data
    assert "rejects speculative external 'endangerment'" in data["anti_extinction_policy"]

    langs = {l["language_code"]: l for l in data["languages"]}
    assert "gon" in langs
    assert "kff" in langs
    assert "sat" in langs
    assert "lmn" in langs

    gondi = langs["gon"]
    assert gondi["census_speakers"] >= 2900000
    assert "preservation_metrics" in gondi
    metrics = gondi["preservation_metrics"]
    assert "total_recorded_stories" in metrics
    assert "total_transcripts_indexed" in metrics
    assert "approved_dictionary_entries" in metrics
    assert gondi["community_status"] in ["Actively Documented & Elder-Governed", "Pending Archive Ingestion"]


def test_backwards_compatibility_kg_routes(client):
    """Ensure existing Milestone 16 Knowledge Graph endpoints still function normally."""
    resp_overview = client.get("/api/v1/kg/overview")
    assert resp_overview.status_code == 200
    overview = resp_overview.json()
    assert "total_nodes" in overview
    assert overview["total_nodes"] >= 44

    resp_langs = client.get("/api/v1/kg/languages")
    assert resp_langs.status_code == 200
    langs = resp_langs.json()
    assert isinstance(langs, list)
    assert len(langs) >= 44
