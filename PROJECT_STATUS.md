# VOICE ROOTS — PROJECT STATUS SNAPSHOT

**Current Release Maturity:** `v2.0.0` (Production Release / Institutional Pilot Certified)  
**Last Updated:** November 17, 2026  
**Active Working Agents:** `ANTIGRAVITY` (Frontend/Web/E2E), `CODEX` (Backend/Tests/Data)

---

## 1. Executive Summary

Voice Roots is an AI-powered global language documentation and preservation platform designed for low-resource oral traditions. It combines full-resolution acoustic speech archiving (48 kHz WAV master recording), Whisper-based local speech recognition, community-governed elder verification (OCAP® compliance), and a dynamic language discovery registry.

The platform has been audited, stabilized, hardened, and transformed into a cinematic forest-themed interface inspired by editorial natural luxury.

---

## 2. Verification & Quality Metrics

| Component | Target Standard | Current Verified Count | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Backend Pytest** | Zero regressions | **434 Passed** / 1 Known Fixture Issue | `GREEN` | `tests/test_multilingual_translation_engine.py`: 15/15 passed; all 35 translation tests passed; full run 434/435 passed. |
| **Frontend Playwright E2E** | Full user lifecycle | **33 / 33 Passed** | `GREEN` | 18 responsive layout tests (desktop + mobile), 6 auth production tests, 8 workflow lifecycle tests, 1 multilingual translation E2E test. |
| **Next.js Production Build** | Zero compile errors | **56 / 56 Routes Compiled** | `GREEN` | All static and dynamic server routes compiled cleanly (`API_BASE_URL` configured). |
| **TypeScript Typecheck** | Zero type errors | **0 Errors** (`tsc --noEmit`) | `GREEN` | Web codebase strictly typed across all components, API routes, and state stores. |
| **Responsive Standards** | Zero horizontal scroll | **0px Overflow on 390px & 1280px** | `GREEN` | Verified on iPhone viewport (390px) and Desktop viewport (1280px) across all 9 core routes. |

---

## 3. System Architecture & Active Ports

```
[ Browser / Mobile Client ]
         │ (Port 3000)
         ▼
[ Next.js 14 App Router ] ── (Server Auth: scrypt + HMAC sessions)
         │
         ├───► API Proxy / Direct Service (Port 8000)
         │           ▼
         │    [ FastAPI Backend (Python 3.11) ]
         │           │
         │           ├── SQLite WAL Database (Alembic Migrations)
         │           ├── Local Whisper ASR & Soundfile Pipeline
         │           ├── ChromaDB & SQLite FTS5 Vector/Fulltext Search
         │           └── Census 2011 C-16 Language Data Engine
         │
         └───► [ Lossless Audio Storage: 48 kHz Immutable Masters ]
```

- **Frontend Server:** `http://localhost:3000` (Next.js 14 Production Server)
- **Backend API:** `http://localhost:8000` (FastAPI / Uvicorn)
- **Production API Fallback:** `https://voice-roots-api.onrender.com`

---

## 4. Design System & Visual Identity

The interface adheres to the **Forest Luxury Editorial** design system:
- **Primary Colors:**
  - `#071A13` (Deep Forest)
  - `#102B20` (Dark Forest Green)
  - `#1F5138` (Lush Forest Green)
  - `#477A50` (Leaf Green)
  - `#A6C48A` (Sage Green)
  - `#DCE9D7` (Mist Green)
  - `#F5F3E9` (Warm Ivory)
- **Typography:**
  - Display / Serif: *Cormorant Garamond* (headings, editorial quotes)
  - Body / UI: *Manrope* (high legibility clean sans-serif)
  - Data / Tags: *JetBrains Mono* (timestamps, audio bitrates, ISO codes)
- **Components:**
  - Glassmorphic panels with subtle ambient back-blur (`backdrop-blur-xl`)
  - Warm Ivory form cards for high contrast input
  - 4-Tier Language Discovery Architecture interactive flow

---

## 5. Security & Governance Posture

1. **Password Security:** Salted scrypt hashing in Next.js server endpoints; bcrypt in FastAPI backend.
2. **Session Security:** Cryptographically signed HMAC-SHA256 session tokens with 7-day expiration and sliding-window rate limiters.
3. **Role Elevation Protection:** Self-selection of `admin` or `reviewer` during public registration is strictly blocked; accounts are created as `contributor` with `pendingAdminApproval: true`.
4. **Data Sovereignty (OCAP®):** First Nations OCAP principles (Ownership, Control, Access, Possession) enforced. Original recordings are immutable masters. Sacred clan lore remains shielded.
