# Voice Roots — Controlled AI Development Rules

You are the senior software engineer responsible for helping maintain and improve the existing Voice Roots project.

## 1. Principles & Constraints
- **Preserve the Working Implementation**: Never rebuild the application from scratch or replace working files without explicit approval.
- **Inspect Before Editing**: Always inspect the existing code, route structures, and documentation before modifying any files.
- **One Feature at a Time**: Make small, testable, and targeted changes. Never make broad or speculative edits across unrelated components.
- **Zero Hallucinated Mock Data**: Do not introduce fake transcription or translation output that masquerades as AI inference. If API credentials are not provided, return structured, transparent error codes (`PROVIDER_NOT_CONFIGURED`).
- **Protect Credentials**: Never commit API keys, secrets, tokens, private keys, or credentials to Git. Always use environment variables.
- **Maintain Architectural Integrity**: Do not duplicate API endpoints, database access layers, authentication engines, or component libraries.

---

## 2. Standard 7-Step Development Loop
Every task must adhere to the following sequence:

1. **READ**: Inspect existing code, route definitions, styles, and project rules.
2. **PLAN**: Define the smallest safe change and identify the precise files to modify.
3. **IMPLEMENT**: Modify only the approved files while preserving all existing comments and behavior.
4. **TEST**: Run type checks, automated test suites, and production builds (`npm run build`).
5. **REVIEW**: Check responsive design, accessibility, security, and edge-case error states.
6. **COMMIT**: Stage only necessary files and commit with a clean, descriptive message.
7. **DOCUMENT**: Update `TASKS.md` and `docs/MEMORY.md` with the verified state.

---

## 3. Technology Stack Reference
- **Frontend / Full-Stack Web**: Next.js 14.2.14 (App Router), React 18.3.1, TypeScript 5.6.2, Tailwind CSS 3.4.
- **Mobile Frontends**: Flutter 3.x / Dart (`flutter_app/`) and React Native / Expo (`mobile/`).
- **Backend / Microservices**: Python 3.11+ / FastAPI (`backend/`).
- **Authentication**: Salted `scrypt` password hashing + HMAC-SHA256 signed session tokens.
- **Speech Recognition**: Whisper (`openai/whisper-base`) via Hugging Face Inference API / OpenAI fallback.
- **Machine Translation**: IndicTrans2 (`ai4bharat/indictrans2-indic-en-dist-200M`) + curated conversational corpus.
- **Hosting**: Render (`web` service, Node 20 runtime, Singapore region) via `render.yaml`.

---

## 4. Acceptance Criteria
- **Authentication**: Working Login, Registration, Password Reset, Profile view, and Role-Based Access Control (Admin, Reviewer, Contributor, Listener).
- **Responsive Navigation**: Top navbar and floating bottom dock render gracefully on mobile (< 768px), tablet, and desktop viewports with zero horizontal overflow.
- **Speech & Audio**:
  - Plays dedicated oral recordings (`/audio/vr-106-...wav` through `vr-110-...wav`), never placeholder audio.
  - Validates audio upload MIME types and file sizes safely.
  - Displays original transcript in editable review area.
  - Translates source transcript into selected target language with distinct result panels.
- **Build & Quality**: `npm run build` must succeed with 0 errors across all 49 routes before any deployment.
