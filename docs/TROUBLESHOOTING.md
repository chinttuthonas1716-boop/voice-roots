# Voice Roots: Operations & Troubleshooting Guide

**Diagnostic Reference for System Operators and Developers**

---

## 1. Speech Recognition & Audio Pipeline

### Symptom: `TranscriptionProviderError: ffmpeg is not available`
- **Cause**: The local Whisper transcription provider requires FFmpeg to convert incoming audio files (MP3, M4A, WebM, OGG, FLAC) to 16kHz mono PCM waveforms.
- **Resolution**:
  - **macOS**: `brew install ffmpeg` or ensure `scratch/bin/ffmpeg` is on system `PATH`.
  - **Linux / Debian / Ubuntu**: `sudo apt-get update && sudo apt-get install -y ffmpeg`.
  - **Docker**: Add `RUN apt-get update && apt-get install -y ffmpeg` to your `Dockerfile`.
  - **Verification**: Run `ffmpeg -version` in terminal.

### Symptom: High CPU usage or slow transcription during Whisper inference
- **Cause**: Whisper model size is configured too large for the host CPU (e.g., `medium` or `large-v3` running on a 2-core CPU).
- **Resolution**:
  - Set `VOICE_ROOTS_WHISPER_MODEL_SIZE=base` or `VOICE_ROOTS_WHISPER_MODEL_SIZE=tiny` in `.env`.
  - Whisper `base` executes in ~2–5 seconds for 20-second audio files on modern CPU hardware with zero external API fees.

### Symptom: `TranscriptionNotConfiguredError`
- **Cause**: `VOICE_ROOTS_TRANSCRIPTION_PROVIDER` is set to `disabled` or not exported.
- **Resolution**:
  - Export `VOICE_ROOTS_TRANSCRIPTION_PROVIDER=whisper-local` in your execution environment.
  - Check provider status via `GET /api/v1/system/telemetry`.

---

## 2. Translation & Linguistic Safety Guardrails

### Symptom: HTTP 503 `OralLanguageElderReviewRequiredError` on Gondi, Koya, Santhali, or Lambadi
- **Important Note**: **THIS IS NOT A BUG.**
- **Cause**: Indigenous oral languages lack standard written corpora. Automated generative AI translation produces dangerous linguistic hallucinations. Voice Roots strictly prohibits automated machine translation for unwritten oral tongues.
- **Resolution**:
  - Machine translation requests for oral tongues return HTTP 503 with the explanation:  
    `"Translation restricted: Language 'Gondi' is an unwritten oral heritage tongue. Automated AI translation without community elder review is prohibited to prevent linguistic hallucination."`
  - To translate these recordings, submit a verified community translation through the Elder Review Queue or the Community Corrections tab.

### Symptom: HTTP 503 `UnsupportedLanguagePairError`
- **Cause**: Voice Roots adheres to strict linguistic honesty: if a language pair does not have a configured local adapter (such as IndicTrans2 or identity passthrough), the API fails truthfully rather than returning hallucinated English text.
- **Resolution**:
  - Identity translations (`en -> en`, `te -> te`) succeed automatically.
  - For new language pairs, configure an open-source local adapter or submit human translations.

---

## 3. Storage, Backups & Security Isolation

### Symptom: HTTP 404 when requesting `/storage/backups/voice_roots_...db`
- **Important Note**: **THIS IS A SECURITY FEATURE.**
- **Cause**: Voice Roots restricts static web file serving strictly to `/storage/audio` ([backend/main.py](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/backend/main.py)). Database snapshots are stored in `backend/backups/`, outside public web routes.
- **Resolution**:
  - Do not attempt to download raw database snapshots through public HTTP endpoints.
  - To trigger an authorized atomic database snapshot, use the authenticated administrative endpoint:
    ```bash
    curl -X POST http://localhost:8000/api/v1/system/backup -H "X-Admin-Key: $VOICE_ROOTS_ADMIN_KEY"
    ```
  - Backups are written directly to the host filesystem at `backend/backups/`.

### Symptom: Audio streaming stops or range requests fail in browser
- **Cause**: Streaming large audio files requires HTTP `206 Partial Content` (Range headers) support.
- **Resolution**:
  - Starlette's `StaticFiles` mounted at `/storage/audio` natively supports byte-range requests.
  - Verify that reverse proxies (e.g. Nginx, Cloudflare) do not buffer audio chunks or strip `Accept-Ranges: bytes` headers.

---

## 4. Vector Store & Semantic Search

### Symptom: `ChromaDB query failed` or search returns empty list
- **Cause**: Either the ChromaDB directory permissions are restricted or an empty query was submitted.
- **Resolution**:
  - Verify directory permissions on `backend/chroma_db/`.
  - Voice Roots automatically falls back to transparent lexical and subword token matching for low-resource scripts (such as Ol Chiki or Telugu script) when dense cosine similarity is below threshold.
  - Check vector store health via `GET /api/v1/resources/health`.

### Symptom: Contributed community words do not appear in vector search immediately
- **Cause**: Contributed words must be approved through the Elder Moderation Queue before being indexed.
- **Resolution**:
  - Open **Tab 2: Semantic Vector Resources**.
  - Click **Elder Review Queue**.
  - Inspect the pending submission and click **Approve & Index to ChromaDB**.
  - Once approved, the record is immediately embedded in 384 dimensions and indexed into ChromaDB.

---

## 5. OCAP Protocol & Consent Controls

### Symptom: Speaker requests deletion or withdrawal of consent
- **Protocol**: Under Indigenous Data Sovereignty (OCAP), speakers hold perpetual ownership over their voice.
- **Procedure**:
  - Call the consent withdrawal endpoint:
    ```bash
    curl -X POST http://localhost:8000/api/v1/transcripts/<transcript_id>/withdraw-consent
    ```
  - The recording is instantly marked `status = 'Consent Withdrawn'` and soft-deleted from all public archive listings (`GET /api/transcripts`).
  - The physical master audio file is retained safely in sovereign custodial storage without public access.

---

## 6. Common Health Check Commands

| Target | Command | Expected Output |
| :--- | :--- | :--- |
| **Backend API Health** | `curl -s http://localhost:8000/health` | `{"status": "healthy", "database": "sqlite", ...}` |
| **Readiness Probe** | `curl -s http://localhost:8000/ready` | `{"status": "ready", "checks": {"database": "ok", ...}}` |
| **Operational Telemetry** | `curl -s http://localhost:8000/api/v1/system/telemetry` | `{"costs": {"external_api_costs_usd": 0.0, ...}}` |
| **Vector Store Health** | `curl -s http://localhost:8000/api/v1/resources/health` | `{"status": "healthy", "indexed_records": 27, ...}` |
| **Dataset License Audit** | `curl -s http://localhost:8000/api/v1/dataset/audit` | `{"quality_score_percent": 100.0, ...}` |

