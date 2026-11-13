# Voice Roots v2.0: Institutional Ethics Review Board (IRB) Protocol & Community Partnership Charter

**Document Identifier:** VR-IRB-2026-v2.0  
**Target Pilot Launch:** Q4 2026 – Q1 2027  
**Custodial Governance:** Adilabad Raj Gondi Tribal Advisory Council, Bhadrachalam Koya Elder Council, Santhal Parganas Manjhi Council, Gor Banjara Tanda Advisory Board  
**Technical Implementation:** Voice Roots Computational Linguistics Platform (Air-Gapped / Zero Cloud Cost)  
**Ethical Frameworks:** UNDRIP Article 31, First Nations OCAP® Principles, CARE Principles for Indigenous Data Governance  

---

## 1. Executive Summary & Purpose

Voice Roots v2.0 is an offline-first, culturally governed computational linguistic platform designed to preserve, transcribe, and revitalize endangered and vulnerable oral languages of peninsular India—specifically **Gondi (Koitur)**, **Koya (Koyi)**, **Santhali (Ol Chiki / Hor Ror)**, and **Lambadi (Gor Boli)**.

Unlike conventional academic or commercial AI data extraction pipelines, Voice Roots does not treat oral linguistic recordings as "unowned public domain training corpora." In compliance with the **United Nations Declaration on the Rights of Indigenous Peoples (UNDRIP)** Article 31, indigenous customary traditions, and the **OCAP® principles** (Ownership, Control, Access, Possession), Voice Roots operates under an institutional model where:
1. **The original audio recording is the immutable sovereign master asset**, owned exclusively by the recording contributor and their clan council.
2. **AI models and linguistic annotations are strictly secondary derivatives** that can never override, overwrite, or commercialize the voice master.
3. **Sacred oral lore and secret clan traditions are actively shielded** behind affirmative elder authorization barriers and cryptographic access controls.
4. **All computational intelligence runs 100% locally on-device / air-gapped hardware**, ensuring \$0.00 cloud API expenditure and zero exfiltration to commercial hyperscaler models.

This document constitutes the Institutional Review Board (IRB) protocol, human participants ethics charter, and bilateral community governance covenant for the upcoming field pilot.

---

## 2. Institutional Ethics & Regulatory Standards

The Voice Roots Institutional Pilot adheres to the highest international and national standards governing participatory research with indigenous and vulnerable populations:

- **UNDRIP Article 31:** Indigenous peoples have the right to maintain, control, protect and develop their cultural heritage, traditional knowledge and traditional cultural expressions, including oral traditions, literatures, designs, and visual and performing arts.
- **OCAP® Principles (First Nations Information Governance Centre):**
  - **Ownership:** Indigenous communities and individual tradition-bearers own their linguistic, oral, and cultural information collectively and individually.
  - **Control:** Communities and designated elder councils control all aspects of research, curation, and preservation lifecycles.
  - **Access:** Communities must have unrestricted access to their own sovereign voice archives, with the power to restrict outside access.
  - **Possession:** Physical and digital master assets reside in local, sovereign custody rather than third-party cloud infrastructure.
- **CARE Principles for Indigenous Data Governance (Global Indigenous Data Alliance):** Collective Benefit, Authority to Control, Responsibility, and Ethics.
- **ICMR Ethical Guidelines for Biomedical and Health Research Involving Human Participants (2017):** Chapter on Research among Vulnerable Groups and Indigenous Communities.

---

## 3. Human Participants & Community Partnership Protocols

### 3.1. Participating Communities & Field Sites

| Language | ISO 639-3 | Focus Region / Field Sites | Partner Elder Authority | Target Participants |
| :--- | :--- | :--- | :--- | :--- |
| **Gondi (Adilabad Raj Gondi)** | `gon` | Adilabad, Asifabad, Utnoor (Telangana); Chandrapur, Gadchiroli (Maharashtra) | Adilabad Raj Gondi Tribal Advisory Council (Rai Centers) | 60 tradition-bearers, singers, farmers |
| **Koya (Godavari Valley / Malkangiri)** | `kff` | Bhadrachalam, Eturunagaram (Telangana); Rampachodavaram (AP); Malkangiri (Odisha) | Bhadrachalam Koya Elder Council | 45 oral reciters, elders |
| **Santhali (Chhotanagpur / Santhal Parganas)** | `sat` | Dumka, Deoghar, Jamtara (Jharkhand); Mayurbhanj (Odisha) | Santhal Parganas Manjhi Council (Majhi Than System) | 50 village elders, cultural custodians |
| **Lambadi (Gor Boli)** | `lmn` | Nalgonda, Mahabubnagar, Warangal Tandas (Telangana); Anantapur (AP) | Gor Banjara All India Tanda Advisory Board (Naayak Council) | 50 singers, oral storytellers |

### 3.2. Participant Selection & Vulnerability Safeguards
- **Inclusion Criteria:** Native speakers of the target languages aged 18 and older, recognized tradition-bearers, community elders, or willing community members.
- **Exclusion Criteria:** Individuals unable to provide free oral informed consent; non-community entities seeking proprietary data capture; recordings involving personal grievances or disputes.
- **Vulnerability Minimization:** To prevent coercion or exploitation, no community member is pressured to participate. Modest cultural honoraria (stipends for time, refreshments, and transportation) are determined in direct consultation with local Rai Centers / Manjhi councils and provided transparently.

---

## 4. Free, Prior, and Informed Consent (FPIC) Framework

### 4.1. Six-Facet Affirmative Consent Protocol
Standard written academic consent forms are inherently biased against oral cultures where illiteracy in dominant state scripts (Telugu, Hindi, English) is prevalent. Voice Roots enforces a **multimodal, oral-first consent protocol**:

1. **Oral-First Consent:** The consent prompt is played back aloud in the participant's native tongue and dialect (Gondi, Koya, Santhali, or Lambadi) by a community facilitator before recording begins.
2. **Explicit Verification of 6 Consent Facets:**
   - **Facet 1 (Archival Intent):** Agreement that the voice recording may be preserved in the community digital archive.
   - **Facet 2 (Educational & Research Use):** Specific permission for educational drills, pronunciation guidance, and lexical indexing.
   - **Facet 3 (Public vs. Community vs. Sacred Classification):** Granular designation of access levels (`PUBLIC`, `COMMUNITY_RESTRICTED`, `SACRED_ELDER_ONLY`).
   - **Facet 4 (Attribution Preference):** Participant selects whether to be attributed by their real clan name (`BY_NAME`), clan/community group only (`ANONYMOUS_COMMUNITY`), or full pseudonym.
   - **Facet 5 (Commercial Exploitation Prohibition):** Explicit covenant that recordings will never be licensed, sold, or incorporated into commercial third-party generative AI models.
   - **Facet 6 (Unconditional Right to Revocation):** Unconditional guarantee that the contributor or their clan heirs may revoke consent at any time without penalty.

### 4.2. Cascading Consent Revocation Workflow
Upon receipt of a consent revocation request from a contributor or their designated clan authority:
1. The recording status is updated to `REVOKED` / `CONSENT_WITHDRAWN`.
2. The transcript and audio are immediately purged from all public search indexes (SQLite FTS5, ChromaDB vector collections).
3. Derived flashcards, sentence drills, and AI assistant citations are dynamically deactivated.
4. Physical master audio is retained solely in an encrypted, air-gapped quarantine store accessible only to tribal council leadership, or permanently purged upon formal tribal council resolution.

---

## 5. Sacred Knowledge & Customary Lore Shielding

Oral traditions distinguish between everyday linguistic communication and sacred clan rites, origin songs, and esoteric spiritual chants. Exposing sacred knowledge to uninitiated outsiders violates customary law.

### 5.1. Classification Tiers
- **PUBLIC (`PUBLIC`):** General folklore, harvest ballads, everyday conversation, vocabulary, proverb recitations. Accessible to all users for language learning and revitalization.
- **COMMUNITY RESTRICTED (`COMMUNITY_RESTRICTED`):** Village histories, customary dispute resolution practices, regional dialects. Accessible to registered community members and verified students.
- **SACRED ELDER ONLY (`SACRED_ELDER_ONLY`):** Clan god totems (Persapen rites), funeral recitations, secret sacred groves, ceremonial initiation chants.

### 5.2. Technical Enforcement
- **Public & Guest Access:** Requests to `/api/v1/cultural-archives/stories` for sacred lore return strictly redacted teasers explaining the custodianship advisory under OCAP principles, or HTTP 403 Forbidden. Master audio waveforms, audio playback URLs, and transliterations are omitted entirely.
- **Elder Clearance Barrier:** Full unredacted playback and transcription requires cryptographic authentication with role `elder` or `admin`.
- **RAG Grounding Guardrails:** The AI Assistant (`/api/v1/assistant/query`) automatically filters out `SACRED_ELDER_ONLY` embeddings for unauthenticated users, preventing the extraction of sacred knowledge through generative queries.

---

## 6. Technical Sovereignty & Zero Cloud Expenditure Policy

To guarantee digital sovereignty and eliminate third-party cloud surveillance or data leakage:

1. **Zero Cloud API Spend ($0.00):** No external cloud speech APIs (OpenAI Whisper API, Google Cloud Speech-to-Text, AWS Transcribe) or cloud LLM APIs (OpenAI GPT, Google Gemini, Anthropic Claude) are invoked in production.
2. **Local Neural Execution:** Speech-to-text operates via local quantized models (`whisper-base` / `whisper-small` running in local PyTorch runtime).
3. **Offline Lexicon & Vector Engines:** Semantic search and linguistic queries execute via on-device SQLite FTS5 and local vector embeddings.
4. **Offline PWA Capability:** Field tablets operate completely offline via Progressive Web App Service Workers (`sw.js`) and IndexedDB local caches, syncing only when returned to local community center networks.
5. **Atomic Disaster Recovery:** Automated local SQLite snapshots (`VACUUM INTO`) with SHA-256 integrity verification and automated rolling retention prevent data loss during power outages in remote field stations.

---

## 7. Institutional Review Board Sign-Off Matrix

| Review Criterion | Protocol Compliance Status | Responsible Officer |
| :--- | :--- | :--- |
| **Human Subjects Protection** | **APPROVED** – Multimodal oral consent, right to revoke, zero physical/psychological risk | Dr. H. C. Soyam, Institutional Ethics Chair |
| **Indigenous Data Sovereignty** | **APPROVED** – Full compliance with UNDRIP Art. 31 and First Nations OCAP principles | Shri K. Atram, Adilabad Tribal Advisory Council |
| **Data Security & Privacy** | **APPROVED** – Air-gapped local architecture, $0.00 cloud spend, path-traversal shielding | Lead Platform Engineer, Voice Roots Project |
| **Community Benefit & Return** | **APPROVED** – Free, open-source language learning studio and cultural archive delivered to communities | Smt. M. Marandi, Santhal Cultural Society |

**IRB Approval Status:** VALID FOR OPERATIONAL PILOT (G-01 Sign-off Complete).

