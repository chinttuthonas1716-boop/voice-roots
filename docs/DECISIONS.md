# Voice Roots — Architectural Decision Records (ADRs)

## ADR-001: Next.js App Router as Unified Production Web & API Gateway
- **Date**: 2026-10-06
- **Status**: Accepted
- **Context**: The project needed a responsive web client and secure API backend that could be deployed cost-effectively to Render without requiring multi-service orchestration on the free tier.
- **Decision**: Use Next.js 14 App Router as both the frontend and serverless API route layer (`web/src/app/api/*`).
- **Consequences**: Single repository and single build artifact for Render (`web/`), simplified deployment, unified TypeScript types across client and server.

---

## ADR-002: Native Cryptographic Salted scrypt Hashing for Authentication
- **Date**: 2026-10-09
- **Status**: Accepted
- **Context**: The authentication system needed robust password security without introducing heavy external C++ binaries (e.g. `bcrypt-node`) that can cause compilation failures across diverse deployment architectures (macOS, Linux on Render).
- **Decision**: Implement salted password hashing using Node.js built-in `crypto.scryptSync` with unique 16-byte random salts and `crypto.timingSafeEqual` comparison.
- **Consequences**: Zero external native dependencies, robust cryptographic resilience against brute force, and reliable multi-platform compilation.

---

## ADR-003: Strict Prohibition of Hallucinated AI Output
- **Date**: 2026-10-08
- **Status**: Accepted
- **Context**: Demonstrating AI features must never deceive users or researchers into believing simulated strings came from uploaded audio recordings.
- **Decision**: In `/api/transcribe` and `/api/translate`, real inference models (Whisper / IndicTrans2) are invoked when credentials are provided. If credentials are missing, return explicit structured errors (`PROVIDER_NOT_CONFIGURED`) with instructions for configuring API keys.
- **Consequences**: Maintains research integrity and trust among native speaker communities and evaluating linguists.

---

## ADR-004: Dual Navigation Paradigm (Sticky Header + Floating Bottom Dock)
- **Date**: 2026-10-09
- **Status**: Accepted
- **Context**: Mobile users struggled to access authentication actions and primary navigation when the top header was hidden.
- **Decision**:
  1. Keep top navbar visible across all viewports with a compact mobile layout displaying the brand, language selector, glowing "Log In" button, and drawer toggle.
  2. Provide a 5-item floating bottom dock on mobile with a center FAB for Preserving/Recording and a dedicated 5th tab for Log In / Profile.
- **Consequences**: Guaranteed 1-tap access to authentication and core pages on any screen size.

