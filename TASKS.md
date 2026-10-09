# Voice Roots — Development Task Tracker

## Active Milestone: Phase 1 & 2 Stabilization & Governance

| Task ID | Task Description | Status | Target | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **VR-AUTH-01** | Add visible Log In & Sign Up actions to header and mobile bottom dock | **Completed** | `web/` | Present on desktop header, mobile top bar, hamburger menu, and bottom dock. |
| **VR-AUTH-02** | Implement server-side salted scrypt password hashing & signed session tokens | **Completed** | `web/src/lib/serverAuth.ts` | Timing-safe equality verification, rate limiting, and 7-day HMAC-SHA256 tokens. |
| **VR-AUTH-03** | Fix mobile login page visibility and always-rendered form | **Completed** | `web/src/app/login/page.tsx` | Full email/password form visible on all devices regardless of active session. |
| **VR-AUTH-04** | Support 1-click `voiceroots2026` demo accounts for quick review | **Completed** | `web/src/lib/serverAuth.ts` | Elder Laxman, Dr. Ananya, K. Ramesh authenticate instantly. |
| **VR-AUDIO-01** | Everyday Multilingual Conversations module with 10 categories | **Completed** | `web/src/app/translate` | Dual-speaker dialogues with pronunciation and browser TTS. |
| **VR-AUDIO-02** | Audio file upload & playback with format validation | **Completed** | `web/src/app/upload` | WAV, MP3, M4A, WebM, OGG upload with real-time audio player. |
| **VR-AUDIO-03** | Real Speech-to-Text (`/api/transcribe`) & Translation (`/api/translate`) | **Completed** | `web/src/app/api/*` | Multipart audio processing, editable transcript area, separate translation panel. |
| **VR-DOCS-01** | Establish full documentation suite (PRD, Architecture, Design, etc.) | **Completed** | `docs/` | 10 governance files created accurately representing actual stack. |
| **VR-ENV-01** | Create root and web `.env.example` templates | **Completed** | `/.env.example` | Document `HF_TOKEN`, `OPENAI_API_KEY`, `AUTH_SECRET` without secrets. |
| **VR-TEST-01** | Automated End-to-End User Journey test script | **Completed** | `scripts/` | Automated verification of full login, transcribe, translate, and preserve flow (52/52 passed). |
| **VR-SYNC-01** | Offline storage queue replay audit & idempotent sync | **Completed** | `web/src/lib/offlineSync.ts` | Verify sync queue idempotency when network transitions offline -> online. |
| **VR-FLUTTER-01** | Flutter Mobile Client theme alignment & glass dock | **Completed** | `flutter_app/` | Aligned dark navy & peach color palette, elevated center FAB, and theme static accessors. |

---

## Completed Milestones
- **2026-10-10**: Flutter mobile theme alignment (`VoiceRootsTheme` aliases) and dark navy glass bottom dock (`VoiceRootsBottomNav`).
- **2026-10-10**: Comprehensive End-to-End User Journey test suite with 52 passing tests (`scripts/test_e2e_user_journey.js`).
- **2026-10-10**: Full documentation rulebook completed (`RULES.md`, `TASKS.md`, `.env.example`, `docs/*`).
- **2026-10-09**: Commit `5dd110b` & `590e0d2` — Fixed mobile header visibility, persistent login form rendering, and demo credentials on Render.
- **2026-10-09**: Full 45-test suite for authentication system passing with 0 failures (`test_auth_system.js`).
- **2026-10-09**: Full 32-test suite for multilingual transcription and translation passing with 0 failures (`test_transcribe_translate.js`).

