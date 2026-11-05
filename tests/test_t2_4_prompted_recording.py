"""Tests for Task T2.4: Prompted Recording Mode & Seed Lexicon.

Requirements Verified:
1. Prompts stored in DB (not hardcoded).
2. DB seeded with at least 50 prompts each for:
   - Gondi (>= 50 prompts)
   - Koya (>= 50 prompts)
   - Santhali (>= 50 prompts)
   - Lambadi (bonus prompts)
3. Prompts are clearly marked as placeholders:
   - is_placeholder = 1
   - provenance = 'swadesh_seed_placeholder'
4. GET /api/v1/prompts supports filtering by language, category, pagination (limit/offset).
5. GET /api/v1/prompts/{prompt_id} retrieves prompt details.
6. Audio uploads can be tagged with prompt_id (POST /api/upload or /api/v1/transcripts/upload).
7. Transcripts table persists and returns prompt_id.
"""

from __future__ import annotations

import io
import sqlite3
import wave

from fastapi.testclient import TestClient

from backend import main, prompt_service
from backend.main import DB_PATH

client = TestClient(main.app)


def _generate_synthetic_pcm_wav(duration_sec: float = 0.5) -> bytes:
    """Generate minimal valid 16-bit PCM mono WAV bytes."""
    import random
    buf = io.BytesIO()
    sample_rate = 16000
    num_samples = int(sample_rate * duration_sec)
    noise = bytes(random.randint(1, 255) for _ in range(num_samples * 2))
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(noise)
    return buf.getvalue()


def test_db_prompts_seeded_with_50_plus_each_and_marked_placeholders():
    """Verify that Gondi, Koya, and Santhali have at least 50 DB prompts each and are marked placeholders."""
    # Ensure seeding is executed
    prompt_service.seed_prompts_if_empty(DB_PATH)

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        # Check Gondi count >= 50
        cur.execute("SELECT COUNT(*) FROM prompts WHERE LOWER(language) = 'gondi'")
        gondi_count = cur.fetchone()[0]
        assert gondi_count >= 50, f"Expected >= 50 Gondi prompts, got {gondi_count}"

        # Check Koya count >= 50
        cur.execute("SELECT COUNT(*) FROM prompts WHERE LOWER(language) = 'koya'")
        koya_count = cur.fetchone()[0]
        assert koya_count >= 50, f"Expected >= 50 Koya prompts, got {koya_count}"

        # Check Santhali count >= 50
        cur.execute("SELECT COUNT(*) FROM prompts WHERE LOWER(language) = 'santhali'")
        santhali_count = cur.fetchone()[0]
        assert santhali_count >= 50, f"Expected >= 50 Santhali prompts, got {santhali_count}"

        # Check all seeded prompts are marked as placeholders
        cur.execute("SELECT COUNT(*) FROM prompts WHERE is_placeholder = 1")
        placeholder_count = cur.fetchone()[0]
        assert placeholder_count >= (gondi_count + koya_count + santhali_count)

        cur.execute("SELECT COUNT(*) FROM prompts WHERE provenance = 'swadesh_seed_placeholder'")
        provenance_count = cur.fetchone()[0]
        assert provenance_count >= (gondi_count + koya_count + santhali_count)


def test_api_list_prompts_filters_by_language_and_category():
    """Verify GET /api/v1/prompts endpoints and filtering."""
    # 1. Fetch Gondi prompts
    res_gon = client.get("/api/v1/prompts?language=Gondi&limit=100")
    assert res_gon.status_code == 200, res_gon.text
    data_gon = res_gon.json()
    assert data_gon["status"] == "success"
    assert data_gon["total"] >= 50
    assert len(data_gon["prompts"]) >= 50
    for p in data_gon["prompts"]:
        assert p["language"] == "Gondi"
        assert p["is_placeholder"] == 1
        assert p["provenance"] == "swadesh_seed_placeholder"

    # 2. Fetch Koya Swadesh words
    res_koy = client.get("/api/v1/prompts?language=Koya&category=swadesh_word&limit=100")
    assert res_koy.status_code == 200
    data_koy = res_koy.json()
    assert data_koy["total"] >= 30
    for p in data_koy["prompts"]:
        assert p["language"] == "Koya"
        assert p["category"] == "swadesh_word"

    # 3. Fetch Santhali short sentences
    res_sat = client.get("/api/v1/prompts?language=Santhali&category=short_sentence&limit=100")
    assert res_sat.status_code == 200
    data_sat = res_sat.json()
    assert data_sat["total"] >= 20
    for p in data_sat["prompts"]:
        assert p["language"] == "Santhali"
        assert p["category"] == "short_sentence"


def test_api_get_single_prompt_details():
    """Verify GET /api/v1/prompts/{prompt_id} returns accurate phonetic and semantic fields."""
    res = client.get("/api/v1/prompts/gon-swadesh-001")
    assert res.status_code == 200, res.text
    prompt = res.json()
    assert prompt["prompt_id"] == "gon-swadesh-001"
    assert prompt["language"] == "Gondi"
    assert prompt["prompt_text"] == "యేర్"
    assert prompt["phonetic_target"] == "yeːr"
    assert prompt["english_meaning"] == "Water"
    assert "నీరు" in prompt["telugu_meaning"]

    # Nonexistent returns 404
    res_404 = client.get("/api/v1/prompts/nonexistent-prompt-999")
    assert res_404.status_code == 404


def test_audio_upload_tagged_with_prompt_id():
    """Verify that uploading an audio recording tagged with prompt_id persists the tag in transcripts."""
    prompt_id = "gon-swadesh-001"
    wav_bytes = _generate_synthetic_pcm_wav(0.4)

    upload_res = client.post(
        "/api/v1/transcripts/upload",
        files={"file": ("prompted_recording_test.wav", wav_bytes, "audio/wav")},
        data={
            "title": "Prompted Rec: Gondi Water",
            "language": "Gondi",
            "dialect": "Adilabad Northern",
            "consent": "true",
            "prompt_id": prompt_id,
        },
    )
    assert upload_res.status_code == 200, upload_res.text
    data = upload_res.json()
    assert data["success"] is True
    rec_id = data["id"]
    assert data.get("prompt_id") == prompt_id

    # Verify database persistence in transcripts table
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT id, title, language, prompt_id FROM transcripts WHERE id = ?", (rec_id,))
        row = cur.fetchone()
        assert row is not None
        assert row["prompt_id"] == prompt_id
        assert row["title"] == "Prompted Rec: Gondi Water"
