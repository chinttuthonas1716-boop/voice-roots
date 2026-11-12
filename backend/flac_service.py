"""Voice Roots: Lossless Audio Master & FLAC Verification Service
============================================================
Evaluates, converts, and verifies lossless audio preservation for Voice Roots
indigenous oral archive recordings.

Core principles:
1. Lossless Bit-Exactness: Every decoded PCM sample in the FLAC master must
   match the original uncompressed source frame-for-frame with ZERO error (max abs diff = 0).
2. Dual-Hash Provenance: Computes and stores both SHA-256 digests:
   - `audio_sha256`: SHA-256 of the originally uploaded master.
   - `flac_sha256`: SHA-256 of the bit-exact FLAC archive master.
3. Storage Efficiency: Measures compression ratio and storage savings (typically
   70% to 85% bandwidth and disk reduction compared to raw PCM WAV).
4. Tamper & Corruption Detection: Any truncated, clipped, or modified sample
   instantly fails verification.
"""

from __future__ import annotations

import hashlib
import logging
import math
import os
import shutil
import tempfile
import time
from dataclasses import asdict, dataclass
from typing import Any

import numpy as np
import soundfile as sf

logger = logging.getLogger(__name__)


class FlacError(RuntimeError):
    """Base exception for FLAC audio service errors."""


class FlacVerificationError(FlacError):
    """Raised when candidate audio fails bit-exact lossless verification."""


class FlacConversionError(FlacError):
    """Raised when encoding or decoding audio fails."""


@dataclass
class SampleComparisonResult:
    """Mathematical sample-by-sample comparison between two audio streams."""

    is_identical: bool
    sample_count: int
    channels: int
    sample_rate: int
    max_absolute_error: int
    mean_absolute_error: float
    signal_to_noise_ratio_db: float
    details: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class FlacConversionResult:
    """Outcome of converting an audio master to FLAC with lossless verification."""

    success: bool
    is_lossless: bool
    original_sha256: str
    flac_sha256: str
    original_size_bytes: int
    flac_size_bytes: int
    compression_ratio: float
    space_saved_bytes: int
    space_saved_percentage: float
    duration_seconds: float
    sample_rate: int
    channels: int
    bit_depth: int
    flac_path: str
    error_message: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class FlacEvaluationReport:
    """Formal evaluation report certifying FLAC as an archival master format."""

    certified_lossless: bool
    all_tests_passed: bool
    total_cases_tested: int
    cases: list[dict[str, Any]]
    average_compression_savings_percent: float
    recommendation: str
    timestamp: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def compute_file_sha256(file_path: str) -> str:
    """Compute the SHA-256 digest of a file in 64 KB chunks."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    digest = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            digest.update(chunk)
    return digest.hexdigest()


def compare_audio_samples(
    original_path: str, candidate_path: str
) -> SampleComparisonResult:
    """Decode and compare audio samples between two files frame-by-frame.

    Uses integer PCM decoding matching the bit-depth of the original file
    so that comparisons are strictly discrete and exact without floating-point
    rounding noise.
    """
    try:
        info_orig = sf.info(original_path)
        info_cand = sf.info(candidate_path)
    except Exception as exc:
        raise FlacConversionError(f"Failed to read audio metadata: {exc}") from exc

    if info_orig.samplerate != info_cand.samplerate:
        return SampleComparisonResult(
            is_identical=False,
            sample_count=info_orig.frames,
            channels=info_orig.channels,
            sample_rate=info_orig.samplerate,
            max_absolute_error=-1,
            mean_absolute_error=-1.0,
            signal_to_noise_ratio_db=0.0,
            details=(
                f"Sample rate mismatch: original={info_orig.samplerate}Hz, "
                f"candidate={info_cand.samplerate}Hz"
            ),
        )

    if info_orig.channels != info_cand.channels:
        return SampleComparisonResult(
            is_identical=False,
            sample_count=info_orig.frames,
            channels=info_orig.channels,
            sample_rate=info_orig.samplerate,
            max_absolute_error=-1,
            mean_absolute_error=-1.0,
            signal_to_noise_ratio_db=0.0,
            details=(
                f"Channel count mismatch: original={info_orig.channels}, "
                f"candidate={info_cand.channels}"
            ),
        )

    # Determine integer decoding target based on subtype
    # 24-bit PCM is decoded as int32
    if "24" in info_orig.subtype or "32" in info_orig.subtype:
        dtype = "int32"
    else:
        dtype = "int16"

    try:
        data_orig, _ = sf.read(original_path, dtype=dtype)
        data_cand, _ = sf.read(candidate_path, dtype=dtype)
    except Exception as exc:
        raise FlacConversionError(f"Failed to decode audio samples: {exc}") from exc

    if data_orig.shape != data_cand.shape:
        return SampleComparisonResult(
            is_identical=False,
            sample_count=info_orig.frames,
            channels=info_orig.channels,
            sample_rate=info_orig.samplerate,
            max_absolute_error=-1,
            mean_absolute_error=-1.0,
            signal_to_noise_ratio_db=0.0,
            details=(
                f"Frame count mismatch: original={data_orig.shape[0]} frames, "
                f"candidate={data_cand.shape[0]} frames"
            ),
        )

    # Convert to int64 for arithmetic subtraction to prevent integer overflow
    orig_i64 = data_orig.astype(np.int64)
    cand_i64 = data_cand.astype(np.int64)
    abs_diff = np.abs(orig_i64 - cand_i64)

    max_err = int(np.max(abs_diff))
    mean_err = float(np.mean(abs_diff))

    is_identical = bool(np.array_equal(data_orig, data_cand)) and max_err == 0

    if is_identical:
        snr_db = float("inf")
        details = (
            f"Bit-exact lossless match across {data_orig.shape[0]} frames "
            f"({info_orig.channels} ch, {info_orig.samplerate} Hz, {dtype})."
        )
    else:
        signal_power = float(np.mean(orig_i64**2))
        noise_power = float(np.mean(abs_diff**2))
        if noise_power > 0:
            snr_db = 10.0 * math.log10(max(1e-12, signal_power / noise_power))
        else:
            snr_db = float("inf")
        details = (
            f"Sample discrepancy detected: max_err={max_err}, mean_err={mean_err:.4f}, "
            f"SNR={snr_db:.2f}dB."
        )

    return SampleComparisonResult(
        is_identical=is_identical,
        sample_count=int(data_orig.shape[0]),
        channels=int(info_orig.channels),
        sample_rate=int(info_orig.samplerate),
        max_absolute_error=max_err,
        mean_absolute_error=mean_err,
        signal_to_noise_ratio_db=snr_db,
        details=details,
    )


def convert_to_flac_and_verify(
    input_path: str,
    flac_target_path: str | None = None,
    allow_non_lossless_fallback: bool = False,
) -> FlacConversionResult:
    """Convert an audio upload to FLAC on ingest and prove losslessness.

    Steps:
    1. Reads original audio and computes `original_sha256`.
    2. Encodes to FLAC preserving sample rate, channel count, and bit depth.
    3. Decodes both original and FLAC files and verifies 100% sample identity.
    4. Computes `flac_sha256` of the verified FLAC master.
    5. Computes storage reduction and returns a FlacConversionResult.

    Raises:
        FileNotFoundError: if input_path does not exist.
        FlacVerificationError: if samples do not match and allow_non_lossless_fallback is False.
    """
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input audio file not found: {input_path}")

    original_size = os.path.getsize(input_path)
    original_sha256 = compute_file_sha256(input_path)

    # Determine whether target path was provided
    cleanup_flac_on_failure = False
    if flac_target_path is None:
        fd, flac_target_path = tempfile.mkstemp(prefix="flac_master_", suffix=".flac")
        os.close(fd)
        cleanup_flac_on_failure = True

    try:
        info = sf.info(input_path)
    except Exception as exc:
        if cleanup_flac_on_failure and os.path.exists(flac_target_path):
            os.remove(flac_target_path)
        raise FlacConversionError(f"Unsupported audio stream: {exc}") from exc

    # Determine bit depth and subtype
    if "24" in info.subtype:
        dtype = "int32"
        flac_subtype = "PCM_24"
        bit_depth = 24
    else:
        dtype = "int16"
        flac_subtype = "PCM_16"
        bit_depth = 16

    try:
        # Read source samples
        samples, sr = sf.read(input_path, dtype=dtype)
        # Write bit-exact FLAC
        sf.write(flac_target_path, samples, sr, format="FLAC", subtype=flac_subtype)
    except Exception as exc:
        if cleanup_flac_on_failure and os.path.exists(flac_target_path):
            os.remove(flac_target_path)
        raise FlacConversionError(f"FLAC encoding failed: {exc}") from exc

    flac_size = os.path.getsize(flac_target_path)
    flac_sha256 = compute_file_sha256(flac_target_path)

    # Verification: decode both and compare samples frame-for-frame
    cmp_result = compare_audio_samples(input_path, flac_target_path)

    if not cmp_result.is_identical:
        if not allow_non_lossless_fallback:
            if cleanup_flac_on_failure and os.path.exists(flac_target_path):
                os.remove(flac_target_path)
            raise FlacVerificationError(
                f"Lossless FLAC verification failed: {cmp_result.details}"
            )
        logger.warning(
            "FLAC conversion was not 100%% bit-exact: %s", cmp_result.details
        )

    # Compression metrics
    compression_ratio = round(original_size / max(1, flac_size), 3)
    space_saved = max(0, original_size - flac_size)
    space_saved_pct = round((space_saved / max(1, original_size)) * 100.0, 2)
    duration = round(float(info.duration), 3)

    return FlacConversionResult(
        success=True,
        is_lossless=cmp_result.is_identical,
        original_sha256=original_sha256,
        flac_sha256=flac_sha256,
        original_size_bytes=original_size,
        flac_size_bytes=flac_size,
        compression_ratio=compression_ratio,
        space_saved_bytes=space_saved,
        space_saved_percentage=space_saved_pct,
        duration_seconds=duration,
        sample_rate=int(info.samplerate),
        channels=int(info.channels),
        bit_depth=bit_depth,
        flac_path=flac_target_path,
        error_message=None if cmp_result.is_identical else cmp_result.details,
    )


def run_flac_evaluation_suite(
    temp_dir: str | None = None,
) -> FlacEvaluationReport:
    """Run comprehensive evaluation suite testing FLAC against raw PCM.

    Tests multiple sample rates (16kHz, 44.1kHz, 48kHz), bit depths (16, 24),
    and channel configurations (mono, stereo). Also validates that sample
    modifications or corruption are reliably caught.
    """
    suite_dir = temp_dir or tempfile.mkdtemp(prefix="voice_roots_flac_eval_")
    os.makedirs(suite_dir, exist_ok=True)

    test_matrix = [
        {
            "name": "16-bit 16kHz Mono (Whisper speech standard)",
            "sr": 16000,
            "channels": 1,
            "subtype": "PCM_16",
            "bit_depth": 16,
            "duration": 2.0,
        },
        {
            "name": "16-bit 44.1kHz Stereo (Field stereo standard)",
            "sr": 44100,
            "channels": 2,
            "subtype": "PCM_16",
            "bit_depth": 16,
            "duration": 1.5,
        },
        {
            "name": "24-bit 48kHz Mono (High-res oral archive)",
            "sr": 48000,
            "channels": 1,
            "subtype": "PCM_24",
            "bit_depth": 24,
            "duration": 1.5,
        },
        {
            "name": "24-bit 48kHz Stereo (Studio high-res master)",
            "sr": 48000,
            "channels": 2,
            "subtype": "PCM_24",
            "bit_depth": 24,
            "duration": 1.0,
        },
    ]

    cases: list[dict[str, Any]] = []
    total_savings_pct = 0.0

    try:
        for idx, cfg in enumerate(test_matrix):
            sr = cfg["sr"]
            ch = cfg["channels"]
            dur = cfg["duration"]
            bit_depth = cfg["bit_depth"]
            total_samples = int(sr * dur)

            # Generate synthetic speech-like acoustic signals (fundamental + harmonics + silence)
            t = np.linspace(0, dur, total_samples, endpoint=False)
            # 220Hz fundamental + 440Hz harmonic + 880Hz formant
            wave_sig = 0.6 * np.sin(2 * np.pi * 220 * t) + 0.3 * np.sin(2 * np.pi * 440 * t) + 0.1 * np.sin(2 * np.pi * 880 * t)
            # Add an intermittent silence gap representing natural conversational pauses
            silence_start = int(total_samples * 0.4)
            silence_end = int(total_samples * 0.6)
            wave_sig[silence_start:silence_end] = 0.0

            if bit_depth == 16:
                scaled = (wave_sig * 32000).astype(np.int16)
            else:
                scaled = (wave_sig * 8380000).astype(np.int32)

            if ch == 2:
                # Slight phase offset on right channel
                if bit_depth == 16:
                    scaled_r = np.roll(scaled, int(sr * 0.01))
                else:
                    scaled_r = np.roll(scaled, int(sr * 0.01))
                audio_data = np.stack([scaled, scaled_r], axis=1)
            else:
                audio_data = scaled

            # Save reference WAV
            wav_path = os.path.join(suite_dir, f"test_case_{idx}.wav")
            flac_path = os.path.join(suite_dir, f"test_case_{idx}.flac")
            sf.write(wav_path, audio_data, sr, format="WAV", subtype=cfg["subtype"])

            res = convert_to_flac_and_verify(wav_path, flac_path)
            total_savings_pct += res.space_saved_percentage

            cases.append({
                "test_name": cfg["name"],
                "sample_rate": sr,
                "channels": ch,
                "bit_depth": bit_depth,
                "original_size_bytes": res.original_size_bytes,
                "flac_size_bytes": res.flac_size_bytes,
                "space_saved_percentage": res.space_saved_percentage,
                "compression_ratio": res.compression_ratio,
                "is_lossless": res.is_lossless,
                "original_sha256": res.original_sha256,
                "flac_sha256": res.flac_sha256,
                "passed": res.is_lossless and res.success,
            })

        # Test tamper / corruption detection
        tamper_wav = os.path.join(suite_dir, "tamper_orig.wav")
        tamper_flac = os.path.join(suite_dir, "tamper_modified.flac")
        t_data = (np.sin(np.linspace(0, 10, 16000)) * 20000).astype(np.int16)
        sf.write(tamper_wav, t_data, 16000, format="WAV", subtype="PCM_16")

        # Create altered FLAC with 1 modified sample
        t_data_mod = t_data.copy()
        t_data_mod[500] += 5
        sf.write(tamper_flac, t_data_mod, 16000, format="FLAC", subtype="PCM_16")

        tamper_cmp = compare_audio_samples(tamper_wav, tamper_flac)
        tamper_detection_passed = (
            not tamper_cmp.is_identical and tamper_cmp.max_absolute_error == 5
        )

        cases.append({
            "test_name": "Tamper / Single-Sample Corruption Detection",
            "sample_rate": 16000,
            "channels": 1,
            "bit_depth": 16,
            "original_size_bytes": os.path.getsize(tamper_wav),
            "flac_size_bytes": os.path.getsize(tamper_flac),
            "space_saved_percentage": 0.0,
            "compression_ratio": 1.0,
            "is_lossless": False,
            "original_sha256": compute_file_sha256(tamper_wav),
            "flac_sha256": compute_file_sha256(tamper_flac),
            "passed": tamper_detection_passed,
        })

    finally:
        shutil.rmtree(suite_dir, ignore_errors=True)

    all_passed = all(c["passed"] for c in cases)
    avg_savings = round(total_savings_pct / len(test_matrix), 2)

    return FlacEvaluationReport(
        certified_lossless=all_passed,
        all_tests_passed=all_passed,
        total_cases_tested=len(cases),
        cases=cases,
        average_compression_savings_percent=avg_savings,
        recommendation=(
            "ADOPT: FLAC demonstrated 100% bit-exact PCM sample fidelity "
            f"across all test configurations with an average of {avg_savings}% "
            "storage and bandwidth reduction. Tamper and corruption checks passed."
            if all_passed
            else "REJECT: Lossless fidelity or corruption detection failed."
        ),
        timestamp=time.strftime("%Y-%m-%d %H:%M:%SZ", time.gmtime()),
    )


if __name__ == "__main__":
    import json
    report = run_flac_evaluation_suite()
    print(json.dumps(report.to_dict(), indent=2))
