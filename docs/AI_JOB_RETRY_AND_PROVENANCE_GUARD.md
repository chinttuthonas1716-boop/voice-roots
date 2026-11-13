# VOICE ROOTS — AI JOB RETRY + PROVENANCE SAFETY GUARD

Apply these rules to every AI operation:
- Speech-to-Text (STT)
- Language Detection
- Translation
- Text-to-Speech (TTS)
- Cultural Context
- AI Assistant

==================================================
1. EVERY AI OPERATION IS A JOB
==================================================
Each AI operation must have:
- `jobId`
- `storyId`
- `operationType` (STT, LANGUAGE_DETECTION, TRANSLATION, TTS, CULTURAL_CONTEXT, AI_ASSISTANT)
- `status` (QUEUED, RUNNING, SUCCEEDED, FAILED, RETRYING, CANCELLED)
- `provider`
- `model`
- `modelVersion`
- `attemptCount`
- `createdAt`
- `startedAt`
- `completedAt`
- `error`
- `inputReference`
- `outputReference`

Never mark a job SUCCEEDED unless the provider returned a valid, verified result stored in the database.

==================================================
2. IDEMPOTENCY & DUPLICATE PROTECTION
==================================================
- Retrying the same job must NOT create duplicate outputs.
- Idempotency key pattern:
  `hash(storyId + operationType + sourceVersion + targetLanguage + provider + model)`
- A retry updates the existing job/result rather than creating duplicate tracks or transcripts.

==================================================
3. NEVER DUPLICATE TTS
==================================================
- If target-language translated audio already exists and is valid:
  REUSE the existing valid audio track.
- If the previous TTS job failed:
  Allow retry.
- If succeeded but the file is missing/unreachable:
  Mark invalid and regenerate safely.

==================================================
4. ORIGINAL AUDIO PROTECTION
==================================================
AI jobs may NEVER modify:
- `originalAudioId`
- original audio master file (WAV/FLAC)
- original source language
The pipeline is strictly derivative:
$$\text{ORIGINAL AUDIO} \longrightarrow \text{TRANSCRIPT} \longrightarrow \text{TRANSLATION} \longrightarrow \text{TRANSLATED AUDIO}$$

==================================================
5. FULL PROVENANCE & VERSIONING
==================================================
Every AI-generated artifact must record:
- `provider`
- `model`
- `modelVersion`
- `jobId`
- `createdAt`
- `confidence`
- `latencyMs`
- `sourceTranscriptVersion`

If a transcript updates from v1 to v2, translations must explicitly reference which transcript version they correspond to.

==================================================
6. EXPLICIT FAILURE & PARTIAL COMPLETION
==================================================
- If translation text succeeds but TTS speech generation fails:
  Translation: SUCCEEDED
  Translated Audio: FAILED
  UI: "Translation text is ready, but translated audio could not be generated. [Retry Audio]"
- Never mark the entire pipeline complete when audio synthesis fails.
- Never silently fall back to playing the original recording under a translated audio label.

==================================================
7. CONCURRENCY & STALE JOB RECOVERY
==================================================
- Prevent race conditions: atomic lock before claiming jobs.
- On server recovery, detect stale RUNNING jobs and transition them to RETRYING or FAILED. Never leave jobs permanently stuck in RUNNING.
