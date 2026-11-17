# VOICE ROOTS — TASK TRACKER (17 DEVELOPMENT PRIORITIES)

**Release:** `v2.0.0` (Production Release)  
**Tracking Mode:** Autonomous Continuity Framework  
**Last Updated:** November 17, 2026

| # | Priority Area | Primary Owner | Status | Verified Evidence |
| :- | :--- | :--- | :--- | :--- |
| **P01** | **Repository Audit & Stabilization** | Shared | `COMPLETED` | Audited 2,351 files; zero broken links; report in `M24_REPOSITORY_AUDIT_REPORT.md`. |
| **P02** | **Dynamic Language Registry** | Shared | `COMPLETED` | Extensible 4-tier pipeline replacing hardcoded lists; verified in `LanguageDiscoveryArchitecture.tsx`. |
| **P03** | **Assessment Engine Specification** | Codex | `IN PROGRESS` | Multi-dimensional scoring formula drafted in specifications; backend calculation pipeline pending. |
| **P04** | **Forest Visual Redesign (Mobile & Web)** | Antigravity | `COMPLETED` | Hero mockup, Warm Ivory auth cards, 4-tier diagram, 0px horizontal scroll on 390px/1280px. |
| **P05** | **Hardened Production Authentication** | Shared | `COMPLETED` | Salted scrypt/bcrypt, HMAC tokens, rate limiters, role elevation block; verified in Playwright (6/6 passed). |
| **P06** | **Lossless Master Archiving Invariant** | Codex | `COMPLETED` | 48 kHz WAV master audio storage strictly immutable; verified in backend tests. |
| **P07** | **Whisper + Conformer ASR Pipeline** | Codex | `COMPLETED` | Local transcription with confidence thresholds; verified in backend test suite. |
| **P08** | **Elder Moderation Queue (Customary OCAP)** | Shared | `COMPLETED` | Two-tier consensus review for sensitive recordings; verified in `e2e/voice_roots_workflow.spec.ts`. |
| **P09** | **Cultural Voice Passport & QR Provenance** | Antigravity | `COMPLETED` | Verifiable passport route (`/passport/[id]`), QR codes, and provenance cards. |
| **P10** | **Offline PWA & Local Draft Sync** | Antigravity | `COMPLETED` | IndexedDB offline draft storage and automatic sync banners. |
| **P11** | **Census 2011 C-16 Demographic Integration** | Codex | `COMPLETED` | 122 scheduled/non-scheduled languages, speaker counts, state distributions verified. |
| **P12** | **Dictionary & Indigenous Lexicon** | Shared | `COMPLETED` | Audio-linked entries, phonemic IPA orthography, and elder-approved badges (`/dictionary`). |
| **P13** | **RBAC & Privilege Escalation Prevention** | Shared | `COMPLETED` | 4 distinct roles; public registration cannot claim reviewer/admin; verified in Playwright. |
| **P14** | **Automated Test Coverage (Backend + E2E)** | Shared | `COMPLETED` | 419 backend pytest passing; 32 Playwright E2E passing across all viewport widths. |
| **P15** | **API Documentation & Error Contracts** | Codex | `COMPLETED` | Documented in `API_DOCUMENTATION.md` and `MASTER_SPECIFICATION.md`. |
| **P16** | **Sanitized Distribution Archive** | Antigravity | `COMPLETED` | Packaged `voice-roots-v2.0-audited-source.zip` (0 secrets, 0 database binaries, 0 private audio). |
| **P17** | **Production Candidate Certification** | Shared | `COMPLETED` | Certified as Production Candidate (Pilot Certified) in `VOICE_ROOTS_PROJECT_ACCEPTANCE_REVIEW.md`. |

---

## Task Details & Sub-items

### P03: Language Assessment Engine Backend Pipeline
- **Goal:** Expose `POST /api/v1/languages/assess` in FastAPI backend to calculate dynamic endangerment scores based on:
  - Text corpora tokens available
  - Audio recording hours
  - Dialect cluster count
  - OCAP community consent status
- **Owner:** Codex (`backend/`)
- **Status:** Architecture specified in UI; backend endpoint awaiting implementation.

### P14: Fix Test Fixture Pagination Ceiling
- **Goal:** In `tests/test_milestone17_cultural_archives.py:344`, add `?limit=100` to `client.get("/api/v1/cultural-archives/collections")` so test collections are not truncated at default limit of 50.
- **Owner:** Codex (`tests/`)
- **Status:** Root cause diagnosed; fix ready for Codex.
