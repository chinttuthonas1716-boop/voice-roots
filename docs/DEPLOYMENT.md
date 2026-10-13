# Deployment and Operations Guide: Voice Roots

> **"Voice Roots: Rooting Oral Languages in Text with AI"**  
> A source-grounded, privacy-preserving oral language preservation platform.

---

## 1. System Architecture

```mermaid
graph TD
    Client[Browser / Mobile Web Client] -->|HTTPS| CDN[Vercel / Cloudflare Pages / Nginx]
    CDN -->|Static Assets| SPA[React 18 + Vite SPA]
    Client -->|REST API / Audio Stream| API[FastAPI Backend - Uvicorn]
    
    subgraph Persistent Storage Mount [/data]
        API -->|Read / Write| DB[(SQLite: voice_roots.db)]
        API -->|Immutable Masters| AudioStore[Master Audio Files: /storage/audio]
        API -->|Linguistic Vectors| ChromaStore[(ChromaDB: /chroma_db)]
        API -->|Atomic Backups| BackupStore[Database Backups: /backups]
    end

    subgraph Offline AI Inference
        API -->|Local Speech-to-Text| Whisper[OpenAI Whisper CPU/GPU Engine]
        API -->|Audio Preprocessing| FFmpeg[System FFmpeg Binary]
        API -->|Semantic Embedding| Subword[Offline 384-dim Subword Embeddings]
    end
```

### Core Components
1. **Frontend**: React 18 + TypeScript + Vite Single Page Application.
2. **Backend**: FastAPI (Python 3.10–3.14) ASGI service managed by Uvicorn.
3. **Local AI Models**: Offline `whisper-base` + local `voiceroots_multilingual_v1` 384-dimensional embeddings for zero external API costs and offline Indigenous Data Sovereignty.
4. **Persistent State**:
   - `voice_roots.db`: SQLite database recording transcript annotations, timestamps, speaker consent records (OCAP protocol), and verified community translations.
   - `storage/audio/`: Master audio recordings (WAV/FLAC/MP3/M4A), preserved immutably with SHA-256 integrity checksums.
   - `chroma_db/`: Persistent local vector store with indexed oral language corpora across 21+ languages.
   - `backups/`: Isolated directory for atomic SQLite database snapshots created via `POST /api/v1/system/backup`.

---

## 2. Recommended Deployment Platform & Rationale

### Platform: Dockerized Web Service with Persistent Disk on Render, Railway, or Linux VPS
- **Why**:
  1. **Persistent Volume Requirement**: SQLite, local ChromaDB, backups, and master audio recordings are stateful and require durable disk storage across container restarts and redeployments. Serverless runtimes (such as AWS Lambda or Vercel Serverless Functions) lack persistent disk and will lose user audio and database records upon instance recycling.
  2. **System Binary Dependency**: The local transcription pipeline requires `ffmpeg` installed directly in the runtime environment. Docker containers guarantee the presence of system `ffmpeg` without host-level discrepancies.
  3. **Zero Recurring API Costs**: Running offline Whisper (`whisper-base`) locally within a persistent container eliminates recurring per-minute speech-to-text API charges.
  4. **Decoupled Frontend Option**: The frontend production build (`frontend/dist`) can either be hosted on a global edge CDN (Vercel, Cloudflare Pages) pointing `VITE_API_URL` to the backend, or served directly from the same container via Nginx/FastAPI.

---

## 3. Environment Variables

Create your production environment file from `.env.example`:

| Variable | Required | Default / Example | Purpose |
|---|---|---|---|
| `VOICE_ROOTS_ENV` | Yes | `production` | Enables production security checks and disables dev debug banners |
| `PORT` | No | `8000` | Port for Uvicorn to listen on |
| `VOICE_ROOTS_ALLOWED_ORIGINS` | Yes | `https://your-frontend.vercel.app` | Comma-separated CORS origins permitted to access API |
| `VOICE_ROOTS_ADMIN_KEY` | Recommended | `secure_token_abc123` | Secret required for admin endpoints (re-indexing, backups, moderation) |
| `VOICE_ROOTS_DB_PATH` | Yes | `/data/voice_roots.db` | Path to persistent SQLite database |
| `VOICE_ROOTS_STORAGE_DIR` | Yes | `/data/storage` | Path to persistent storage root (audio saved to `/data/storage/audio`) |
| `VOICE_ROOTS_BACKUP_DIR` | Yes | `/data/backups` | Path to persistent backup directory (isolated outside web routes) |
| `VOICE_ROOTS_CHROMA_DIR` | Yes | `/data/chroma_db` | Path to persistent ChromaDB vector store directory |
| `VOICE_ROOTS_TRANSCRIPTION_PROVIDER`| No | `whisper-local` | Speech recognition provider (`whisper-local` \| `disabled`) |
| `VOICE_ROOTS_WHISPER_MODEL_SIZE` | No | `base` | Whisper model size (`tiny`, `base`, `small`, `medium`) |
| `VOICE_ROOTS_TRANSLATION_PROVIDER` | No | `offline-rule` | Translation adapter (`offline-rule` \| `identity`) |
| `VITE_API_URL` | Frontend | `https://api.yourdomain.com` | Base URL used by the frontend to contact backend |

---

## 4. Step-by-Step Deployment Instructions

### Option A: Single-Host Docker Deployment (Recommended)

#### Step 1: Create `Dockerfile` in Repository Root
```dockerfile
FROM python:3.11-slim

# Install system dependencies including FFmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend application code and seeded datasets
COPY backend/ backend/
COPY data/ data/

# Create persistent storage directories
RUN mkdir -p /data/storage/audio /data/chroma_db /data/backups

# Configure environment defaults
ENV VOICE_ROOTS_ENV=production \
    VOICE_ROOTS_DB_PATH=/data/voice_roots.db \
    VOICE_ROOTS_STORAGE_DIR=/data/storage \
    VOICE_ROOTS_BACKUP_DIR=/data/backups \
    VOICE_ROOTS_CHROMA_DIR=/data/chroma_db \
    VOICE_ROOTS_TRANSCRIPTION_PROVIDER=whisper-local \
    VOICE_ROOTS_WHISPER_MODEL_SIZE=base \
    PYTHONPATH=/app/backend

EXPOSE 8000

# Health check using readiness probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/ready || exit 1

CMD ["python", "-m", "uvicorn", "main:app", "--app-dir", "backend", "--host", "0.0.0.0", "--port", "8000"]
```

#### Step 2: Build and Run Container with Persistent Volume
```bash
# 1. Build the production image
docker build -t voice-roots-backend:1.0.0 .

# 2. Run container with persistent host volume mounted to /data
docker run -d \
  --name voice-roots-api \
  -p 8000:8000 \
  -v /var/lib/voice-roots-data:/data \
  --env-file .env.production \
  --restart unless-stopped \
  voice-roots-backend:1.0.0
```

#### Step 3: Build & Deploy Frontend (Vercel / Cloudflare Pages / Static Nginx)
```bash
cd frontend
# Set production backend endpoint
export VITE_API_URL=https://api.yourdomain.com

# Install dependencies and build static bundle
npm install
npm run build

# Output directory: frontend/dist
# Deploy frontend/dist to Vercel, Cloudflare Pages, or static Nginx root
```

---

### Option B: Deploying to Render.com with Persistent Disk

1. **Create Web Service**:
   - Environment: `Python 3` or `Docker`.
   - Build Command: `pip install -r backend/requirements.txt && apt-get install -y ffmpeg` (or use Dockerfile).
   - Start Command: `python -m uvicorn main:app --app-dir backend --host 0.0.0.0 --port $PORT`
2. **Attach Persistent Disk**:
   - Mount Path: `/data`
   - Size: `10 GB` (or larger depending on expected recording volume).
3. **Set Environment Variables**:
   - `VOICE_ROOTS_DB_PATH=/data/voice_roots.db`
   - `VOICE_ROOTS_STORAGE_DIR=/data/storage`
   - `VOICE_ROOTS_BACKUP_DIR=/data/backups`
   - `VOICE_ROOTS_CHROMA_DIR=/data/chroma_db`
   - `VOICE_ROOTS_ALLOWED_ORIGINS=https://your-frontend.vercel.app`
   - `VOICE_ROOTS_ADMIN_KEY=<generate-strong-key>`
4. **Deploy Frontend on Vercel**:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Environment Variable: `VITE_API_URL=https://<your-render-service>.onrender.com`

---

## 5. Health & Readiness Monitoring

The backend exposes standardized monitoring probes:

- **Readiness Probe (`GET /ready` or `GET /api/v1/ready`)**:
  - Verifies database connectivity.
  - Verifies audio storage directory write permissions.
  - Verifies ChromaDB vector database connectivity.
  - Returns HTTP 200 `{"status": "ready", "checks": {"database": "ok", "storage": "ok", "vector_store": "ok"}}` when ready for traffic.
  - Returns HTTP 503 if any dependency check fails.

- **Liveness Probe (`GET /health` or `GET /api/v1/health`)**:
  - Verifies process liveness.
  - Returns HTTP 200 `{"status": "healthy", "database": "sqlite", "database_status": "ok", "storage_status": "ok"}`.
  - Sanitized in production (no internal system directory paths leaked).

---

## 6. Backup and Recovery Procedures

### Backup Execution (Daily / Scheduled Cron)

State is consolidated under the persistent data directory (`/data`):
1. **SQLite Database Backup**:
   Use Voice Roots atomic backup API or SQLite online backup API:
   ```bash
   curl -X POST http://localhost:8000/api/v1/system/backup -H "X-Admin-Key: $VOICE_ROOTS_ADMIN_KEY"
   ```
   Or via CLI:
   ```bash
   sqlite3 /data/voice_roots.db ".backup '/data/backups/voice_roots_$(date +%Y%m%d_%H%M%S).db'"
   ```
2. **Master Audio Files Backup**:
   Sync immutable audio master files to an offsite secure bucket (e.g. AWS S3 Glacier / Cloudflare R2 / cold storage):
   ```bash
   rsync -avz /data/storage/audio/ /backup/storage/audio/
   ```
3. **ChromaDB Vector Store**:
   Sync ChromaDB index files:
   ```bash
   rsync -avz /data/chroma_db/ /backup/chroma_db/
   ```

### Restoration Procedure
1. Stop the backend service to prevent live writes:
   ```bash
   docker stop voice-roots-api
   ```
2. Restore SQLite database:
   ```bash
   cp /backup/voice_roots_YYYYMMDD_HHMMSS.db /data/voice_roots.db
   ```
3. Restore audio storage and vector embeddings:
   ```bash
   rsync -av /backup/storage/audio/ /data/storage/audio/
   rsync -av /backup/chroma_db/ /data/chroma_db/
   ```
4. Start the backend service and verify readiness:
   ```bash
   docker start voice-roots-api
   curl -s http://localhost:8000/ready
   ```

---

## 7. Rollback Plan

1. **Application Code Rollback**:
   - In containerized deployments, redeploy previous container tag (e.g. `voice-roots-backend:0.9.9`).
   - In Git-based deployments: `git checkout <previous-tag-or-commit>` followed by service restart.
2. **Database Compatibility**:
   - All Voice Roots database migrations are non-destructive and additive (`ALTER TABLE ADD COLUMN` and `CREATE TABLE IF NOT EXISTS`).
   - Rolling back backend application code does not require rolling back the SQLite database schema. Existing recordings and transcripts remain intact.
3. **Emergency Verification**:
   - Run verification test suite against rollback instance:
     ```bash
     PYTHONPATH=backend python3 -m pytest tests/test_e2e_workflow.py -v
     ```

