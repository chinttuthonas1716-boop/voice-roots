# 📋 Voice Roots: Pending Human Actions & Ethical Governance Checklist

> **Document Status**: Active Pre-Deployment Prerequisite Register  
> **Target Audience**: Institutional Ethics Reviewers, Academic Supervisors, Community Liaisons, and Principal Investigators  
> **Platform Version**: `v1.0.0-production`  
> **Compliance Target**: Tri-Council Policy Statement (TCPS 2 - Chapter 9: Research Involving the First Nations, Inuit and Métis Peoples of Canada), CARE Principles for Indigenous Data Governance, and Indian Council of Social Science Research (ICSSR) Ethical Guidelines.

---

## ⚠️ Executive Statement on Software Limitations

Voice Roots has achieved full software verification across all technical layers (frontend, backend, storage, database, authentication, and continuous deployment). However, **software alone cannot confer ethical legitimacy or cultural consent**. 

In strict adherence to the project's foundational ethics:
1. **All current assets in the platform are labelled as `DEMO / SYNTHETIC EVALUATION DATA`**.
2. **No authentic field recordings from indigenous communities may be ingested into production until every item in the checklist below has been formally completed, signed, and countersigned by authorized human custodians.**

---

## 🏛️ Checklist of Non-Software Prerequisites

```text
[ ] 1. Institutional Review Board (IRB) Ethics Board Clearance
[ ] 2. Bilateral Data Governance Agreements with Tribal Councils
[ ] 3. Native Speaker Voice Talent for Spoken Consent & Seed Lexicons
[ ] 4. Formal Appointment & Accreditation of Community Elder Councils
[ ] 5. Customary Sacred Knowledge Classification & Exclusion Protocols
[ ] 6. Community Data Repatriation & Succession Trust Establishment
```

---

## 📝 Detailed Action Descriptions & Protocols

### 1. Institutional Review Board (IRB) Ethics Clearance

- **Responsible Parties**: Principal Investigator (PI), University Human Research Ethics Committee.
- **Required Deliverables**:
  - Formal submission of the Voice Roots Protocol Dossier, including participant information sheets, risk minimization strategies, and sub-second consent revocation mechanisms.
  - Review of dual affirmative consent text for potential linguistic coercion or structural power imbalances between field researchers and rural community members.
  - Ethical clearance certificate granting permission to conduct ethnographic linguistic fieldwork among scheduled tribes (Gondi, Koya, Santhali, Lambadi).
- **Current Status**: `PENDING HUMAN SUBMISSION`
- **Software Mitigation**: The platform displays a prominent, universal `DEMO DATA / ACADEMIC PILOT` disclaimer across all web views (`web/src/app/layout.tsx`).

---

### 2. Bilateral Community Data Agreements (OCAP® Compacts)

- **Responsible Parties**: Tribal Welfare Department liaisons, Registered Adivasi Associations, Gondwana Panchayats, Santhal Manjhi Councils, and Banjara Seva Sanghs.
- **Required Deliverables**:
  - Legally binding bilateral Memoranda of Understanding (MOUs) ratifying that all acoustic recordings belong exclusively to the contributing community.
  - Explicit non-commercial covenants prohibiting the use of archived voice data for commercial AI foundation models, automated voice synthesis, or third-party corporate resale.
  - Agreed dispute resolution procedures for cross-dialectal phonetic standardizations.
- **Current Status**: `PENDING COMMUNITY CONSULTATION`
- **Software Mitigation**: Server-side access control enforces four isolated tiers (`public`, `community`, `research`, `private`), and restricted export scripts (`scripts/export_restricted_data.py`) bundle mandatory `OCAP_GOVERNANCE.txt` notices.

---

### 3. Native Speaker Voice Talent for Spoken Audio Prompts

- **Responsible Parties**: Native Mother-Tongue Speakers (Gondi, Koya, Santhali, Lambadi).
- **Required Deliverables**:
  - Authentic, human-recorded acoustic audio recordings of the **Spoken Informed Consent Notice** in each target language, dialect, and script:
    - Gondi (Adilabad & Bastar dialects)
    - Koya (Bhadrachalam Agency & Papikonda dialects)
    - Santhali (Mayurbhanj & Santhal Parganas dialects)
    - Lambadi / Gor Boli (Telangana & Maharashtra dialects)
  - Replacement of placeholder synthesized audio files (`data/audio/prompts/*.wav`) with certified human acoustic masters.
- **Current Status**: `AWAITING NATIVE SPEAKER SESSIONS`
- **Software Mitigation**: The codebase strictly forbids automated machine generation of synthetic tribal consent audio. Any placeholder file is marked with metadata `is_placeholder=true`.

---

### 4. Appointment & Accreditation of Community Elder Councils

- **Responsible Parties**: Traditional Clan Heads (Patels, Manjhis, Nayaks), Tribal Cultural Research and Training Institutes (TCRTI).
- **Required Deliverables**:
  - Nomination and credentialing of accredited elders to staff the Community Reviewer Queue (`/reviewer`).
  - Distribution of secure authentication hardware tokens or credential pairs to verified elder reviewers.
  - Formulation of customary guidelines for adjudicating spelling disputes between regional scripts (e.g., Gunjala Gondi vs. Telugu script for Adilabad Gondi; Ol Chiki vs. Latin/Devanagari for Santhali).
- **Current Status**: `PENDING COUNCIL NOMINATION`
- **Software Mitigation**: The Reviewer Queue requires the `reviewer` or `admin` role, preventing unauthorized public users from approving or modifying linguistic drafts.

---

### 5. Customary Sacred Knowledge Classification & Exclusion Protocols

- **Responsible Parties**: Clan Priests (Katikas, Katwalas, Naiks, Ojhas), Traditional Ethnobotanical Healers.
- **Required Deliverables**:
  - Compilation of a community-defined index of sacred, ceremonial, or restricted lore that must **NEVER** be recorded or uploaded to cloud infrastructure (e.g., secret clan invocations, private funerary rites, confidential healing herb recipes).
  - Training field workers to recognize and refuse recording requests that violate customary community taboos.
- **Current Status**: `PENDING ELDER ADVISORY SESSION`
- **Software Mitigation**: Server-side access control includes a `sacred_lore_restricted` security tag that blocks search indexing and streaming endpoints for restricted content.

---

### 6. Community Data Repatriation & Succession Trust

- **Responsible Parties**: Legal Counsel, Indigenous Rights Advocacy Organizations.
- **Required Deliverables**:
  - Establishment of an independent, non-profit community trust or cooperative to inherit custody of all encrypted storage keys, database backups, and domains in the event that academic project funding terminates.
  - Creation of an air-gapped physical hard drive repository maintained locally within tribal community resource centers.
- **Current Status**: `LONG-TERM GOVERNANCE ROADMAP`
- **Software Mitigation**: Automated disaster recovery scripts (`scripts/backup_database.py` and `scripts/restore_database.py`) support atomic offline snapshots that can be exported to standard encrypted media without cloud vendor lock-in.

---

## 📌 Sign-Off & Verification Schedule

| Milestone Gate | Target Completion | Verification Authority | Current Status |
| :--- | :---: | :--- | :---: |
| **Institutional IRB Clearance** | Q1 2027 | University Ethics Board | `PENDING` |
| **Gondwana Council MOU** | Q1 2027 | Keslapur Assembly Elders | `PENDING` |
| **Santhali Ol Chiki Agreement** | Q2 2027 | All India Santali Writers Assoc. | `PENDING` |
| **Human Consent Audio Ingest** | Q2 2027 | Certified Field Ethnolinguists | `PENDING` |
| **Community Elder Accreditation** | Q2 2027 | Joint Tribal Review Board | `PENDING` |

> *Until all gates above are marked `VERIFIED`, Voice Roots will remain restricted to invited pilot participants using simulated and placeholder evaluation assets.*
