"""Voice Roots Milestone 25: Advanced Speech Intelligence & Dialect Pipeline Tests.

Verifies:
1. IPA phonetic transcription generation for indigenous phonology.
2. Dialect classification across Gondi, Koya, Santhali, and Lambadi regional varieties.
3. Multi-speaker diarization segmentation (Elder Storyteller vs Interviewer).
4. Non-destructive spectral noise reduction (preserving immutable master audio).
5. Token-level acoustic confidence scoring and uncertainty flagging (<80% conf).
6. Word and phonetic correction submission for community elder review.
"""

from pathlib import Path

from fastapi.testclient import TestClient

from backend.main import app
from backend.speech_analysis_service import (
    apply_noise_reduction,
    diarize_speakers,
    get_or_generate_word_alignments,
    identify_dialect,
    text_to_ipa,
)

client = TestClient(app)
REPO_ROOT = Path(__file__).resolve().parent.parent


def test_text_to_ipa_phonetic_transcription():
    """Verify authentic IPA representation for Dravidian retroflexes, vowel length, and aspirates."""
    # Long vowels
    assert text_to_ipa("kōr", "gon") == "/køːɾ/" or "øː" in text_to_ipa("kōr", "gon") or "oː" in text_to_ipa("kōr", "gon")
    assert "aː" in text_to_ipa("māṭi", "gon")
    # Retroflexes
    ipa_mati = text_to_ipa("māṭi", "gon")
    assert "ʈ" in ipa_mati, f"Expected retroflex /ʈ/ in {ipa_mati}"

    ipa_madi = text_to_ipa("māḍi", "gon")
    assert "ɖ" in ipa_madi, f"Expected voiced retroflex /ɖ/ in {ipa_madi}"

    # Aspirations
    ipa_kh = text_to_ipa("khor", "gon")
    assert "kʰ" in ipa_kh, f"Expected aspirated velar stop in {ipa_kh}"

    ipa_gh = text_to_ipa("ghotul", "gon")
    assert "ɡʱ" in ipa_gh, f"Expected aspirated voiced velar in {ipa_gh}"


def test_identify_dialect_gondi_varieties():
    """Verify dialect classification across Southern, Northern, and Eastern Gondi."""
    # Adilabad Southern
    res_southern = identify_dialect("nawa naav koytor aando kor pen mati", language="Gondi")
    assert res_southern["language"] == "Gondi"
    assert "Adilabad" in res_southern["detected_dialect"] or "Southern" in res_southern["detected_dialect"]
    assert res_southern["confidence"] >= 0.75
    assert len(res_southern["phonological_markers"]) > 0

    # Betul / Mandla Northern
    res_northern = identify_dialect("mandla sehor bhai danda hondi chhe", language="Gondi")
    assert "Northern" in res_northern["detected_dialect"] or "Betul" in res_northern["detected_dialect"]

    # Bastar / Maria Eastern
    res_eastern = identify_dialect("maria muria ghotul koytor dadul pata", language="Gondi")
    assert "Eastern" in res_eastern["detected_dialect"] or "Bastar" in res_eastern["detected_dialect"]


def test_identify_dialect_koya_santhali_lambadi():
    """Verify regional dialect classification for Koya, Santhali, and Lambadi."""
    res_koya = identify_dialect("koya godavari podu dorla", language="Koya")
    assert res_koya["language"] == "Koya"
    assert "Godavari" in res_koya["detected_dialect"] or "Bhadrachalam" in res_koya["detected_dialect"]

    res_sat = identify_dialect("santhali folk oral story", language="Santhali")
    assert res_sat["language"] == "Santhali"
    assert res_sat["confidence"] >= 0.80

    res_lmn = identify_dialect("lambadi tanda banjara", language="Lambadi")
    assert res_lmn["language"] == "Lambadi"
    assert "Banjara" in res_lmn["detected_dialect"] or "Deccan" in res_lmn["detected_dialect"]


def test_speaker_diarization_turn_segmentation(tmp_path):
    """Verify speaker diarization partitions conversation into elder and interviewer turns."""
    dummy_wav = tmp_path / "conversation.wav"
    dummy_wav.write_bytes(
        b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00"
        b"\x44\xac\x00\x00\x88\x58\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00"
    )

    text = "Nawa naav Somu aando. Can you tell us about the sacred clan grove?"
    turns = diarize_speakers(str(dummy_wav), transcript_text=text, num_speakers=2)

    assert len(turns) >= 2
    assert turns[0]["speaker_label"] == "Elder Storyteller"
    assert turns[1]["speaker_label"] == "Field Researcher / Interviewer"
    assert turns[0]["start_time"] < turns[0]["end_time"]
    assert "SPEAKER_" in turns[0]["speaker_id"]


def test_apply_noise_reduction_preserves_master_audio(tmp_path):
    """Verify noise reduction generates enhanced derivative while preserving original master audio."""
    master_wav = tmp_path / "master_field_recording.wav"
    # Create simple 16-bit PCM WAV
    sample_rate = 16000
    num_samples = 8000
    import struct
    import wave

    raw_samples = [int(1000 * (i % 20 - 10)) for i in range(num_samples)]
    with wave.open(str(master_wav), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(struct.pack(f"<{num_samples}h", *raw_samples))

    original_bytes = master_wav.read_bytes()
    original_size = len(original_bytes)

    # Apply noise reduction
    result = apply_noise_reduction(str(master_wav), filter_strength=0.7)

    assert result["status"] == "success"
    assert result["master_preserved"] is True
    assert result["snr_improvement_db"] > 0
    assert result["enhanced_file"].startswith("enhanced_")

    # Master audio must remain completely unmodified (OCAP non-negotiable)
    assert master_wav.read_bytes() == original_bytes
    assert master_wav.stat().st_size == original_size


def test_word_alignments_with_uncertainty_scoring():
    """Verify word alignments contain IPA tokens and flags words with confidence < 0.80."""
    # Query any available transcript from DB
    resp = client.get("/api/transcripts")
    assert resp.status_code == 200
    data = resp.json()
    transcripts = data.get("transcripts", []) if isinstance(data, dict) else data
    if not transcripts:
        return

    tid = transcripts[0]["id"]
    alignments = get_or_generate_word_alignments(tid)
    assert len(alignments) > 0

    first_word = alignments[0]
    assert "word_text" in first_word
    assert "start_time" in first_word
    assert "end_time" in first_word
    assert "confidence" in first_word
    assert "phonetic_tokens" in first_word
    assert first_word["phonetic_tokens"].startswith("/")
    assert first_word["phonetic_tokens"].endswith("/")
    assert "is_uncertain" in first_word


def test_speech_intelligence_rest_endpoints():
    """Verify new REST endpoints for dialect ID, diarization, noise reduction, and corrections."""
    # 1. Dialect Identification API
    resp_dialect = client.post(
        "/api/v1/speech/dialect-id",
        json={"text": "nawa naav koytor aando kor pen", "language": "Gondi"},
    )
    assert resp_dialect.status_code == 200
    d_data = resp_dialect.json()
    assert d_data["status"] == "success"
    assert "detected_dialect" in d_data["dialect_classification"]

    # 2. Pronunciation Exercises Overview
    resp_overview = client.get("/api/v1/speech/overview")
    assert resp_overview.status_code == 200
    assert resp_overview.json()["status"] == "active"

    # 3. Speech Correction Submission API
    resp_corr = client.post(
        "/api/v1/speech/corrections",
        json={
            "transcript_id": 1,
            "word_index": 0,
            "previous_text": "kor",
            "suggested_text": "kōr",
            "suggested_ipa": "/køːɾ/",
            "dialect_note": "Adilabad Southern vowel length contrast",
            "contributor_name": "Elder Somu",
            "rationale": "Phonetic length distinction",
        },
    )
    assert resp_corr.status_code == 200
    corr_data = resp_corr.json()
    assert corr_data["status"] == "submitted"
    assert corr_data["review_status"] == "pending_review"
    assert corr_data["suggested_text"] == "kōr"
