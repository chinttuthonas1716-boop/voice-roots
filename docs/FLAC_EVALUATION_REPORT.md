# Voice Roots – FLAC Archival Audio Masters Evaluation Report (T1.5)

**Status:** Certified & Formally Adopted  
**Evaluation Date:** 2026-11-05 18:24:53Z  
**Certified Lossless:** `True`  
**Average Storage & Bandwidth Reduction:** `84.07%`  

---

## 1. Executive Summary & Adoption Decision

In accordance with Voice Roots production launch requirements (T1.5), we evaluated the Free Lossless Audio Codec (FLAC) for storing indigenous oral audio recordings alongside or as immutable archival masters in Cloudflare R2 / local storage.

### Recommendation
> **ADOPT: FLAC demonstrated 100% bit-exact PCM sample fidelity across all test configurations with an average of 84.07% storage and bandwidth reduction. Tamper and corruption checks passed.**

FLAC achieves bit-exact, frame-for-frame mathematical sample identity (maximum absolute sample error = 0, SNR = $\infty$) across all oral recording configurations (16-bit 16kHz speech standard, 16-bit 44.1kHz field stereo, 24-bit 48kHz high-resolution oral archives) while reducing storage space and streaming egress costs by **84.07%**.

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
| 16-bit 16kHz Mono (Whisper speech standard) | 16000 Hz | 1 | 16-bit | 64044 B | 16166 B | 74.76% | 3.962x | YES |
| 16-bit 44.1kHz Stereo (Field stereo standard) | 44100 Hz | 2 | 16-bit | 264644 B | 44901 B | 83.03% | 5.894x | YES |
| 24-bit 48kHz Mono (High-res oral archive) | 48000 Hz | 1 | 24-bit | 216044 B | 23411 B | 89.16% | 9.228x | YES |
| 24-bit 48kHz Stereo (Studio high-res master) | 48000 Hz | 2 | 24-bit | 288044 B | 30772 B | 89.32% | 9.361x | YES |
| Tamper / Single-Sample Corruption Detection | 16000 Hz | 1 | 16-bit | 32044 B | 3744 B | 0.0% | 1.0x | Tamper Caught |

---

## 4. Implementation in Voice Roots Stack

- **Conversion & Verification:** `backend/flac_service.py` provides `convert_to_flac_and_verify()` and `compare_audio_samples()`.
- **Database Schema:** `transcripts` table stores both `audio_sha256` (original upload) and `flac_sha256` (lossless FLAC master), indexed via `idx_transcripts_flac_sha256`.
- **API Exposure:** Both SHA-256 hashes are exposed on `/api/v1/transcripts/upload`, `/api/upload`, and `/api/v1/transcriptions/{id}`.
- **Alembic Migration:** `backend/alembic/versions/6e7f8a9b0c1d_add_flac_sha256_to_transcripts.py`.
