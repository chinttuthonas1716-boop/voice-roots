"""Tests for Voice Roots Task T2.7: Public Stats Page and Census 2011 Benchmarks.

Verifies:
1. Public statistics endpoint (/api/v1/stats/public) returns live recording volume side-by-side with Census 2011 data.
2. Official Census 2011 figures for Gondi, Koya, Santhali, Lambadi, and Telugu match official records.
3. Methodological citations and source references (C-16 Table) are correctly reported.
4. Raw census data endpoint (/api/v1/stats/census) correctly resolves data from data/census/.
"""

from __future__ import annotations

from fastapi.testclient import TestClient

from backend import main

client = TestClient(main.app)


def test_public_stats_endpoint_structure():
    """Verify high-level structure of the public statistics API."""
    resp = client.get("/api/v1/stats/public")
    assert resp.status_code == 200
    data = resp.json()

    assert "summary" in data
    assert "languages" in data
    assert "sources" in data

    summary = data["summary"]
    assert "total_recorded_hours" in summary
    assert "total_recordings" in summary
    assert "data_source_directory" in summary
    assert summary["data_source_directory"] == "data/census/"


def test_public_stats_contains_census_benchmarks_for_core_tongues():
    """Verify each core language includes both Voice Roots counts and Census 2011 demographics."""
    resp = client.get("/api/v1/stats/public")
    assert resp.status_code == 200
    languages = {l["language"]: l for l in resp.json()["languages"]}

    # Verify Gondi
    assert "Gondi" in languages
    gondi = languages["Gondi"]
    assert gondi["language_code"] == "gon"
    assert "voice_roots" in gondi
    assert "recordings" in gondi["voice_roots"]
    assert "duration_hours" in gondi["voice_roots"]
    assert "speakers" in gondi["voice_roots"]
    assert gondi["census_2011"]["population_total"] == 2984453
    assert gondi["census_2011"]["pct_rural"] == 96.2
    assert "044000" in gondi["census_2011"]["census_code"]

    # Verify Koya
    assert "Koya" in languages
    koya = languages["Koya"]
    assert koya["language_code"] == "kff"
    assert koya["census_2011"]["population_total"] == 407423
    assert koya["census_2011"]["pct_rural"] == 98.7
    assert "069000" in koya["census_2011"]["census_code"]

    # Verify Santhali
    assert "Santhali" in languages
    santhali = languages["Santhali"]
    assert santhali["census_2011"]["population_total"] == 7368192
    assert "018000" in santhali["census_2011"]["census_code"]

    # Verify Lambadi
    assert "Lambadi" in languages
    lambadi = languages["Lambadi"]
    assert lambadi["census_2011"]["population_total"] >= 4000000

    # Verify Telugu
    assert "Telugu" in languages
    telugu = languages["Telugu"]
    assert telugu["census_2011"]["population_total"] == 81127740


def test_public_stats_official_citations():
    """Verify that official sources and methodological disclosures are included."""
    resp = client.get("/api/v1/stats/public")
    assert resp.status_code == 200
    sources = resp.json()["sources"]
    assert len(sources) >= 2

    census_source = next((s for s in sources if s["id"] == "census_2011_c16"), None)
    assert census_source is not None
    assert "C-16" in census_source["title"]
    assert census_source["source_year"] == 2011
    assert "Registrar General" in census_source["publisher"]
    assert "10,000" in census_source["methodological_note"]


def test_raw_census_metadata_endpoint():
    """Verify raw census metadata resolver reads from data/census/ or data/india/."""
    resp = client.get("/api/v1/stats/census")
    assert resp.status_code == 200
    data = resp.json()
    assert "source_dir" in data
    assert "languages_count" in data
    assert data["languages_count"] > 0
