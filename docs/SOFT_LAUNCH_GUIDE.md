# 🚀 Voice Roots: Phase 5 – Soft Launch Operational Protocol & Pilot Runbook

> **Target Cohort**: Academic Faculty / Supervisor, Accredited Tribal Reviewers, and Certified Field Contributors.  
> **Platform Status**: Production Launch Ready (`1.0.0`)  
> **Live Web Application**: [`https://voice-roots.onrender.com`](https://voice-roots.onrender.com)  
> **Live API Gateway**: [`https://voice-roots-api.onrender.com`](https://voice-roots-api.onrender.com)

---

## 1. Soft Launch Cohort & Access Credentials

Access is initially restricted to an invite-only pilot cohort to validate end-to-end workflows in real-world network conditions before wide public announcements.

### Pre-Seeded Pilot Accounts

| Role | Identity / Email | Username | Credentials | Evaluation Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| **Faculty / Admin** | `admin@voiceroots.ai` | `admin` | `VoiceRootsAdmin2026!` | Overall platform audit, deep health telemetry (`/health/deep`), database snapshot/restore, restricted data export. |
| **Community Elder Reviewer** | `elder.reviewer@gondi.org` | `elder_reviewer` | `ElderReviewer2026!` | Reviewer queue (`/reviewer`), phonetic transcript moderation, customary dispute resolution. |
| **Field Contributor** | `field.worker@voiceroots.org` | `field_worker` | `preservation2026` | Prompted recording studio (`/record`), affirmative consent signing, PWA offline sync test. |
| **Linguistic Researcher** | `researcher@ciil.res.in` | `researcher` | `ResearchScholar2026!` | Corpus dictionary search (`/dictionary`), demographic census statistics (`/stats`). |

---

## 2. Structured Evaluation Journeys

### Journey 1: Contributor Prompted Recording & Dual Consent

1. Navigate to `/record`.
2. Inspect the **Informed Consent Notice** (English or native script prompt).
3. Check the mandatory consent checkboxes (Master preservation + assistive AI speech transcription).
4. Select a prompt from the Swadesh seed catalog (e.g. Gondi: *"మారొడి నేలపాల్"*).
5. Click **Record Voice**, speak the phrase into the field microphone, and click **Stop**.
6. Review the audio preview and submit.
7. Verify that the issued transcript is automatically tagged with `[DRAFT - UNREVIEWED MACHINE GENERATION]`.

### Journey 2: Community Elder Reviewer Queue & Moderation

1. Log in at `/login` as `elder_reviewer`.
2. Navigate to `/reviewer`.
3. Locate the pending draft contribution in the queue.
4. Perform an **Acoustic Audit**: listen to the master recording.
5. Click **Approve & Publish**: verify that the draft badge clears and the status elevates to `approved`.
6. Alternatively, click **Correct & Save**: provide phonetic adjustments in Gondi/Koya script and confirm the revision audit trail is preserved.

### Journey 3: Speaker Data Sovereignty & Immediate Consent Withdrawal

1. Navigate to `/recordings/[id]` or `/passport/[id]`.
2. Locate the **Withdraw Speaker Consent** action.
3. Submit a withdrawal request with a confirmation reason.
4. Verify sub-second enforcement:
   - Transcript status immediately changes to `withdrawn`.
   - Recording is immediately hidden from `/search` and `/archive`.
   - Streaming endpoint `/storage/audio/{filename}` immediately returns HTTP 404/403.

### Journey 4: Disaster Recovery & Atomic Restore Verification

1. Log in as `admin`.
2. Trigger an atomic point-in-time database backup:

   ```bash
   python3 scripts/backup_database.py
   ```

3. Inspect the snapshot with dry-run inspection:

   ```bash
   python3 scripts/restore_database.py --snapshot storage/backups/latest.db --dry-run
   ```

4. Confirm database integrity check reports `ok`.

---

## 3. Issue Triage & Incident Response

### Severity Classification

| Severity | Description | SLA / Target Response | Action Protocol |
| :--- | :--- | :--- | :--- |
| **P0: Critical** | Consent withdrawal failure, audio master mutation, or PII leak. | Immediate (< 1 hour) | Trigger immediate rollback via `scripts/restore_database.py`, suspend ingestion, notify supervisor. |
| **P1: Major** | Audio playback failure, transcription service downtime, or 500 errors. | Same Day (< 6 hours) | Inspect structured logs via correlation `X-Request-ID`, review `/health/deep`, restart worker. |
| **P2: Minor** | UI styling defect, translation typo, or localization formatting glitch. | Next Review Cycle | Log ticket in GitHub Issues, apply fix on reviewable branch. |

---

## 4. Deferred Post-Launch Roadmap (v2.0)

As agreed during Phase 0 scope freeze, advanced non-launch features are formally scheduled for the post-launch v2.0 milestone:

- **Dialect Cartography & Geographic Heatmaps**: Interactive Leaflet/Mapbox cartographic visualizer linking audio recordings to GPS linguistic boundaries.
- **Phonetic CTC Forced Alignment**: Sub-word acoustic alignment matching audio millisecond timestamps to IPA phonetic segments.
- **Spaced-Repetition Language Learning**: Leitner flashcard system for oral vocabulary retention and dialect quizzes.
- **Automated Pronunciation Scoring**: Acoustic distance scoring comparing learner vocal formants against elder reference masters.
- **Multi-Speaker Diarization**: Unsupervised speaker clustering for complex multi-participant oral lore circles.
