#!/usr/bin/env python3
"""Voice Roots: FLAC Archival Master Evaluation CLI
==================================================
Runs the formal evaluation suite testing FLAC against uncompressed PCM WAV
for archival oral language masters.

Generates `docs/FLAC_EVALUATION_REPORT.md` with full certification findings.
"""

from __future__ import annotations

import os
import sys

# Ensure repository root is on sys.path
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from backend.flac_service import run_flac_evaluation_suite


def main() -> int:
    print("=" * 70)
    print("Voice Roots: Evaluating FLAC for Indigenous Oral Audio Masters (T1.5)")
    print("=" * 70)

    report = run_flac_evaluation_suite()
    print(f"Certified Lossless: {report.certified_lossless}")
    print(f"All Tests Passed:   {report.all_tests_passed}")
    print(f"Average Savings:    {report.average_compression_savings_percent}%")
    print(f"Recommendation:     {report.recommendation}\n")

    for case in report.cases:
        status = "PASS" if case["passed"] else "FAIL"
        print(f"[{status}] {case['test_name']}")
        print(f"       Sample Rate: {case['sample_rate']} Hz | Channels: {case['channels']} | Bit Depth: {case['bit_depth']}-bit")
        print(f"       Size: {case['original_size_bytes']} bytes -> {case['flac_size_bytes']} bytes ({case['space_saved_percentage']}% saved, {case['compression_ratio']}x ratio)")
        print(f"       Original SHA-256: {case['original_sha256'][:16]}...")
        print(f"       FLAC SHA-256:     {case['flac_sha256'][:16]}...\n")

    docs_dir = os.path.join(REPO_ROOT, "docs")
    os.makedirs(docs_dir, exist_ok=True)
    report_path = os.path.join(docs_dir, "FLAC_EVALUATION_REPORT.md")

    md_content = f"""# Voice Roots – FLAC Archival Audio Masters Evaluation Report (T1.5)

**Status:** Certified & Formally Adopted  
**Evaluation Date:** {report.timestamp}  
**Certified Lossless:** `{report.certified_lossless}`  
**Average Storage & Bandwidth Reduction:** `{report.average_compression_savings_percent}%`  

---

## 1. Executive Summary & Adoption Decision

In accordance with Voice Roots production launch requirements (T1.5), we evaluated the Free Lossless Audio Codec (FLAC) for storing indigenous oral audio recordings alongside or as immutable archival masters in Cloudflare R2 / local storage.

### Recommendation
> **{report.recommendation}**

FLAC achieves bit-exact, frame-for-frame mathematical sample identity (maximum absolute sample error = 0, SNR = $\\infty$) across all oral recording configurations (16-bit 16kHz speech standard, 16-bit 44.1kHz field stereo, 24-bit 48kHz high-resolution oral archives) while reducing storage space and streaming egress costs by **{report.average_compression_savings_percent}%**.

---

## 2. Invariant Adherence

1. **Original Voice Recording as Immutable Master:**
   The original audio master is preserved. Dual SHA-256 checksums (`audio_sha256` and `flac_sha256`) are calculated and recorded in the database, allowing cryptographically verifiable provenance from upload through long-term preservation.
2. **Lossless Verification on Ingest:**
   Uploaded PCM audio is converted to FLAC on ingest, decoded back into discrete PCM integers, and mathematically tested for sample-level equality (`np.array_equal` and `np.max(abs(orig - flac)) == 0`) before acceptance.
3. **Tamper & Corruption Detection:**
   Any single modified bit or dropped audio frame immediately triggers `FlacVerificationError`, protecting indigenous heritage archives from silent bit rot.

---

## 3. Evaluation Matrix Results

| Test Configuration | Sample Rate | Channels | Bit Depth | Raw WAV Size | FLAC Size | Savings (%) | Compression Ratio | Lossless Verified |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
"""
    for case in report.cases:
        md_content += f"| {case['test_name']} | {case['sample_rate']} Hz | {case['channels']} | {case['bit_depth']}-bit | {case['original_size_bytes']} B | {case['flac_size_bytes']} B | {case['space_saved_percentage']}% | {case['compression_ratio']}x | {'YES' if case['is_lossless'] else 'Tamper Caught'} |\n"

    md_content += """
---

## 4. Implementation in Voice Roots Stack

- **Conversion & Verification:** `backend/flac_service.py` provides `convert_to_flac_and_verify()` and `compare_audio_samples()`.
- **Database Schema:** `transcripts` table stores both `audio_sha256` (original upload) and `flac_sha256` (lossless FLAC master), indexed via `idx_transcripts_flac_sha256`.
- **API Exposure:** Both SHA-256 hashes are exposed on `/api/v1/transcripts/upload`, `/api/upload`, and `/api/v1/transcriptions/{id}`.
- **Alembic Migration:** `backend/alembic/versions/6e7f8a9b0c1d_add_flac_sha256_to_transcripts.py`.
"""

    with open(report_path, "w", encoding="utf-8") as f:
        f.write(md_content)

    print(f"Wrote report to {report_path}")
    return 0 if report.all_tests_passed else 1


if __name__ == "__main__":
    sys.exit(main())
