# Voice Roots — Complete Owner Setup & Execution Guide
## How to Install, Configure, Run, and Maintain the Complete Platform

> **Target Audience**: Project Owner, Lead Maintainers, and Deployers  
> **Platform Version**: `1.0.0-production` (Milestones 1–23 Complete)  
> **Repository**: `https://github.com/chinttuthonas1716-boop/voice-roots`

---

## 1. System Requirements & Prerequisites

Voice Roots is an **offline-first, zero-cloud-cost** platform. It runs entirely on local compute without requiring external paid cloud APIs.

### Hardware Requirements
- **Architecture**: x86_64 or Apple Silicon (ARM64)
- **Memory (RAM)**: Minimum 4 GB; Recommended 8 GB+ (for local Whisper and MiniLM embeddings)
- **Disk Storage**: Minimum 10 GB free space for lossless 48kHz audio storage and models

### Software Prerequisites
- **Python**: 3.10 to 3.14
- **Node.js**: v18.x or v20.x+ (with `npm`)
- **Git**: 2.30+
- **Audio Decoding**: macOS built-in CoreAudio (`afconvert`) or native `ffmpeg` (`brew install ffmpeg` / `apt-get install ffmpeg`)
- *(Optional)* **Docker & Docker Compose**: v24+ for containerized deployments

---

## 2. Quick-Start (Local Development & Demonstration)

### Step 1: Clone Repository
```bash
git clone https://github.com/chinttuthonas1716-boop/voice-roots.git
cd voice-roots
```

### Step 2: Configure Environment
Copy the safe configuration template:
```bash
cp .env.example .env
```
Key environment variables:
```ini
VOICE_ROOTS_ENV=development
VOICE_ROOTS_ADMIN_KEY=VoiceRootsAdmin2026!
VOICE_ROOTS_JWT_SECRET=voice-roots-secure-enterprise-jwt-signing-secret-key-2026-production
AI_PROVIDER=whisper-local
WHISPER_MODEL_SIZE=base
```

### Step 3: Install Backend Dependencies
```bash
python3 -m pip install -r backend/requirements.txt
```
*(Dependencies include FastAPI, Uvicorn, SQLite3, PyTorch, Whisper, ChromaDB, Sentence-Transformers, Bcrypt, PyJWT, Structlog).*

### Step 4: Build Frontend Assets
```bash
cd frontend
npm install
npm run build
cd ..
```
*(Compiles the single-page application into `frontend/dist/` with zero TypeScript errors).*

### Step 5: Start Unified Backend & Web Application
```bash
python3 -m uvicorn main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
```

Open your browser at:
👉 **`http://localhost:8000/`** (or `http://127.0.0.1:8000/`)

---

## 3. Pre-Seeded Demonstration Accounts

The platform automatically seeds four role-based accounts on first launch:

| Role | Email Identifier | Username | Default Password | Primary Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@voiceroots.ai` | `admin` | `VoiceRootsAdmin2026!` | Full platform administration, backup pruning, storage probe, institutional research key issuance, user management. |
| **Researcher** | `researcher@ciil.res.in` | `researcher` | `ResearchScholar2026!` | Access to Research API (`/api/v1/research/*`), corpus manifests, CoNLL-U exports, dictionary exports, evaluation telemetry. |
| **Community Reviewer** | `elder.reviewer@gondi.org` | `elder_reviewer` | `ElderReviewer2026!` | Community verification queue, correction approvals, cultural story validation, sacred lore governance. |
| **Field Contributor** | `field.worker@voiceroots.org` | `field_worker` | `preservation2026` | Ingestion studio, audio recording, multimodal speaker consent, machine transcription request, personal drafts. |

---

## 4. Key Workflows & Demonstration Guide

### 1. Ingestion & Affirmative Consent
1. Navigate to **Recording Studio** (`#record` or `http://localhost:8000/#record`).
2. Record live audio using the browser microphone or upload a `.wav` / `.mp3` file.
3. Select Language: **Gondi**, **Koya**, **Santhali**, **Lambadi**, or choose among 44+ registered languages.
4. **Enforce Consent**: The submission button is disabled until the affirmative speaker consent checkbox is selected.
5. Click **Save Recording**. Master audio is saved with its SHA-256 cryptographic checksum.

### 2. Speech Transcription & Separation of Layers
1. Upon upload, click **Transcribe Audio**.
2. Offline local Whisper creates draft text stored in `machine_transcript_text`.
3. Community members propose corrections stored in the `corrections` child table.
4. **Invariant**: Master audio and machine transcript are never overwritten.

### 3. Translation & Oral Language Elder Review Guardrails
1. Navigate to **Translation Hub** (`#translate`).
2. Supported pairs (e.g. Hindi $\leftrightarrow$ English, Telugu $\leftrightarrow$ English) translate with full transliteration.
3. Select an unwritten oral tongue (e.g. **Gondi** or **Koya**):
   - The system intercepts the request and returns **HTTP 503**:
   - *"Translation restricted: Language 'Gondi' is an unwritten oral heritage tongue. Automated AI translation without community elder review is prohibited to prevent linguistic hallucination."*

### 4. Interactive Cultural Archives & OCAP Governance
1. Navigate to **Cultural Archives** (`#cultural`).
2. Explore curated oral histories, ethnobotanical lore, and seasonal songs.
3. Stories marked `SACRED_ELDER_ONLY` are shielded from anonymous streaming.
4. Trigger **Consent Withdrawal**: within $< 1.0\text{s}$, the recording is masked with HTTP 404 and evicted from vector search.

### 5. Advanced Milestone Hubs
- **Knowledge Graph** (`#graph`): Visualizes language family taxonomies, dialect relationships, and cultural concepts.
- **Speech Intelligence** (`#speech`): Word-level forced alignments, phonetic breakdown, and pronunciation score practice.
- **Language Learning** (`#learning`): Flashcards, dialogue comprehension, and cultural lore quizzes.
- **Research Portal** (`#research`): Scoped token registration, CoNLL-U corpus export, and rate limiting telemetry.

---

## 5. Verification & Test Execution Commands

Run the full automated test suite anytime:

```bash
# 1. Run all 222 automated regression & security tests
pytest tests/ -v

# 2. Run the 26-checkpoint Pre-Faculty Release Audit
python3 scratch/pre_faculty_release_audit.py

# 3. Run the 27-endpoint Live Feature Verification
python3 scratch/test_every_feature.py

# 4. Check codebase linting and style
python3 -m ruff check

# 5. Verify frontend TypeScript types and production build
npm run build --prefix frontend
```

---

## 6. Maintenance & Backups

### Create Manual Backup
```bash
curl -X POST http://localhost:8000/api/v1/system/backup \
  -H "X-Admin-Key: VoiceRootsAdmin2026!"
```

### Inspect Storage & Filesystem Health
```bash
curl http://localhost:8000/api/v1/system/storage-probe
```

### Automated Tiered Retention (PR-04)
The rolling backup service automatically preserves:
- All snapshots within 7 days
- 1 snapshot per day for days 8–30
- 1 snapshot per week for days 31–90
- All `pre_m*` milestone anchor baselines indefinitely
