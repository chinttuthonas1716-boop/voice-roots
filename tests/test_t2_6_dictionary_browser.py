"""Tests for Voice Roots Task T2.6: Multilingual Dictionary and Phrasebook Browser.

Verifies:
1. Read-only search across the 4 core languages (Gondi, Koya, Santhali, Lambadi).
2. Approved vs Proposed status filtering and badges.
3. Language filtering with standard codes and colloquial aliases (gon, koy/kff, sat, lam/lmn).
4. Audio pronunciation snippet streaming and synthetic fallback.
5. Provenance, cultural context, and elder attribution persistence.
6. Dictionary overview telemetry and supported languages metadata.
"""

from __future__ import annotations

import io
import wave

from fastapi.testclient import TestClient

from backend import main

client = TestClient(main.app)


def test_dictionary_supported_languages_contains_four_core():
    """Verify that dictionary metadata covers the 4 core indigenous tongues."""
    resp = client.get("/api/v1/dictionary/languages")
    assert resp.status_code == 200
    data = resp.json()
    assert "languages" in data
    codes = {l["code"] for l in data["languages"]}
    assert "gon" in codes  # Gondi
    assert "kff" in codes  # Koya
    assert "sat" in codes  # Santhali
    assert "lmn" in codes  # Lambadi


def test_dictionary_overview_telemetry():
    """Verify aggregate telemetry on words, approval rates, and dialect diversity."""
    resp = client.get("/api/v1/dictionary/overview")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_words"] >= 50
    assert data["approved_words"] > 0
    assert data["words_with_audio"] > 0
    assert data["dialects_represented"] > 0
    assert isinstance(data["by_language"], list)


def test_dictionary_search_full_text_and_facets():
    """Verify FTS5 and LIKE search matching across Latin headword and translations."""
    # Search for persapen
    resp = client.get("/api/v1/dictionary/search?q=persapen")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1
    headword = data["results"][0]
    assert headword["word"] == "persapen"
    assert headword["language_code"] == "gon"
    assert headword["is_elder_approved"] is True
    assert headword["provenance"] is not None
    assert "Adilabad" in headword["provenance"] or "Kotnak Jangu" in headword["provenance"]

    # Search by English translation keyword 'deity'
    resp_en = client.get("/api/v1/dictionary/search?q=deity")
    assert resp_en.status_code == 200
    data_en = resp_en.json()
    assert data_en["total"] >= 1
    assert any("deity" in str(r["meanings"]).lower() or "deity" in str(r["translations"]).lower() for r in data_en["results"])


def test_dictionary_language_alias_filtering():
    """Verify filtering works with canonical codes and colloquial aliases."""
    # Gondi
    resp_gon = client.get("/api/v1/dictionary/search?language_code=gon")
    assert resp_gon.status_code == 200
    assert all(r["language_code"] in ("gon", "gondi") for r in resp_gon.json()["results"])

    resp_gondi = client.get("/api/v1/dictionary/search?language_code=gondi")
    assert resp_gondi.status_code == 200
    assert resp_gondi.json()["total"] == resp_gon.json()["total"]

    # Koya alias: koy maps to kff
    resp_koy = client.get("/api/v1/dictionary/search?language_code=koy")
    assert resp_koy.status_code == 200
    assert resp_koy.json()["total"] >= 1
    assert all(r["language_code"] in ("kff", "koy") for r in resp_koy.json()["results"])

    # Lambadi alias: lam maps to lmn
    resp_lam = client.get("/api/v1/dictionary/search?language_code=lam")
    assert resp_lam.status_code == 200
    assert resp_lam.json()["total"] >= 1
    assert all(r["language_code"] in ("lmn", "lam") for r in resp_lam.json()["results"])

    # Santhali alias: santhali maps to sat
    resp_sat = client.get("/api/v1/dictionary/search?language_code=santhali")
    assert resp_sat.status_code == 200
    assert resp_sat.json()["total"] >= 1
    assert all(r["language_code"] in ("sat", "santhali") for r in resp_sat.json()["results"])


def test_dictionary_status_and_approval_filtering():
    """Verify filtering by approved vs proposed status badges."""
    resp_approved = client.get("/api/v1/dictionary/search?status=approved")
    assert resp_approved.status_code == 200
    data_approved = resp_approved.json()
    assert data_approved["total"] >= 1
    assert all(r["is_elder_approved"] is True and r["status"] == "approved" for r in data_approved["results"])

    # Proposed entries
    resp_proposed = client.get("/api/v1/dictionary/search?status=proposed")
    assert resp_proposed.status_code == 200
    data_proposed = resp_proposed.json()
    assert all(not r["is_elder_approved"] or r["status"] != "approved" for r in data_proposed["results"])


def test_dictionary_single_word_details():
    """Verify retrieving complete word details including cross-dialect forms and provenance."""
    # Find word id for persapen
    search_res = client.get("/api/v1/dictionary/search?q=persapen").json()
    word_id = search_res["results"][0]["id"]

    resp = client.get(f"/api/v1/dictionary/words/{word_id}")
    assert resp.status_code == 200
    word = resp.json()
    assert word["id"] == word_id
    assert word["word"] == "persapen"
    assert "ipa" in word and word["ipa"].startswith("/")
    assert isinstance(word["meanings"], list) and len(word["meanings"]) > 0
    assert isinstance(word["translations"], dict)
    assert "cultural_context" in word and len(word["cultural_context"]) > 0
    assert word["provenance"] is not None


def test_dictionary_audio_pronunciation_stream_and_fallback():
    """Verify audio snippet streaming returns valid WAV bytes and headers."""
    # Test sample audio route directly
    resp_sample = client.get("/api/v1/audio/samples/gon_persapen.wav")
    assert resp_sample.status_code == 200
    assert resp_sample.headers["content-type"].startswith("audio/wav")

    # Validate that returned bytes form a syntactically valid WAV stream
    wav_bytes = io.BytesIO(resp_sample.content)
    with wave.open(wav_bytes, "rb") as wf:
        assert wf.getnchannels() in (1, 2)
        assert wf.getsampwidth() in (2, 3, 4)
        assert wf.getframerate() in (16000, 44100, 48000)
        assert wf.getnframes() > 0

    # Test word audio route
    search_res = client.get("/api/v1/dictionary/search?limit=1").json()
    word_id = search_res["results"][0]["id"]
    resp_word_audio = client.get(f"/api/v1/dictionary/words/{word_id}/audio")
    assert resp_word_audio.status_code == 200
    assert resp_word_audio.headers["content-type"].startswith("audio/wav")
    assert len(resp_word_audio.content) > 44  # WAV header is 44 bytes minimum
