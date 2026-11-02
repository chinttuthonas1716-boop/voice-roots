# Voice Roots — Complete REST & WebSocket API Documentation
## Comprehensive Specification for Ingestion, AI Pipelines, Governance, and Research

> **API Version**: `v1.0.0`  
> **Interactive OpenAPI Docs**: `http://localhost:8000/docs`  
> **ReDoc Interface**: `http://localhost:8000/redoc`

---

## 1. Authentication & Security Headers

### Authentication Mechanisms
1. **JWT Bearer Token**: Standard `Authorization: Bearer <token>` header obtained from `/api/v1/auth/login`.
2. **Administrative Header**: `X-Admin-Key: <key>` for administrative system operations.
3. **Research API Token**: `Authorization: Bearer <vr_res_...>` for institutional corpus access.

### Global Security Headers (M22 Hardening)
Every response automatically includes:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: default-src 'self' ...`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

---

## 2. Authentication & User Management Endpoints

### Register User
- **Route**: `POST /api/v1/auth/register` (also `/api/auth/register`)
- **Status**: `201 Created`
- **Request Body**:
```json
{
  "username": "ramu_gond",
  "email": "ramu@gondi-council.org",
  "password": "SecurePassword123!",
  "full_name": "Elder Ramu Gond",
  "role": "reviewer",
  "bio": "Traditional village council elder"
}
```
- **Response**: User object with signed JWT `access_token` and `token_type: "bearer"`.

### Login User
- **Route**: `POST /api/v1/auth/login` (also `/api/auth/login`)
- **Status**: `200 OK`
- **Request Body**:
```json
{
  "identifier": "admin@voiceroots.ai",
  "password": "VoiceRootsAdmin2026!"
}
```
- **Response**:
```json
{
  "status": "success",
  "message": "Authentication successful.",
  "data": {
    "id": "usr_admin_001",
    "username": "admin",
    "email": "admin@voiceroots.ai",
    "full_name": "System Administrator",
    "role": "admin",
    "is_active": true,
    "access_token": "eyJhbGciOiJIUzI1Ni...",
    "token_type": "bearer"
  }
}
```

### Get Authenticated User Profile
- **Route**: `GET /api/v1/auth/me`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: Authenticated user profile metadata.

### List All Users (Admin Only)
- **Route**: `GET /api/v1/auth/users`
- **Headers**: `Authorization: Bearer <admin_token>` or `X-Admin-Key: <key>`
- **Response**: List of registered users (passwords omitted).

---

## 3. Audio Ingestion & Transcription Endpoints

### Upload Audio Master with Consent
- **Route**: `POST /api/upload` (also `/api/v1/audio/upload`)
- **Form Data**:
  - `file`: Audio binary (`.wav`, `.mp3`, `.m4a`, `.ogg`, `.flac`)
  - `title`: Descriptive title of narrative
  - `language`: Target language (e.g. `Gondi`, `Koya`, `Telugu`)
  - `dialect`: Optional regional dialect variety
  - `consent`: Mandatory affirmative string (`"true"`)
  - `transcription_consent`: Optional AI transcription opt-in (`"true"` / `"false"`)
- **Behavior**: Rejects unconsented audio with HTTP 400. Saves 48kHz WAV master, calculates SHA-256 digest, creates database record.

### Request Speech Transcription
- **Route**: `POST /api/v1/transcripts/{id}/transcribe`
- **Request Body**: `{"transcription_consent": true}`
- **Behavior**: Dispatches local offline Whisper model. Populates `machine_transcript_text`.

### Stream Audio Master
- **Route**: `GET /storage/audio/{filename}`
- **Security**: Validates path traversal (`..`). Blocks withdrawn recordings (`status = 'withdrawn'`) with HTTP 404. Blocks `SACRED_ELDER_ONLY` files from unauthenticated public streaming with HTTP 403. Supports HTTP 206 partial range streaming.

---

## 4. Translation & Linguistic Guardrails

### Translate Text
- **Route**: `POST /api/v1/translate` (also `/api/translate`)
- **Request Body**:
```json
{
  "text": "నమస్కారం! మీరు బాగున్నారా?",
  "source_language": "Telugu",
  "target_language": "English"
}
```
- **Oral Language Guardrail**:
  If `source_language` is an unwritten oral tongue (e.g. `Gondi`, `Koya`), the request returns **HTTP 503**:
  `OralLanguageElderReviewRequiredError: Language is an unwritten oral heritage tongue. Automated AI translation without community elder review is prohibited.`

---

## 5. Community Verification & Consent Withdrawal

### Submit Community Correction
- **Route**: `POST /api/v1/transcripts/{id}/corrections`
- **Request Body**:
```json
{
  "suggested_text": "Corrected native Gondi phrase",
  "contributor_name": "Elder Somu",
  "contributor_role": "village_elder"
}
```

### Review Correction (Elder / Reviewer Only)
- **Route**: `PATCH /api/v1/corrections/{correction_id}/review`
- **Request Body**:
```json
{
  "status": "approved",
  "reviewer_name": "Elder Ramu",
  "reviewer_role": "community_elder",
  "review_notes": "Verified authentic dialect spelling."
}
```

### Withdraw Speaker Consent (OCAP Protocol)
- **Route**: `POST /api/v1/transcripts/{id}/withdraw` (or `/withdraw-consent`)
- **Behavior**: Sub-second execution ($< 1.0\text{s}$). Flags `status = 'withdrawn'`. Evicts embeddings from ChromaDB. Removes entries from FTS5. Masks audio stream with HTTP 404 (`"withdrawn under OCAP"`).

---

## 6. Advanced Milestone Endpoints (M16–M20)

### Milestone 16: Language Knowledge Graph
- `GET /api/v1/knowledge-graph/overview`: Summary stats and node/edge counts.
- `GET /api/v1/knowledge-graph/graph`: Complete graph nodes, relationships, and taxonomies.
- `GET /api/v1/knowledge-graph/search`: Full-text search across graph entities.

### Milestone 17: Cultural Archives
- `GET /api/v1/cultural-archives/overview`: Archive metrics, stories count, and OCAP access tiers.
- `GET /api/v1/cultural-archives/collections`: List curated folklore, botanical lore, and historical collections.
- `GET /api/v1/cultural-archives/stories/{id}`: Retrieve story narrative with elder review attribution.

### Milestone 18: Advanced Speech Intelligence
- `GET /api/v1/speech/overview`: Alignment counts, acoustic metrics, and pronunciation pairs.
- `GET /api/v1/speech/alignments/{transcript_id}`: Word-level timestamps, duration, and phonetic tokens.
- `POST /api/v1/speech/pronunciation/evaluate`: Compares learner audio against reference target phonemes.

### Milestone 19: Language Learning Studio
- `GET /api/v1/learning/overview`: Curated learning collections and modules.
- `GET /api/v1/learning/collections/{id}/modules`: Practice vocabulary flashcards and dialogues.
- `POST /api/v1/learning/practice/submit`: Submits exercise answers and updates mastery score.

### Milestone 20: Institutional Research API
- `POST /api/v1/research/keys/register`: Admin-gated issuance of institutional scoped keys.
- `GET /api/v1/research/corpus/export`: Standardized CoNLL-U and JSON corpus export (Rate limited to 60 req/min).
- `GET /api/v1/research/lexicon/export`: Filtered linguistic dictionary export.
- `DELETE /api/v1/research/keys/{key_id}`: Immediate key revocation.

---

## 7. Infrastructure & System Health

### System Health Probe
- `GET /health`: Basic health telemetry (`status: healthy`).
- `GET /ready`: Readiness check for traffic routing.

### Persistent Storage & Volume Probe (PR-01)
- `GET /api/v1/system/storage-probe`: Deep filesystem writability probe, table counts (49), SQLite `PRAGMA quick_check;`, and disk space telemetry.

### Atomic Database Backup
- `POST /api/v1/system/backup`: Creates timestamped atomic SQLite snapshot. Automatically triggers PR-04 tiered retention pruning.

### Manual Retention Pruning (PR-04)
- `POST /api/v1/system/backups/prune`: Admin-only endpoint enforcing rolling 7-day/30-day/90-day retention rules.
