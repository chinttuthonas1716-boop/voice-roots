"""Tests for Voice Roots Task T2.5: Multilingual Interface and Consent Prompts.

Verifies:
1. Spoken audio consent endpoints (/api/v1/consent/audio/{lang}) return valid WAV bytes.
2. Placeholder headers ('needs-community-recording') are enforced to disclose unverified demo status.
3. Multilingual consent prompts metadata API covers English, Telugu, Hindi, Gondi, and Koya.
4. i18n dictionary parity across English (en.json), Telugu (te.json), and Hindi (hi.json)
   for core UI buttons, consent statements, and navigation.
"""

from __future__ import annotations

import io
import json
import wave
from pathlib import Path

from fastapi.testclient import TestClient

from backend import main

client = TestClient(main.app)
REPO_ROOT = Path(__file__).resolve().parent.parent


def test_consent_audio_endpoints_return_valid_wav_and_placeholder_headers():
    """Verify that audio consent prompts return playable WAV bytes with placeholder disclosure."""
    languages = ["te", "hi", "en", "gon", "kff"]
    for lang in languages:
        resp = client.get(f"/api/v1/consent/audio/{lang}")
        assert resp.status_code == 200
        assert resp.headers["content-type"].startswith("audio/wav")
        assert resp.headers.get("x-consent-status") == "needs-community-recording"
        assert resp.headers.get("x-consent-placeholder") == "true"
        assert resp.headers.get("x-consent-language") == lang

        # Validate standard PCM WAV header structure
        wav_buffer = io.BytesIO(resp.content)
        with wave.open(wav_buffer, "rb") as wf:
            assert wf.getnchannels() in (1, 2)
            assert wf.getsampwidth() == 2
            assert wf.getframerate() == 16000
            assert wf.getnframes() > 0


def test_consent_prompts_metadata_endpoint():
    """Verify metadata endpoint describes consent text and disclaimer across supported tongues."""
    resp = client.get("/api/v1/consent/prompts")
    assert resp.status_code == 200
    data = resp.json()
    assert "prompts" in data
    assert "disclaimer" in data

    prompts = data["prompts"]
    for lang in ["en", "te", "hi", "gon", "kff"]:
        assert lang in prompts
        item = prompts[lang]
        assert "text" in item and len(item["text"]) > 10
        assert item["audio_url"] == f"/api/v1/consent/audio/{lang}"
        assert item["status"] == "needs-community-recording"
        assert item["is_placeholder"] is True


def test_i18n_dictionary_parity_across_english_telugu_hindi():
    """Verify that en.json, te.json, and hi.json contain all mandatory keys for UI and consent."""
    i18n_dir = REPO_ROOT / "web" / "src" / "i18n"
    assert (i18n_dir / "en.json").exists()
    assert (i18n_dir / "te.json").exists()
    assert (i18n_dir / "hi.json").exists()

    with open(i18n_dir / "en.json", encoding="utf-8") as f:
        en_dict = json.load(f)
    with open(i18n_dir / "te.json", encoding="utf-8") as f:
        te_dict = json.load(f)
    with open(i18n_dir / "hi.json", encoding="utf-8") as f:
        hi_dict = json.load(f)

    # Core required keys for Phase 2 multilingual experience
    required_keys = [
        "nav.home",
        "nav.record",
        "nav.translate",
        "nav.dictionary",
        "nav.dashboard",
        "nav.reviewer",
        "action.record",
        "action.upload",
        "action.translate",
        "action.save",
        "consent.step",
        "consent.desc",
        "consent.statement",
        "consent.audioTitle",
        "consent.listenBtn",
        "consent.playing",
        "consent.placeholderDisclaimer",
    ]

    for key in required_keys:
        assert key in en_dict, f"Missing key in en.json: {key}"
        assert key in te_dict, f"Missing key in te.json: {key}"
        assert key in hi_dict, f"Missing key in hi.json: {key}"
        assert len(en_dict[key].strip()) > 0
        assert len(te_dict[key].strip()) > 0
        assert len(hi_dict[key].strip()) > 0
