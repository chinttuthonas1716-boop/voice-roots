# Voice Roots — Comprehensive Test Plan

## 1. Test Strategy Overview
Voice Roots uses a multi-layered testing strategy combining unit tests, security contract verifications, audio pipeline validations, and end-to-end user journey checks.

---

## 2. Automated Test Suites

### Suite A: Authentication & Security (`scripts/test_auth_system.js`)
- **Execution**: `node scripts/test_auth_system.js`
- **Coverage (45 Tests)**:
  - Route contract validation for `/api/auth/login`, `/register`, `/forgot-password`, `/reset-password`, `/me`, `/logout`.
  - Cryptographic salted `scrypt` hashing consistency and timing-safe equality.
  - HMAC-SHA256 session token generation, verification, and tamper detection.
  - Seeded demo credentials verification across all roles.
  - Reset token 48-char entropy and 1-hour expiration.
  - Header actions and mobile drawer auth elements.
  - Recording permission isolation (`getUserPermittedRecordings`).

### Suite B: Speech & Translation Pipeline (`scripts/test_transcribe_translate.js`)
- **Execution**: `node scripts/test_transcribe_translate.js`
- **Coverage (32 Tests)**:
  - Conversational corpus validation across all 10 categories.
  - Multipart audio upload validation (rejects 0-byte and unsupported formats).
  - STT endpoint error handling (`PROVIDER_NOT_CONFIGURED` without mock hallucinations).
  - Exact phrase corpus matching and neural translation fallback in `/api/translate`.
  - Independent transcript review textarea and copy/download actions.
  - Browser TTS labeling without synthetic claims.

### Suite C: Audio Assets & Playback (`scripts/test_featured_audio.js`)
- **Execution**: `node scripts/test_featured_audio.js`
- **Coverage**:
  - Validates that dedicated oral recordings exist on disk for all 5 featured stories:
    - Sacred Monsoon Invocation Chants (`vr-106`, Telugu) &rarr; `vr-106-telugu-recording.wav`
    - Gondi Elder Forest Lore (`vr-107`, Gondi) &rarr; `vr-107-gondi-recording.wav`
    - Koya Ethnobotanical Herbal Chant (`vr-108`, Koya) &rarr; `vr-108-koya-recording.wav`
    - Tulu Spirit Paddana Epic (`vr-109`, Tulu) &rarr; `vr-109-tulu-recording.wav`
    - Nomadic Caravan Twilight Ballad (`vr-110`, Lambadi) &rarr; `vr-110-lambadi-recording.wav`

---

## 3. Manual & Viewport Verification Matrix

| Device / Viewport | Width | Critical Verification Items | Pass Criteria |
| :--- | :--- | :--- | :--- |
| **Mobile Phone** | 360px – 430px | Top header, brand logo, Log In button, hamburger toggle, bottom dock | Zero horizontal scroll, Log In visible in top header & bottom dock |
| **Tablet** | 768px – 1024px | Desktop navigation links, Search, Language selector, Audio player controls | Clean grid columns, responsive cards |
| **Desktop** | 1280px+ | Full header with profile dropdown, telemetry sync pill, side-by-side cards | No wrapping, hover transitions smooth |

---

## 4. Production Build Gate
Before deploying any commit to Render:
```bash
cd web
npm run build
```
- Must compile all 49 pages and route handlers with 0 TypeScript and 0 build errors.
