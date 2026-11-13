# 🌿 Voice Roots — Interface Design System & Memory
<!-- Persistent Design Rules & Craft Tokens (Adhering to Interface Design Skill) -->

> **Version:** 1.0.0  
> **Target Products:** Voice Roots Web Portal (`/web`), Heritage Passport (`/passport/[id]`), Mobile Audio Simulator (`/app`), Conversational Translator (`/translate`), and Dialect Map (`/explore`).  
> **Philosophy:** 70% Cinematic Cultural Heritage + 30% Futuristic Liquid Glass. Tactile, dignified, tamper-evident.

---

## 1. Intent & Identity

* **The Human:** Cultural custodians, linguists, field researchers, and community elders preserving disappearing oral traditions across South Asia. They value reverence, authenticity, clarity, and legal-grade cultural ownership.
* **The Task:** Record, transcribe, verify, translate, and issue tamper-evident provenance tokens for sacred folklore, dialect songs, and spoken traditions.
* **The Feel:** *Sanctuary meets High-Tech Archive*. Not a corporate SaaS dashboard, not a generic blog. Deep midnight velvet surfaces, luminous warm amber embers, acoustic spectral teals, and whisper-quiet glass layering.

### Domain Exploration
* **Domain Concepts:** Oral Tradition, Acoustic Spectrogram, Lineage Provenance, Dialect Continuum, Custodial Consent, Traditional Knowledge Commons, ISO-OACP Certification.
* **Color World (Physical Metaphors):**
  * *Midnight Temple Sky* (`#080A12` / `#11152E`) — Silent, sacred foundation.
  * *Temple Brass & Warm Amber* (`#F59E0B` / `#D9A441`) — Ancient living flames, heirloom medals.
  * *River Teal & Malachite* (`#14B8A6` / `#35B7A5`) — Living organic roots, acoustic vibration.
  * *Lotus & AI Violet* (`#8B5CF6` / `#8B7CFF`) — Neural linguistic synthesis, machine intelligence.
  * *Parchment & Warm Ivory* (`#FAF7F2` / `#F7F3EA`) — Palm-leaf manuscripts, human typography.
* **Signature Elements:**
  1. **Holographic Guilloche Border:** Intricate concentric geometric line curves signaling official certification.
  2. **Liquid Glass Dossier:** Layered blur surfaces (`backdrop-filter: blur(28px)`) with subtle specular highlight borders (`rgba(255,255,255,0.12)`).
  3. **Apple-Grade Activity Rings / Concentric Audio Rings:** Real-time feedback rings indicating recording fidelity, preservation progress, and community review status.
* **Rejected Defaults:**
  * ❌ *Generic SaaS light-gray tables* → Replaced with deep-space obsidian dossiers and glowing metadata ledgers.
  * ❌ *Standard boring pill badges* → Replaced with cryptographic audit chips (`ISO-OACP Verified · 2026`).
  * ❌ *Flat icon grids* → Replaced with tactile sliding cards and interactive dossier tabs.

---

## 2. Token Architecture

### Color Primitives & Semantics

| Token Name | Hex Code | Semantic Role |
| :--- | :--- | :--- |
| `--bg-midnight` | `#080A12` | Root application canvas / Deep Obsidian base |
| `--bg-surface` | `#101426` | Card backgrounds, drawer surfaces (+7% lightness) |
| `--bg-surface-elevated` | `#181D3B` | Popovers, active tab triggers, modals (+12% lightness) |
| `--text-primary` | `#FAF7F2` | Headings, essential metadata (Warm Ivory) |
| `--text-secondary` | `#9DA7C9` | Supporting labels, descriptions, captions |
| `--text-muted` | `#64748B` | Disabled states, timestamps, subtle hashes |
| `--heritage-amber` | `#F59E0B` | Primary accents, verified seals, focus highlights |
| `--heritage-teal` | `#14B8A6` | Acoustic waveforms, positive consent, verified checks |
| `--soft-violet` | `#8B5CF6` | AI assistance, neural translation badges |
| `--border-subtle` | `rgba(255,255,255,0.08)` | Standard card borders |
| `--border-focus` | `rgba(245,158,11,0.60)` | Keyboard focus rings & active card states |

---

## 3. Depth & Elevation Scale

Voice Roots commits strictly to **Layered Glass + Transparent Specular Rings**.

* **Base Canvas (Level 0):** `#080A12` with fixed radial ambient gradients (Amber 12% at top, Violet 10% right, Teal 9% bottom).
* **Surface Card (Level 1):**
  * Background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01)), rgba(16, 20, 38, 0.70)`
  * Border: `1px solid rgba(255,255,255,0.10)`
  * Backdrop Blur: `blur(24px) saturate(150%)`
  * Shadow: `0 20px 48px -20px rgba(0,0,0,0.7)`
* **Active / Hover Card (Level 2):**
  * Transform: `translateY(-2px)`
  * Border: `1px solid rgba(245, 158, 11, 0.40)`
  * Shadow: `0 24px 60px -20px rgba(0,0,0,0.8), 0 0 20px -4px rgba(245,158,11,0.15)`
* **Modal / Popover (Level 3):**
  * Border: `1px solid rgba(255,255,255,0.18)`
  * Backdrop Blur: `blur(32px)`
  * Shadow: `0 32px 80px -20px rgba(0,0,0,0.9)`

---

## 4. Spacing, Geometry & Radius Rules

### The 4px Spatial Grid
* **Micro:** `4px` (tag gap), `8px` (icon-to-label gap)
* **Control:** `12px` (inner button padding Y), `16px` (button padding X)
* **Card Interior:** `20px` (mobile), `28px` - `36px` (desktop)
* **Section Gap:** `32px` - `48px`
* **Major Flow Gap:** `64px` - `96px`

### Concentric Radius Formula
Always enforce `outerRadius = innerRadius + padding`:
* **Pill Chips / Buttons:** `rounded-full` (`9999px`)
* **Inner Badges / QR Frames:** `12px` (`rounded-xl`)
* **Standard Content Cards:** `20px` (`rounded-2xl`)
* **Heritage Passport Physical Document:** `36px` - `40px` (`rounded-[2.5rem]`)

---

## 5. Typography Hierarchy

Scale Ratio: **1.25 (Major Third)**, tracking tightened on large headers:

| Level | Size | Weight | Line Height | Tracking | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | `40px - 48px` | `800` (Extrabold) | `1.15` | `-0.03em` | Primary view headline |
| **Document Title** | `24px - 30px` | `700` (Bold) | `1.25` | `-0.02em` | Passport header, recording title |
| **Section Heading** | `18px - 20px` | `600` (Semibold) | `1.35` | `-0.01em` | Card group titles |
| **Body Primary** | `15px` | `400` / `500` | `1.55` | `0` | Explanatory texts, transcripts |
| **Body Secondary** | `13px` | `400` | `1.50` | `0` | Descriptions, metadata values |
| **Audit Mono / Code** | `11px - 12px` | `700` (Mono) | `1.40` | `+0.08em` | Tokens, hash IDs, status badges |
| **Micro Caption** | `10px - 11px` | `600` (Semibold) | `1.30` | `+0.05em` | Metadata keys (`UPPERCASE`) |

---

## 6. Key Component Specifications

### 1. Primary Action Button (`.btn-heritage-primary`)
* **Dimensions:** Minimum `44px` height (`vr-touch-target`).
* **Padding:** `12px 24px`
* **Radius:** `rounded-full` (`9999px`)
* **Typography:** `14px / 700 font-bold`
* **Colors:** Background `#14B8A6` (Teal) or `#F59E0B` (Amber), Text `#080A12` (Obsidian)
* **State Changes:** Hover: `brightness(1.1) translateY(-1px)`, Active: `scale(0.97)`

### 2. Glass Outline Button (`.btn-glass-secondary`)
* **Dimensions:** Minimum `40px` height.
* **Padding:** `10px 18px`
* **Border:** `1px solid rgba(255, 255, 255, 0.15)`
* **Background:** `rgba(255, 255, 255, 0.04)`
* **Hover:** `background: rgba(255, 255, 255, 0.09); border-color: rgba(255, 255, 255, 0.30)`

### 3. Dossier Status Chip (`.provenance-chip`)
* **Padding:** `4px 12px`
* **Radius:** `rounded-full`
* **Border:** `1px solid` matching status accent with `25%` opacity.
* **Background:** Accent color at `10%` opacity.
* **States:**
  * `COMMUNITY_VERIFIED`: `#14B8A6` (Emerald/Teal)
  * `HUMAN_REVIEWED`: `#60A5FA` (Sky Blue)
  * `AI_PROCESSED`: `#F59E0B` (Amber Gold)

---

## 7. Motion & Accessibility Contract

* **Durations:** Micro-interactions (hover/click) `120ms` - `180ms`. View transitions `240ms` - `300ms`.
* **Easing Curve:** `cubic-bezier(0.22, 1, 0.36, 1)` (snappy entry, graceful deceleration).
* **Press Confirmation:** `:active { transform: scale(0.97); }`
* **Reduced Motion:** Fully integrated via `prefers-reduced-motion: reduce`. Animations collapse to instant opacity transitions.
* **Touch Targets:** All interactive controls maintain strict minimum hit box of `44x44px`.
* **Keyboard Nav:** Every interactive item features visible `focus-visible:ring-2 focus-visible:ring-heritage-amber focus-visible:outline-none`.
