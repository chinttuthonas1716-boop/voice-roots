# Voice Roots: Rooting Oral Languages in Text with AI
## Community-Governed, Offline-First Speech Preservation & Linguistic Intelligence Platform

> **Current Release**: `1.0.0-production` (Milestones 1–23 Complete & Verified)  
> **Unified Single-URL Host**: [`http://127.0.0.1:8000/`](http://127.0.0.1:8000/)  
> **Automated Test Suite**: **222 / 222 Passed (100%)**  
> **Pre-Faculty Release Audit**: **26 / 26 Checkpoints Passed (100%)**  
> **Live Feature Probe**: **27 / 27 Endpoints Verified (100%)**  
> **Database Schema**: 49 Registered Tables (`alembic` head: `4c5d6e7f8a9b`)  
> **External Cloud AI Costs**: **$0.00** (100% Offline Local Compute)

---

## 1. Project Overview & Indigenous Data Sovereignty (OCAP®)

Voice Roots is an ethical, source-grounded platform for recording, transcribing, preserving, and semantically searching oral, tribal, and under-resourced languages—with deep specialization in vulnerable Dravidian tongues including **Gondi**, **Koya**, **Santhali**, and **Lambadi**.

Built in strict compliance with the **OCAP® principles** (Ownership, Control, Access, and Possession):
- **Audio Master is Immutable**: The original speaker's acoustic recording is permanently retained as an unedited 48kHz WAV master asset with cryptographic SHA-256 integrity verification.
- **AI as Annotation Layer**: Speech recognition is processed only with separate, affirmative consent and stored strictly as a non-destructive machine annotation layer.
- **Elder Human Review Guardrail**: Unwritten oral languages reject hallucinated automated machine translation in favor of mandatory community elder review (`OralLanguageElderReviewRequiredError` HTTP 503).
- **Instantaneous Consent Withdrawal**: Speakers retain the unilateral right to withdraw consent at any time, triggering sub-second removal from FTS5 full-text search, ChromaDB vector retrieval, and audio streaming endpoints.

---

## 2. Complete Milestone Architecture (Milestones 1–23)

```
Voice Roots Ecosystem
├── 1. Ingestion & Preservation (M1–M4)
│   ├── Lossless 48kHz WAV Recording & Upload
│   ├── Dual Affirmative Consent (Archive + AI)
│   ├── SHA-256 Checksum Vault & Storage Probe
│   └── SQLite 3 WAL Persistence (49 Tables)
├── 2. Speech Intelligence & Guardrails (M5–M9)
│   ├── Local Offline OpenAI Whisper (CPU/GPU)
│   ├── Community Corrections Layer Separation
│   ├── Oral Tongue Elder Translation Guardrail
│   └── ChromaDB & SQLite FTS5 Hybrid Semantic Search
├── 3. Governance & Research Ecosystem (M10–M14)
│   ├── Research Dataset Registry & Digital Preservation
│   ├── Multilingual Model Evaluation & Rollback
│   ├── Offline Voice Assistant with Local Intent Routing
│   └── Tribal Council Accreditation & Dispute Governance
├── 4. Advanced Linguistic Systems (M16–M20)
│   ├── M16: Language Knowledge Graph (Entities, Dialects, Taxonomies)
│   ├── M17: Cultural & Oral History Archives (Access Tiers: PUBLIC, COMMUNITY, SACRED)
│   ├── M18: Advanced Speech Intelligence (Word-Level Alignments, Phonetics)
│   ├── M19: Language Learning Studio (Vocabulary Flashcards, Quizzes, Mastery)
│   └── M20: Institutional Research API (Scoped Tokens, CoNLL-U, 60 req/min)
└── 5. Hardening & Pilot Readiness (M21–M23)
    ├── M21: Unified "Everything in One" Single Entrypoint SPA
    ├── M22: Infrastructure Hardening (Nosniff, DENY, CSP, Audio Shield, Rate Limiting)
    ├── M23: Pre-Pilot Remediations (PR-01 to PR-05) & 9-Document Governance Package
    └── Production Release: Native JWT Session Auth, Bcrypt Passwords, 4-Tier RBAC
```

---

## 3. Pre-Seeded Default Accounts (Evaluation & Demo)

The platform provides pre-seeded accounts covering each ecosystem role:

| Role | Email Identifier | Username | Default Password | Target Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@voiceroots.ai` | `admin` | `VoiceRootsAdmin2026!` | Full admin console, storage probe, backup pruning, institutional research key issuance, user management. |
| **Researcher** | `researcher@ciil.res.in` | `researcher` | `ResearchScholar2026!` | Research API (`/api/v1/research/*`), corpus manifests, CoNLL-U exports, dictionary exports, evaluation metrics. |
| **Community Reviewer** | `elder.reviewer@gondi.org` | `elder_reviewer` | `ElderReviewer2026!` | Community verification queue, correction approvals, cultural story validation, sacred lore governance. |
| **Field Contributor** | `field.worker@voiceroots.org` | `field_worker` | `preservation2026` | Ingestion studio, audio recording, multimodal speaker consent, machine transcription request, personal drafts. |

---

## 4. Quick Start & Execution

### 1. Unified Single-Port Execution (Recommended)
Run the entire platform from a single unified server on port 8000:

```bash
# 1. Install Python dependencies
python3 -m pip install -r backend/requirements.txt

# 2. Build production frontend SPA
npm run build --prefix frontend

# 3. Start unified application server
python3 -m uvicorn main:app --app-dir backend --port 8000 --host 0.0.0.0
```

Open your browser at:
👉 **`http://localhost:8000/`** (or `http://127.0.0.1:8000/`)

### 2. Development Mode with Hot-Reload
```bash
# Terminal 1: Backend service
python3 -m uvicorn main:app --app-dir backend --port 8000 --reload

# Terminal 2: Vite hot-reload frontend
npm run dev --prefix frontend -- --host 127.0.0.1 --port 5173
```
Open **`http://127.0.0.1:5173/`** in your browser.

---

## 5. Master Documentation Suite

Complete technical and operational documentation is provided in the repository root:

- **[OWNER_SETUP_GUIDE.md](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/OWNER_SETUP_GUIDE.md)** — Comprehensive installation, execution, and demonstration instructions.
- **[PROJECT_HANDOVER.md](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/PROJECT_HANDOVER.md)** — Project owner final handover deliverable and architecture index.
- **[API_DOCUMENTATION.md](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/API_DOCUMENTATION.md)** — Complete REST API reference, request/response models, and authentication.
- **[DEPLOYMENT.md](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/DEPLOYMENT.md)** — Production Docker deployment, Caddy/Nginx reverse proxy, and zero-downtime rollback.
- **[DATABASE_GUIDE.md](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/DATABASE_GUIDE.md)** — SQLite WAL configuration, schema (49 tables), Alembic migrations, and backups.
- **[SECURITY_REPORT.md](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/SECURITY_REPORT.md)** — Security audit, bcrypt password hashing, JWT RBAC matrix, and rate limiting.
- **[TEST_REPORT.md](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/TEST_REPORT.md)** — Empirical verification report covering 222 automated unit/regression tests.
- **[MILESTONE_23_INSTITUTIONAL_PILOT_DOCUMENTATION_PACKAGE.md](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/MILESTONE_23_INSTITUTIONAL_PILOT_DOCUMENTATION_PACKAGE.md)** — Complete 9-document governance suite (DOC-01 to DOC-09) and Operational Gate Tracker (G-01 to G-05).
- **[.env.example](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/.env.example)** — Safe production configuration template without secrets.

---

## 6. Verification Commands

```bash
# Run full automated regression & security test suite (222 tests)
pytest tests/ -v

# Run the 26-checkpoint Pre-Faculty Release Audit
python3 scratch/pre_faculty_release_audit.py

# Run the 27-endpoint Live Feature Verification
python3 scratch/test_every_feature.py

# Run linter
python3 -m ruff check

# Run frontend build verification
npm run build --prefix frontend
```

---

## 7. Ethical Safeguards & Invariants

1. **Consent Mandatory**: Audio capture consent and AI transcription consent are separate, affirmative checkboxes that default to unchecked.
2. **Zero Incurred API Cost**: Speech recognition (Whisper-local) and sentence vector embeddings run completely offline on local hardware with zero external API fees.
3. **Data Sovereignty**: The original voice recording is permanently preserved as an immutable master that is never altered during transcription, translation, or community editing.
4. **Sacred Knowledge Protected**: Restricted ceremonial and clan lore is shielded from public streaming (`SACRED_ELDER_ONLY`) and barred from open research exports.
