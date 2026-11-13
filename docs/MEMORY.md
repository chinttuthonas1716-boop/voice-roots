# Voice Roots — Project Memory & Active Status

## Current System Status
- **Current Milestone**: Phase 1 & 2 Stabilization, Authentication Visibility & Documentation Rulebook.
- **Git HEAD**: `origin/main` synchronized.
- **Render Production Service**: Active and serving HTTP/2 200 at [https://voice-roots.onrender.com](https://voice-roots.onrender.com).
- **All 49 Routes**: Compiled and operating cleanly.

---

## Recent Milestones & Resolved Bugs
1. **Flutter Mobile Client & Theme Alignment (2026-10-10)**:
   - Added direct static color accessors on `VoiceRootsTheme` to match `VoiceRootsColors`.
   - Built dark navy translucent glass bottom dock with peach active indicator and floating center microphone FAB (`VoiceRootsBottomNav`).
   - Integrated unified navigation shell across home, explore, record studio, saved archive, and profile.
2. **Automated End-to-End User Journey Test Suite (2026-10-10)**:
   - Built 52-test automated verification suite (`scripts/test_e2e_user_journey.js`) validating the entire custodian journey:
     - Public visitor navigation & discovery (Home, Explore, Archive, Translate, Upload, Login)
     - Custodian registration, salted scrypt password hashing, HMAC-SHA256 tokens, RBAC, demo accounts
     - Multilingual conversational corpus (10 categories with phonetic guides)
     - Real audio upload validation & translation gateway
     - Idempotent sync replay protection (`/api/sync/idempotent`)
     - Flutter theme and navigation contracts
3. **Login Page Visibility Fixed (Commits `5dd110b`, `590e0d2`)**:
   - Resolved mobile header hiding in `components.css`.
   - Prevented conditional hiding of the login form on `/login` when an active user session exists.
   - Added standard `<Navbar />` to `login/page.tsx`.
   - Added dedicated Log In / Profile tab to `MobileBottomNav`.
   - Supported `voiceroots2026` across all demo accounts in `serverAuth.ts`.
4. **Everyday Conversations & Audio STT/Translation (Commit `6725807`)**:
   - Implemented 10 everyday conversation categories with real dialogues.
   - Integrated Whisper STT and IndicTrans2 endpoints with editable source review and independent result panels.

---

## Active Environment Variables Reference
| Variable | Required In | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | Render / Local | Environment mode (`production` / `development`) |
| `PORT` | Render / Local | Server port binding (default 3000) |
| `AUTH_SECRET` | Render / Local | HMAC-SHA256 session signature secret |
| `HF_TOKEN` | Render (Optional) | Hugging Face token for real-time Whisper & IndicTrans2 models |
| `OPENAI_API_KEY` | Render (Optional) | Fallback OpenAI Whisper speech transcription |

---

## Current Status & Next Steps
- All 129 automated tests across all 3 suites passing (52 E2E, 45 Auth, 32 STT/Translation).
- Production build passing: 49/49 routes compiled with 0 errors.
- Render deployment paused per user instructions ("no need of render of it").
- Ready for git commit and push to remote repository.

