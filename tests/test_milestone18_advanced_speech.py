"""Voice Roots — Milestone 18: Advanced Speech Intelligence & Pronunciation Test Suite.

Validates:
- Waveform peak downsampling and envelope generation.
- Acoustic speech rate (WPM, articulation rate) and silence/pause pattern detection.
- Word-level timestamp alignments with monotonic chronological intervals.
- Curated minimal pairs catalog (Gondi, Koya, Santhali, Lambadi).
- Pronunciation practice acoustic scoring and PENDING_REVIEW default.
- Native-speaker elder review gate and credential enforcement.
- REST API endpoints in backend/main.py.
"""

import io
import os
import struct
import wave

import main
import speech_analysis_service
from fastapi.testclient import TestClient

client = TestClient(main.app)


def _create_dummy_wav(duration_seconds: float = 1.0, framerate: int = 16000) -> str:
    """Helper to create a temporary test WAV file with audible tone followed by silence."""
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(framerate)
        num_frames = int(duration_seconds * framerate)
        samples = []
        for i in range(num_frames):
            # Half audible tone, half silence
            if i < num_frames // 2:
                samples.append(int(15000 * ((i % 32) / 32.0)))
            else:
                samples.append(0)
        wf.writeframes(struct.pack(f"<{len(samples)}h", *samples))
    
    test_path = os.path.join(tempfile.gettempdir(), f"test_tone_{uuid.uuid4().hex[:8]}.wav")
    with open(test_path, "wb") as f:
        f.write(buf.getvalue())
    return test_path


import tempfile
import uuid


def test_speech_overview_endpoint():
    """Verify speech intelligence overview reports active features and seeded exercises."""
    response = client.get("/api/v1/speech/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "active"
    assert data["pronunciation_exercises_count"] >= 6
    assert "word_level_alignments" in data["supported_features"]
    assert "silence_pause_patterns" in data["supported_features"]
    assert "minimal_pairs" in data["supported_features"]


def test_waveform_peak_extraction():
    """Verify waveform peak downsampling extracts normalized amplitudes between 0.0 and 1.0."""
    wav_path = _create_dummy_wav(duration_seconds=1.2)
    try:
        peaks = speech_analysis_service.compute_waveform_peaks(wav_path, num_peaks=120)
        assert len(peaks) == 120
        assert all(0.0 <= p <= 1.0 for p in peaks)
        assert any(p > 0.05 for p in peaks)  # Tone region
    finally:
        if os.path.exists(wav_path):
            os.remove(wav_path)


def test_acoustic_pause_and_speaking_rate_analysis():
    """Verify speaking rate (WPM) and pause pattern detection."""
    wav_path = _create_dummy_wav(duration_seconds=2.0)
    try:
        metrics = speech_analysis_service.analyze_acoustic_metrics(
            audio_path=wav_path,
            transcript_text="Gondi sacred traditions preserved permanently in oral memory",
        )
        assert metrics["duration_seconds"] > 0
        assert metrics["speaking_rate_wpm"] > 0
        assert metrics["pause_count"] >= 1
        assert metrics["total_silence_seconds"] > 0
        assert len(metrics["waveform_peaks"]) == 120
    finally:
        if os.path.exists(wav_path):
            os.remove(wav_path)


def test_word_level_alignments_generation():
    """Verify word-level timestamp alignments generate monotonic, non-overlapping intervals."""
    # Find or use an active transcript
    resp = client.get("/api/transcripts")
    assert resp.status_code == 200
    data = resp.json()
    transcripts = data.get("transcripts", data) if isinstance(data, dict) else data
    assert len(transcripts) > 0
    t = next((tr for tr in transcripts if tr.get("transcript_text")), transcripts[0])
    t_id = t["id"]

    alignments = speech_analysis_service.get_or_generate_word_alignments(t_id)
    assert len(alignments) > 0
    
    prev_end = 0.0
    for a in alignments:
        assert a["start_time"] >= prev_end or abs(a["start_time"] - prev_end) < 0.1
        assert a["end_time"] > a["start_time"]
        assert 0.0 <= a["confidence"] <= 1.0
        assert len(a["word_text"]) > 0
        prev_end = a["end_time"]


def test_pronunciation_exercises_catalog_and_filtering():
    """Verify curated minimal pairs for Gondi, Koya, Santhali, and Lambadi."""
    resp = client.get("/api/v1/speech/pronunciation/exercises")
    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] >= 6
    
    languages = {ex["language"] for ex in data["exercises"]}
    assert "Gondi" in languages
    assert "Koya" in languages
    assert "Santhali" in languages
    assert "Lambadi" in languages

    # Filter by Gondi
    gondi_resp = client.get("/api/v1/speech/pronunciation/exercises?language=Gondi")
    assert gondi_resp.status_code == 200
    gondi_data = gondi_resp.json()
    assert all(ex["language"] == "Gondi" for ex in gondi_data["exercises"])
    assert any(ex["exercise_id"] == "pron_gon_01_kor_gor" for ex in gondi_data["exercises"])


def test_pronunciation_exercise_details_and_not_found():
    """Verify single pronunciation exercise endpoint and 404 behavior."""
    resp = client.get("/api/v1/speech/pronunciation/exercises/pron_gon_01_kor_gor")
    assert resp.status_code == 200
    data = resp.json()
    assert data["target_text"] == "kōr"
    assert "minimal_pair_with" in data
    assert "distinction_note" in data

    bad_resp = client.get("/api/v1/speech/pronunciation/exercises/nonexistent_exercise")
    assert bad_resp.status_code == 404


def test_pronunciation_practice_submission_and_elder_review_workflow():
    """Verify user practice submission defaults to PENDING_REVIEW and elder review gate confirms scores."""
    # 1. Practice submission
    submit_payload = {
        "exercise_id": "pron_gon_01_kor_gor",
        "user_id": "learner_tester_42",
        "audio_filename": "practice_attempt_01.wav",
        "recorded_duration": 1.4,
    }
    resp = client.post("/api/v1/speech/pronunciation/practice", json=submit_payload)
    assert resp.status_code == 200
    attempt = resp.json()
    assert attempt["status"] == "PENDING_REVIEW"
    assert attempt["human_review_required"] is True
    assert 60.0 <= attempt["phonetic_accuracy_score"] <= 100.0
    attempt_id = attempt["attempt_id"]

    # 2. Unauthorized review rejection (no elder/admin credentials)
    unauth_review = client.patch(
        f"/api/v1/speech/pronunciation/attempts/{attempt_id}/review",
        json={"reviewer_name": "Random Caller", "elder_score": 95.0, "status": "VERIFIED"},
    )
    assert unauth_review.status_code == 403

    # 3. Authorized elder review approval
    auth_review = client.patch(
        f"/api/v1/speech/pronunciation/attempts/{attempt_id}/review",
        headers={"X-User-Role": "elder"},
        json={
            "reviewer_name": "Council Elder Kumram",
            "elder_score": 92.5,
            "status": "VERIFIED",
            "feedback_notes": "Accurate unvoiced velar articulation matching authentic Adilabad lore.",
        },
    )
    assert auth_review.status_code == 200
    updated = auth_review.json()
    assert updated["status"] == "VERIFIED"
    assert updated["elder_review_score"] == 92.5
    assert updated["reviewer_name"] == "Council Elder Kumram"


def test_speech_endpoints_for_active_transcript():
    """Verify /analyze, /alignments, and /waveform endpoints for an active transcript."""
    resp = client.get("/api/transcripts")
    data = resp.json()
    transcripts = data.get("transcripts", data) if isinstance(data, dict) else data
    assert len(transcripts) > 0
    t = next((tr for tr in transcripts if tr.get("transcript_text")), transcripts[0])
    t_id = t["id"]

    # Analyze endpoint
    an_resp = client.post(f"/api/v1/speech/analyze/{t_id}")
    assert an_resp.status_code == 200
    an_data = an_resp.json()
    assert an_data["transcript_id"] == t_id
    assert "acoustic_metrics" in an_data
    assert "alignments" in an_data

    # Waveform endpoint
    wf_resp = client.get(f"/api/v1/speech/waveform/{t_id}")
    assert wf_resp.status_code == 200
    wf_data = wf_resp.json()
    assert len(wf_data["waveform_peaks"]) == 120

    # Alignments endpoint
    al_resp = client.get(f"/api/v1/speech/alignments/{t_id}")
    assert al_resp.status_code == 200
    al_data = al_resp.json()
    assert len(al_data["alignments"]) > 0
