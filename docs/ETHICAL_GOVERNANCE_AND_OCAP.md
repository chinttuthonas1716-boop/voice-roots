# 🌿 Voice Roots: Ethical Governance, Informed Consent & OCAP® Charter

> **Official Governance Policy for Voice Roots**  
> Prepared for Community Elders, Academic Ethics Committees (IRB), Field Researchers, and Contributors.  
> Aligned with the First Nations Information Governance Centre (FNIGC) **OCAP® Principles** (Ownership, Control, Access, Possession) and International Indigenous Data Sovereignty Protocols.

---

## 1. Executive Summary & Core Invariants

Voice Roots is an ethical, community-governed speech preservation and linguistic intelligence platform created to document, archive, and revitalize endangered and vulnerable oral languages (specifically Dravidian and indigenous tongues including **Gondi**, **Koya**, **Santhali**, and **Lambadi**).

The system is architected around four non-negotiable ethical invariants:

1. **The Original Voice Recording is the Immutable Master**: Acoustic audio recordings are immutable heritage assets. Under no circumstances may AI or human processing modify, overwrite, truncate, or re-encode the original master audio.
2. **AI Transcripts and Translations are Strictly Assistive Annotations**: Machine speech recognition (Whisper) and neural translations (IndicTrans2) are secondary, non-destructive annotation layers. All machine outputs are explicitly branded as `[DRAFT - UNREVIEWED MACHINE GENERATION]` until verified by accredited community elders.
3. **Dual Affirmative Consent is Mandatory**: Capturing audio requires explicit, documented speaker consent. Processing audio through AI speech models requires separate, independent affirmative consent. Without consent, no audio is recorded or stored.
4. **Irrevocable Right to Sub-Second Consent Withdrawal**: Any speaker or their authorized community representative may revoke consent at any time. Revocation instantly purges or tomb-stones all derived annotations, vectors, FTS indices, and public streams across the platform.

---

## 2. Indigenous Data Sovereignty: The OCAP® Framework

Voice Roots translates the four pillars of OCAP into enforceable server-side architectural guarantees:

```text
        ┌────────────────────────────────────────────────────────┐
        │                 OCAP® GOVERNANCE CORE                  │
        └────────────────────────────────────────────────────────┘
                 │                   │                   │
                 ▼                   ▼                   ▼
        ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
        │    OWNERSHIP    │ │     CONTROL     │ │     ACCESS      │
        │ Community owns  │ │ Elders govern   │ │ 4-Tier Server   │
        │ voice, stories, │ │ translations &  │ │ Isolation       │
        │ & cultural lore │ │ dictionary data │ │ Engine          │
        └─────────────────┘ └─────────────────┘ └─────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │   POSSESSION    │
                            │ Offline masters │
                            │ On-demand export│
                            │ Cascade purge   │
                            └─────────────────┘
```

### Pillar 1: Ownership (Who owns the data?)

- **Community Collective Ownership**: Cultural lore, folktales, dialectal variations, and traditional knowledge remain the perpetual intellectual and cultural property of the originating linguistic community.
- **Individual Speaker Moral Rights**: Individual contributors retain permanent moral ownership of their vocal identity and biometric acoustic profile.
- **No Commercial Exploitation**: Audio recordings, phonetic models, and dictionary datasets gathered through Voice Roots may not be sold, licensed to proprietary commercial foundation model vendors, or used for unconsented commercial voice synthesis.

### Pillar 2: Control (Who governs the data?)

- **Elder Human Review Queue**: Machine translations for unwritten oral tongues are disabled by default. The system routes community contributions to accredited elder reviewers who verify phonetic accuracy, cultural appropriateness, and dialectal nuances.
- **Sacred Lore Protection**: Lore classified as sacred or ritual-restricted is tagged `SACRED_ELDER_ONLY` and automatically restricted from general or secular distribution.
- **Dispute Resolution Mechanism**: Linguistic or provenance disputes are logged in an immutable governance audit trail and adjudicated through accredited community tribal councils.

### Pillar 3: Access (Who can listen and learn?)

Access to master recordings and annotations is enforced on the server via cryptographic tokens and strict access tiers:

- **Public (`public`)**: Open heritage recordings cleared by speakers and elders for global cultural education and revitalization.
- **Community (`community`)**: Restricted to authenticated members of the language community and authorized cultural researchers.
- **Research (`research`)**: Accessible exclusively to verified academic researchers holding cryptographically signed institutional research tokens for non-commercial linguistic documentation.
- **Private (`private`)**: Strictly isolated to the recording contributor and designated system administrators.
- **Withdrawn (`withdrawn`)**: Permanently disabled and blocked from all callers (including administrators).

### Pillar 4: Possession (Where does the data reside?)

- **Offline-First Sovereignty**: The Voice Roots stack operates 100% offline on local hardware with zero external cloud dependencies if a community desires air-gapped physical possession.
- **Zero-Vendor Lock-In & Restricted Export**: Authorized community administrators can trigger a complete OCAP data export (`GET /api/v1/export/public-audio`), packaging consented FLAC/WAV masters, JSONL metadata, and governance receipts into standard ZIP archives.

---

## 3. Informed Consent Policy & Verbatim Statements

Voice Roots mandates an active, multi-stage informed consent process before any audio capture or file ingestion can proceed.

### Stage 1: Master Preservation Consent

> **Verbatim Consent Statement (English)**:  
> *"I hereby give voluntary permission for my voice recording to be archived in the Voice Roots community linguistic repository. I understand that my recording will be preserved as an immutable master asset to safeguard our ancestral tongue for future generations. I retain ownership of my voice, and I may withdraw my consent at any time without penalty or explanation."*
>
> **Verbatim Consent Statement (Telugu / గోండీ & కోయ ప్రాంతీయ అనువాదం)**:  
> *"భవిష్యత్ తరాల కొరకు మా పూర్వీకుల భాషను కాపాడటానికి నా గొంతు రికార్డింగ్‌ను వాయిస్ రూట్స్ కమ్యూనిటీ రిపోజిటరీలో భద్రపరచడానికి నేను స్వచ్ఛందంగా అనుమతి ఇస్తున్నాను. నా స్వరానికి నేనే సంపూర్ణ యజమానినని, ఎటువంటి కారణం చెప్పకుండా ఎప్పుడైనా నా సమ్మతిని ఉపసంహరించుకునే హక్కు నాకు ఉందని నేను అర్థం చేసుకున్నాను."*

### Stage 2: Assistive AI Transcription Consent

> **Verbatim Consent Statement (English)**:  
> *"I explicitly consent to having my recorded voice processed by assistive artificial intelligence speech recognition software solely to generate a written draft transcript and phonetic alignment. I understand that machine transcripts are unreviewed drafts and will not be published as definitive community knowledge until reviewed by accredited language elders."*

### Stage 3: Unilateral Consent Withdrawal Procedure

A speaker or authorized community elder may revoke consent by visiting `/recordings/[id]`, contacting an accredited community reviewer, or invoking `POST /api/v1/transcripts/{id}/withdraw-consent`.

**Cascade Purge Invariant**:

Upon receiving a consent revocation signal:

1. The transcript status is immediately updated to `withdrawn` and stamped with `archived_at = CURRENT_TIMESTAMP`.
2. The transcript text is excised from SQLite FTS5 full-text search tables.
3. Vector embeddings are immediately deleted from ChromaDB collections.
4. Audio streaming endpoints immediately return HTTP 404/403 with `Audio recording has been withdrawn under speaker consent`.
5. An immutable audit record is recorded in `governance_audit_log` documenting the revocation timestamp and reason.

---

## 4. Privacy Notice & Data Protection

| Category | Policy / Enforcement |
| :--- | :--- |
| **Biometric Vocal Data** | Master recordings are stored in restricted-permission directories (`0o600`) or private S3/R2 buckets. Audio is streamed exclusively via short-lived cryptographic presigned URLs (maximum TTL: 3600s). |
| **Personally Identifiable Information (PII)** | Speakers may contribute anonymously (`is_anonymous=true`). Contributor names default to community handles unless the speaker explicitly requests public attribution. |
| **Telemetry & APM Privacy** | Application monitoring (Sentry) operates with `send_default_pii=False`. Audio bytes, biometric profiles, and raw transcripts are never transmitted to third-party APM or telemetry vendors. |
| **Security Headers** | All HTTP responses enforce defense-in-depth headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, and restrictive `Content-Security-Policy`. |

---

## 5. Institutional Ethics (IRB) Clearance & Demo Data Protocol (Task T4.2)

### Mandatory Academic Ethics Clearance

In accordance with international ethical standards for research involving human participants (Declaration of Helsinki, CIOMS Guidelines, and Tri-Council Policy Statement TCPS 2 Chapter 9):

- **Field Recording Moratorium**: **NO real-world community field recordings will be conducted, ingested, or archived until institutional ethics committee (IRB) clearance has been formally granted and written Bilateral Community Agreements have been executed with regional tribal councils.**
- **Demo Data Classification**: All pre-seeded audio assets, prompt sentences, cultural stories, and dictionary entries currently hosted within this repository or on the evaluation site (`https://voice-roots.onrender.com`) are **strictly synthetic, simulated, or publicly cleared educational demo placeholders** (`is_placeholder=1`, `demo-placeholder`).
- **Elder Verification Mocking**: Pre-seeded approval badges on demo records demonstrate software verification flows only and do not represent formal endorsement by indigenous councils until bilateral field protocols commence.
