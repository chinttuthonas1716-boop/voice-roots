# Backend setup and speech-to-text

The React/Vite client uses the SQLite FastAPI app in `backend/main.py`. The
separate PostgreSQL app in `backend/app/main.py` is not the upload/transcription
service documented here. These commands run the SQLite app from the repository
root.

## macOS setup

The repository pins Python dependencies to versions intended for Python 3.11.
Install Python 3.11 and the local audio decoder, then create an isolated
environment:

```sh
brew install python@3.11 ffmpeg libsndfile
python3.11 -m venv backend/.venv
source backend/.venv/bin/activate
python -m pip install -r backend/requirements.txt -r backend/requirements-test.txt
uvicorn main:app --app-dir backend --reload --host 127.0.0.1 --port 8000
```

Check the service with `curl http://127.0.0.1:8000/health`. Run backend tests
from the repository root:

```sh
PYTHONPATH=backend python3 -m pytest -q
```

The default database and audio directory are `backend/voice_roots.db` and
`backend/storage/`. Set `VOICE_ROOTS_DB_PATH` and
`VOICE_ROOTS_STORAGE_DIR` in the backend environment to use other paths. Do not
point tests at a database containing recordings; the API tests create isolated
temporary databases and storage directories.

## Local Whisper

Transcription is disabled unless a backend provider is selected. Local Whisper
does not require an API key or send audio to a hosted service:

```sh
export VOICE_ROOTS_TRANSCRIPTION_PROVIDER=whisper-local
export VOICE_ROOTS_WHISPER_MODEL_SIZE=base
```

The selected Whisper model weights may be downloaded on first use. The local
provider requires `openai-whisper`, PyTorch and the `ffmpeg` executable. Install
`ffmpeg` before processing MP3, M4A, OGG, WebM or other compressed audio. If the
provider or model is unavailable, the API stores `not_configured` and an error;
it does not create placeholder transcript text.

## Hosted Whisper-compatible provider

The optional hosted adapter uses the OpenAI Audio Transcriptions API with
`whisper-1`. Credentials are read only by the backend process:

```sh
export VOICE_ROOTS_TRANSCRIPTION_PROVIDER=openai
export VOICE_ROOTS_TRANSCRIPTION_MODEL=whisper-1
export OPENAI_API_KEY='your-backend-secret'
export VOICE_ROOTS_ALLOW_PAID_TRANSCRIPTION=true
```

The hosted provider remains unavailable unless the paid-use gate is explicitly
enabled. Do not enable it until provider charges are approved. Per-recording
transcription consent is also required. SDK retries are disabled. Never put
`OPENAI_API_KEY` in React code or a frontend build variable.

## Consent, API flow and transcript fields

Archiving requires `consent=true`. Sending a recording to speech recognition is
a separate choice and requires `transcription_consent=true` either on upload or
in the JSON body of the manual transcription route. For example:

```sh
curl -F 'file=@recording.wav;type=audio/wav' \
  -F 'title=Community recording' \
  -F 'language=English' \
  -F 'consent=true' \
  -F 'transcription_consent=true' \
  http://127.0.0.1:8000/api/upload
```

The response includes an `id` and transcription status. Poll
`GET /api/transcripts/{id}` (or `GET /api/v1/transcriptions/{id}`) for
`transcription_status`, `transcription_error`, `machine_transcript_text`, and
the editable `transcript_text`. Machine output is stored separately. Updating
`transcript_text` for a human correction does not overwrite
`machine_transcript_text`. Provider output is not a verified translation or a
claim of language support; quality must be evaluated for each language.

The current `frontend/src/App.tsx` upload UI submits only `file`, `title`,
`language`, and `dialect`; it sends neither archive consent nor the separate
transcription consent. The backend therefore rejects its upload with HTTP 400
before saving audio. The UI also does not show or poll transcription results,
so frontend upload and transcription are not end-to-end verified.

See [`API_CONTRACT.md`](API_CONTRACT.md) for the inspected routes, schemas,
status values and current service limitations.

## Verification record

- **VERIFIED:** The local Whisper `base` model was exercised through the SQLite
  upload and transcript retrieval routes on a developer-generated 3.14-second
  English TTS sample. The model returned the expected sentence, the database
  GET returned the saved transcript, and the stored source checksum matched
  the uploaded bytes. This is a synthetic speech smoke test, not a test on a
  real speaker or a Voice Roots community recording. Because this host lacked
  `ffmpeg`, that run used a temporary WAV-only decoder shim.
- **VERIFIED:** Mocked provider and API tests cover upload/manual opt-in,
  persistence, provider errors, preservation of original audio, and retention
  of human corrections separately from model output.
- **VERIFIED (2026-10-12 review):** The active Python runtime is 3.14.4 and has
  `openai-whisper` 20250625 with cached `base` weights. The existing Uvicorn
  process is configured for `whisper-local` / `base`; its hosted paid-use gate
  and API key are unset. No hosted request was made. The review shell has no
  system `ffmpeg`; the running process resolves that command to an Antigravity
  scratch helper outside this checkout. That helper was not inspected or run,
  so its decoder support is **NOT VERIFIED**. A pre-existing Antigravity-managed
  Uvicorn process started on this checkout during review and initialized the
  additive SQLite schema. A later metadata-only check found one candidate row
  and one audio file (83,878 bytes), with both consent timestamps recorded and
  `transcription_status=completed` from `whisper-local` / `whisper-base`. Its
  machine text and editable community text are separate in SQLite and were
  retrieved read-only. This review did not run inference; the file's origin as
  actual human speech is **NOT VERIFIED**, so this is not evidence of real
  human-speech ASR. The external FFmpeg helper's behavior remains unverified.
- **NOT VERIFIED:** Real authorized community speech, language-specific
  accuracy, hosted inference, normal decoding through the system `ffmpeg`, a
  clean macOS dependency installation, and deployment.

The separate PostgreSQL app is the Dockerfile entrypoint. If it is deployed in
production, set `APP_ENV=production`, `DEBUG=false`, and a randomly generated
`JWT_SECRET_KEY` with at least 32 characters. Startup rejects the development
JWT placeholder and refuses production mode with debug logging enabled.
