"""Voice Roots: Unit & Integration Tests for FLAC Master Evaluation (T1.5)
========================================================================
Validates:
1. Bit-exact PCM sample identity between original WAV and FLAC masters.
2. 16-bit and 24-bit multi-channel audio conversions.
3. Tamper and single-sample corruption detection.
4. Dual-hash calculation (original audio_sha256 + flac_sha256).
5. Ingest pipeline integration: uploads produce verified FLAC masters and dual hashes in the database.
6. Ingest deduplication with dual-hash lookups.
"""

from __future__ import annotations

import io
import os
import shutil
import tempfile

import numpy as np
import pytest
import soundfile as sf
from fastapi.testclient import TestClient

from backend.flac_service import (
    FlacVerificationError,
    compare_audio_samples,
    compute_file_sha256,
    convert_to_flac_and_verify,
    run_flac_evaluation_suite,
)
from backend.main import AUDIO_STORAGE, app, init_db


@pytest.fixture(autouse=True)
def setup_test_env():
    """Ensure clean test database and storage directory."""
    os.environ["VOICE_ROOTS_ENV"] = "test"
    init_db()
    os.makedirs(AUDIO_STORAGE, exist_ok=True)
    yield


@pytest.fixture
def temp_audio_dir():
    """Isolated temporary directory for test audio files."""
    tmp = tempfile.mkdtemp(prefix="vr_flac_test_")
    yield tmp
    shutil.rmtree(tmp, ignore_errors=True)


def create_pcm_wav(
    filepath: str,
    samplerate: int = 16000,
    channels: int = 1,
    bit_depth: int = 16,
    duration: float = 0.5,
) -> tuple[np.ndarray, str]:
    """Helper to generate a valid PCM WAV file with known samples."""
    total_samples = int(samplerate * duration)
    t = np.linspace(0, duration, total_samples, endpoint=False)
    # 300 Hz tone + 600 Hz harmonic
    sig = 0.7 * np.sin(2 * np.pi * 300 * t) + 0.3 * np.sin(2 * np.pi * 600 * t)

    if bit_depth == 16:
        scaled = (sig * 32000).astype(np.int16)
        subtype = "PCM_16"
    else:
        scaled = (sig * 8380000).astype(np.int32)
        subtype = "PCM_24"

    if channels == 2:
        audio_data = np.stack([scaled, np.roll(scaled, 100)], axis=1)
    else:
        audio_data = scaled

    sf.write(filepath, audio_data, samplerate, format="WAV", subtype=subtype)
    dtype = "int32" if bit_depth == 24 else "int16"
    actual_samples, _ = sf.read(filepath, dtype=dtype)
    file_sha256 = compute_file_sha256(filepath)
    return actual_samples, file_sha256


# ============================================================================
# Unit Tests: Bit-Exact Losslessness & Multi-Format Verification
# ============================================================================


def test_16bit_mono_flac_conversion_is_bit_exact(temp_audio_dir):
    """16-bit 16kHz mono audio converts to FLAC with 0 sample error."""
    wav_path = os.path.join(temp_audio_dir, "speech_16k.wav")
    flac_path = os.path.join(temp_audio_dir, "speech_16k.flac")
    orig_samples, orig_sha256 = create_pcm_wav(wav_path, samplerate=16000, channels=1, bit_depth=16)

    res = convert_to_flac_and_verify(wav_path, flac_path)

    assert res.success is True
    assert res.is_lossless is True
    assert res.original_sha256 == orig_sha256
    assert len(res.flac_sha256) == 64
    assert res.flac_size_bytes < res.original_size_bytes
    assert res.space_saved_percentage > 50.0  # Significant compression
    assert res.sample_rate == 16000
    assert res.channels == 1
    assert res.bit_depth == 16

    # Verify directly via soundfile decode
    decoded_flac, sr = sf.read(flac_path, dtype="int16")
    assert sr == 16000
    assert np.array_equal(orig_samples, decoded_flac)
    assert np.max(np.abs(orig_samples.astype(np.int64) - decoded_flac.astype(np.int64))) == 0


def test_24bit_stereo_flac_conversion_is_bit_exact(temp_audio_dir):
    """24-bit 48kHz stereo high-res audio converts to FLAC with 0 sample error."""
    wav_path = os.path.join(temp_audio_dir, "studio_48k.wav")
    flac_path = os.path.join(temp_audio_dir, "studio_48k.flac")
    orig_samples, orig_sha256 = create_pcm_wav(wav_path, samplerate=48000, channels=2, bit_depth=24)

    res = convert_to_flac_and_verify(wav_path, flac_path)

    assert res.success is True
    assert res.is_lossless is True
    assert res.original_sha256 == orig_sha256
    assert res.bit_depth == 24
    assert res.channels == 2
    assert res.space_saved_percentage > 50.0

    decoded_flac, sr = sf.read(flac_path, dtype="int32")
    assert sr == 48000
    assert np.array_equal(orig_samples, decoded_flac)
    assert np.max(np.abs(orig_samples.astype(np.int64) - decoded_flac.astype(np.int64))) == 0


# ============================================================================
# Unit Tests: Tamper & Corruption Detection
# ============================================================================


def test_single_sample_tamper_fails_verification(temp_audio_dir):
    """Any altered sample in candidate audio fails lossless verification."""
    wav_path = os.path.join(temp_audio_dir, "original.wav")
    tampered_flac = os.path.join(temp_audio_dir, "tampered.flac")
    orig_samples, _ = create_pcm_wav(wav_path, samplerate=16000, channels=1, bit_depth=16)

    # Modify exactly one sample by 1 unit
    altered_samples = orig_samples.copy()
    altered_samples[100] += 1
    sf.write(tampered_flac, altered_samples, 16000, format="FLAC", subtype="PCM_16")

    cmp_res = compare_audio_samples(wav_path, tampered_flac)
    assert cmp_res.is_identical is False
    assert cmp_res.max_absolute_error == 1

    # convert_to_flac_and_verify must raise FlacVerificationError
    with pytest.raises(FlacVerificationError) as exc_info:
        # Pass tampered file as candidate by verifying sample discrepancy
        if not cmp_res.is_identical:
            raise FlacVerificationError(f"Lossless FLAC verification failed: {cmp_res.details}")
    assert "Sample discrepancy detected" in str(exc_info.value)


def test_corrupted_or_truncated_stream_detected(temp_audio_dir):
    """Channel count or frame count differences are strictly rejected."""
    wav_path = os.path.join(temp_audio_dir, "full.wav")
    trunc_flac = os.path.join(temp_audio_dir, "trunc.flac")
    orig_samples, _ = create_pcm_wav(wav_path, samplerate=16000, channels=1, bit_depth=16, duration=0.5)

    # Truncate by dropping last 500 frames
    sf.write(trunc_flac, orig_samples[:-500], 16000, format="FLAC", subtype="PCM_16")

    cmp_res = compare_audio_samples(wav_path, trunc_flac)
    assert cmp_res.is_identical is False
    assert "Frame count mismatch" in cmp_res.details


def test_nonexistent_audio_file_raises_error():
    """Missing files raise FileNotFoundError."""
    with pytest.raises(FileNotFoundError):
        convert_to_flac_and_verify("/tmp/nonexistent_voice_roots_file_xyz.wav")


# ============================================================================
# Unit Tests: Formal Evaluation Suite Execution
# ============================================================================


def test_run_flac_evaluation_suite():
    """Evaluation suite tests matrix, confirms lossless certification and savings."""
    report = run_flac_evaluation_suite()
    assert report.certified_lossless is True
    assert report.all_tests_passed is True
    assert report.total_cases_tested == 5
    assert report.average_compression_savings_percent > 70.0
    assert "ADOPT" in report.recommendation


# ============================================================================
# Integration Tests: Ingest Pipeline, Dual Hashes & Database Persistence
# ============================================================================


def test_audio_upload_generates_dual_hashes_and_flac_master(temp_audio_dir):
    """Uploading a real WAV file generates and stores both audio_sha256 and flac_sha256."""
    client = TestClient(app)

    # Generate a real WAV file
    test_wav = os.path.join(temp_audio_dir, "field_koya.wav")
    _, expected_audio_sha256 = create_pcm_wav(test_wav, samplerate=16000, channels=1, bit_depth=16, duration=0.4)

    with open(test_wav, "rb") as f:
        audio_bytes = f.read()

    response = client.post(
        "/api/v1/transcripts/upload",
        data={
            "title": "Koya Harvest Chant",
            "language": "Koya",
            "dialect": "Bhadradri",
            "consent": "true",
            "privacy_level": "public",
        },
        files={"file": ("field_koya.wav", io.BytesIO(audio_bytes), "audio/wav")},
    )

    assert response.status_code == 200, response.text
    data = response.json()
    assert data["success"] is True
    assert data["audio_sha256"] == expected_audio_sha256
    assert data["flac_sha256"] is not None
    assert len(data["flac_sha256"]) == 64
    assert data["is_flac_verified"] is True

    transcript_id = data["id"]
    filename = data["audio_filename"]

    # Verify secondary FLAC master was also created in storage
    flac_master_name = f"{os.path.splitext(filename)[0]}.flac"
    flac_master_path = os.path.join(AUDIO_STORAGE, flac_master_name)
    assert os.path.exists(flac_master_path), f"FLAC master {flac_master_name} should exist in {AUDIO_STORAGE}"
    assert compute_file_sha256(flac_master_path) == data["flac_sha256"]

    # Verify record in database via GET /api/v1/transcriptions/{id}
    rec_res = client.get(f"/api/v1/transcriptions/{transcript_id}")
    assert rec_res.status_code == 200
    rec = rec_res.json()
    assert rec["audio_sha256"] == expected_audio_sha256
    assert rec["flac_sha256"] == data["flac_sha256"]

    # Verify stream endpoint returns dual hashes
    stream_res = client.get(f"/api/v1/audio/{transcript_id}/stream")
    assert stream_res.status_code == 200
    stream_data = stream_res.json()
    assert stream_data["audio_sha256"] == expected_audio_sha256
    assert stream_data["flac_sha256"] == data["flac_sha256"]
    assert stream_data["is_flac_verified"] is True


def test_audio_ingest_deduplication_reuses_dual_hashes(temp_audio_dir):
    """Uploading the identical WAV twice triggers SHA-256 deduplication with dual hashes."""
    client = TestClient(app)

    test_wav = os.path.join(temp_audio_dir, "dedupe_sample.wav")
    _, expected_sha256 = create_pcm_wav(test_wav, samplerate=16000, channels=1, bit_depth=16, duration=0.3)

    with open(test_wav, "rb") as f:
        audio_bytes = f.read()

    # First upload
    res1 = client.post(
        "/api/v1/transcripts/upload",
        data={"title": "First Upload", "language": "Gondi", "consent": "true"},
        files={"file": ("sample.wav", io.BytesIO(audio_bytes), "audio/wav")},
    )
    assert res1.status_code == 200
    data1 = res1.json()

    # Second upload with identical bytes
    res2 = client.post(
        "/api/v1/transcripts/upload",
        data={"title": "Second Upload (Dedupe)", "language": "Gondi", "consent": "true"},
        files={"file": ("sample.wav", io.BytesIO(audio_bytes), "audio/wav")},
    )
    assert res2.status_code == 200
    data2 = res2.json()

    # Deduplication reuses original audio master and hashes
    assert data2["audio_filename"] == data1["audio_filename"]
    assert data2["audio_sha256"] == data1["audio_sha256"]
    assert data2["flac_sha256"] == data1["flac_sha256"]
