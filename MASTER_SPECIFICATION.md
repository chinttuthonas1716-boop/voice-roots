# 🌿 VOICE ROOTS — MASTER SPECIFICATION

### *Rooting Oral Languages in Text with AI*

> **Voice → Transcribe → Translate → Understand → Preserve**

---

## 1. 🎯 Project Vision

**Voice Roots** is an AI-powered oral heritage platform that preserves:

- 🗣️ Oral stories
- 🎵 Folk songs
- 🧑🤝🧑 Community traditions
- 🌍 Regional languages
- 📜 Cultural knowledge
- 🎙️ Personal/community recordings

**Core Ethic:**
> *“A voice should not disappear just because it was never written down.”*

---

## 2. 🧠 Core AI Pipeline

```text
                    🎙️ VOICE
                       │
                       ▼
              Audio Processing
                       │
                       ▼
             🌐 Language Detection
                       │
                       ▼
              🤖 AI Transcription
                       │
                       ▼
                📝 Source Text
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
       🌍 Translation       🧠 AI Understanding
             │                   │
             └─────────┬─────────┘
                       ▼
               Cultural Context
                       │
                       ▼
                 🔎 Searchable
                       │
                       ▼
              🌿 PRESERVED STORY
```

**Golden Rule:** *AI adds layers of accessibility to the cultural artifact; it does not replace the original recording.*

---

## 3. 🏠 Main Website Experience

### Main sections

1. Header (Adaptive Navbar with language pill & audio controls)
2. Hero Story (Focused & clean: Title, dialect, community, and *"▶ Listen to Original Recording"*)
3. Featured Oral Heritage (Living collection cards with high-fidelity streaming)
4. Signature AI Pipeline Section (*From Spoken Voice → Living Heritage*)
5. Explore Languages & Regional Geographic Clusters
6. Archive Statistics (Dynamic verified metrics)
7. Footer (Ethical indigenous preservation notice)

---

## 4. 🎨 Visual Design System

- **Aesthetic:** Dark cinematic + Liquid Glass + premium cultural archive.
- **Components:** Glass cards, soft blurs (`backdrop-blur-xl`), rounded pill buttons, subtle glow shadows (`#38ef7d`), and high-contrast typography.
- **Ergonomics:** Fluid responsive sizing via CSS `clamp()` and strict 44px minimum touch targets.

---

## 5. 🚫 Branding Rules

- **Zero Hotstar / JioHotstar references.**
- Use **VOICE ROOTS** or **ORAL HERITAGE PLATFORM**.
- Use **Featured Oral Heritage** instead of simulated ranking badges.

---

## 6. 📖 Story Details Architecture

Every preserved oral story adheres to the 9-part structure:

1. Cover & Attribution (Community, region, recorder)
2. Original Acoustic Recording (Seek bar, waveform visualizer, volume, mute)
3. Source Transcript (**Displayed first in native script**)
4. IndicTrans2 Translation Layer (**English, Telugu, Hindi, Tamil, Kannada, Malayalam**)
5. Cultural Context & Ecological Significance
6. Ask Voice Roots AI Entry Point
7. Related Oral Heritage Stories

---

## 7. 🔀 Three Language Layers & Universal Multilingual Support

| Layer | Function | Example |
| :--- | :--- | :--- |
| **App Language** | Controls UI buttons, menus, and AI chat chrome | English (`en`), Telugu, Spanish, Swahili |
| **Story Language** | Represents source recording and native script | Gondi (`gon`), Koya (`kff`), Quechua (`qu`), Welsh (`cy`) |
| **Translation Language** | Controls multilingual interpretation layer | English, Hindi, Spanish, Arabic |

### 7.1 Universal Multilingual Dynamic System
- **Global Scope**: Not restricted to Indian languages; natively extensible to any spoken and written tongue worldwide.
- **Dynamic Registry**: Initialized with 44 world languages across Indigenous/Oral, Regional, Scheduled, and Major World categories with standard BCP 47/ISO codes.
- **Runtime Registration**: `POST /api/v1/languages/register` allows community onboarding of new languages without code redeployments.
- **Oral Language Sovereignty (OCAP)**: Unwritten oral tongues (Gondi, Koya, Santhali, Lambadi, etc.) strictly mandate community elder verification before translation layers are certified, preventing synthetic AI hallucination.
- **ChromaDB Vector Archive**: Indexed across global linguistic corpora with transparent character n-gram lexical fallback.

### 7.2 Independent Translation Persistence Layer (OCAP Compliance)
- **Relational Storage**: Translations are persisted in a dedicated SQLite table (`translations`), referencing the parent transcript via `FOREIGN KEY (transcript_id) REFERENCES transcripts(id)`.
- **Annotation Integrity**: The original acoustic audio master and primary transcript text are immutable and never modified or overwritten by machine or community translations.
- **Verification States**: Translations record provider, model, creation timestamp, and native speaker verification status (`verified: 0 | 1`) with optional elder commentary.
- **API Endpoints**: `POST /api/v1/translate` (stores with `transcript_id`), `GET /api/v1/transcripts/{id}/translations`, `PATCH /api/v1/translations/{id}`, `DELETE /api/v1/translations/{id}`.

---

## 8. 🎙️ Recording & AI Contribution Studio

1. **Microphone Permission & Acoustic Capture**
2. **Real-time Waveform Canvas Visualizer**
3. **Multi-Stage AI Pipeline:**
   - Feature Extraction & VAD
   - Language & Dialect Identification
   - Whisper-Indic Speech Recognition
   - IndicTrans2 Multilingual Translation
   - Cultural Lore Extraction
4. **Mandatory Speaker Consent**
5. **Direct Indexing into Local & Global Archive**

---

## 9. 📱 Responsive & Motion Specifications

- Viewport categories: Phone (<768px), Tablet (768–1199px), Desktop (1200px+).
- Mobile navigation: Compact bottom navigation bar with safe-area padding.
- Motion curve: `cubic-bezier(0.22, 1, 0.36, 1)` with full `prefers-reduced-motion` compliance.

---

## 10. 🌐 Active Public Deployment

- **Web App:** <https://indexed-tricks-placed-apt.trycloudflare.com>
- **Mobile Simulator:** <https://indexed-tricks-placed-apt.trycloudflare.com/app>
