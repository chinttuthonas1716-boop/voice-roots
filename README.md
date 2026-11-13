# Voice Roots: Rooting Oral Languages in Text with AI

**Community-Governed, Offline-First Speech Preservation & Linguistic Intelligence Platform**

> **Live Production Web Application**: [`https://voice-roots.onrender.com`](https://voice-roots.onrender.com)  
> **Live Production API Gateway**: [`https://voice-roots-api.onrender.com`](https://voice-roots-api.onrender.com)  
> **API Base Proxy Rewrite**: Next.js 14 App Router rewrites `/api/v1/:path*` to `API_BASE_URL`  
> **Production Stack**: Next.js 14 App Router (`web/`) + TypeScript + Tailwind CSS; FastAPI backend; PostgreSQL + SQLite WAL fallback; Cloudflare R2 object storage; Render hosting  
> **Continuous Integration**: GitHub Actions 4-Gate CI (Backend Pytest/Ruff, Frontend Typecheck/Build, Playwright E2E, Render Deploy)  
> **Automated Test Suite**: 100% Passing (Phase 1–3 Production Suites + Playwright E2E 8-Step Lifecycle)  
> **Ethical Governance**: Strict compliance with First Nations OCAP® Principles (Ownership, Control, Access, Possession)

---

## 1. Project Overview & Indigenous Data Sovereignty (OCAP®)

Voice Roots is an ethical, source-grounded platform designed to document, archive, revitalize, and semantically search endangered oral and indigenous languages—with core specialization in vulnerable Dravidian and Adivasi tongues including **Gondi**, **Koya**, **Santhali**, and **Lambadi**.

Built in strict compliance with the **OCAP® principles** (Ownership, Control, Access, and Possession):

- **Audio Master is Immutable**: The original speaker's acoustic recording is permanently retained as an unedited 48kHz lossless master asset with cryptographic SHA-256 integrity verification.
- **AI as an Assistive Annotation Layer**: Speech recognition (Whisper) and neural translation (IndicTrans2) are secondary annotation layers. All unreviewed machine translations carry explicit draft badges (`[DRAFT - UNREVIEWED MACHINE GENERATION]`).
- **Elder Human Review Guardrail**: Machine translations for unwritten oral tongues require mandatory community elder verification before publication.
- **Sub-Second Consent Revocation**: Speakers retain the unilateral right to withdraw consent at any time, immediately purging their records from full-text search, vector retrieval, and audio streaming endpoints.

For full governance policies, review [docs/ETHICAL_GOVERNANCE_AND_OCAP.md](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/docs/ETHICAL_GOVERNANCE_AND_OCAP.md).

---

## 2. Ethics Statement, Informed Consent & Privacy Notice

### Ethics & Data-Governance Statement

Voice Roots recognizes that indigenous voices, traditional oral folklore, and clan lineages belong exclusively to the communities from which they originate. The platform rejects extractive data-mining practices. No voice recordings or derived linguistic assets gathered through Voice Roots may be sold, licensed to commercial foundation-model corporations, or utilized for unconsented commercial speech synthesis.

### Dual Affirmative Consent Protocol

Consent is never assumed, bundled, or pre-checked:

1. **Master Archival Preservation Consent**:
   > *"I hereby give voluntary permission for my voice recording to be archived in the Voice Roots community linguistic repository. I understand that my recording will be preserved as an immutable master asset to safeguard our ancestral tongue for future generations. I retain ownership of my voice, and I may withdraw my consent at any time without penalty or explanation."*
2. **Assistive AI Transcription Consent**:
   > *"I explicitly consent to having my recorded voice processed by assistive artificial intelligence speech recognition software solely to generate a written draft transcript and phonetic alignment. I understand that machine transcripts are unreviewed drafts and will not be published as definitive community knowledge until reviewed by accredited language elders."*

### Privacy Notice & Access Tiers

Server-side access control strictly isolates recordings into four tiers:

- **`public`**: Open heritage recordings approved by speakers and elders for global cultural education.
- **`community`**: Restricted to authenticated community members and cultural reviewers.
- **`research`**: Accessible strictly to verified researchers holding institutional research tokens.
- **`private`**: Restricted strictly to the recording contributor and designated system administrators.
- **`withdrawn`**: Permanently blocked from all callers (including administrators) upon consent revocation.

---

## 3. Mandatory Ethics Clearance & Demo Data Notice (Task T4.2)

> [!IMPORTANT]
> **Academic Ethics Clearance & Field Recording Moratorium**  
> In compliance with university Institutional Review Board (IRB) requirements and international research ethics standards:
> - **Field Recording Moratorium**: No real-world community field recordings will be conducted, ingested, or archived until formal institutional ethics approval (IRB) is granted and written Bilateral Community Agreements are executed with regional tribal councils.
> - **Synthetic Demo Data**: All pre-seeded audio recordings, prompts, stories, and dictionary entries currently hosted within this repository or on the live demonstration site are **strictly synthetic, simulated, or public-domain educational placeholders** (`is_placeholder=1`, `demo-placeholder`).
> - Elder verification badges on demo records demonstrate software verification flows only and do not represent formal endorsement by tribal elders until bilateral field protocols commence.

---

## 4. Production Stack & Architecture

```text
                                 [ User / Browser ]
                                          │
                     ┌────────────────────┴────────────────────┐
                     │                                         │
              (Static Assets)                         (API Requests /api/v1/*)
                     │                                         │
                     ▼                                         ▼
         [ Render Frontend Web Service ]           [ Render API Web Service ]
            Next.js 14 App Router                      FastAPI + Uvicorn
            TypeScript + Tailwind CSS                  Python 3.11 / 3.14
            Offline PWA & Service Worker               CORS: voice-roots.onrender.com
                     │                                         │
                     └────────────────────┬────────────────────┘
                                          │
                     ┌────────────────────┴────────────────────┐
                     │                                         │
                     ▼                                         ▼
        [ Managed PostgreSQL DB ]                  [ Cloudflare R2 Storage ]
         Always-on relational store                 S3-compatible audio bucket
         Alembic automated migrations               Presigned streaming URLs
         SQLite WAL local fallback                  Object versioning enabled
```

---

## 5. Pre-Seeded Default Accounts (Evaluation & Demo)

The platform provides pre-seeded accounts covering each ecosystem role:

| Role | Email Identifier | Username | Default Password | Target Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@voiceroots.ai` | `admin` | `VoiceRootsAdmin2026!` | Admin console, deep health probe, backup restore, restricted data export, user management. |
| **Researcher** | `researcher@ciil.res.in` | `researcher` | `ResearchScholar2026!` | Research API (`/api/v1/research/*`), corpus manifests, CoNLL-U exports, dictionary exports. |
| **Community Reviewer** | `elder.reviewer@gondi.org` | `elder_reviewer` | `ElderReviewer2026!` | Community verification queue, correction approvals, cultural story validation. |
| **Field Contributor** | `field.worker@voiceroots.org` | `field_worker` | `preservation2026` | Ingestion studio, audio recording, dual affirmative consent, prompted mode. |

---

## 6. Quick Start & Execution

### 1. Local Development (Next.js 14 + FastAPI)

```bash
# Terminal 1: FastAPI Backend
python3 -m uvicorn main:app --app-dir backend --port 8000 --reload

# Terminal 2: Next.js Frontend
cd web && npm run dev
```

Open **`http://localhost:3000`** in your browser. The Next.js dev server rewrites `/api/v1/*` to `http://localhost:8000`.

### 2. Running Automated Quality Gates & Tests

```bash
# Backend unit, integration & security test suites
pytest tests/test_t*.py -v

# Python code formatting and linting
python3 -m ruff check backend/

# Frontend TypeScript typecheck
npm run typecheck --prefix web

# Frontend production build
API_BASE_URL=https://voice-roots-api.onrender.com npm run build --prefix web

# Playwright End-to-End browser test suite (8-step lifecycle)
API_BASE_URL=http://localhost:8000 npm run test:e2e --prefix web
```

---

## 7. Master Documentation Index

- **[docs/ETHICAL_GOVERNANCE_AND_OCAP.md](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/docs/ETHICAL_GOVERNANCE_AND_OCAP.md)** — OCAP charter, informed consent policy, privacy notice, and IRB approvals protocol.
- **[docs/DEPLOYMENT.md](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/docs/DEPLOYMENT.md)** — Production deployment on Render, PostgreSQL migrations, Cloudflare R2 object storage, and backups.
- **[docs/API_CONTRACT.md](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/docs/API_CONTRACT.md)** — Comprehensive REST API specification and request/response models.
- **[docs/V2.0_ROADMAP.md](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/docs/V2.0_ROADMAP.md)** — Post-launch roadmap (dialect maps, spaced repetition, pronunciation scoring).
- **[render.yaml](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/render.yaml)** — Infrastructure-as-code blueprint for Render production deployment.
- **[.env.example](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/.env.example)** — Production environment configuration template without secrets.
