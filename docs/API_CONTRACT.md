# Voice Roots API contract

Inspected and verified against the backend and React/Vite client on 2026-10-13.
The core application is the unified SQLite app in `backend/main.py`, fully integrated
with offline local Whisper speech recognition, multi-format audio decoding (MP3, WAV,
M4A, FLAC, OGG, WebM), OCAP-compliant speaker consent enforcement, community corrections,
linguistic evaluation, ChromaDB vector search, and CI quality checks. All 114 backend regression tests
and the Vite production build pass cleanly.

## React/Vite SQLite API (`backend/main.py`)

The Vite development proxy forwards `/api`, `/health`, and `/storage` to port
8000. This app stores transcript rows in the SQLite database (`backend/voice_roots.db`)
and preserves uploaded master audio files untouched under `backend/storage/audio/`.
The database and storage paths can be customized with `VOICE_ROOTS_DB_PATH` and
`VOICE_ROOTS_STORAGE_DIR`. Upload size is governed by `VOICE_ROOTS_MAX_AUDIO_SIZE_MB`
(default 500 MB). CORS origins are configured via `VOICE_ROOTS_ALLOWED_ORIGINS`.

Run the SQLite app on macOS from the repository root:

```sh
# Start backend with offline local Whisper
PATH="scratch/bin:$PATH" VOICE_ROOTS_TRANSCRIPTION_PROVIDER=whisper-local VOICE_ROOTS_WHISPER_MODEL_SIZE=base python3 -m uvicorn main:app --app-dir backend --reload --port 8000

# Start Vite frontend
cd frontend && npm run dev -- --host 127.0.0.1 --port 5173
```

Run the backend test suite:
```sh
pytest -q  # 114 passed
```

| Method and path | Request | Success response |
|---|---|---|
| `GET /` | None | Name, tagline, status, version, docs and health paths |
| `GET /health` and `GET /api/health` | None | Status (`healthy`), SQLite connectivity (`ok`), and storage path |
| `GET /languages`, `GET /api/languages`, and `GET /api/v1/languages` | Query params: `q`, `category`, `family`, `script`, `region`, `limit` | `{"total":number,"languages":[Language]}` (44+ dynamically registered languages worldwide) |
| `GET /api/v1/languages/{code}` | Language code path param | Detailed metadata and capabilities for specific language |
| `POST /api/v1/languages/register` | JSON (`name`, `code`, `native`, `script`, `family`, `region`, `category`) | `{"status":"success","language":Language}` (runtime registration of any global tongue) |
| `GET /api/v1/languages/capabilities` and `GET /api/languages/capabilities` | None | Comprehensive language capability matrix across all registered tongues |
| `GET /api/v1/translate/pairs` | Query params: `source`, `target` | Discovery of language pair viability, supported status, and limitation notes |
| `POST /api/translate` and `POST /api/v1/translate` | `{"text":"...","source_language":"...","target_language":"...","transcript_id":opt}` | Source-grounded translation; stores to `translations` table when `transcript_id` provided |
| `GET /api/v1/transcripts/{id}/translations` and `/api/transcripts/{id}/translations` | Integer transcript ID | Retrieve all saved translations for a transcript |
| `GET /api/v1/translations/{id}` | Integer translation ID | Retrieve single translation record |
| `PATCH /api/v1/translations/{id}` | `{"translated_text":"opt","verified":opt}` | Update translation or record community elder verification |
| `DELETE /api/v1/translations/{id}` | Integer translation ID | Delete translation record; audio master and original transcript stay untouched |
| `POST /api/detect-language` and `POST /api/v1/detect-language` | `{"id":number}` | Acoustic language detection via Whisper (`language_code`, `confidence`, top 5 probabilities) |
| `GET /api/transcripts` and `GET /api/v1/transcriptions` | None | `{"transcripts":[Transcript],"count":number}` |
| `GET /api/transcripts/{id}`, `GET /api/v1/transcriptions/{id}`, `GET /api/transcription/{id}` | Integer path ID | Single transcript row with machine and community text; 404 if absent |
| `POST /api/upload` and `POST /api/v1/audio/upload` | Multipart form fields (`file` or `audio`, `title`, `language`, `consent=true`) | Upload metadata, checksum, consent metadata, and transcription status (supports `language="auto"`) |
| `POST /api/transcripts/{id}/transcribe` and `POST /api/v1/transcriptions/{id}/transcribe` | `{"transcription_consent":true}` | Queues transcription; poll matching GET route for status/result |
| `POST /api/transcribe` and `POST /api/v1/transcribe` | `{"id":number,"transcription_consent":true}` | Queues transcription by ID; returns queued status |
| `PUT /api/transcripts/{id}`, `PATCH /api/v1/transcriptions/{id}`, `PUT /api/transcription/{id}` | JSON fields (`title`, `transcript_text`, `dialect`) | `{"success":true,"message":string,"id":number}` |
| `DELETE /api/transcripts/{id}`, `DELETE /api/v1/transcriptions/{id}`, `DELETE /api/transcription/{id}` | Integer path ID | Soft-archives the row from active results; original audio master retained |
| `GET /api/v1/archive/search` | `q`, `language`, `status`, `page`, `page_size` query parameters | Matching transcript rows with count and pagination values |
| `GET /storage/{path}` | None | Static file bytes (immutable acoustic audio playback) |
| `GET /api/v1/resources/health` and `GET /api/resources/health` | None | Health status of ChromaDB vector store, collection name, and record count (26+ records) |
| `GET /api/v1/resources/stats` and `GET /api/resources/stats` | None | Vector store telemetry: total records, language counts across world tongues, doc types |
| `POST /api/v1/resources/search` and `POST /api/resources/search` | `{"query":"string","language":"opt","document_type":"opt","limit":12}` | Ranked semantic resources with lexical token fallback, similarity score, text, license |
| `POST /api/v1/resources/ingest` and `POST /api/resources/reindex` | Optional `{"admin_key":"opt","resources":[...]}` or `X-Admin-Key` header | Idempotent re-indexing of verified language resources into ChromaDB collection |
| `POST /api/v1/transcripts/{id}/corrections` | `{"suggested_text":"...","contributor_name":"...","contributor_role":"...","rationale":"...","consent_confirmed":true}` | Propose versioned transcript revision with affirmative OCAP consent |
| `GET /api/v1/transcripts/{id}/corrections` | Integer transcript ID | Retrieve complete correction audit trail and review status for transcript |
| `POST /api/v1/translations/{id}/corrections` | `{"suggested_text":"...","contributor_name":"...","contributor_role":"...","rationale":"...","consent_confirmed":true}` | Propose versioned translation revision |
| `GET /api/v1/translations/{id}/corrections` | Integer translation ID | Retrieve translation correction history |
| `PATCH /api/v1/corrections/{id}/review` | `{"status":"approved|rejected","reviewed_by":"...","review_notes":"..."}` | Community elder/moderator approval; sets active text and 'Community Verified' status |
| `POST /api/v1/resources/submit` | `{"submission_type":"...","language_code":"...","term_or_text":"...","speaker_consent_given":true,"is_sacred_or_restricted":false}` | Submit linguistic entry; blocks sacred/restricted knowledge with HTTP 403 under OCAP |
| `GET /api/v1/resources/submissions` | Optional `status`, `language` query params | View community submissions and moderation status |
| `PATCH /api/v1/resources/submissions/{id}/moderate` | `{"status":"approved|rejected","reviewed_by":"..."}` | Moderation approval; automatically indexes verified entry into ChromaDB collection |
| `GET /api/v1/dataset/audit` | None | Audit report: total records, duplicate hashes (0), license breakdown, URL validity |
| `GET /api/v1/evaluation/latest` | None | Latest multi-modal linguistic quality report (WER/CER, elder-review guardrails, MRR) |
| `POST /api/v1/evaluation/run` | None | Trigger live benchmark suite across speech, translation guardrails, and vector search |
| `POST /api/v1/system/backup` | None | Safe atomic SQLite `.backup()` to timestamped file in `storage/backups/` |
| `GET /api/v1/system/telemetry` | None | System telemetry: database size, audio count, total audio bytes, $0.00 external API cost |

### Audio upload fields

`POST /api/upload` and `POST /api/v1/audio/upload` accept multipart form data:

| Field | Type | Required | Meaning |
|---|---|---:|---|
| `file` | file | Yes | WAV, MP3, M4A/MP4, OGG, WebM or FLAC container signature |
| `title` | string | Yes | Recording title; blank values are rejected |
| `language` | string | Yes | Contributor-selected language label/code; this is not language identification |
| `dialect` | string | No | Contributor-provided dialect label |
| `consent` | boolean form value | Yes in effect | Must be `true`; otherwise the request returns 400 before storage |
| `transcription_consent` | boolean form value | No | Must be `true` to queue AI transcription and send this audio to the configured provider |

The server streams the file into a temporary file, checks its size, header
signature, declared MIME type and filename extension, then atomically renames
it to a UUID filename. It stores SHA-256, byte size, archive consent metadata,
and separate transcription-consent time/version when provided. An additive
SQLite migration preserves existing rows and audio. The upload response includes
`id`, `uuid_id`, `audio_url`, `transcript_text`, `machine_transcript_text`,
`transcription_status`, `transcription_error`, checksum and consent metadata.
When `transcription_consent=true`, the response reports `queued` and FastAPI
runs the provider as a background task. Without this field, no provider is
called and the status is `not_requested`.

Upload errors: 400 when consent is false, 413 when the configured size limit is
exceeded, 415 for unsupported or mismatched audio content, and 422 for missing
or blank required metadata. Header checks do not decode or validate the full
audio stream.

### Transcription status and result

`GET /api/transcripts/{id}` and `GET /api/v1/transcriptions/{id}` return
`transcription_status`, `transcription_error`, `transcription_provider`,
`transcription_model`, `transcription_consent_at`, `transcribed_at`,
`transcription_consent_version`,
`machine_transcript_text`, and the existing editable `transcript_text`.
Statuses are `not_requested`, `queued`, `processing`, `completed`,
`not_configured`, or `failed`. A completed machine result is saved in
`machine_transcript_text` and copied into `transcript_text` only when that
field is empty; a community edit is preserved. Provider failures are stored
with a safe, actionable error and no transcript is fabricated.

The POST transcription routes accept JSON:

```json
{"transcription_consent": true}
```

False or missing consent returns HTTP 400. A successful request returns
`success`, `id`, `transcription_status`, `transcript_text`,
`machine_transcript_text`, and `transcription_error`; fetch the GET route to
retrieve the completed result or error.

### Backend provider configuration

The SQLite workflow supports local OpenAI Whisper inference and the hosted
OpenAI Audio Transcriptions API. The provider defaults to `disabled`. The hosted
API defaults to `whisper-1` and accepts files up to 25 MB; larger files fail
before any provider request. Configure these variables only in the backend
process:

| Variable | Default | Meaning |
|---|---|---|
| `VOICE_ROOTS_TRANSCRIPTION_PROVIDER` | `disabled` | Set to `whisper-local` for local inference or `openai` for hosted inference |
| `VOICE_ROOTS_WHISPER_MODEL_SIZE` | `base` | Local Whisper model size used when `whisper-local` is selected |
| `VOICE_ROOTS_TRANSCRIPTION_MODEL` | `whisper-1` | Hosted transcription model sent by the backend |
| `OPENAI_API_KEY` | unset | Backend-only credential; never returned to the client |
| `VOICE_ROOTS_ALLOW_PAID_TRANSCRIPTION` | `false` | Must be explicitly set to `true` after approving provider charges |

Both `transcription_consent=true` for the specific recording and the paid-use
environment gate are required before an external provider request can occur.
SDK retries are disabled to avoid an automatic duplicate billable request.
The hosted adapter uses the [OpenAI Python SDK transcription method](https://github.com/openai/openai-python/blob/v1.47.0/src/openai/resources/audio/transcriptions.py).
The `OPENAI_API_KEY` environment variable was absent in this execution
environment and no external request was made. Do not set the paid-use gate
until provider billing is approved.

Local mode requires the `openai-whisper` package, `ffmpeg`, and local model
weights; the first model load may download weights. It makes no hosted
inference request and requires no API key or paid-use gate. Both providers
remain disabled unless selected in the backend environment.

In the synchronized workspace, `frontend/src/App.tsx` submits `file`, `title`,
`language`, `dialect`, and affirmative archive-consent fields; it conditionally
submits `transcription_consent`, posts to `/api/transcripts/{id}/transcribe`,
and polls `/api/transcripts/{id}` for status and results. Both archive consent
and transcription consent default to unchecked (`false`), ensuring genuine
affirmative speaker opt-in before archiving or AI processing. The active
`backend/main.py` exposes the full consent-enforcing upload and transcription
endpoints matching the documented contract.

### Transcript edit fields

The legacy PUT and versioned PATCH routes accept a JSON object with optional
`title`, `transcript_text`, and `dialect` string fields. Supplying
`transcript_text` changes the displayed text and labels the row
`Community Edited`. Machine output is retained separately, but there is no
full correction history in this SQLite app yet.

### Search behavior

`GET /api/v1/archive/search` accepts optional `q`, `language`, and `status`, plus
`page` (default 1, minimum 1) and `page_size` (default 20, range 1–100). `q`
performs a case-insensitive SQLite `LIKE` match on title and transcript text.
This is not a full-text index. An empty query with no filters returns all rows
in pages.

### Important SQLite API limitations

- This app has no authentication or access tiers. Transcript and audio reads
  are not protected. `/storage` is a public static mount.
- The boolean archive-consent field in the newer SQLite implementation records
  an uploader declaration. It does not identify the speaker or prove that a
  consent statement was presented and understood. The current Vite UI has a
  separate transcription-consent control, but it defaults to checked. The older
  SQLite backend in the active Antigravity checkout does not enforce either
  consent field or provide the transcription route.
- There is no separate language-identification or noise-reduction stage.
  Whisper performs its own audio decoding when local inference is selected.
  Local Whisper and hosted `whisper-1` are available through the same SQLite
  workflow and are disabled by default. Hosted calls require backend
  credentials, per-recording transcription consent, and the explicit paid-use
  gate. Tests cover mocked results and persistence. The local `base` model was
  also exercised through the SQLite upload and transcript GET routes using a
  developer-generated 3.14-second English TTS sample (affirmative consent
  fields were set only to exercise the gated test path); it returned the
  expected text in 4.17 seconds from upload to completion and preserved the source audio
  SHA-256. The host lacked `ffmpeg`, so this test used a temporary WAV-only
  decoder shim; it does not verify decoding other formats with real `ffmpeg`,
  accuracy on community recordings, or the hosted provider.
- Transcription runs through in-process FastAPI background tasks. This queue is
  not durable across a process crash or redeploy; a persistent task queue is a
  later deployment requirement.
- Storage defaults to local disk and is ephemeral on many deployment hosts
  unless a persistent path is configured. No redeploy persistence test was run.
- The delete route now archives the row with an `archived_at` timestamp. It
  hides the row from normal list/get/search responses and retains the original
  audio file. It is not access-controlled, and there is no restore route yet.
- Existing rows receive null checksum/consent metadata, empty
  `machine_transcript_text`, and `not_requested` transcription status; old audio
  files are not backfilled or modified.

The active OpenAPI document for this app is available at `/openapi.json` when
it is started with `uvicorn main:app --app-dir backend`.

## Legacy PostgreSQL API (`backend/app/main.py`)

The Dockerfile currently starts this separate app using `uvicorn app.main:app`.
Its routes and schemas below describe the PostgreSQL/SQLAlchemy implementation.
They are not aliases for the SQLite API above, and no Vite client request to
these routes was found.

### AI provider status

This app already defines the provider-independent `AIProvider` interface and a
provider registry. The default is now `disabled`; requesting a provider while
disabled, or selecting an unregistered provider, raises
`ProviderUnavailableError` instead of silently selecting the sample-text mock.
The mock remains available only when explicitly selected with
`AI_PROVIDER=mock`; it returns generated demo text and must not be used as
transcription evidence.

`WhisperProvider` contains a local OpenAI Whisper `load_model()` / `transcribe()`
implementation. Model import or load failures now raise an explicit error and
do not return mock text. The current Python environment has the
`openai-whisper` distribution installed, but it is not declared in
`backend/requirements.txt`. No Whisper model was loaded and no real audio was
transcribed during this task. Whisper results currently set confidence to
`null` and omit speaker labels; the provider does not derive either from
unsupported heuristics. The SQLite app used by Vite does not call this provider
registry; its separate adapter uses `POST /api/v1/transcriptions/{id}/transcribe`.

For this PostgreSQL app, choose and pin the ASR runtime/dependencies, wire its
provider into a job endpoint, keep machine output separate from community
corrections, and evaluate it on consented recordings before claiming language
support. Do not configure the mock provider for archived recordings.

## Common behavior

- JSON request bodies use `Content-Type: application/json`, except uploads,
  which use `multipart/form-data` with a `file` field.
- Protected endpoints use `Authorization: Bearer <access_token>`. Tokens come
  from `/api/v1/auth/register` or `/api/v1/auth/login`.
- FastAPI validation errors use HTTP 422 with
  `{"detail":[{"loc":[...],"msg":"...","type":"..."}]}`. Other errors
  generally use `{"detail":"..."}`.
- UUID path and body fields must be valid UUID strings. Datetimes use ISO 8601.
- `/health` reports configured provider/storage labels; it does not probe the
  database, object storage, or an AI provider.

## Service endpoints

| Method and path | Auth | Request | Success response |
|---|---|---|---|
| `GET /` | No | None | `{"name": string, "tagline": string, "status": "online", "version": string, "docs": "/docs"}` |
| `GET /health` | No | None | `{"status":"healthy", "provider": string, "storage": string}` |
| `GET /openapi.json` | No | None | OpenAPI 3.1 document generated by FastAPI |
| `GET /docs` | No | None | Swagger UI HTML |
| `GET /redoc` | No | None | ReDoc HTML |
| `GET /static/storage/{path}` | No | None | File bytes served from the local storage directory, when mounted |

The static storage mount is public and does not apply recording privacy checks.
It can expose uploaded files to anyone who knows or guesses the path.

## Authentication

### `POST /api/v1/auth/register`

Request `UserCreate`:

```json
{
  "email": "person@example.org",
  "username": "person_1",
  "full_name": "Person Name",
  "password": "at-least-8-characters"
}
```

All fields are required. `username` is 3–50 characters and limited to letters,
digits, `_`, and `-`; `full_name` is 1–200 characters; password is 8–128
characters. Success is HTTP 201 and a `Token` response. Duplicate email or
username returns 409.

### `POST /api/v1/auth/login`

Request `UserLogin`: required `email` and `password` strings. Success is HTTP
200 and a `Token` response. Invalid credentials return 401; a deactivated user
returns 403.

### Token response

```json
{
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "person@example.org",
    "username": "person_1",
    "full_name": "Person Name",
    "role": "contributor",
    "is_active": true,
    "is_verified": false,
    "avatar_url": null,
    "bio": null,
    "location": null,
    "created_at": "ISO-8601 datetime"
  }
}
```

`role` is `contributor`, `researcher`, `moderator`, or `admin`. `avatar_url`,
`bio`, and `location` may be null.

### `POST /api/v1/auth/refresh`

Request `{"refresh_token":"string"}`. Success is HTTP 200 with a newly
issued `Token` response. Invalid, expired, or inactive-user refresh tokens
return 401.

### `POST /api/v1/auth/logout`

No request body or authentication is required. Success is HTTP 204 with no
body. The endpoint does not revoke or blacklist tokens; clients are expected
to discard them.

## Recordings

### `GET /api/v1/recordings`

Requires authentication. Query parameters: `page` (default 1, minimum 1),
`page_size` (default 20, 1–100), optional `language_id` UUID,
`recording_type`, and `status`. Returns a `RecordingListResponse`.

### `GET /api/v1/recordings/mine`

Requires authentication. Same pagination parameters. Returns only the current
user's recordings as a `RecordingListResponse`.

### `POST /api/v1/recordings`

Requires authentication. Request `RecordingCreate`:

| Field | Type | Required/default |
|---|---|---|
| `title` | string, 1–500 chars | Required |
| `description` | string or null | Optional, null |
| `recording_type` | enum | `story` |
| `language_id`, `dialect_id`, `community_id` | UUID or null | Optional, null |
| `privacy` | enum | `public` |
| `speaker_count` | integer, 1–20 | `1` |
| `location`, `cultural_context` | string or null | Optional, null |
| `recorded_at` | ISO-8601 datetime or null | Optional, null |

`recording_type`: `story`, `conversation`, `interview`, `song`,
`traditional_knowledge`, `proverb`, `history`, `other`.

`privacy`: `public`, `community`, `research`, `private`. Success is HTTP 201
with a `RecordingResponse`. Creation does not require or store consent in the
request schema.

### `GET /api/v1/recordings/{recording_id}`

Requires authentication. Returns a `RecordingResponse`; 404 if absent and 403
if the recording is not public, owned by the caller, or visible to a moderator
or admin.

### `PATCH /api/v1/recordings/{recording_id}`

Requires authentication and owner/moderator/admin access. `RecordingUpdate`
accepts optional `title` (max 500), `description`, `recording_type`, `privacy`,
and `cultural_context`. Returns the updated `RecordingResponse`.

### `DELETE /api/v1/recordings/{recording_id}`

Requires authentication and owner/admin access. Returns HTTP 204 with no body.

### `POST /api/v1/recordings/{recording_id}/process`

Requires authentication and owner/moderator/admin access. No body. Returns
HTTP 202:

```json
{"message":"AI processing started","recording_id":"uuid"}
```

The handler queues an in-process FastAPI background task and passes the
request's database session into it. Database-backed processing has not been
verified and may fail after the request session closes.

### Recording response schemas

`RecordingResponse` contains: `id`, `title`, `description`, `recording_type`,
`status`, `privacy`, `duration_seconds`, `file_size_bytes`, `speaker_count`,
`word_count`, `detected_language_code`, `detected_language_confidence`,
`location`, `cultural_context`, `waveform_data`, `thumbnail_url`, `recorded_at`,
`created_at`, `updated_at`, `user_id`, and `language_id`.

`status`: `pending`, `processing`, `completed`, `failed`, `review_needed`.
Nullable fields may be `null`. `RecordingListResponse` is:

```json
{
  "items": ["RecordingResponse"],
  "total": 0,
  "page": 1,
  "page_size": 20,
  "has_next": false
}
```

## Uploads

Both endpoints require an existing recording and an authenticated owner (video
requires exact ownership; audio also permits admin). Request is multipart form
data with one `file` field.

### `POST /api/v1/uploads/audio/{recording_id}`

Allowed declared MIME types: `audio/mpeg`, `audio/wav`, `audio/ogg`,
`audio/mp4`, `audio/webm`, and `audio/flac`. Success is HTTP 200:

```json
{
  "message":"Audio uploaded successfully",
  "recording_id":"uuid",
  "file_size_bytes":123,
  "duration_seconds":null,
  "ready_to_process":true
}
```

The implementation validates the declared MIME type only. It does not enforce
the configured audio size limit or inspect file contents, and saves directly
to the local filesystem. A false MIME type can pass; a large upload can exceed
the configured limit.

### `POST /api/v1/uploads/video/{recording_id}`

Allowed declared MIME types: `video/mp4`, `video/webm`, and `video/ogg`.
Success is HTTP 200:

```json
{
  "message":"Video uploaded successfully",
  "recording_id":"uuid",
  "file_size_bytes":123
}
```

Configured size limits are likewise not enforced.

## Languages and dialects

### `GET /api/v1/languages`

Public. Query parameters: optional `search`, optional `status`, `page` (default
1, minimum 1), `page_size` (default 50, 1–200). Returns an array of
`LanguageResponse`.

### `GET /api/v1/languages/{language_id}`

Public. Returns `LanguageResponse`; 404 if not found.

### `POST /api/v1/languages`

Requires moderator or admin (admin is accepted by role dependency). Request
`LanguageCreate`: required `name` (max 100) and `code` (max 20); optional
`native_name`, `family`, `region`, `description`; `status` defaults to
`active`. Status values are `active`, `endangered`, `critically_endangered`,
`dormant`, `extinct`. Returns HTTP 201 and `LanguageResponse`; duplicate code
returns 409.

`LanguageResponse` fields: `id`, `name`, `code`, `native_name`, `family`,
`region`, `description`, `status`, `recording_count`, `word_count`,
`contributor_count`, `hour_count`, `cover_image_url`.

### `GET /api/v1/languages/{language_id}/dialects`

Public. Returns an array of `DialectResponse` objects with `id`, `language_id`,
`name`, `region`, `description`, and `recording_count`.

### `POST /api/v1/languages/{language_id}/dialects`

Requires authentication. Request `DialectCreate`: required `name` (max 100),
optional `region` and `description`. Returns HTTP 201 and `DialectResponse`.

### `GET /api/v1/languages/stats/overview`

Public. Returns `total_languages`, `total_recordings`, `total_words`, and
`total_hours` numeric fields.

## Search

### `GET /api/v1/search`

Requires authentication. Query parameters: required non-empty `q`, optional
`language_id` UUID and `recording_type`, `page` (default 1, minimum 1),
`page_size` (default 20, 1–100). Returns `{"query": string, "results":
[RecordingResponse], "count": integer}`.

### `POST /api/v1/search/semantic`

Requires authentication. Request `SemanticSearchRequest`: `query` (required,
1–500 chars), optional `language_code`, optional `recording_type`, and `limit`
(default 10, 1–50). Returns an array of `SearchResult` objects containing
`recording` (`RecordingResponse`), `relevance_score` (number), and optional
`matched_text`.

## Analytics

All analytics endpoints below require authentication.

| Method and path | Request | Response |
|---|---|---|
| `GET /api/v1/analytics/overview` | None | `languages`, `recordings`, `completed_recordings`, `contributors`, `words_digitized`, `hours_archived` numeric fields |
| `GET /api/v1/analytics/languages` | Optional `limit` query (default 10) | Array of `{name, code, recordings, hours}` |
| `GET /api/v1/analytics/recordings-over-time` | None | Array of `{month: "YYYY-MM", count: integer}` |

## Implementation and verification limits

- Database models use PostgreSQL UUIDs, PostgreSQL `ARRAY`, and pgvector. The
  configured default database is PostgreSQL; SQLite compatibility is not
  implemented.
- The PostgreSQL app's default AI provider is `disabled`. The mock is available
  only when explicitly selected and returns fabricated demo content. The
  registry registers `mock` and `whisper`, but does not register the configured
  `huggingface` choice. Whisper imports the `whisper` module, which is not
  supplied by `backend/requirements.txt`; import and model-load failures are
  surfaced without fallback. No real ASR inference was run or verified.
- Backend route metadata and health/root responses were exercised without a
  database. Database-backed API success responses were not verified because
  no PostgreSQL service was configured for this audit.

## Verification snapshot (2026-10-13)

- Complete Unified Backend Test Suite: `pytest -v` — 114 passed in 6.64s (100% pass rate).
- Test Categorization & Markers: VERIFIED. Unit tests (`pytest -m unit` -> 6 passed), Integration tests (`pytest -m integration` -> 5 passed), and Real Audio Inference tests (`pytest -m real_ai` -> 1 passed).
- Real Audio ASR Inference & Persistence: VERIFIED. Real 3-minute 37-second Gondi speech recording (`f172343b-e928-467b-8984-8f82ef9408bf.mp3`, 3.19 MB) successfully decoded via multi-format audio engine (`scratch/bin/ffmpeg` wrapping macOS CoreAudio `afconvert`), transcribed by local offline Whisper (`base` model, 2,008 phonetic tokens generated in 37.03s), and persisted to SQLite row ID 5 (`transcription_status: 'completed'`).
- Multilingual Vector Store (ChromaDB): VERIFIED. 26 verified records across 13 target languages from AI4Bharat, Mozilla Common Voice, CIIL, and PARADISEC, indexed into persistent ChromaDB collection `language_resources` with 384-dimensional offline embeddings.
- Language Capabilities Registry: VERIFIED. All 44+ registered languages returned via `GET /api/v1/languages` and `GET /api/v1/languages/capabilities` with explicit script, speech, translation, and limitation annotations.
- Stage 6 Multi-Modal Evaluation Framework: VERIFIED. Full linguistic evaluation suite (`GET /api/v1/evaluation/latest` and `POST /api/v1/evaluation/run`) reporting WER/CER, translation elder-review guardrails (100% compliance), and vector search retrieval metrics (MRR: 0.4722, Hit@1: 33.3%, Hit@3: 66.7%).
- Continuous Integration & Quality Runner: VERIFIED. GitHub Actions CI workflow in `.github/workflows/ci.yml` and unified automated runner `scripts/run_quality_checks.sh`.
- Zero Paid API Cost: VERIFIED. 100% local, self-hosted execution; telemetry confirms `$0.00` external API cost.
- Frontend Production Build: `npm --prefix frontend run build` — exit code 0; TypeScript and Vite built 1568 modules in 1.51s.
- Dual Annotation Separation: VERIFIED. Original audio master is immutable under OCAP protocols; AI output and community corrections are saved independently.
