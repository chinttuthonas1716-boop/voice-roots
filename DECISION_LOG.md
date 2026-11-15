# VOICE ROOTS — ARCHITECTURAL DECISION LOG (ADR)

**System:** Voice Roots Language Preservation Platform  
**Architecture Version:** `v2.0`  
**Standard:** Documenting Key Design & Technical Choices

---

## ADR-001: Forest Luxury Editorial Design System
- **Context:** The platform previously had a generic dark-green dashboard appearance. The user requested an immersive, cinematic forest-themed UI/UX inspired by natural luxury editorial design.
- **Decision:** Implemented a unified 7-color botanical palette:
  - `#071A13` (Deep Forest)
  - `#102B20` (Dark Forest Green)
  - `#1F5138` (Lush Forest Green)
  - `#477A50` (Leaf Green)
  - `#A6C48A` (Sage Green)
  - `#DCE9D7` (Mist Green)
  - `#F5F3E9` (Warm Ivory)
- **Rationale:** Warm ivory cards provide high-contrast readability for forms and data, while dark forest green and mist overlays create deep botanical atmosphere without eye strain.
- **Consequences:** All components use CSS variables and Tailwind classes conforming to this palette.

---

## ADR-002: Dynamic Global Language Discovery Registry (4-Tier Architecture)
- **Context:** Low-resource languages were previously hardcoded to a static regional list (Gondi, Koya, Santhali, Lambadi). The mission requires supporting low-resource oral languages worldwide.
- **Decision:** Architected a 4-tier language discovery and onboarding engine:
  1. *Global Language Registry:* Ingests from India (Census 2011 C-16, CIIL SPPEL, Bhashini) and Global repositories (Glottolog, UNESCO, ISO 639-3).
  2. *Language Assessment Engine:* Evaluates speech data hours, text corpora, dialect diversity, and customary consent before onboarding.
  3. *Community-Approved Profiles:* Requires affirmative OCAP consent before audio can be ingested or indexed.
  4. *Shared AI & Preservation Engine:* Unified Whisper + Conformer models without creating isolated applications per dialect.
- **Rationale:** Ensures Voice Roots remains language-independent and extensible to any language on Earth.

---

## ADR-003: Cryptographic Authentication & Role Elevation Prevention
- **Context:** Demo applications often allow users to self-assign elevated roles or use plaintext credentials.
- **Decision:**
  - Implemented cryptographic salted scrypt hashing and HMAC-SHA256 session tokens.
  - Implemented strict role-elevation guards: If a public user registers selecting `reviewer` or `admin`, the account is created safely as `contributor` with `pendingAdminApproval: true` and an explicit notice is displayed.
- **Rationale:** Prevents unauthorized individuals from approving or altering customary cultural archives.

---

## ADR-004: Immutable Acoustic Master Recording (OCAP® Invariant)
- **Context:** AI pipelines often normalize, compress, or discard original audio recordings during speech processing.
- **Decision:** The original 48 kHz WAV recording is designated the permanent, immutable acoustic master. AI annotations, Whisper transcriptions, and phonemic IPA alignments exist solely as a metadata layer and never overwrite audio bytes.
- **Rationale:** Respects indigenous customary data sovereignty and preserves scientific archival audio integrity.
