# Voice Roots — Faculty Demo Backup & Fallback Plan 🌿

This document provides a fail-safe fallback plan for your live faculty presentation in case of projector issues, microphone authorization glitches, or live system latency.

---

## 1. Verified Working Live Server

- **Primary Browser URL**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Alternate Dev Server**: [http://127.0.0.1:5173/](http://127.0.0.1:5173/)
- **Server Restart Command** (if ever closed):
  ```bash
  PATH="scratch/bin:$PATH" VOICE_ROOTS_TRANSCRIPTION_PROVIDER=whisper-local VOICE_ROOTS_WHISPER_MODEL_SIZE=base python3 -m uvicorn main:app --app-dir backend --port 8000 --reload
  ```

---

## 2. Verified Pre-Recorded Audio Sample

If live microphone capture is unavailable or browser permissions fail:
- **Audio File**: `demo_backup_materials/audio/demo_sample_verified.wav`
- **Format**: 16kHz PCM mono WAV (82 KB)
- **Language**: Gondi (`gon`) / Oral Tribal Tongue
- **Acoustic Speech Content**: *"Voice roots preserves oral languages."*
- **Live Test Verified**: Tested via `POST /api/upload` (Record ID: 215)
- **Verified Transcription Output**: `"voice roots preserves oral languages."`
- **Inference Engine**: Offline Whisper Local (`whisper-base`) in ~1.8 seconds (0 paid API cost)
- **How to demonstrate**:
  1. In the **Record** tab (`#record`), click the **Upload File** toggle.
  2. Select `demo_backup_materials/audio/demo_sample_verified.wav`.
  3. Select Language: **Gondi (`gon`)**.
  4. Check both consent checkboxes:
     - *Affirmative Speaker Consent (Mandatory)*
     - *AI Speech-to-Text Opt-In*
  5. Click **Upload Audio**. The system will process it with local Whisper and display the verified machine transcript in seconds!

---

## 3. Visual Backup Slide Gallery (All 8 Reference Views)

If the web browser or projector crashes, present the high-resolution screenshots directly from `demo_backup_materials/screenshots/`:

| Slide / Panel | Feature View | Backup Image Location |
| :--- | :--- | :--- |
| **01** | **Homepage Landing** | `demo_backup_materials/screenshots/01_homepage_desktop.png` |
| **02** | **Record & Transcribe** | `demo_backup_materials/screenshots/02_record_transcribe_desktop.png` |
| **03** | **Translation Workspace** | `demo_backup_materials/screenshots/03_translation_workspace_desktop.png` |
| **04** | **Language Registry** | `demo_backup_materials/screenshots/04_language_registry_desktop.png` |
| **05** | **Semantic Search** | `demo_backup_materials/screenshots/05_semantic_search_desktop.png` |
| **06** | **Archive & Saved Transcripts** | `demo_backup_materials/screenshots/06_archive_recordings_desktop.png` |
| **07** | **Community Moderation** | `demo_backup_materials/screenshots/07_community_moderation_desktop.png` |
| **08** | **Login & Sign Up Modal** | `demo_backup_materials/screenshots/08_login_signup_desktop.png` |
| **09** | **Mobile Responsive View (390px)** | `demo_backup_materials/screenshots/09_mobile_home_view.png` |

---

## 4. Protected Database & Audio Backups

A safety snapshot of all SQLite records, master audio files, and ChromaDB embeddings was taken before demo readiness:
- **Backup Directory**: `backups/demo_safety_backup_20261014_005043/`
  * `voice_roots.db`: 194 master audio records & community corrections (344 KB)
  * `audio/`: 213 master WAV/FLAC audio files with SHA-256 integrity logs
  * `chroma_db/`: 28 verified indexed documents across 21 languages
- **To Restore (if needed)**:
  ```bash
  cp backups/demo_safety_backup_20261014_005043/voice_roots.db backend/voice_roots.db
  cp -r backups/demo_safety_backup_20261014_005043/audio/* backend/storage/audio/
  cp -r backups/demo_safety_backup_20261014_005043/chroma_db/* backend/chroma_db/
  ```

---

## 5. Quick Q&A Cheat Sheet for Faculty Questions

- **Q: How does this differ from commercial ASR like Google Speech-to-Text or OpenAI Whisper API?**
  * **A**: Commercial models lack training data on unwritten tribal languages like Gondi, Koya, and Santhali, often hallucinating or replacing indigenous words with dominant regional languages. Voice Roots enforces Indigenous Data Sovereignty (OCAP): original audio is an immutable master, AI transcription is only an annotation layer, and machine translation is blocked for oral tongues without community elder verification.
- **Q: What is the cost of running Voice Roots?**
  * **A**: $0 for transcription and embeddings. We run local Whisper (`base`) and local 384-dim subword embeddings completely offline on CPU/GPU without recurring per-minute API fees.
- **Q: Where is data stored?**
  * **A**: SQLite on disk (`voice_roots.db`) for structured relational data, ChromaDB (`chroma_db/`) for vector similarity search, and lossless audio files (`/storage/audio`) with SHA-256 verification.

