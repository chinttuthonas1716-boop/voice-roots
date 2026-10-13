# Voice Roots: Rooting Oral Languages in Text with AI

Voice Roots is an ethical, source-grounded platform for recording, transcribing, preserving, and semantically searching oral, tribal, and under-resourced languages.

Under Indigenous Data Sovereignty (OCAP) principles:
- **Audio Master is Immutable**: The original speaker's acoustic recording is permanently retained as the immutable master.
- **AI as Annotation Layer**: Automated speech recognition is processed only with affirmative, separate consent and stored strictly as an annotation layer that never overwrites the master voice.
- **Honest Linguistic Capabilities**: Low-resource oral tongues (Gondi, Koya, Santhali, Lambadi) are handled with strict fidelity—rejecting hallucinated AI translation in favor of community and elder verification.

---

## Universal Multilingual Support & Global Language Matrix

Voice Roots is designed for **any language worldwide**, dynamically registering tongues across Indigenous, Regional, Scheduled, and Global categories.

| Category | Examples | Speech Recognition | Translation Viability | Vector Index |
|---|---|---|---|---|
| **Indigenous & Oral Tongues** | Gondi (`gon`), Koya (`kff`), Santhali (`sat`), Lambadi (`lmn`), Quechua (`qu`), Guarani (`gn`), Nahuatl (`nah`), Navajo (`nv`), Inuktitut (`iu`), Maori (`mi`), Hawaiian (`haw`), Tibetan (`bo`), Ainu (`ain`) | Local Whisper acoustic phonetic tokenization | **Community Elder Review Required** (Zero hallucinated MT) | Indexed in ChromaDB with transparent lexical fallback |
| **Regional & Minority Languages** | Swahili (`sw`), Yoruba (`yo`), Amharic (`am`), Zulu (`zu`), Basque (`eu`), Welsh (`cy`), Irish (`ga`) | Local Whisper / Open ASR | NLLB-200 / Open Models | Indexed in ChromaDB (Field & community literature) |
| **Constitutional / Scheduled Languages** | Telugu (`te`), Hindi (`hi`), Tamil (`ta`), Kannada (`kn`), Malayalam (`ml`), Marathi (`mr`), Odia (`or`), Bengali (`bn`), Punjabi (`pa`), Gujarati (`gu`), Urdu (`ur`) | Available (Whisper-local) | IndicTrans2 / Modern NMT | Indexed in ChromaDB (Classical & folk literature) |
| **Major World Languages** | English (`en`), Spanish (`es`), French (`fr`), Portuguese (`pt`), German (`de`), Arabic (`ar`), Chinese (`zh`), Japanese (`ja`), Korean (`ko`), Russian (`ru`), Turkish (`tr`), Indonesian (`id`), Vietnamese (`vi`) | Fully Available | Universal NMT | Indexed in ChromaDB (Global corpora & charters) |

*Dynamic Registration*: Any community can register additional world tongues at runtime via `POST /api/v1/languages/register` or the web UI modal.

---

## Architecture

- **Frontend (`frontend/`)**: React 18, TypeScript, Vite, Lucide Icons, and Glassmorphic Dark UI.
  - *Oral Studio & Archive Tab*: Dynamic language selection with auto-detection (`auto`), runtime language registration modal, separate affirmative consent controls, 3-box dual annotation workspace, Community Corrections version audit trail and submission form, Unicode font fallback stack (`Noto Sans` for Ol Chiki, Masaram Gondi, Telugu, Devanagari), accessible ARIA tablist/tabs, and multi-format exports (TXT, JSON, WebVTT) + one-click clipboard copying.
  - *Semantic Vector Resources Tab*: ChromaDB multilingual similarity search across 26 verified global field records with transparent lexical exact/token fallback, dynamic language filter, and community resource contribution modal.
  - *Universal Language Registry & Evaluation Tab*: Comprehensive matrix of BCP 47 codes, scripts, speech models, translation status for 44+ world languages, plus live Multi-Modal Quality & Linguistic Evaluation suite (WER/CER, elder-review guardrails compliance, vector search MRR/Hit@k metrics).
- **Backend (`backend/`)**: FastAPI, Python 3.14, Uvicorn.
  - REST endpoints for upload, transcription (`/api/transcribe`), acoustic language detection (`/api/detect-language`), source-grounded translation (`/api/translate`), vector search (`/api/v1/resources/search`), dynamic languages registry (`/api/v1/languages`), runtime registration (`/api/v1/languages/register`), community corrections (`/api/v1/transcripts/{id}/corrections`), community submissions (`/api/v1/resources/submit`), dataset quality audit (`/api/v1/dataset/audit`), linguistic evaluation (`/api/v1/evaluation/*`), atomic backups (`/api/v1/system/backup`), and operational telemetry (`/api/v1/system/telemetry`).
- **Database & Storage**:
  - **SQLite (`backend/voice_roots.db`)**: Relational source of truth for recordings, dual annotation layers, versioned community corrections, contributor submissions, and consent timestamps.
  - **ChromaDB (`backend/chroma_db/`)**: Persistent vector store with custom `VoiceRootsMultilingualEmbeddingFunction` (384-dim subword/character n-grams operating 100% offline).
- **Speech & Translation Pipelines**:
  - Local Whisper (`base` model) running completely offline with zero paid API costs, supporting automatic language identification.
  - Universal Translation Layer (`UniversalTranslationManager`) with adapter architecture and strict Indigenous oral protections preventing automated MT without elder review.
  - Multi-format audio decoding engine supporting MP3, WAV, M4A, FLAC, OGG, and WebM via macOS CoreAudio / FFmpeg.
- **Dataset (`data/`)**:
  - 26 field-grounded linguistic records in `data/processed/language_resources.jsonl` sourced with verified open licenses (CC BY 4.0, CC0, CC BY-NC 4.0) from AI4Bharat, Mozilla Common Voice, CIIL, PARADISEC, and global indigenous archives.

---

## Quick Start

### 1. Start the FastAPI Backend
```bash
# From repository root
PATH="scratch/bin:$PATH" VOICE_ROOTS_TRANSCRIPTION_PROVIDER=whisper-local VOICE_ROOTS_WHISPER_MODEL_SIZE=base python3 -m uvicorn main:app --app-dir backend --port 8000 --reload
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.

### 3. Run the Automated Test Suite & Production Build
```bash
# Run all 117 pytest tests (unit, integration, real ASR, and regression suites)
PYTHONPATH=backend pytest -v

# Or run by test category:
pytest -m unit -v         # Fast isolated unit tests (fixtures and mocks)
pytest -m integration -v  # Local SQLite and ChromaDB integration tests
pytest -m real_ai -v      # Real offline Whisper inference on actual recordings

# Run complete automated quality checks and build diagnostics:
./scripts/run_quality_checks.sh

# Run frontend typecheck and production build
npm --prefix frontend run typecheck
npm --prefix frontend run build
```

---

## Release Documentation & Production Operations

For complete deployment architectures, Dockerfile templates, persistent volume setup, backup/recovery, and rollback plans, see:
- [docs/RELEASE_CHECKLIST.md](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/docs/RELEASE_CHECKLIST.md) — Pre-flight audit verification and release checklist
- [docs/PILOT_GUIDE.md](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/docs/PILOT_GUIDE.md) — Controlled pilot release checklist and tester feedback form
- [docs/DEPLOYMENT.md](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/docs/DEPLOYMENT.md) — Step-by-step production operations and persistent volume guide
- [docs/TROUBLESHOOTING.md](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/docs/TROUBLESHOOTING.md) — Diagnostics for FFmpeg, Whisper, storage isolation, and OCAP controls
- [docs/API_CONTRACT.md](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/docs/API_CONTRACT.md) — Canonical REST API specifications and error shapes
- [.env.example](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/.env.example) — Production environment configuration template

### Health & Readiness Probes
- `GET /ready` (or `/api/v1/ready`) — Container orchestrator readiness probe verifying SQLite, audio storage write permissions, and ChromaDB.
- `GET /health` (or `/api/v1/health`) — Liveness probe with sanitized status output.

---

## Ethical Non-Negotiables (OCAP Principles)
1. **Consent Gating**: Audio capture consent and AI transcription consent are separate, affirmative checkboxes that default to unchecked.
2. **Zero Paid API Costs**: Speech recognition (Whisper-local) and vector embeddings run completely offline on local hardware with zero external API fees.
3. **Data Sovereignty**: The original voice recording is permanently preserved as an immutable master that is never altered during transcription, translation, or community editing.

