# VOICE ROOTS — SAFE DEVELOPMENT CONTROL RULES
## MANDATORY SYSTEM CONSTITUTION & SAFEGUARDS

This document governs all modifications to the Voice Roots repository. All agents, developers, and workflows must comply with these 20 non-negotiable rules.

---

### Rule 1: Inspect Before Modifying
Before changing code:
- Inspect the existing repository.
- Identify relevant files, dependencies, models, and routes.
- Never immediately rewrite or regenerate the project.

### Rule 2: Never Perform a Broad Rewrite
- Do NOT rewrite the frontend or backend en masse.
- Do NOT replace the database, router, or delete working components.
- Prefer the smallest safe, isolated change that solves the current task.

### Rule 3: Work One Phase at a Time
Strict loop:
$$\text{INSPECT} \longrightarrow \text{EXPLAIN} \longrightarrow \text{PROPOSE CHANGES} \longrightarrow \text{WAIT FOR APPROVAL} \longrightarrow \text{IMPLEMENT} \longrightarrow \text{TEST} \longrightarrow \text{REPORT RESULTS} \longrightarrow \text{CHECKPOINT} \longrightarrow \text{NEXT PHASE}$$

### Rule 4: Protect Existing Functionality
Preserve working public behavior. If a change carries risk of breaking existing features, STOP and report the risk before proceeding.

### Rule 5: Destructive Changes Require Explicit Approval
Never automatically drop tables, remove APIs, replace auth, or alter data structures destructively.

### Rule 6: Database Safety
Never modify schema without a migration. Preserve existing data; never drop tables to simplify schema changes.

### Rule 7: Data Safety & Anti-Hallucination
Never fabricate Voice Roots cultural data (villages, languages, communities, dialects, Census statistics).
If information is unavailable:
$$\text{verificationStatus} = \text{UNVERIFIED}$$
AI suggestions must never automatically become `OFFICIAL`.

### Rule 8: Original Cultural Data Is Immutable
The original audio recording, source language, and contributor identity are primary cultural artifacts. All AI transcripts, translations, summaries, and synthetic speech tracks are derivative. Never overwrite the original audio or change `sourceLanguageId` upon translation.

### Rule 9: Strict Sequential Workflow
Preservation flow is a strict sequential state machine:
$$\text{DRAFT} \rightarrow \text{RECORDED/UPLOADED} \rightarrow \text{PROCESSING} \rightarrow \text{LANGUAGE\_DETECTED} \rightarrow \text{TRANSCRIBED} \rightarrow \text{TRANSCRIPT\_REVIEW} \rightarrow \text{TRANSLATED} \rightarrow \text{CULTURAL\_CONTEXT} \rightarrow \text{CONSENT\_PENDING} \rightarrow \text{HUMAN\_REVIEW} \rightarrow \text{VERIFIED} \rightarrow \text{HERITAGE\_RECORD} \rightarrow \text{PASSPORT\_CREATED} \rightarrow \text{PUBLISHED}$$
Frontend route guards AND backend validation must prevent skipping steps or direct URL access before completion.

### Rule 10: Backend Is the Source of Truth
The backend independently validates auth, workflow state, consent, and verification. The UI cannot declare a story verified on its own.

### Rule 11: Translation Safety (Four Language Concepts)
Maintain absolute separation:
- `Source Audio Language`: Immutable; card label derived strictly from original audio language (`TELUGU · GUNTUR, ANDHRA PRADESH, INDIA`).
- `Translation Language`: Target language for written text.
- `Translated Audio Language`: Generated speech track (`DualTrackAudioPlayer`).
- `Website UI Language`: Independent interface chrome.

### Rule 12: Responsive Website Only
Strictly web. No Flutter, no React Native, no native iOS/Android apps. Mobile is simply the responsive version of the website.

### Rule 13: Preserve Approved Visual Design System
Approved color palette:
- Primary background: `#2D3250`
- Deep background: `#242942`
- Indigo surface: `#42476C`
- Muted periwinkle: `#6F76A0`
- Primary peach: `#F9B17A`
- Soft peach: `#F6A875`
- Light surface: `#F5F5F2`
- Secondary text: `#D9D9E2`
- Muted text: `#A9AEC5`
- Glass materials: `rgba(255, 255, 255, 0.08)` / `0.14`

### Rule 14: Route Safety
Main navigation contains ONLY:
`Home` · `Explore` · `Archive` · `Preserve` · `Profile`.
Workflow sub-routes remain hidden from the navigation bar until reached naturally through the preservation sequence.

### Rule 15: Change Scope
Before every change, explicitly report:
- `CURRENT FILES`
- `FILES TO CHANGE`
- `FILES TO ADD`
- `FILES NOT TO TOUCH`

### Rule 16: Test After Every Significant Change
Verify builds, routes, endpoints, and responsive layouts before declaring completion.

### Rule 17: Transparent Error Reporting
Never hide errors. Report: `ERROR`, `CAUSE`, `AFFECTED FILE`, `PROPOSED FIX`, `RISK`.

### Rule 18: Checkpoint After Each Phase
Provide a structured checkpoint summary after completing each phase before continuing to the next.

### Rule 19: Current Task Boundary
Implement only what was explicitly approved. No opportunistic or unapproved refactoring.

### Rule 20: Final Safety Rule
If in doubt about data loss, workflow regressions, or cultural artifact mutability, STOP and ask for user approval.
