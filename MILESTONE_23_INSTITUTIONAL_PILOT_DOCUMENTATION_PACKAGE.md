# Voice Roots — Milestone 23: Institutional & Community Pilot Documentation Package
## Comprehensive Governance Protocols, Ethical Safeguards, Operational Gate Tracker, and Security Audit

> **Document Version**: `1.0-DRAFT`  
> **Date**: November 2, 2026  
> **Target Branch**: `feature/m23-pilot-remediations`  
> **Consolidated Integration Baseline**: `integration/milestones-16-23` (Commit: `7733142`)  
> **Operational Status**: `STRICT PRE-PILOT REVIEW DRAFT — ALL REAL-WORLD GATES PENDING`  
> **Critical Governance Invariant**: This document contains proposed draft policies and protocols prepared exclusively for ethics committee submission and community council review. **It does NOT represent approved policy, active consent, or authorized pilot deployment.** No human participants, elders, or institutions have been contacted, and no real community recordings have been collected.

---

## Executive Summary & Document Suite Index

This documentation package provides the complete operational, ethical, and governance framework required for the proposed **Milestone 23 Controlled Institutional Pilot** of the Voice Roots platform. The pilot is designed to evaluate an offline-first, community-governed speech preservation and linguistic documentation system for two endangered Dravidian languages: **Gondi** and **Koya**.

### Master Index of Governance & Ethics Documents

```
pilot_documentation/
├── DOC-01: Institutional Pilot Proposal (Phase I Controlled Field Evaluation)
├── DOC-02: Participant Information Sheet (Plain-Language Reference Statement)
├── DOC-03: Informed Consent Form (Multimodal Written & Oral Protocol)
├── DOC-04: Community Sovereign Permission Checklist (Pre-Recording Council Protocol)
├── DOC-05: Data Governance, Access Control & Consent Withdrawal Policy
├── DOC-06: Researcher Access, Data Use & Ethical Interoperability Agreement
├── DOC-07: Institutional Pilot Test Plan & Verification Scenarios
├── DOC-08: Security Incident & Cultural Data Breach Response Procedure
└── DOC-09: Participant & Field Researcher Evaluation Questionnaire
```

---

## Section 1: The Nine Governance & Ethics Draft Documents

---

### DOC-01: Institutional Pilot Proposal
#### Phase I Controlled Field Evaluation of the Voice Roots Platform

```
STATUS: DRAFT FOR INSTITUTIONAL ETHICS (IRB) & COMMUNITY COUNCIL REVIEW
DOCUMENT ID: VR-PILOT-DOC-01
TARGET PILOT LANGUAGES: Gondi (gon), Koya (kff)
PLANNED DURATION: 4 Weeks (Post-Approval)
TARGET VOLUME: 20–30 Consented Recordings (Approx. 2–3 Hours Total)
EXTERNAL CLOUD COSTS: $0.00 (Offline Local Computation Only)
```

#### 1. Abstract & Study Purpose
Oral traditions, regional dialects, and indigenous knowledge systems across central and southern India are experiencing rapid intergenerational language shift. Traditional digital archiving approaches often expropriate community voice assets into remote proprietary cloud repositories, divorcing indigenous peoples from data sovereignty and technological ownership.

This proposal outlines a 4-week, controlled institutional pilot evaluating the **Voice Roots** platform. Voice Roots is a zero-cloud-cost, offline-first digital language archive designed under the **OCAP® principles** (Ownership, Control, Access, and Possession) for Indigenous data governance. The pilot will evaluate acoustic preservation fidelity, offline speech recognition accuracy, community elder verification workflows, and instantaneous consent withdrawal latency for two vulnerable Dravidian language varieties: **Gondi** (Adilabad / Bastar varieties) and **Koya** (Bhadradri Kothagudem / Khammam varieties).

#### 2. Research Justification & Vulnerability Safeguards
Indigenous and tribal language communities are historically vulnerable to extractive linguistic research, unauthorized commercialization of oral lore, and digital exploitation. To safeguard participant welfare, this study enforces four non-negotiable boundaries:
1. **Sovereign Community Consent**: Institutional ethics clearance is recognized as a necessary institutional requirement, but **never a substitute** for sovereign community council consent. Fieldwork will not commence without formal elder council bilateral memoranda.
2. **Exclusion of Sacred Knowledge**: Sacred clan cosmologies, esoteric ritual incantations, secret spiritual names, and ceremonial initiation rites are **strictly prohibited** from ingestion. Only everyday conversational phrases, traditional agricultural/botanical terms, public folk tales, and children's songs are eligible.
3. **Master Audio Immutability**: The speaker's original voice recording is preserved permanently as an unedited master. AI-generated transcriptions are strictly treated as draft machine annotation layers and never overwrite the master asset.
4. **Instantaneous Unconditional Withdrawal**: Any speaker or recognized clan elder retains the unilateral right to withdraw consent at any time without justification, triggering sub-second removal from all search, vector, and streaming interfaces.

#### 3. Technical Architecture & Zero-Cost Offline Mandate
The pilot operates entirely on local infrastructure with zero external paid API dependencies:
- **Compute Runtime**: Non-root container (`appuser`, UID 1000) deployed on an isolated institutional workstation or local portable edge server.
- **Speech Recognition**: Local, CPU/GPU-accelerated OpenAI Whisper (`small` or `base` models running locally via PyTorch/CTranslate2). Zero voice bytes leave the host.
- **Semantic Discovery**: Local `all-MiniLM-L6-v2` sentence transformers embedded locally into ChromaDB and SQLite FTS5.
- **Storage Layer**: SQLite 3 configured with Write-Ahead Logging (`WAL`), strict foreign keys, and 5000ms busy timeout, paired with persistent local directory storage for lossless 48kHz WAV audio masters.
- **Total Incurred Cloud Inference Cost**: **$0.00**.

#### 4. Pilot Scope & Methodology
- **Participant Cohort**: 10 to 15 adult native speakers (ages 18+) recruited voluntarily across participating pilot communities.
- **Target Volume**: 20 to 30 unique recordings, each ranging between 2 and 7 minutes (aggregate 120–180 minutes).
- **Phased Implementation**:
  - *Week 1 (Community Alignment & Setup)*: Bilateral briefings with traditional elder councils, dialect alignment, oral consent prompt verification, and staging server health validation.
  - *Weeks 2–3 (Supervised Field Documentation)*: Supervised recording sessions, affirmative multimodal consent capture, automated local transcription, and elder correction sessions.
  - *Week 4 (Analysis, Usability Evaluation & Repatriation)*: Usability questionnaires, CER/WER linguistic evaluations, full local archive replication to offline USB storage for community council possession, and formal debrief.

#### 5. Ethical Risk Assessment & Mitigation Matrix
| Identified Risk | Risk Level | Mitigation Strategy |
| :--- | :---: | :--- |
| **Accidental Recording of Sacred Clan Lore** | Medium | Multi-tier pre-recording screening; elder accompaniment; immediate marking as `SACRED_ELDER_ONLY` or deletion. |
| **Coerced or Ill-Informed Consent** | Low | Native-language oral explanatory audio; explicit plain-language consent facets; zero financial inducement. |
| **Unauthorized External Data Scraping** | Low | Isolated network deployment; Research API locked behind token authentication with 60 req/min rate limiters. |
| **Data Loss due to Hardware Failure** | Low | PR-01 automated persistent storage health probe on startup; PR-04 tiered automated daily backup rotation. |

---

### DOC-02: Participant Information Sheet
#### Plain-Language Explanatory Statement for Community Speakers

```
STATUS: DRAFT ENGLISH REFERENCE TEXT — AWAITING QUALIFIED NATIVE-SPEAKER & COMMUNITY REVIEW
DOCUMENT ID: VR-PILOT-DOC-02
NOTE: This text serves as the master semantic baseline. Prior to field use, it must be translated, 
culturally reviewed, and orally recorded in authentic Gondi and Koya dialects by accredited native speakers.
```

#### What is Voice Roots?
Voice Roots is a community-owned digital audio library designed to help you, your family, and your elders preserve your spoken mother tongue for your children, grandchildren, and future generations. It ensures your words, proverbs, and stories remain protected and remembered in your own real voice.

#### Why are you being invited to participate?
You are invited because you are a native speaker of Gondi or Koya. Your knowledge of your ancestral language, daily words, traditional farming terminology, plant wisdom, and cultural stories is unique and irreplaceable.

#### Do you have to take part?
**No. Participation is 100% voluntary.**
- You can say "yes" or "no".
- If you say no, nobody will be upset, and your standing in the village and community will not change in any way.
- Even if you start speaking, you can stop at any moment. You do not have to answer any question or share any story you do not feel completely comfortable with.

#### What will happen during a recording session?
1. A field researcher and an accredited elder from your community will sit with you in a quiet, comfortable space.
2. They will explain the microphone and let you choose what story, traditional song, or daily conversation you wish to share.
3. Before the microphone turns on, they will ask for your consent (either in writing or by recording your voice saying you agree).
4. You will speak for about 3 to 10 minutes.
5. You can listen back to your recording immediately. If you dislike it, it will be deleted immediately on the spot.

#### What will happen to your voice recording?
- **Your voice belongs to you.** Voice Roots will never sell your recording, license it to commercial companies, or use it for corporate advertising.
- Your master voice recording will be safely stored in the archive. An offline computer tool will create a draft written text of your words, which a trusted community elder will review to make sure every word is spelled and understood accurately.
- You choose who can listen to your recording:
  - *Option 1*: Only you and designated community elders.
  - *Option 2*: Verified members of your language community.
  - *Option 3*: The public, so people around the world can learn to respect your language.

#### Can you change your mind later?
**Yes. You have the absolute right to withdraw at any time.**
If you ever decide that you no longer want your voice in the library, simply tell the community elder or field researcher. Within seconds, your recording will be removed from all search lists, and public access will be permanently locked.

#### Who can you speak with if you have questions or concerns?
- **Community Elder Representative**: *[Name, Village, and Contact to be appointed by Community Council]*
- **Institutional Ethics Liaison**: *[University Ethics Committee Representative Contact]*

---

### DOC-03: Informed Consent Form
#### Multimodal Written and Oral Audio Consent Protocol

```
STATUS: DRAFT PROTOCOL SPECIFICATION — AWAITING COMMUNITY COUNCIL APPROVAL
DOCUMENT ID: VR-PILOT-DOC-03
SUPPORTED MODALITIES: Signed Paper Form OR Timestamped Spoken Audio Consent Preamble
```

#### Section A: Contributor & Recording Identity
- **Contributor / Speaker Name**: __________________________________________________
- **Preferred Attribution**: `[ ]` Real Name & Clan `[ ]` Pseudonym `[ ]` Completely Anonymous
- **Language & Variety**: `[ ]` Gondi (Dialect: __________________) `[ ]` Koya (Dialect: __________________)
- **Village / Habitation**: __________________________________ **District**: __________________________________
- **Recording Title / Topic**: __________________________________________________
- **Approximate Duration**: ________ minutes

#### Section B: Granular Consent Facets (Speaker Selects Each Individually)
*Each option must be affirmatively chosen by the speaker. No default opt-ins.*

| Facet | Description | Speaker Decision |
| :---: | :--- | :---: |
| **Facet 1** | **Archival Preservation**: I permit Voice Roots to store my original voice recording in the secure digital community archive. | `[ ]` YES &nbsp;&nbsp;&nbsp; `[ ]` NO |
| **Facet 2** | **Offline AI Transcription**: I permit the local offline computer system to generate a preliminary draft text of my spoken words. | `[ ]` YES &nbsp;&nbsp;&nbsp; `[ ]` NO |
| **Facet 3** | **Elder Human Verification**: I permit accredited community elders and language specialists to review and correct the written transcript. | `[ ]` YES &nbsp;&nbsp;&nbsp; `[ ]` NO |
| **Facet 4** | **Educational Reuse**: I permit my consented non-sacred stories and words to be used in community vocabulary cards and learning modules. | `[ ]` YES &nbsp;&nbsp;&nbsp; `[ ]` NO |
| **Facet 5** | **Non-Commercial Linguistic Research**: I permit accredited non-commercial researchers to study grammar and vocabulary patterns under OCAP terms. | `[ ]` YES &nbsp;&nbsp;&nbsp; `[ ]` NO |
| **Facet 6** | **Public Audio Discovery**: I permit my recording to be listened to by learners and language enthusiasts on the public website. | `[ ]` YES &nbsp;&nbsp;&nbsp; `[ ]` NO |

#### Section C: Declaration of Non-Sacred Content
`[ ]` **I explicitly confirm that this recording does NOT contain sacred clan secrets, esoteric ritual incantations, private disputes, or restricted ceremonial knowledge.**

#### Section D: Right to Withdraw
I understand that I can withdraw my recording at any time in the future by notifying the community council or project coordinator. Upon withdrawal, public access will immediately cease.

#### Section E: Execution Block

**For Literate Participants (Written Consent):**
- **Speaker Signature / Mark**: _________________________________________ **Date**: _______________

**For Non-Literate Participants (Oral Audio Consent Preamble):**
- *Oral Consent Recording UUID*: `________________________________________________`
- *Timestamp of Spoken Affirmation*: `____:____:____` (Captured in master audio lead-in)

**Field Linguist & Community Witness Verification:**
- **Field Researcher Name**: _________________________________ **Signature**: ____________________
- **Community Elder Witness**: _______________________________ **Signature**: ____________________
- **Date & Location**: ____________________________________________________________________

---

### DOC-04: Community Sovereign Permission Checklist
#### Pre-Recording Tribal Council & Elder Governance Protocol

```
STATUS: DRAFT GOVERNANCE PROTOCOL — AWAITING BILATERAL COMMUNITY SIGN-OFF
DOCUMENT ID: VR-PILOT-DOC-04
APPLICABILITY: Mandatory pre-requisite prior to conducting any field recording in a target village
```

This checklist enforces the sovereign authority of Indigenous community councils under OCAP principles. Field researchers cannot enter villages or solicit recordings until every checkpoint is formally signed off by traditional community leadership.

- [ ] **1. Formal Council Briefing Completed**: The research team has met face-to-face with the traditional village council (e.g., Rai Sabha, Gram Sabha, or Tribal Elder Council), explained the project in the local vernacular, and answered all questions.
- [ ] **2. Accredited Community Elder Reviewers Designated**: The council has formally appointed two or more respected elders/knowledge-keepers to act as accredited moderators for all submitted recordings:
  - *Appointed Reviewer 1*: ________________________________ (Role/Clan: ________________________)
  - *Appointed Reviewer 2*: ________________________________ (Role/Clan: ________________________)
- [ ] **3. Cultural Exclusion Boundaries Established**: The elder council has clearly delineated forbidden subject areas (e.g., clan ancestral lineage ceremonies, birth/death rites, secretive medicinal formulations) that field researchers must refuse to record.
- [ ] **4. Permitted Cultural Topics Approved**:
  - `[ ]` Daily conversational vocabulary and farming terminology
  - `[ ]` Public folk stories, animal fables, and proverbs
  - `[ ]` Non-ceremonial harvest, seasonal, and celebration songs
  - `[ ]` Historical memories of village geography and old trails
- [ ] **5. Physical Data Repatriation Commitment**: The research team has agreed in writing to deliver an offline, unencrypted copy of all audio masters and verified transcripts on durable physical media (hard drive/USB) directly to the community council at the end of the pilot.
- [ ] **6. Collective Withdrawal & Dispute Protocol**: The council understands its right to request the collective withdrawal of any recording or dialect collection if community welfare or cultural protocol is violated.

#### Council Approval Sign-Off
- **Presiding Village Elder / Council Head**: __________________________________________________
- **Clan / Traditional Council Seal**: __________________________________________________
- **Village & District**: ________________________________________ **Date**: ___________________

---

### DOC-05: Data Governance, Access Control & Consent Withdrawal Policy
#### Technical and Legal Rulebook for Sovereign Digital Heritage

```
STATUS: DRAFT TECHNICAL GOVERNANCE POLICY — PENDING INSTITUTIONAL ADOPTION
DOCUMENT ID: VR-PILOT-DOC-05
AUTHORITY: OCAP® Data Sovereignty Standards & ISO 27001 Staging Controls
```

#### 1. The Principle of Master Audio Immutability
Under all circumstances, the raw acoustic recording captured from the microphone is the **immutable master asset**.
- The file is saved immediately as a 48kHz, 16-bit or 24-bit PCM uncompressed WAV file.
- Its SHA-256 cryptographic digest is calculated at ingestion and stored in the database (`audio_sha256`).
- No software pipeline, machine learning model, or editing tool is permitted to truncate, filter, resample, or overwrite the master file.
- All AI transcriptions, phonetic alignments, translations, and elder corrections are stored in separate relational and vector tables, strictly referencing the master recording by its immutable UUID.

#### 2. Access Tier Taxonomy
Every recording in Voice Roots is strictly assigned to one of four access tiers:

| Access Tier | Database Flag | Permitted Audience | Technical Enforcement |
| :--- | :--- | :--- | :--- |
| **Tier 1: Public Discovery** | `privacy_level = 'PUBLIC'` | Global learners, public educators, researchers | Streamable via `/storage/audio/{file}` and discoverable via public search. |
| **Tier 2: Community Restricted** | `privacy_level = 'COMMUNITY_ONLY'` | Verified language community members | Requires authenticated community session; excluded from unauthenticated search. |
| **Tier 3: Sacred Elder Only** | `privacy_level = 'SACRED_ELDER_ONLY'` | Appointed elder reviewers only | Blocked from `/storage/audio` endpoint with HTTP 403 Forbidden; excluded from public search and AI training. |
| **Tier 4: Withdrawn / Masked** | `status = 'withdrawn'` | System Administrator (Audit Only) | Streaming returns HTTP 404 (`"withdrawn under OCAP"`); purged from ChromaDB and FTS5 search indexes within $< 1.0\text{s}$. |

#### 3. Consent Withdrawal Protocol & Technical Execution
When a participant or authorized elder exercises the right to withdraw:
1. **Trigger**: An administrative or API request is submitted to `POST /api/transcripts/{id}/withdraw` with authorized credentials.
2. **Immediate Database Masking**: The record status is transitioned to `status = 'withdrawn'`, `consent_archiving = 0`, `consent_public = 0`, and `withdrawn_at = CURRENT_TIMESTAMP`.
3. **Search Index Eviction**: FTS5 search index entries are deleted; ChromaDB vector embeddings are evicted immediately.
4. **Audio Stream Masking**: Any attempt to access the audio file via HTTP returns `HTTP 404 Not Found` with response detail `{"detail": "withdrawn under OCAP"}`.
5. **Permanent Physical Deletion Protocol**: If the speaker requests complete physical purging, the master file on disk is overwritten and removed, leaving only a cryptographic audit tombstone confirming permanent deletion.

---

### DOC-06: Researcher Access & Ethical Data Use Agreement
#### Terms of Use for Institutional and Academic Research Interoperability

```
STATUS: DRAFT RESEARCH ACCESS AGREEMENT — PENDING PILOT ADOPTION
DOCUMENT ID: VR-PILOT-DOC-06
APPLICABILITY: Mandatory for all researchers accessing the Milestone 20 Research API
```

#### 1. Scope & Eligibility
Accredited academic linguists, indigenous language educators, and university researchers may apply for scoped API credentials to access non-sacred, consented linguistic corpora via the **Milestone 20 Research API** (`/api/v1/research/*`).

#### 2. Granular Token Scopes
Tokens are issued with strictly defined, non-transferable scopes:
- `read:registry`: Access language metadata, dialects, and census classifications.
- `read:transcripts`: Access verified, public transcripts and word alignments.
- `export:corpus`: Export standardized CoNLL-U and JSON corpus manifests.
- `export:lexicon`: Export verified community lexicons and dictionary entries.

#### 3. The Non-Commercial & Anti-Exploitation Covenant
By accepting an API key, the researcher explicitly enters into a legally binding covenant:
- **No Commercial Use**: The data shall not be used for commercial product development, monetized voice synthesis, or commercial AI model training.
- **No Proprietary LLM Absorption**: Corpus extracts shall not be uploaded to unvetted third-party cloud AI platforms (e.g., OpenAI, Google, Anthropic) without explicit community consent.
- **Mandatory Attribution**: All academic publications, papers, and presentations utilizing pilot data must cite the native language community, the specific dialect, and the sovereign stewardship of the traditional community council.
- **Dialect Integrity**: Researchers agree not to publish generalized phonetic or lexical claims that erase regional dialect varieties.

#### 4. Rate Limiting, Monitoring & Revocation
- **Enforced Rate Limit**: Research API requests are dynamically capped at **60 requests per minute** per institutional key. Exceeding this limit results in HTTP 429 Too Many Requests.
- **Audit Logging**: Every API access event (timestamp, endpoint, token ID, client IP) is permanently logged to `research_access_logs`.
- **Immediate Revocation**: The platform administrator or community council may revoke any token at any time via `DELETE /api/v1/research/keys/{key_id}` upon suspicion of terms violation.

---

### DOC-07: Institutional Pilot Test Plan & Verification Scenarios
#### Field Operational Execution Guide & Minimum Acceptance Criteria

```
STATUS: DRAFT OPERATIONAL PLAN — PENDING ETHICS & COMMUNITY CLEARANCE
DOCUMENT ID: VR-PILOT-DOC-07
METHODOLOGY: 10 Standardized Field Scenarios Covering Ingestion, Moderation, and Governance
```

#### 1. Pilot Readiness Benchmarks
The pilot will be evaluated against the 12 Key Performance Indicators established in Section 6 of `MILESTONE_23_PILOT_READINESS_ASSESSMENT.md`:
- Upload Reliability $\ge 98.0\%$ (Target $\ge 99.5\%$)
- Acoustic Bit-Preservation: $100\%$ bit-identical SHA-256 match
- Transcription Character Error Rate (CER) $< 20\%$ (Target $< 12\%$)
- Word Error Rate (WER) $< 30\%$ (Target $< 20\%$)
- Human Elder Correction Rate: $100\%$ of public recordings verified
- Zero External Cloud API Incurred Cost: **$0.00**

#### 2. The 10 Field Verification Scenarios
1. **Scenario 1 (Speaker Onboarding & Dual Consent)**: Field researcher onboard native Gondi speaker, explains project using DOC-02, and captures dual written/oral consent under DOC-03. *Acceptance*: Recording blocked if any required facet is unchecked.
2. **Scenario 2 (Lossless Audio Ingestion)**: Capture 5-minute oral narrative on mobile microphone in 48kHz WAV. *Acceptance*: Ingestion succeeds; SHA-256 digest calculated and stored.
3. **Scenario 3 (Local Offline Speech Recognition)**: Trigger local Whisper inference on audio master. *Acceptance*: Output text stored in `machine_transcript_text`; master audio untouched.
4. **Scenario 4 (Elder Review & Non-Destructive Correction)**: Appointed elder reviewer inspects machine transcript, corrects dialect spellings, and approves submission. *Acceptance*: Correction saved in `transcript_text`; machine output preserved in historical log; zero destructive edits.
5. **Scenario 5 (Dialect & Knowledge Graph Sync)**: Assign specific village dialect variety and link botanical terms to Knowledge Graph. *Acceptance*: Graph triples created linking language, dialect, and cultural concepts.
6. **Scenario 6 (Sacred Lore Ingestion Defense)**: Attempt to ingest an audio clip flagged as containing ceremonial initiation secrets. *Acceptance*: System flags record as `SACRED_ELDER_ONLY`; audio streaming endpoint returns HTTP 403 Forbidden.
7. **Scenario 7 (Language Learning Module Generation)**: Consented folktale exported into vocabulary flashcards. *Acceptance*: Educational practice module created; unconsented lore barred.
8. **Scenario 8 (Semantic Cross-Lingual Search)**: Search for traditional agricultural practices using Telugu and English queries. *Acceptance*: Local MiniLM embeddings retrieve Gondi/Koya narratives with MRR $\ge 0.65$.
9. **Scenario 9 (Institutional Research API Export)**: Accredited researcher key requests CoNLL-U corpus export. *Acceptance*: HTTP 200 returned; rate limiter enforces 60 req/min bound.
10. **Scenario 10 (Simulated Emergency Withdrawal)**: Speaker requests removal of their narrative. *Acceptance*: Administrator triggers withdrawal; within $< 1.0\text{s}$, audio returns HTTP 404 and vector embeddings are purged.

---

### DOC-08: Security Incident & Cultural Data Breach Response Procedure
#### Emergency Response Protocol for Technical Compromise or Cultural Protocol Violation

```
STATUS: DRAFT EMERGENCY PROCEDURE — PENDING PILOT ADOPTION
DOCUMENT ID: VR-PILOT-DOC-08
RESPONSE SLA: P1 Takedown within < 15 Minutes; Community Notice within < 24 Hours
```

#### 1. Incident Severity Classification
- **Priority 1 (P1 - Critical Cultural Emergency)**:
  - Accidental public exposure of sacred clan lore or ceremonial initiation rites.
  - Failure of consent withdrawal masking (withdrawn audio accessible to public).
  - Exposure of private speaker identity where anonymity was requested.
- **Priority 2 (P2 - Security Vulnerability)**:
  - Unauthorized administrative privilege escalation or token bypass.
  - Research API key compromise or mass corpus exfiltration attempt.
- **Priority 3 (P3 - Operational Failure)**:
  - Persistent volume unmount or backup failure.
  - Server crash during active field recording session.

#### 2. Containment Playbook for P1 Cultural Breaches
When sacred or unconsented audio is reported exposed:
1. **Immediate Quarantine ($T < 15\text{ minutes}$)**: The Incident Commander or Field Linguist executes immediate quarantine via `POST /api/transcripts/{id}/withdraw` or applies an emergency local firewall block on port 8000.
2. **Access Revocation**: All active sessions and research tokens are invalidated.
3. **Cache & Search Purge**: The SQLite FTS5 index and ChromaDB vector store are cleared of affected entries.
4. **Community Notification ($T < 24\text{ hours}$)**: The Lead Field Linguist and Community Liaison personally notify the affected speaker and traditional elder council, detailing the incident, root cause, and remediation steps taken.
5. **Institutional Ethics Report ($T < 48\text{ hours}$)**: A formal incident memorandum is submitted to the Institutional Review Board.

#### 3. Incident Response Team Roles
- **Incident Commander**: Technical Systems Lead (overall response coordination and container management).
- **Cultural Safety Officer**: Accredited Community Elder (determines cultural impact and approves resolution).
- **Field Operations Lead**: Senior Field Linguist (speaker communication and on-the-ground mitigation).

---

### DOC-09: Participant & Field Researcher Evaluation Questionnaire
#### Comprehensive Feedback Instrument for Usability, Comfort, and Cultural Respect

```
STATUS: DRAFT EVALUATION INSTRUMENT — AWAITING QUALIFIED BILINGUAL TRANSLATION
DOCUMENT ID: VR-PILOT-DOC-09
ADMINISTRATION: Oral bilingual interview (Gondi/Koya) for non-literate participants; written for researchers
```

#### Section A: Standard System Usability Scale (SUS)
*(Rated 1 = Strongly Disagree to 5 = Strongly Agree)*
1. I think that I would like to use this language system frequently. `[ 1 | 2 | 3 | 4 | 5 ]`
2. I found the system unnecessarily complex. `[ 1 | 2 | 3 | 4 | 5 ]`
3. I thought the system was easy to use. `[ 1 | 2 | 3 | 4 | 5 ]`
4. I think that I would need the support of a technical person to use this system. `[ 1 | 2 | 3 | 4 | 5 ]`
5. I found the various functions in this system were well integrated. `[ 1 | 2 | 3 | 4 | 5 ]`
6. I thought there was too much inconsistency in this system. `[ 1 | 2 | 3 | 4 | 5 ]`
7. I would imagine that most people in my village would learn to use this system very quickly. `[ 1 | 2 | 3 | 4 | 5 ]`
8. I found the system very cumbersome to use. `[ 1 | 2 | 3 | 4 | 5 ]`
9. I felt very confident using the system. `[ 1 | 2 | 3 | 4 | 5 ]`
10. I needed to learn a lot of things before I could get going with this system. `[ 1 | 2 | 3 | 4 | 5 ]`

#### Section B: Cultural Respect & Audio Recording Comfort
1. Did the researcher clearly explain who owns your voice before recording began? `[ YES | NO ]`
2. Did you feel comfortable and unhurried while speaking into the microphone? `[ 1 | 2 | 3 | 4 | 5 ]`
3. Did you feel confident that sacred or private family stories would remain protected? `[ 1 | 2 | 3 | 4 | 5 ]`
4. Did you feel that your local dialect variety was respected by the elder reviewers? `[ 1 | 2 | 3 | 4 | 5 ]`

#### Section C: Open-Ended Qualitative Feedback
1. What was the best or most meaningful part of sharing your spoken words?
   ____________________________________________________________________________________________
2. Was there anything confusing, uncomfortable, or concerning during the session?
   ____________________________________________________________________________________________
3. What words or stories should we record next to protect our language for our youth?
   ____________________________________________________________________________________________

---

## Section 2: Language & Community Safeguards

To prevent digital colonialism, linguistic misrepresentation, and paternalistic research practices, the following operational safeguards are permanently enforced for Gondi and Koya:

```
╔══════════════════════════════════════════════════════════════════════════════════════╗
║                     MANDATORY COMMUNITY SAFEGUARDS POLICY                            ║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║ 1. NO INVENTED PERMISSIONS   : Zero claims of elder approval or council consent      ║
║                                without physically executed bilateral documentation.  ║
║ 2. NO MACHINE-INVENTED TEXTS : Consent documents must NEVER be translated via cloud  ║
║                                machine translation without human elder verification. ║
║ 3. NO DIALECT HOMOGENIZATION : Adilabad Gondi, Bastar Gondi, and Khammam Koya must   ║
║                                be classified as distinct dialect varieties.          ║
║ 4. SOVEREIGN COUNCIL PRIMACY : IRB clearance from a university is NOT community      ║
║                                permission. Both are required independently.          ║
╚══════════════════════════════════════════════════════════════════════════════════════╝
```

1. **Awaiting Qualified Native-Speaker Review**: All draft consent texts (DOC-02, DOC-03, DOC-09) are currently provided in English reference format only. They are explicitly marked: `AWAITING QUALIFIED NATIVE-SPEAKER AND COMMUNITY COUNCIL REVIEW`. No automatic machine translation shall be substituted for human native-speaker translation.
2. **Oral Vernacular Consent Requirement**: Because significant portions of rural indigenous speaker cohorts communicate through oral tradition rather than printed literacy, consent cannot rely solely on written signatures. Spoken bilingual audio prompts in native Gondi and Koya dialects must be produced, vetted, and recorded prior to field deployment.
3. **Dialect Integrity**: Gondi and Koya encompass diverse dialect networks (e.g., Northern Gondi, Southern Gondi, Koyaboli, Dorli). No linguistic claim of "correctness" may be asserted by outside researchers over local native variants.

---

## Section 3: Operational Gate Tracker (G-01 through G-05)

Every operational prerequisite represents a mandatory go/no-go gate. **All five gates currently remain strictly PENDING.** No field activities, institutional engagements, or participant interactions may commence until each gate transitions to `APPROVED` with verifiable evidence.

| Gate Ref | Required Operational Real-World Check | Responsible Party / Role | Required Evidence Document | Target Verification Method | Current Status | Outstanding Actions Required |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **G-01** | **Institutional Ethics Approval (IRB)** | Principal Investigator & Institutional Ethics Liaison | Formal, signed IRB clearance certificate referencing `DOC-01: Pilot Proposal` | Review of written IRB approval letter from partner university ethics board | ⏳ **PENDING** | Submit completed `DOC-01` and `DOC-03` to institutional review board; await formal committee review. |
| **G-02** | **Community Council Sovereign Consent** | Lead Field Linguist & Traditional Council Head | Signed and clan-sealed `DOC-04: Community Permission Checklist` | Physical inspection of bilateral council agreement and elder delegation resolution | ⏳ **PENDING** | Present project in-person to Gondi and Koya community elder councils; secure formal bilateral memorandum. |
| **G-03** | **Vernacular Oral Consent Prompts** | Accredited Native Speakers & Cultural Safety Officer | Validated audio recordings (`.wav`) of `DOC-02` and `DOC-03` in Gondi and Koya | Acoustic verification and elder panel translation sign-off | ⏳ **PENDING** | Engage certified native translators to record and verify spoken oral consent prompts in local dialects. |
| **G-04** | **Host Persistent Volume Provisioning** | Infrastructure Lead & Technical Systems Admin | Host filesystem audit confirming durable mount with `chown -R 1000:1000 /data` | Live execution of `/api/v1/system/storage-probe` returning `status: "healthy"` on host | ⏳ **PENDING** | Provision target physical server/workstation; mount dedicated NVMe/SSD volume to `/data`; set UID 1000 ownership. |
| **G-05** | **Edge Reverse-Proxy TLS Certificates** | Systems Administrator & Network Operations | Valid DNS routing and active TLS 1.3 certificate for `pilot.voiceroots.ai` | Automated HTTPS TLS handshake probe (`curl -Iv https://pilot.voiceroots.ai`) | ⏳ **PENDING** | Point DNS records to hosting IP; run `deployment/docker-compose.pilot.yml`; verify Let's Encrypt certificate issuance. |

---

## Section 4: Repository Security & Historical Artifact Audit

In accordance with Section 4 of the user directive, an in-depth read-only inspection of repository Git history was conducted to investigate whether `backend/voice_roots.db` or backup files containing sensitive information remain accessible in historical commits.

### 1. Methodology & Inspection Scope
The inspection was conducted using read-only Git commands without modifying commits, rewriting history, or deleting files:
- `git log --stat -- "backend/voice_roots.db"`
- `git log --all --name-only | grep -E '\.(db|sqlite|bak|backup)$'`
- Read-only Python SQLite introspection of historical database objects extracted directly from Git object storage (`git show <commit>:backend/voice_roots.db`).

### 2. Historical Tracking Timeline of `backend/voice_roots.db`
The database binary was introduced early in development and tracked across 16 historical commits prior to its removal:
1. `fd4dd72` (Milestone Integration Takeover): Initial database creation (16 KB).
2. `93d37dc` through `2d53db5` (Milestones 1–8): Database grew incrementally from 376 KB to 765 KB.
3. `e24aacb` through `03d9d7f` (Milestones 9–20): Grew to 2.57 MB as synthetic lexicons and knowledge graph seeds were added.
4. `2f0d013` (Milestone 21): 2.84 MB.
5. `6a87072` (Milestone 22 Hardening): 3.30 MB (final tracked revision).
6. `62ba218` (**PR-05 Security Untracking**): `git rm --cached backend/voice_roots.db` executed; `.gitignore` updated with `*.db`, `*.db-shm`, `*.db-wal`. The file was completely removed from index tracking.

### 3. Investigation of Database Contents in Historical Commits
Inspection of the historical database binary at commit `6a87072` revealed:
- **Absence of User Credentials / Passwords**: The database contains **zero `users` tables, zero password hashes, and zero session authentication tokens**.
- **Research API Key Storage**: The `research_api_keys` table contains 38 rows. All keys are stored as **one-way SHA-256 cryptographic hashes** (`api_key_hash`), never as plaintext secrets.
- **Contributor / Speaker PII**: The `transcripts` table contains 661 rows. All contributor names are **synthetic test fixtures** generated during milestone unit testing (e.g., `"Community Contributor"`, `"Field Researcher"`, `"Elder Somu Meshram"`, `"Lachhu Maravi"`, `"Confidential Contributor"`). No real human participant personal identifiable information (PII) is present.
- **Audio Files**: **Zero raw audio recordings from `backend/storage/audio/` were ever committed to Git history.** The only audio files in repository history are public synthetic demonstration files in `mobile/assets/audio/` and `web/public/audio/`.
- **Database Backups**: An exhaustive search confirmed that **zero backup files** (`backend/backups/*.bak`, `*.db`) were ever committed to Git.

### 4. Security Assessment & History Retention Policy
While the historical database contains only synthetic test data and one-way hashes, retaining binary database files in Git history is a known repository anti-pattern. However, in strict adherence to the project rule:
> **"Do not modify main. Do not rewrite Git history. Do not delete backups."**

Git history has been left untouched. Untracking in commit `62ba218` ensures no future database binary or live participant data can ever be committed to the repository index. If public open-source publication of the repository is planned in future milestones, an external history-sanitization procedure (such as `git-filter-repo`) will be evaluated as a formal release gate.

---

## Section 5: Version Information, Review Matrix & Unresolved Decisions

### 1. Document Version Control

| Version | Date | Author / Agent | Changes & Notes |
| :---: | :---: | :---: | :--- |
| `1.0-DRAFT` | 2026-11-02 | ANTIGRAVITY | Initial compilation of complete 9-document governance suite, operational gate tracker, and security audit report based on M23 baseline `7733142`. |

### 2. Multi-Stakeholder Review Matrix

| Stakeholder Role | Organization / Affiliation | Review Responsibilities | Mandatory Approval Artifact |
| :--- | :--- | :--- | :--- |
| **Institutional Ethics Reviewer** | Partner University Ethics Board (IRB) | Review `DOC-01`, `DOC-02`, and `DOC-03` for compliance with human research ethics standards. | Signed IRB Clearance Letter (Gate G-01) |
| **Gondi Community Council Head** | Traditional Gondwana Mahasabha / Gram Sabha | Review `DOC-04` and approve Gondi dialect scope and appointed elder reviewers. | Signed & Sealed `DOC-04` (Gate G-02) |
| **Koya Community Council Head** | Traditional Koya Tribal Council / Elder Panel | Review `DOC-04` and approve Koya dialect scope and appointed elder reviewers. | Signed & Sealed `DOC-04` (Gate G-02) |
| **Lead Field Linguist** | Accredited Academic Linguistics Dept | Oversee native-speaker translations of `DOC-02` and `DOC-03` and oral recording of prompts. | Native Oral Audio Prompts (Gate G-03) |
| **Infrastructure & Security Lead** | Voice Roots Technical Engineering | Verify persistent volume mount permissions and edge reverse-proxy TLS configurations. | Storage Probe & TLS Handshake (Gates G-04 & G-05) |

### 3. Open Unresolved Decisions Requiring Human Determination

The following operational questions cannot be determined by AI agents and require human administrative resolution prior to pilot execution:

1. **Partner University Selection**: Formal selection between prospective academic institutions (e.g., Central Institute of Indian Languages, Osmania University Department of Linguistics, or TCRTI).
2. **Specific Village Habitation Selection**: Final determination of the exact geographic villages in Telangana/Andhra Pradesh (for Koya) and Telangana/Maharashtra/Chhattisgarh (for Gondi) where field visits will occur.
3. **Physical Media Provisioning Budget**: Formal allocation of funds for ruggedized USB thumb drives / external SSDs to be distributed to village elder councils for local offline data possession.
4. **Dialect Transcription Orthography**: Formal agreement between community elders and academic linguists regarding the preferred script for rendering oral Gondi and Koya transcripts (e.g., native Gunjala Gondi lipi, Masaram Gondi lipi, Telugu script with diacritics, or Devanagari script).

---

```
══════════════════════════════════════════════════════════════════════════════════════
  END OF MILESTONE 23 PILOT DOCUMENTATION PACKAGE — EXECUTION STRICTLY HALTED
  No participants contacted. No recordings collected. All operational gates PENDING.
══════════════════════════════════════════════════════════════════════════════════════
```

