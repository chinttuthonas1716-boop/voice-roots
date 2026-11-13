# 🎙️ Voice Roots: 10-Minute Academic Live Demonstration Script

> **Project Title**: Voice Roots — Rooting Oral Languages in Text with AI  
> **Target Audience**: Capstone Evaluation Committee, Academic Faculty, and Community Custodians  
> **Duration**: Exactly 10 Minutes (8 Guided Lifecycle Stages + Q&A)  
> **Live Production URL**: [https://voice-roots.onrender.com](https://voice-roots.onrender.com)  
> **Live API Gateway**: [https://voice-roots-api.onrender.com](https://voice-roots-api.onrender.com)

---

## ⏱️ Evaluation Schedule & Stage Allocation

| Stage | Duration | Core Route / View | Operational Focus |
| :---: | :---: | :--- | :--- |
| **01** | `00:00 – 01:15` | Landing Page (`/`) & Governance (`/about`) | Linguistic motivation, Census 2011 context, and OCAP® data sovereignty. |
| **02** | `01:15 – 02:15` | Contributor Login (`/login`) | Role-based authentication, guest exploration, and session security. |
| **03** | `02:15 – 03:45` | Recording Studio (`/record`) | Dual affirmative consent, prompted Swadesh recording, and acoustic capture. |
| **04** | `03:45 – 05:00` | Machine Transcription & Honest Translation | Whisper ASR, IndicTrans2 draft badges (`[DRAFT - UNREVIEWED]`), and FLAC master. |
| **05** | `05:00 – 06:15` | Reviewer Moderation Queue (`/reviewer`) | Customary elder audit, phonetic corrections, and approval state transition. |
| **06** | `06:15 – 07:30` | Multilingual Dictionary (`/dictionary`) | Four-language corpus (Gondi, Koya, Santhali, Lambadi), IPA, and elder provenance. |
| **07** | `07:30 – 08:30` | Demographic Benchmarks & Stats (`/stats`) | Census 2011 mother-tongue baselines, endangered status, and audio coverage. |
| **08** | `08:30 – 10:00` | Sovereign Consent Withdrawal (`/passport/1`) | Sub-second cascade deletion, audit logging, and immutability guarantees. |

---

## 🎬 Stage-by-Stage Click-by-Click Guide

### Stage 1: Motivation & Indigenous Data Sovereignty (`00:00 – 01:15`)

- **Click-by-Click Action**:
  1. Open [https://voice-roots.onrender.com](https://voice-roots.onrender.com) in browser (desktop viewport 1280px).
  2. Point out the top **Universal DEMO DATA Banner**: highlight the disclaimer and click **Governance Charter &rarr;** to navigate to `/about`.
  3. Scroll to the **First Nations OCAP® Principles & Governance Charter** card.
- **Spoken Script**:
  > *"Respected faculty and committee members. In India alone, over 19,500 raw mother tongues exist according to Census 2011, yet only 121 are officially recognized. Over 400 oral languages are vulnerable to silent extinction. When an oral language ceases to be spoken, centuries of botanical lore, medicine, and oral history vanish with it.*
  >
  > *Voice Roots is built on a non-negotiable ethical foundation: **First Nations OCAP® (Ownership, Control, Access, and Possession)**. Notice our persistent demo banner: all data remains strictly labelled DEMO until institutional IRB clearance and bilateral community council agreements are finalized.*
  >
  > *Most importantly: **The voice recording is the immutable cultural master. AI is merely an assistive annotation layer, never the definitive author or owner.** Let us demonstrate the complete 8-step lifecycle."*

---

### Stage 2: Authentication & Role-Based Access (`01:15 – 02:15`)

- **Click-by-Click Action**:
  1. Click **Log In** in the top navigation bar to go to `/login`.
  2. Switch between **Sign In** and **Sign Up** tabs to show the mandatory ethical consent checkbox during account creation.
  3. Enter demo contributor credentials (`field_worker` / `preservation2026`) or click quick contributor session.
- **Spoken Script**:
  > *"Voice Roots implements fine-grained Server-Side Role-Based Access Control (RBAC) isolating four key roles: **Contributors**, **Community Elder Reviewers**, **Institutional Researchers**, and **Administrators**.*
  >
  > *In production, pre-seeded accounts are strictly disabled—clean production instances require a cryptographically generated one-time bootstrap token. We now log in as an authorized community contributor."*

---

### Stage 3: Dual Affirmative Informed Consent & Field Recording (`02:15 – 03:45`)

- **Click-by-Click Action**:
  1. Click **Record** in the navigation bar to enter `/record`.
  2. Point out the **Informed Consent Notice** card.
  3. Toggle the language selector between English, Telugu, and Hindi to demonstrate localized consent prompts.
  4. Explicitly check the two distinct affirmative checkboxes:
     - Checkbox 1: Master Archival Preservation Consent.
     - Checkbox 2: Assistive AI Transcription Consent.
  5. Select **Prompted Mode** &rarr; choose **Gondi (Adilabad Southern)** &rarr; select prompt: *"మారొడి నేలపాల్"* (Mother Earth).
  6. Click **Start Recording**, speak the phrase into the microphone, and click **Stop**.
  7. Play back the recorded audio in the waveform player.
- **Spoken Script**:
  > *"Consent is never bundled or pre-checked. We require dual affirmative consent: first, for immutable master acoustic archiving; second, for assistive AI transcription. If a speaker refuses AI processing, their master voice is still safely archived without automated machine transcription.*
  >
  > *Field contributors can record freeform oral narratives or select from standardized Swadesh lexical prompts across Gondi, Koya, Santhali, and Lambadi. Upon recording, the audio is captured as lossless 48kHz audio."*

---

### Stage 4: AI Speech Recognition & Honest Translation Policy (`03:45 – 05:00`)

- **Click-by-Click Action**:
  1. Click **Submit Recording & Generate Draft**.
  2. Observe the automatic transition to the story detail view.
  3. Point out the yellow draft pill: `[DRAFT - UNREVIEWED MACHINE GENERATION]`.
  4. Click **Translate** in the top navigation to navigate to `/translate`.
  5. Select source language **Gondi** and target language **English**, and type a sample phrase: *"నార లోపల వాన వచ్చింది"*.
  6. Point out the machine translation output and the mandatory disclaimer:
     > *"Machine translation for unwritten oral tongues is assistive only and carries unreviewed draft status until approved by a customary elder."*
- **Spoken Script**:
  > *"Under our Honest Translation Policy (Task T2.1), the system rejects artificial confidence. Foundation models frequently hallucinate when processing low-resource oral tongues.*
  >
  > *Every machine-generated transcript and IndicTrans2 translation is stamped with a server-enforced `[DRAFT]` badge. It cannot be presented as authoritative community knowledge until it has undergone customary human review."*

---

### Stage 5: Customary Elder Reviewer Queue (`05:00 – 06:15`)

- **Click-by-Click Action**:
  1. Log out or switch to **Elder Reviewer** identity (`elder_reviewer` / `ElderReviewer2026!`).
  2. Click **Reviewer Queue** in the navigation bar (`/reviewer`).
  3. Point out the three tabs: **Draft Transcripts**, **Pending Translations**, and **Dictionary Submissions**.
  4. Click on the pending draft item.
  5. Listen to the acoustic master playback.
  6. Click **Elder Approve & Publish** (or click **Correct & Save** to show the revision audit logging).
  7. Show that the item status immediately elevates from `draft` to `approved` and is stamped with the elder reviewer's accredited council badge.
- **Spoken Script**:
  > *"Here is the Community Elder Reviewer Queue (Task T2.3). Voice Roots respects traditional Indigenous governance structures. Machine output sits in quarantine until an accredited language elder performs an acoustic audit.*
  >
  > *Elders can listen to the master, approve the text, or submit phonetic corrections. Once approved, the draft badge is cleared, and the record is elevated to the permanent community archive."*

---

### Stage 6: Multilingual Dictionary & Cultural Provenance (`06:15 – 07:30`)

- **Click-by-Click Action**:
  1. Click **Dictionary** in the navigation bar (`/dictionary`).
  2. Demonstrate search across the 4 core languages: type `"persapen"` (Gondi), `"mutte"` (Koya), `"baha"` (Santhali), or `"sevalal"` (Lambadi).
  3. Click **Listen** to stream the authenticated audio pronunciation snippet.
  4. Expand the entry card to show:
     - Native scripts (Masaram Gondi, Ol Chiki, Telugu, Devanagari)
     - International Phonetic Alphabet (IPA) phonological transcription
     - Source provenance attribution (e.g. *Attributed to Kotnak Jangu, elder storyteller, Keslapur Assembly*)
     - Customary cultural context.
- **Spoken Script**:
  > *"Our Multilingual Dictionary and Phrasebook (Task T2.6) indexes over 50 verified lexical items across our four target languages. Notice that every word carries its authentic IPA representation, its multi-script transliteration, and vital source provenance.*
  >
  > *Words are not abstracted away from their cultural custodians; every entry records who spoke it, in which river basin or assembly, and which elder council verified its meaning."*

---

### Stage 7: Demographic Analytics & Census 2011 Benchmarks (`07:30 – 08:30`)

- **Click-by-Click Action**:
  1. Navigate to `/stats` (or click **Demographic Stats** from the footer).
  2. Point out the live telemetry cards: Total Preserved Masters, Total Words, Audio Coverage %, and Elder Verification Rate.
  3. Scroll down to the **Census 2011 Demographic Benchmarks** table.
  4. Compare the official 2011 speaker counts (e.g., Gondi: 2.98 million, Santhali: 7.36 million, Lambadi: 4.60 million, Koya: 405,000) against current digital preservation coverage.
- **Spoken Script**:
  > *"Preservation requires demographic accountability. On our Public Stats dashboard (Task T2.7), community members and scholars can see real-time progress benchmarked against India's official Census 2011 data.*
  >
  > *This demonstrates the stark gap between living speaker populations and existing digital representation, guiding targeted field recording drives in vulnerable agency tracts."*

---

### Stage 8: Sovereign Consent Withdrawal & Immutability Guarantee (`08:30 – 10:00`)

- **Click-by-Click Action**:
  1. Navigate to `/passport/1`.
  2. Show the **Cultural Voice Passport** with its SHA-256 seal, dialect telemetry, and OCAP access tier.
  3. Scroll to the **Data Sovereignty & Speaker Consent Withdrawal** panel.
  4. Click **Withdraw Speaker Consent**.
  5. Select reason: *"Speaker customary prerogative / Clan decision"*, and confirm withdrawal.
  6. Demonstrate the immediate results:
     - Status updates to `Consent Withdrawn`.
     - Audio streaming returns HTTP 404 / 403.
     - Search index immediately purges the item.
     - An immutable cryptographic entry is appended to the server-side `governance_audit_logs`.
- **Spoken Script**:
  > *"Finally, we demonstrate the most critical test of Indigenous data sovereignty: **Sub-Second Consent Revocation** (Task T2.2).*
  >
  > *Under OCAP, a speaker's consent is not a one-time surrender of rights. A speaker can withdraw their voice at any time. When consent is withdrawn, Voice Roots executes an atomic cascade: the physical audio master is purged, AI transcripts and translations are deleted from the database, search vector embeddings are excised, and streaming routes immediately return 404.*
  >
  > *Only an immutable governance audit log entry remains to record the ethical withdrawal.*
  >
  > *Voice Roots proves that artificial intelligence can be deployed in deep alignment with human rights, cultural sovereignty, and linguistic preservation. Thank you, and we welcome your questions."*

---

## ❓ Faculty Review Committee: Anticipated Questions & Defense

### Q1: "Why did you build a web application instead of a native mobile app?"
- **Defense**: Native app store distribution introduces severe friction for rural and tribal contributors (account requirements, device-specific APKs, Apple/Google platform monopolies). Voice Roots is an Offline-First Progressive Web App (PWA) with Service Worker background caching and IndexedDB queueing. It runs on any phone browser, works completely offline in air-gapped forests, and syncs automatically when 4G connectivity is restored.

### Q2: "How does the system prevent non-speakers from polluting the tribal dictionary?"
- **Defense**: Community contributions are subject to a mandatory three-stage gate: (1) cryptographic HMAC contributor token tracking, (2) automated phonetic anomaly detection, and (3) mandatory human elder sign-off in the `/reviewer` queue before a word can receive the `Elder Approved` badge.

### Q3: "What happens if the cloud storage goes down or Render sleeps?"
- **Defense**: The backend architecture implements dual-redundant fallback: Cloudflare R2 is the primary object store with zero egress fees, while local storage acts as an offline fallback. The database utilizes managed PostgreSQL with an automatic zero-cost SQLite WAL fallback for complete local standalone deployment.
