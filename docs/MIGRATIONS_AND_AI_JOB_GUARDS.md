# VOICE ROOTS — MIGRATION, SCHEMA, & AI JOB RETRY GUARDS

This guide complements the Voice Roots Safety Constitution with precision protocols for:
1. **Database Migrations & Schema Changes**
2. **AI Job Retries, Idempotency, & Output Provenance**

---

## 🗄️ PART 1: MIGRATIONS & SCHEMA SAFETY GUARD

### 1. Zero-Downtime Non-Destructive Migrations
- **Never drop or rename a column in-place** while live traffic is active. Use the expand-contract pattern:
  1. **Expand**: Add new nullable column / new table.
  2. **Backfill**: Migrate data via background batch jobs.
  3. **Dual-Write**: Write to both old and new columns.
  4. **Contract**: Deprecate and safely prune old columns only after verification.
- **Rollback Strategy Required**: Every migration script must include a verifiable `DOWN` script or rollback function.

### 2. Canonical Identity & Foreign Keys
- All story and recording records must link to normalized IDs:
  - `countryId` (e.g., `IND`)
  - `stateId` (e.g., `in-ap`, `in-tg`, `in-ka`)
  - `districtId` (e.g., `in-ap-gun`, `in-tg-adi`)
  - `subdistrictId` (Mandal/Taluk/Tehsil)
  - `localityId` (Village with official 6-digit LGD code)
  - `sourceLanguageId` (Census 2011 C-16 / ISO 639-3 ID)
- Never store raw free-text strings as the primary relational key.

### 3. Historical Geography Isolation
- Historical 2011 Census geography must carry:
  $$\text{geographyVersion} = \text{"CENSUS\_2011"}, \quad \text{sourceYear} = 2011$$
- Modern administrative boundaries (post-2014 Telangana bifurcation and 2022 AP reorganization) are linked via the `census_2011_ap_crosswalk` table. Never overwrite modern boundaries with historical Census boundaries.

### 4. Mandatory Indexes
Always index high-cardinality foreign keys and search paths:
```sql
CREATE INDEX IF NOT EXISTS idx_stories_source_lang ON stories(source_language_id);
CREATE INDEX IF NOT EXISTS idx_stories_state_id ON stories(state_id);
CREATE INDEX IF NOT EXISTS idx_stories_district_id ON stories(district_id);
CREATE INDEX IF NOT EXISTS idx_stories_locality_id ON stories(locality_id);
CREATE INDEX IF NOT EXISTS idx_lang_loc_language_id ON language_locations(language_id);
CREATE INDEX IF NOT EXISTS idx_lang_loc_locality_id ON language_locations(locality_id);
```

---

## 🤖 PART 2: AI JOB RETRIES, IDEMPOTENCY, & PROVENANCE GUARD

### 1. Job Idempotency
- Every AI processing request (STT, translation, TTS, cultural context) must carry an **Idempotency Key**:
  $$\text{idempotencyKey} = \text{hash}(\text{storyId} + \text{operation} + \text{sourceHash} + \text{targetLang})$$
- Retrying a network timeout or recovering from a transient worker failure must **never** create duplicate transcriptions or duplicate audio tracks.

### 2. Full Output Provenance
Never store raw AI output text without its lineage. Every derivative record must store:
- `provider`: (e.g. `IndicTrans2`, `VoiceRoots-IndicTTS`, `Whisper-Large-v3`)
- `model`: Exact model checkpoint identifier
- `modelVersion`: Version string
- `confidence`: Confidence score (0.00 – 1.00)
- `latencyMs`: Processing duration
- `promptHash` / `promptVersion`: Template version used
- `createdAt`: ISO 8601 timestamp

### 3. Partial Failure & Explicit State Reporting
- If translation text succeeds but TTS speech generation fails:
  $$\text{textStatus} = \text{"READY"}, \quad \text{audioStatus} = \text{"FAILED"}$$
- **UI State**: *"Translation text is ready, but translated audio could not be generated. [Retry Audio]"*
- Never mark the entire pipeline complete when audio synthesis fails.
- Never silently fall back to playing the original recording under a translated audio label.

### 4. Background Asynchronous Processing
- Audio processing must not block the main HTTP thread:
  $$\text{Upload} \longrightarrow \text{Enqueue Background Job} \longrightarrow \text{State Polling / SSE} \longrightarrow \text{Completion}$$
- Real state indicators only:
  - `✓ Audio Master Stored`
  - `✓ Source Language Verified`
  - `● Generating IndicTrans2 Translation...`
  - `○ Generating Neural Speech Track...`
- Never simulate progress with artificial progress bar timers when the backend is offline.
