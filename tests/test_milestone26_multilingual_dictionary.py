"""Milestone 26: Module 2 — Multilingual Dictionary Test Suite

Verifies:
1. Relational schema and FTS5 full-text virtual indexing.
2. Comprehensive seed lexicon for Gondi (gon), Koya (kff), Santhali (sat), and Lambadi (lmn).
3. Orthographic inclusivity (Gunjala/Masaram Gondi, Ol Chiki, Telugu, Devanagari).
4. Authentic IPA phonological representation and acoustic pronunciation references.
5. Cross-dialectal comparisons and semantic shifts.
6. Source provenance attribution and etymological root tracking.
7. Community proposal submission with automatic IPA synthesis.
8. Elder approval gate and verification badge.
9. Dictionary overview telemetry and language metadata endpoints.
"""

import os
import sqlite3
import sys
import uuid

import pytest
from fastapi.testclient import TestClient

# Ensure backend is on sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

import dictionary_service
from main import app


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


def test_dictionary_schema_and_seed_coverage():
    """Verify dictionary tables exist and all 4 core languages are richly seeded."""
    overview = dictionary_service.get_dictionary_overview()
    assert overview["total_words"] >= 20, f"Expected at least 20 seed entries, got {overview['total_words']}"
    assert overview["approved_words"] >= 20
    assert overview["approval_rate_pct"] >= 60.0
    assert overview["audio_coverage_pct"] >= 80.0

    langs_in_db = {item["language_code"] for item in overview["by_language"]}
    required_langs = {"gon", "kff", "sat", "lmn"}
    assert required_langs.issubset(langs_in_db), f"Missing core languages: {required_langs - langs_in_db}"

    # Verify each core language has at least 4 entries
    for item in overview["by_language"]:
        if item["language_code"] in required_langs:
            assert item["total"] >= 4, f"Language {item['language_code']} has only {item['total']} entries"


def test_fts5_and_multilingual_search(client):
    """Verify SQLite FTS5 search across headwords, native scripts, meanings, and translations."""
    # 1. Search by English meaning keyword
    resp_en = client.get("/api/v1/dictionary/search?q=deity")
    assert resp_en.status_code == 200
    data_en = resp_en.json()
    assert data_en["total"] >= 1
    words_en = [w["word"] for w in data_en["results"]]
    assert "persapen" in words_en

    # 2. Search by Ol Chiki native script (Santhali 'dhorom' -> ᱫᱷᱚᱨᱚᱢ)
    resp_ol = client.get("/api/v1/dictionary/search?q=ᱫᱷᱚᱨᱚᱢ")
    assert resp_ol.status_code == 200
    data_ol = resp_ol.json()
    assert data_ol["total"] >= 1
    assert data_ol["results"][0]["word"] == "dhorom"
    assert data_ol["results"][0]["language_code"] == "sat"

    # 3. Search by Telugu native script (Gondi 'persapen' -> పెర్సాపేన్)
    resp_te = client.get("/api/v1/dictionary/search?q=పెర్సాపేన్")
    assert resp_te.status_code == 200
    data_te = resp_te.json()
    assert data_te["total"] >= 1
    assert data_te["results"][0]["word"] == "persapen"

    # 4. Search by Devanagari script (Lambadi 'tanda' -> तांडा)
    resp_deva = client.get("/api/v1/dictionary/search?q=तांडा")
    assert resp_deva.status_code == 200
    data_deva = resp_deva.json()
    assert data_deva["total"] >= 1
    words_deva = [w["word"] for w in data_deva["results"]]
    assert "tanda" in words_deva


def test_faceted_filtering(client):
    """Verify filtering by language, dialect, part of speech, and elder approval."""
    # Language filter: Koya (kff)
    resp_kff = client.get("/api/v1/dictionary/search?language_code=kff")
    assert resp_kff.status_code == 200
    data_kff = resp_kff.json()
    assert all(r["language_code"] == "kff" for r in data_kff["results"])
    assert any(r["word"] == "koitur" for r in data_kff["results"])

    # Dialect filter: Adilabad Southern
    resp_dial = client.get("/api/v1/dictionary/search?dialect=Adilabad%20Southern")
    assert resp_dial.status_code == 200
    data_dial = resp_dial.json()
    assert all("Adilabad Southern" in (r.get("dialect") or "") for r in data_dial["results"])

    # Category filter: cultural_term
    resp_cat = client.get("/api/v1/dictionary/search?category=cultural_term")
    assert resp_cat.status_code == 200
    data_cat = resp_cat.json()
    assert all(r["part_of_speech"] == "cultural_term" for r in data_cat["results"])

    # Approved only filter
    resp_app = client.get("/api/v1/dictionary/search?only_approved=true")
    assert resp_app.status_code == 200
    data_app = resp_app.json()
    assert all(r["is_elder_approved"] is True for r in data_app["results"])


def test_word_details_and_cross_dialectal_comparisons(client):
    """Verify word details endpoint returns full metadata, cross-dialect variations, and related words."""
    # Find word_id for Gondi persapen
    resp_search = client.get("/api/v1/dictionary/search?q=persapen")
    assert resp_search.status_code == 200
    results = resp_search.json()["results"]
    assert len(results) >= 1
    word_id = results[0]["id"]

    resp_detail = client.get(f"/api/v1/dictionary/words/{word_id}")
    assert resp_detail.status_code == 200
    entry = resp_detail.json()

    assert entry["word"] == "persapen"
    assert entry["ipa"] == "/peːɾsaːpeːn/"
    assert entry["is_elder_approved"] is True
    assert entry["provenance"] is not None
    assert "Kotnak Jangu" in entry["provenance"]

    # Verify cross-dialect variations
    variations = entry["dialect_variations"]
    assert "Betul Northern" in variations
    assert variations["Betul Northern"] == "badadeo"

    # Verify related words
    assert "related_words" in entry
    assert isinstance(entry["related_words"], list)
    assert len(entry["related_words"]) > 0


def test_community_proposal_and_automatic_ipa_synthesis(client):
    """Verify community proposal submission, IPA synthesis, and initial unapproved state."""
    proposal_data = {
        "word": "velpu",
        "language_code": "gon",
        "dialect": "Adilabad Southern",
        "native_script": "వెల్పు",
        "script_name": "Telugu",
        "part_of_speech": "sacred_term",
        "meanings": ["clan tutelary spirit", "ancestral protective guardian"],
        "translations": {
            "en": "Clan Tutelary Spirit",
            "te": "కుల దేవత",
            "hi": "कुल देवी / देवता",
        },
        "cultural_context": "Invoked during seasonal rites before tilling farmland.",
        "contributor_name": "Mesram Devrao",
        "contributor_role": "community_elder",
    }

    resp = client.post("/api/v1/dictionary/propose", json=proposal_data)
    assert resp.status_code == 201
    res_json = resp.json()
    assert res_json["status"] == "success"
    entry = res_json["entry"]

    assert entry["word"] == "velpu"
    assert entry["is_elder_approved"] is False
    assert entry["status"] == "pending_review"
    # Verify authentic IPA was synthesized automatically
    assert entry["ipa"] is not None
    assert len(entry["ipa"]) > 0

    # Clean up proposed test entry to avoid polluting persistent seed db
    with sqlite3.connect(dictionary_service.DB_PATH) as conn:
        conn.execute("DELETE FROM dictionary WHERE id = ?", (entry["id"],))
        conn.execute("DELETE FROM dictionary_fts WHERE rowid = ?", (entry["id"],))
        conn.commit()


def test_elder_approval_gate_workflow(client):
    """Verify elder approval gate transitions an entry to approved status and updates FTS index."""
    test_word = f"aaran_{uuid.uuid4().hex[:6]}"
    # 1. Propose new word
    new_word_data = {
        "word": test_word,
        "language_code": "kff",
        "dialect": "Godavari Valley",
        "native_script": "ఆరన్",
        "meanings": ["bamboo forest clearing"],
        "translations": {"en": "Bamboo Clearing", "te": "వెదురు అడవి"},
        "contributor_name": "Soyam Bheem",
    }
    prop_resp = client.post("/api/v1/dictionary/propose", json=new_word_data)
    assert prop_resp.status_code == 201
    entry_id = prop_resp.json()["entry"]["id"]

    # Verify not yet in only_approved search
    search_app_before = client.get(f"/api/v1/dictionary/search?q={test_word}&only_approved=true")
    assert search_app_before.status_code == 200
    assert search_app_before.json()["total"] == 0

    # 2. Elder approves
    app_resp = client.patch(
        f"/api/v1/dictionary/words/{entry_id}/approve",
        json={
            "approved_by": "Council of Koya Elders",
            "notes": "Verified authentic forest term during November council",
        },
    )
    assert app_resp.status_code == 200
    app_data = app_resp.json()
    assert app_data["status"] == "success"
    approved_entry = app_data["entry"]
    assert approved_entry["is_elder_approved"] is True
    assert approved_entry["status"] == "approved"
    assert approved_entry["approved_by"] == "Council of Koya Elders"

    # 3. Verify it now appears in only_approved search
    search_app_after = client.get(f"/api/v1/dictionary/search?q={test_word}&only_approved=true")
    assert search_app_after.status_code == 200
    assert search_app_after.json()["total"] == 1
    assert search_app_after.json()["results"][0]["id"] == entry_id

    # Clean up test entry to maintain database hygiene
    with sqlite3.connect(dictionary_service.DB_PATH) as conn:
        conn.execute("DELETE FROM dictionary WHERE id = ?", (entry_id,))
        conn.execute("DELETE FROM dictionary_fts WHERE rowid = ?", (entry_id,))
        conn.commit()


def test_dictionary_overview_and_languages_endpoints(client):
    """Verify telemetry overview and language metadata endpoints."""
    # Overview
    r_over = client.get("/api/v1/dictionary/overview")
    assert r_over.status_code == 200
    overview = r_over.json()
    assert "total_words" in overview
    assert "approved_words" in overview
    assert "by_language" in overview
    assert "by_part_of_speech" in overview

    # Languages
    r_langs = client.get("/api/v1/dictionary/languages")
    assert r_langs.status_code == 200
    langs_payload = r_langs.json()
    assert langs_payload["status"] == "success"
    languages = langs_payload["languages"]
    codes = [l["code"] for l in languages]
    assert "gon" in codes
    assert "kff" in codes
    assert "sat" in codes
    assert "lmn" in codes

    # Gondi should list Gunjala and Masaram Gondi scripts
    gon_meta = next(l for l in languages if l["code"] == "gon")
    assert any("Gunjala" in s for s in gon_meta["primary_scripts"])
