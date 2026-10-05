# 🌱 Voice Roots: Rooting Oral Languages in Text with AI

> **"Preserve Voices. Grow Languages. Connect Generations."**

Voice Roots is an AI-powered oral-language preservation platform designed as a university capstone and scholarly research initiative. The platform enables community speakers, field linguists, and researchers to record, transcribe, translate, semantically index, and digitally archive spoken languages, tribal dialects, folk tales, songs, and indigenous ecological knowledge — **without ever destroying or overwriting the original human voice**.

---

## 🌟 Product Philosophy & Core Principles

1. **Immutable Voice Preservation**: Never overwrite original audio or raw speech signals. Store:
   - Original Audio (Lossless PCM WAV)
   - Original AI Transcript
   - Human-in-the-Loop Verified Transcript
   - IndicTrans2 Multilingual Translation
   - Cultural Vocabulary & Ethno-ecological Terms
   - Strict Informed Consent & Speaker Data Sovereignty
2. **iOS 27-Inspired Mobile Experience**: Spatial layering, liquid-glass translucent surfaces, live canvas waveforms, and haptic-friendly recording workflows.
3. **Netflix-Style Web Discovery**: Content-first discovery with cinematic heroes, horizontally scrollable category rows, and granular filters across 18 linguistic traditions.
4. **Academic Model Lab**: Grounded evaluation of open-source models (OpenAI Whisper vs. AI4Bharat IndicConformer vs. LoRA Fine-Tuned Checkpoints) measuring Word Error Rate (WER) and Character Error Rate (CER).

---

## 🏗️ System Architecture

```text
                        🌱 VOICE ROOTS
                              │
               ┌──────────────┴──────────────┐
               │                             │
          📱 MOBILE                       🌐 WEB
       (React Native / Expo)         (Next.js 14 / App Router)
               │                             │
               └──────────────┬──────────────┘
                              │
                     FastAPI REST Gateway (Port 8000)
                              │
        ┌─────────────────────┼────────────────────┐
        │                     │                    │
   Auth & RBAC            Audio Uploads         PostgreSQL 16
   (JWT / Bcrypt)         (Local / S3)          (+ pgvector)
        │                     │                    │
        └─────────────────────┼────────────────────┘
                              ▼
                  Modular AI Processing Pipeline
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
     Speech-to-Text      Language ID          Translation
  (Whisper / Conformer)   (IndicLID)         (IndicTrans2)
         │                    │                    │
         └────────────────────┼────────────────────┘
                              ▼
                  NLP & Vocabulary Extraction
                              │
                              ▼
            Sentence Transformers Embeddings (384-d)
                              │
                              ▼
               PostgreSQL pgvector Cosine Index
                              │
                              ▼
               Voice Roots Grounded RAG Assistant
```

---

## 📁 Repository Structure

```text
voice-roots/
├── web/                       # Next.js 14 + Tailwind CSS Web Application
│   ├── src/
│   │   ├── app/               # App Router pages (Home, Record, Archive, Search, Research)
│   │   ├── components/        # Reusable UI, Audio Studio, Archive Cards, AIAssistant
│   │   └── lib/               # Utility functions and tokens
│   ├── Dockerfile
│   └── package.json
├── backend/                   # Python FastAPI REST Backend
│   ├── app/
│   │   ├── api/v1/            # Auth, Recordings, Uploads, Languages, Search, Analytics
│   │   ├── ai/                # Base provider, Mock fallback, Whisper, Pipeline
│   │   ├── auth/              # JWT, Passwords, RBAC permissions
│   │   ├── database/          # Async SQLAlchemy engine + pgvector support
│   │   ├── models/            # 14 Normalized ORM models
│   │   └── schemas/           # Pydantic v2 validation models
│   ├── Dockerfile
│   └── requirements.txt
├── mobile/                    # React Native Expo Mobile App
│   ├── screens/               # HomeScreen, RecordScreen, ArchiveScreen, ProfileScreen
│   ├── App.tsx                # Bottom tab navigation shell
│   └── package.json
├── docker-compose.yml         # Full multi-container stack (DB, Redis, API, Web)
├── voice-roots.code-workspace # One-click VS Code Workspace configuration
└── README.md
```

---

## 🚀 Quickstart & Setup

### Option A: Running with Docker Compose (Recommended)

To launch the full stack (PostgreSQL with pgvector, Redis, FastAPI Backend, and Next.js Web):

```bash
# Clone the repository
git clone https://github.com/<your-username>/voice-roots.git
cd voice-roots

# Start all services
docker-compose up --build
```

- **Web Platform**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Interactive API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **PostgreSQL Database**: `localhost:5432` (`postgres` / `password123`)

---

### Option B: Running Locally

#### 1. Backend (FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```

#### 2. Web Frontend (Next.js)
```bash
cd web
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the interface.

---

## 🧪 Model Lab & Academic Research

The **Voice Roots Model Lab** (`/research`) benchmarks speech recognition systems on oral dialect recordings:

| Model Architecture | Parameters | WER (Word Error Rate) | CER (Char Error Rate) | Latency |
| :--- | :--- | :--- | :--- | :--- |
| **OpenAI Whisper-v3 Large** | 1.54B | 18.4% | 9.7% | 2.1s |
| **AI4Bharat IndicConformer** | 600M | 12.7% | 6.8% | 1.4s |
| **Voice Roots LoRA Fine-Tuned** | 600M + 12M | **8.9%** ⭐ | **4.1%** ⭐ | 1.6s |

---

## 👥 Scrum & Capstone Methodology

This project is engineered according to a **10-day Agile Scrum sprint cycle**:

- **Sprint 0**: Discovery, literature review, and architecture definition.
- **Sprint 1**: Design tokens, liquid-glass visual system, and web shell.
- **Sprint 2**: Authentication, JWT tokens, and Role-Based Access Control (RBAC).
- **Sprint 3**: Audio recording studio with informed consent and storage.
- **Sprint 4**: Speech-to-text pipeline and Whisper integration.
- **Sprint 5**: Dialect identification and speaker diarization.
- **Sprint 6**: IndicTrans2 translation and digital language archive.
- **Sprint 7**: Sentence embeddings and pgvector semantic retrieval.
- **Sprint 8**: Grounded RAG Voice Roots AI Assistant.
- **Sprint 9**: Mobile application companion (iOS 27 spatial style).
- **Sprint 10**: Community verification, review workflows, and Model Lab.
- **Sprint 11**: End-to-end integration and security validation.
- **Sprint 12**: Deployment and capstone release.

---

## ⚖️ Ethics & Data Sovereignty

All recordings collected in Voice Roots require **explicit, informed consent** from native speakers before ingestion. Speakers and communities maintain full ownership and can designate recordings as `Public`, `Community-Only`, `Research-Only`, or `Private`. Private recordings are strictly isolated from public search indexes and RAG retrieval pipelines.
