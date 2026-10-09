# Voice Roots — Project Memory & Active Status

## Current System Status
- **Current Milestone**: Phase 1 & 2 Stabilization, Authentication Visibility & Documentation Rulebook.
- **Git HEAD**: `origin/main` synchronized.
- **Render Production Service**: Active and serving HTTP/2 200 at [https://voice-roots.onrender.com](https://voice-roots.onrender.com).
- **All 49 Routes**: Compiled and operating cleanly.

---

## Recent Milestones & Resolved Bugs
1. **Login Page Visibility Fixed (Commits `5dd110b`, `590e0d2`)**:
   - Resolved mobile header hiding in `components.css`.
   - Prevented conditional hiding of the login form on `/login` when an active user session exists.
   - Added standard `<Navbar />` to `login/page.tsx`.
   - Added dedicated Log In / Profile tab to `MobileBottomNav`.
   - Supported `voiceroots2026` across all demo accounts in `serverAuth.ts`.
2. **Everyday Conversations & Audio STT/Translation (Commit `6725807`)**:
   - Implemented 10 everyday conversation categories with real dialogues.
   - Integrated Whisper STT and IndicTrans2 endpoints with editable source review and independent result panels.
3. **Full Authentication Engine (Commit `ed8f033`)**:
   - Built salted `scrypt` hashing, HMAC-SHA256 session tokens, forgot/reset password flows, and profile recording isolation.

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

## Next Tasks Queued
1. Implement automated end-to-end integration test script simulating the full user lifecycle (register &rarr; login &rarr; audio upload &rarr; transcribe &rarr; translate &rarr; save).
2. Validate offline queue recovery and synchronization transitions.
