# VOICE ROOTS — RELEASE BASELINE FREEZE (v1.0.0-rc1)

This document establishes the official freeze protocol for the Voice Roots v1.0.0-rc1 Release Candidate.

==================================================
1. KNOWN-GOOD RECOVERY BASELINE
==================================================
- **Version**: `voice-roots-v1.0.0-rc1`
- **Release Status**: Feature-Complete $\rightarrow$ Release Candidate
- **Platform**: Responsive Website Only (No native mobile binaries)
- **Principle**: The original audio recording and source language are permanent, immutable cultural artifacts. AI-generated transcriptions, translations, and synthetic audio tracks are derivatives.

==================================================
2. NON-NEGOTIABLE FREEZE RULES
==================================================
1. **No New Features**: Feature development is frozen.
2. **No Broad Refactoring**: Architecture and database models are locked.
3. **Four Language Concepts Separated**:
   - `sourceLanguageId` = Language of original recording (immutable)
   - `targetLanguageId` = Requested translation language
   - `translation_audio` = Derivative synthetic speech track
   - `uiLanguage` = Independent interface chrome
4. **Card Badge Format**: `TELUGU · GUNTUR, ANDHRA PRADESH, INDIA` (always reflecting the original source language and location).
5. **Strict Sequential Workflow**:
   `DRAFT` $\rightarrow$ `RECORD/UPLOAD` $\rightarrow$ `PROCESSING` $\rightarrow$ `LANGUAGE DETECTION` $\rightarrow$ `TRANSCRIPT` $\rightarrow$ `TRANSCRIPT REVIEW` $\rightarrow$ `TRANSLATION` $\rightarrow$ `CULTURAL CONTEXT` $\rightarrow$ `CONSENT` $\rightarrow$ `HUMAN REVIEW` $\rightarrow$ `VERIFIED` $\rightarrow$ `HERITAGE RECORD` $\rightarrow$ `PASSPORT`.

==================================================
3. RELEASE VALIDATION GATES
==================================================
- [x] India Master Geographic Data (LGD 28 States + 8 UTs, districts, subdistricts, verified villages)
- [x] Census of India 2011 C-16 Mother Tongue Catalog & Language Atlas
- [x] Historical Census 2011 Geography Isolated (`PC11_C16-28` pre-bifurcation AP crosswalk)
- [x] Provenance Registry (`OFFICIAL`, `CENSUS_DATA`, `FIELD_VERIFIED`, `COMMUNITY_REPORTED`, `UNVERIFIED`)
- [x] Dual-Track Audio Player (`DualTrackAudioPlayer.tsx`)
- [x] Cascading Location & Language Picker (`LocationLanguageCascadingPicker.tsx`)
- [x] Route Protection & Workflow Guards
- [x] SHA-256 Verifiable Heritage Passport
- [x] Next.js Production Build Validation
- [x] Fast, Idempotent Import Pipeline (`scripts/india-data/validate-import.js`)
