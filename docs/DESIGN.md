# Voice Roots — Design System & UI Specifications

## 1. Aesthetic Direction: iOS-Inspired Dark Glassmorphism
The Voice Roots interface pairs an organic, respectful oral heritage theme with modern iOS-inspired physical design:
- **Surface Elevation**: Layered translucent surfaces with `-webkit-backdrop-filter: blur(24px)`.
- **Lighting & Depth**: Soft radial glow accents layered over deep midnight blue tones.
- **Micro-Interactions**: Tactile spring responses (`scale-[0.98]` active states), high contrast indicators, and smooth state transitions.

---

## 2. Color Palette & Design Tokens

| Token Name | Hex Code / Value | Usage & Meaning |
| :--- | :--- | :--- |
| `--vr-bg` | `#2D3250` | Primary deep navy background |
| `--vr-bg-deep` | `#242942` | Elevated card & modal container background |
| `--vr-surface` | `#42476C` | Input fields, active toggles, pill backdrops |
| `--vr-peach` | `#F9B17A` | Primary accent, CTA buttons, active state highlights |
| `--vr-green` | `#879B87` | Verified status, synchronized indicators, elder badge |
| `--vr-text` | `#FFFFFF` | Primary high-contrast text |
| `--vr-text-secondary`| `#D9D9E2` | Secondary labels, descriptions, metadata |
| `--vr-text-muted` | `#A9AEC5` | Helper text, timestamps, input placeholders |
| `--vr-border` | `rgba(255, 255, 255, 0.12)` | Subtle glass boundaries |

---

## 3. Responsive Navigation Architecture

### A. Desktop Navigation Header (`>= 768px`)
- **Structure**: Sticky pill navigation floating at `top: 16px` with 24px corner radius.
- **Elements**: Brand logo, primary link tabs (Home, Conversations, Transcribe, Explore, Archive, Preserve), Language selector, Search, and Authentication menu.
- **Unauthenticated State**: Prominent glowing **"Log In"** button and secondary **"Sign Up"** button.
- **Authenticated State**: User avatar initials, name badge, and dropdown menu with My Profile, My Heritage, Settings, and Log Out.

### B. Mobile Navigation Header (`< 768px`)
- **Structure**: Compact sticky header (`min-height: 56px; padding: 8px 12px; margin: 8px auto 0;`).
- **Elements**: Brand logo mark, language selector, glowing **"Log In"** button, and hamburger toggle.
- **Drawer**: Tap opens a translucent modal drawer containing the full navigation menu, Account Access card, and Search.

### C. Floating Bottom Dock (`MobileBottomNav`)
- **Structure**: Detached floating dock fixed at `bottom: 18px` with 5 evenly spaced columns (`grid-template-columns: repeat(5, 1fr)`).
- **Items**:
  1. Home (`/`)
  2. Conversations (`/translate`)
  3. Transcribe / Preserve (Hero center FAB with peach glow)
  4. Archive (`/archive`)
  5. **Log In** (`/login`) when unauthenticated &rarr; **Profile** (`/profile`) when authenticated.

---

## 4. Reusable UI Components

- **`VoiceRootsLogo`**: High-contrast seedling emoji with bold tracking typography.
- **`AudioPlayer`**: Custom HTML5 audio player with scrub bar, duration display, and play/pause controls.
- **`QRCodeModal`**: Modal displaying scan-ready QR codes for testing on mobile devices.
- **`ResumeDraftBanner`**: Offline draft restoration prompt for incomplete field recordings.
- **`WorkflowGuard`**: Multi-step progress tracker for recording, metadata capture, consent, and verification.
