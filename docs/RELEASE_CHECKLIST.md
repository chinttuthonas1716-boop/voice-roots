# Voice Roots: Final Release Checklist

**Release Target**: Voice Roots v1.0.0-rc1  
**Project**: *Voice Roots: Rooting Oral Languages in Text with AI*  
**Audited Branch**: `agent/antigravity`  
**Security & Cost Status**: Zero Paid API Costs ($0.00), 100% Offline Capable, Sovereign OCAP Compliance

---

## 1. Automated Test & Build Gates

- [x] **Full Pytest Suite Passed**:
  - Command: `PYTHONPATH=backend pytest -v`
  - Result: **117/117 passed** (100% pass rate in 7.17s)
  - Unit Tests: 6 passed (`pytest -m unit`)
  - Integration Tests: 7 passed (`pytest -m integration`)
  - Real Audio AI Inference: 1 passed (`pytest -m real_ai`)
  - Full Regression Suite: 103 passed
- [x] **Frontend Typecheck & Production Build**:
  - Command: `npm --prefix frontend run typecheck && npm --prefix frontend run build`
  - Result: TypeScript passed with **0 errors**; Vite bundled 1,568 modules in 1.54s into `frontend/dist/`.
- [x] **Unified Continuous Integration Runner**:
  - Command: `./scripts/run_quality_checks.sh`
  - Result: All 6 validation stages passed with exit code 0.
- [x] **Zero External API Cost Telemetry**:
  - Command: `GET /api/v1/system/telemetry`
  - Result: `costs.external_api_costs_usd: 0.00`, billing status: `100% Free / Self-Hosted`.

---

## 2. Security, Privacy & Data Sovereignty (OCAP)

- [x] **Static Storage Scope Isolation**:
  - Root storage mounting is restricted strictly to `/storage/audio` ([backend/main.py](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/backend/main.py)).
  - Direct HTTP requests to `/storage/backups/...` and `/storage/voice_roots.db` return **HTTP 404**.
  - All database snapshots are relocated to `backend/backups/`, completely outside any web-accessible directory.
- [x] **Consent Enforcement on All Audio Ingestion**:
  - `POST /api/upload` requires affirmative speaker consent (`voice-roots-consent-v1`). Uploads without consent are rejected with **HTTP 400**.
  - Automated transcription requires separate affirmative opt-in (`voice-roots-ai-transcription-v1`).
- [x] **OCAP Consent Withdrawal Endpoint**:
  - `POST /api/v1/transcripts/{id}/withdraw-consent` immediately marks the record `Consent Withdrawn` and soft-deletes it from public archive endpoints while maintaining physical master recordings under sovereign custodial integrity.
- [x] **Sacred & Restricted Knowledge Protection**:
  - `POST /api/v1/resources/submit` strictly rejects sacred or secret knowledge submissions with **HTTP 403 Forbidden** under Indigenous Ethical Protocols.
- [x] **Secret Hygiene & Clean Repository**:
  - No private API keys, credentials, or production secrets are tracked in git.
  - `.gitignore` protects database files (`*.db`), backups (`backend/backups/`), model weights (`models/`, `*.pt`), and audio masters (`*.wav`, `*.mp3`, `*.ogg`).

---

## 3. Data Integrity & Persistence Verification

- [x] **Relational SQLite Source of Truth**:
  - Database: `backend/voice_roots.db`
  - Integrity Check: `PRAGMA integrity_check;` returns `ok`.
  - Record Parity: All 89 SQLite transcript rows correspond 1-to-1 with physical audio files on disk.
- [x] **Physical Master Audio Preservation**:
  - Location: `backend/storage/audio/`
  - File Integrity: 89 preserved audio files with SHA-256 verification and duration extraction.
  - Master Immutability: AI transcription and community corrections exist strictly as non-destructive annotation layers.
- [x] **ChromaDB Vector Store**:
  - Location: `backend/chroma_db/`
  - Collection: `language_resources` contains 27 verified records with 384-dimensional unit-normalized offline embeddings.
  - Transparent Fallback: Semantic vector search is paired with exact and token-level lexical fallback for low-resource scripts.
- [x] **Elder Moderation Queue**:
  - Tab 2 Elder Review workspace supports community submissions (`pending_verification`), approval (`verified`), and rejection.
  - Approved submissions are automatically indexed into ChromaDB with licensing and attribution.

---

## 4. Linguistic Reality & Honest Capability Grounding

- [x] **Clear Distinction Between Registered vs Tested Languages**:
  - **Real-Audio Verified (1)**: Gondi (`gon`) — verified with authentic 20s and 3m 37s acoustic speech recordings.
  - **Test-Verified (9)**: English, Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, Odia, Bengali.
  - **Benchmarked (14)**: Koya, Santhali, Lambadi, Maori, Quechua, Basque, Swahili, Welsh, Yoruba, Arabic, French, Japanese, Mandarin, Spanish.
  - **Cataloged Only (20)**: Metadata-only entries awaiting consented native community voice recordings.
- [x] **Oral Language Translation Guardrails**:
  - Unverified machine translation of oral/tribal tongues (Gondi, Koya, Santhali, Lambadi) is strictly blocked with HTTP 503 (`OralLanguageElderReviewRequiredError`) to prevent AI linguistic hallucination.
  - Unsupported language pairs fail truthfully without fabricating text.

---

## 5. Deployment Readiness

- [x] **Environment Configuration**: [`.env.example`](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/.env.example) contains complete template for production variables.
- [x] **Operations Guide**: [`docs/DEPLOYMENT.md`](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/docs/DEPLOYMENT.md) provides single-container Docker setup and volume mount configurations.
- [x] **Troubleshooting Guide**: [`docs/TROUBLESHOOTING.md`](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/docs/TROUBLESHOOTING.md) covers FFmpeg, Whisper, ChromaDB, and storage isolation diagnostics.
- [x] **Pre-Publish Gate**: The application is **local-only** and **deployment-ready**. No public cloud resources or paid billing accounts have been initialized without explicit user sign-off.

