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

## 2. 🧠 Master Project Flow (25-Step Pre-Defined Sequence)

Both the **Voice Roots Website** and **Mobile Companion App** strictly follow this unified 25-step pipeline:

```text
01. LOGIN / REGISTER
          ↓
02. HOME
          ↓
03. EXPLORE
          ↓
04. ARCHIVE
          ↓
05. SEARCH
          ↓
06. STORY DETAILS
          ↓
07. LISTEN TO ORIGINAL RECORDING
          ↓
08. RECORD / UPLOAD
          ↓
09. AUDIO PROCESSING
          ↓
10. LANGUAGE DETECTION
          ↓
11. AI TRANSCRIPTION
          ↓
12. TRANSCRIPT REVIEW / EDIT
          ↓
13. AI TRANSLATION
          ↓
14. CULTURAL CONTEXT
          ↓
15. CONSENT & ACCESS CONTROL
          ↓
16. HUMAN REVIEW
          ↓
17. VERIFICATION
          ↓
18. HERITAGE RECORD
          ↓
19. HERITAGE PASSPORT
          ↓
20. QR / PUBLIC HERITAGE PAGE
          ↓
21. VOICE ROOTS AI
          ↓
22. OFFLINE SAVE
          ↓
23. RECONNECT
          ↓
24. SYNC
          ↓
25. PRESERVED ORAL HERITAGE
```

### Core Architecture & System Unity
- **Single Source of Truth:** Both the Website and Mobile Companion App run against the exact same backend engine, database, and browser storage keys (`voice_roots_user_recordings`).
- **Website Role:** Comprehensive workstation for deep exploration, linguist review, semantic search, and full-screen folklore dossiers.
- **Mobile App Role:** Field-first capture tool optimized for elders and local custodians: rapid high-fidelity recording, offline-first IndexedDB caching, phonetic inspection, and QR generation.
- **Preservation Principle:** *Voice → Transcribe → Translate → Understand → Preserve.* AI enhances discovery; original 48kHz audio is permanently preserved.

---

## 3. 🧠 Core AI Pipeline

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

## 4. 🏠 Main Website Experience

### Main sections

1. Header (Adaptive Navbar with language pill & audio controls)
2. Hero Story (Focused & clean: Title, dialect, community, and *"▶ Listen to Original Recording"*)
3. Featured Oral Heritage (Living collection cards with high-fidelity streaming)
4. Signature AI Pipeline Section (*From Spoken Voice → Living Heritage*)
5. Explore Languages & Regional Geographic Clusters
6. Archive Statistics (Dynamic verified metrics)
7. Footer (Ethical indigenous preservation notice)

---

## 5. 🎨 Visual Design System

- **Aesthetic:** Dark cinematic + Liquid Glass + premium cultural archive.
- **Components:** Glass cards, soft blurs (`backdrop-blur-xl`), rounded pill buttons, subtle glow shadows (`#38ef7d`), and high-contrast typography.
- **Ergonomics:** Fluid responsive sizing via CSS `clamp()` and strict 44px minimum touch targets.

---

## 6. 🚫 Branding Rules

- **Zero Hotstar / JioHotstar references.**
- Use **VOICE ROOTS** or **ORAL HERITAGE PLATFORM**.
- Use **Featured Oral Heritage** instead of simulated ranking badges.

---

## 7. 📖 Story Details Architecture

Every preserved oral story adheres to the 9-part structure:

1. Cover & Attribution (Community, region, recorder)
2. Original Acoustic Recording (Seek bar, waveform visualizer, volume, mute)
3. Source Transcript (**Displayed first in native script**)
4. IndicTrans2 Translation Layer (**English, Telugu, Hindi, Tamil, Kannada, Malayalam**)
5. Cultural Context & Ecological Significance
6. Ask Voice Roots AI Entry Point
7. Related Oral Heritage Stories

---

## 8. 🔀 Three Language Layers

| Layer | Function | Example |
| :--- | :--- | :--- |
| **App Language** | Controls UI buttons, menus, and AI chat chrome | English (`en`) |
| **Story Language** | Represents source recording and native script | Telugu / Gondi |
| **Translation Language** | Controls multilingual interpretation layer | Hindi / Tamil |

---

## 9. 🎙️ Recording & AI Contribution Studio

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

## 10. 📱 Responsive & Motion Specifications

- Viewport categories: Phone (<768px), Tablet (768–1199px), Desktop (1200px+).
- Mobile navigation: Compact bottom navigation bar with safe-area padding.
- Motion curve: `cubic-bezier(0.22, 1, 0.36, 1)` with full `prefers-reduced-motion` compliance.

---

## 11. 🌐 Active Public Deployment & Live Endpoints

- **Live Web App:** <https://learned-fairly-qualifying-notifications.trycloudflare.com>
- **Mobile Simulator:** <https://learned-fairly-qualifying-notifications.trycloudflare.com/app>
- **Master Project Flow (25-Step Pipeline):** <https://learned-fairly-qualifying-notifications.trycloudflare.com/flow>
- **1-Page Team Sign-Off QA Checklist:** <https://learned-fairly-qualifying-notifications.trycloudflare.com/checklist>
- **All Links & QR Code Hub:** <https://learned-fairly-qualifying-notifications.trycloudflare.com/links>
