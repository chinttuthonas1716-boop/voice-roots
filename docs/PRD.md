# Voice Roots — Product Requirements Document (PRD)

## 1. Executive Summary
**Voice Roots** is an oral heritage preservation platform engineered to document, transcribe, translate, and archive endangered indigenous and regional spoken traditions. The platform empowers native communities, elders, and linguists to safeguard generational narratives with cryptographic provenance while ensuring complete community data sovereignty (OCAP: Ownership, Control, Access, and Possession).

---

## 2. Target Users & Personas

### A. Community Elders & Native Speakers
- **Profile**: Native knowledge keepers speaking vulnerable dialects (e.g. Soyam Laxman, Gondi elder).
- **Needs**: Simple audio recording, offline resilience, spoken guidance, and culturally respectful consent agreements.

### B. Field Recorders & Community Contributors
- **Profile**: Local youth and researchers documenting elder songs, chants, and oral folktales in field conditions.
- **Needs**: Reliable mobile recording, offline queueing, metadata tagging (dialect, clan, region), and background synchronization.

### C. Linguists & Translation Reviewers
- **Profile**: Academic and community linguists (e.g. Dr. Ananya Sen, Indic linguist).
- **Needs**: Side-by-side original audio playback, verbatim transcript verification, dialect annotation, and translation review.

### D. Public Listeners & Learners
- **Profile**: Students, diasporic descendants, and cultural enthusiasts.
- **Needs**: Everyday conversation learning modules, pronunciation guidance, story exploration, and geographical language mapping.

---

## 3. Core Feature Requirements

### 1. Day-to-Day Multilingual Conversations (`/translate`)
- Provide 10 everyday categories: Greetings, Introductions, Everyday Questions, College & Classroom, Shopping & Money, Food & Dining, Travel & Directions, Family & Friends, Healthcare & Emergencies, Work & Interviews.
- Dual-speaker dialogue scripts displaying source (Telugu/Hindi), transliteration, and English translation.
- Browser TTS audio playback with explicit disclaimers identifying synthetic pronunciation assistance.

### 2. Audio Upload, Transcription & Translation (`/upload`)
- Support uploading audio recordings in WAV, MP3, M4A, WebM, and OGG formats up to 25MB.
- Interactive HTML5 audio player displaying playback scrubber, current time, and duration.
- Automated Speech-to-Text via Whisper (`/api/transcribe`).
- Source transcript review card allowing user editing and verification before translation.
- Machine Translation via IndicTrans2 (`/api/translate`) with source-to-target language pairing.
- Dedicated result panels with independent Copy and Download (.txt) functionality.

### 3. Authentication & Access Control (`/login`, `/register`, `/profile`)
- Secure registration and login using salted `scrypt` hashing and HMAC-SHA256 signed session tokens.
- Role-Based Access Control (RBAC): `listener`, `contributor`, `reviewer`, `admin`, and `guest`.
- 1-click demo accounts for evaluation (Elder Laxman, Dr. Ananya, K. Ramesh).
- Personal heritage recording management with private vs. public visibility flags.
- Token-based password recovery flow (`/forgot-password`).

### 4. Cultural Heritage Archive & Exploration (`/archive`, `/explore`, `/search`)
- Searchable oral story catalogue categorized by language, region, and theme.
- Dedicated oral audio recordings on disk with playback (`/audio/vr-106-...wav` through `vr-110-...wav`).
- Interactive language census explorer with 2011 India Census data.
- Cultural Passport and SHA-256 provenance verification for archival integrity.

---

## 4. Supported Languages & Dialects
- **Initial Focus**: Telugu (తెలుగు), Gondi (గోండి / गोंडी), Koya (కోయ), Lambadi (లంబాడి / लंबानी), Tulu (ತುಳು).
- **Bridge & Target Languages**: English, Hindi (हिन्दी), Kannada (ಕನ್ನಡ).
- **Expansion Framework**: Community language contribution workflow (`/api/community/contribute-language`).

