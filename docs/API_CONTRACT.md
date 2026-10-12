# Voice Roots API contract

Inspected from the backend and React/Vite client on 2026-10-12. This repository
currently contains two independent FastAPI apps. The React/Vite client is
written to call the SQLite app in `backend/main.py`; `backend/Dockerfile` starts
the separate PostgreSQL app in `backend/app/main.py`. A deployment must choose
an entrypoint explicitly. In the active `agent/antigravity` checkout, the
SQLite app is an older implementation and does not implement the consent or
transcription routes described below. Those newer routes are present in the
separate `agent/codex` worktree but are not integrated into this checkout. No
live deployment behavior is verified by this document.
Backend launch and provider setup instructions are in
[`BACKEND_SETUP.md`](BACKEND_SETUP.md). The backend README also contains the
SQLite app setup notes.

## React/Vite SQLite API (`backend/main.py`)

The Vite development proxy forwards `/api`, `/health`, and `/storage` to port
8000. This app stores transcript rows in the existing SQLite database and
stores uploaded audio under the configured local storage directory. The
database and storage paths can be set with `VOICE_ROOTS_DB_PATH` and
`VOICE_ROOTS_STORAGE_DIR`; the default paths are under `backend/`. Upload size
is configured by `VOICE_ROOTS_MAX_AUDIO_SIZE_MB` (default 500 MB). CORS origins
are configured by comma-separated `VOICE_ROOTS_ALLOWED_ORIGINS`.

Run the SQLite app on macOS from the repository root with Python 3.11 (the
version used by the repository Dockerfile). Install Python 3.11 with Homebrew
if needed; the clean macOS dependency install has not been verified.

```sh
brew install python@3.11 ffmpeg libsndfile
python3.11 -m venv backend/.venv
source backend/.venv/bin/activate
python -m pip install -r backend/requirements.txt -r backend/requirements-test.txt
uvicorn main:app --app-dir backend --reload --port 8000
```

Run the full backend test suite from the repository root with
`PYTHONPATH=backend python -m pytest -q`. This test command passed in the
current environment; a clean macOS install and any Render service are not
verified by it.

| Method and path | Request | Success response |
|---|---|---|
| `GET /` | None | Name, tagline, status, version, docs and health paths |
| `GET /health` | None | Status, SQLite connectivity, and storage path |
| `GET /languages` and `GET /api/languages` | None | `{"languages":[Language]}` (13 configured language entries) |
| `GET /api/transcripts` and `GET /api/v1/transcriptions` | None | `{"transcripts":[Transcript],"count":number}` |
| `GET /api/transcripts/{id}` and `GET /api/v1/transcriptions/{id}` | Integer path ID | One transcript row; 404 if absent |
| `POST /api/upload` and `POST /api/v1/audio/upload` | Multipart fields below | Upload metadata, checksum, consent metadata, and transcription status |
| `POST /api/transcripts/{id}/transcribe` and `POST /api/v1/transcriptions/{id}/transcribe` | `{"transcription_consent":true}` | Queues transcription; poll the matching GET route for status/result |
| `PUT /api/transcripts/{id}` and `PATCH /api/v1/transcriptions/{id}` | JSON fields below | `{"success":true,"message":string,"id":number}` |
| `DELETE /api/transcripts/{id}` and `DELETE /api/v1/transcriptions/{id}` | Integer path ID | Archives the row from active results; `{"success":true,"message":string}` |
| `GET /api/v1/archive/search` | `q`, `language`, `status`, `page`, `page_size` query parameters | Matching transcript rows with count and pagination values |
| `GET /storage/{path}` | None | Static file bytes; this mount is currently public |

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

## Verification snapshot (2026-10-12)

- Active Antigravity checkout: `PYTHONPATH=backend python3 -m pytest -q` — 4
  passed in 16.67s. This older backend suite does not verify real ASR.
- Separate Codex worktree: `PYTHONPATH=backend python3 -m pytest -q` — 56
  passed in 1.52s. Provider/model responses in transcription tests are mocked;
  these tests verify route behavior and persistence, not actual speech
  recognition.
- Frontend: `npm run build` in `frontend/` — exit code 0; TypeScript and Vite
  built 1568 modules in 1.52s.
- Real authorized audio through upload, inference, SQLite persistence, and
  retrieval: NOT VERIFIED. No repository sample had documented consent
  provenance, no audio was processed, and the runtime had no `ffmpeg`, selected
  transcription provider, hosted API key, or paid-use gate. The documented
  synthetic TTS exercise is not evidence for an authorized community recording.
- Full integration in one checkout: NOT VERIFIED; the Codex backend changes
  are not merged into the active Antigravity checkout.
