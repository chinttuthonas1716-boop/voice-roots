# Production Deployment & Operations Guide: Voice Roots

> **"Voice Roots: Rooting Oral Languages in Text with AI"**  
> Community-Governed, Offline-First Speech Preservation & Linguistic Intelligence Platform.  
> Official deployment documentation for Render, PostgreSQL, Cloudflare R2, and air-gapped local mode.

---

## 1. Production System Architecture

```
                                  [ Global Web Clients ]
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       │                                           │
                (HTTPS: Web UI)                           (HTTPS: API Proxy)
                       │                                           │
                       ▼                                           ▼
          [ voice-roots Frontend ]                    [ voice-roots-api Backend ]
           Render Web Service (Node.js)                Render Web Service (Python)
           Next.js 14 App Router (SSR + SSG)           FastAPI + Uvicorn (Starter Plan)
           Offline PWA Service Worker                  CORS: https://voice-roots.onrender.com
           Rewrite: /api/v1/* -> API_BASE_URL          Deep Health Probe: /health/deep
                       │                                           │
                       └─────────────────────┬─────────────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       │                                           │
                       ▼                                           ▼
           [ Managed PostgreSQL ]                      [ Cloudflare R2 Audio ]
            Render / Supabase Database                  S3-compatible Object Storage
            Alembic Automated Migrations                Bucket Versioning Enabled
            Transactional Relational State              Presigned Streaming URLs (TTL: 1h)
            (Fallback: SQLite 3 WAL Mode)               (Fallback: Local 0o600 Storage)
```

---

## 2. Infrastructure Specification & Cloud Services

| Subsystem | Service / Technology | Plan / Specification | Cost / SLA |
| :--- | :--- | :--- | :--- |
| **Frontend Web Service** | Render (`voice-roots`) | Node.js 18+ runtime, Next.js 14 App Router | Standard Free/Starter, Global Edge CDN |
| **Backend API Service** | Render (`voice-roots-api`)| Python 3.11/3.14 runtime, FastAPI, Uvicorn | Starter Plan (Always-On; eliminates cold-start sleeps) |
| **Relational Database** | Managed PostgreSQL 15+ | Non-expiring database, pooled connections | Automated Alembic migrations on startup |
| **Audio Master Storage** | Cloudflare R2 Object Store | S3-compatible, multi-region redundancy | $0 egress fees, object versioning enabled |
| **Offline Compute Engine**| Local Whisper & Embeddings | CPU/GPU local execution (offline capable) | $0 recurring transcription/translation spend |
| **Observability & Logging**| Structured JSON + Sentry APM | Request correlation IDs (`X-Request-ID`) | OCAP-compliant (`send_default_pii=False`) |

---

## 3. Render Blueprint Deployment (`render.yaml`)

The repository includes a production-ready Render Blueprint definition (`render.yaml`) orchestrating both frontend and backend services:

```yaml
services:
  - type: web
    name: voice-roots-api
    runtime: python
    plan: starter            # always-on paid instance; prevents idle sleep
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
    healthCheckPath: /health
    envVars:
      - key: DATABASE_URL
        sync: false          # set in Render dashboard to non-expiring Postgres instance
      - key: CORS_ORIGINS
        value: https://voice-roots.onrender.com
      - key: SECRET_KEY
        generateValue: true
      - key: R2_ENDPOINT_URL
        sync: false
      - key: R2_ACCESS_KEY_ID
        sync: false
      - key: R2_SECRET_ACCESS_KEY
        sync: false
      - key: R2_BUCKET
        sync: false
      - key: SENTRY_DSN
        sync: false
      - key: STRUCTURED_LOGGING
        value: "true"

  - type: web
    name: voice-roots
    runtime: node
    plan: starter
    rootDir: web
    buildCommand: npm ci && npm run build
    startCommand: npm start
    envVars:
      - key: API_BASE_URL
        value: https://voice-roots-api.onrender.com
      - key: NEXT_PUBLIC_SITE_URL
        value: https://voice-roots.onrender.com
```

---

## 4. Environment Variables Reference

### Backend API (`voice-roots-api`)
| Variable | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | Yes (Hosted) | `postgresql://user:pass@host:5432/db` | Connection string for PostgreSQL database |
| `CORS_ORIGINS` | Yes | `https://voice-roots.onrender.com` | Permitted browser origins for direct API invocations |
| `SECRET_KEY` | Yes | `crypto-secure-random-token-64-bytes` | HMAC key for signed URLs and session verification |
| `VOICE_ROOTS_ADMIN_KEY` | Recommended | `voice-roots-admin-key-2026` | Authorization key for backups, restores, and admin APIs |
| `R2_ENDPOINT_URL` | Optional | `https://<account_id>.r2.cloudflarestorage.com` | Cloudflare R2 S3 API endpoint |
| `R2_ACCESS_KEY_ID` | Optional | `your-r2-access-key-id` | Cloudflare R2 access key ID |
| `R2_SECRET_ACCESS_KEY` | Optional | `your-r2-secret-access-key` | Cloudflare R2 secret access key |
| `R2_BUCKET` | Optional | `voice-roots-audio` | Cloudflare R2 audio masters bucket |
| `SENTRY_DSN` | Optional | `https://publicKey@sentry.io/project` | Application error tracking (safe fallback if unset) |
| `STRUCTURED_LOGGING` | Optional | `true` | Outputs JSON formatted logs with correlation IDs |

### Frontend UI (`voice-roots`)
| Variable | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `API_BASE_URL` | Yes (Build-time)| `https://voice-roots-api.onrender.com` | Target for Next.js App Router `/api/v1/*` proxy rewrites |
| `NEXT_PUBLIC_SITE_URL` | No | `https://voice-roots.onrender.com` | Canonical site origin for metadata and PWA manifests |
| `NEXT_PUBLIC_SENTRY_DSN`| No | `https://publicKey@sentry.io/project` | Optional client-side error reporting |

---

## 5. Automated Database Migrations & Point-in-Time Backups

### Alembic Database Migrations
When `DATABASE_URL` is configured, `backend/main.py` automatically validates and applies Alembic migrations upon container startup:
```bash
# Manual migration command (if needed)
alembic upgrade head
```

### Automated Backup & Snapshot Protocol (Task T3.3)
1. **SQLite / Postgres Automated Backups**:
   ```bash
   # Run point-in-time database snapshot with rolling retention
   python3 scripts/backup_database.py
   ```
2. **Cloudflare R2 Object Versioning & Sync**:
   ```bash
   # Verify R2 bucket versioning and sync audio assets to backup store
   python3 scripts/backup_r2_storage.py --sync
   ```
3. **Admin Restore Runbook**:
   - Inspect snapshot without mutating active database:
     ```bash
     python3 scripts/restore_database.py --snapshot storage/backups/backup_20261107.db --dry-run
     ```
   - Execute restore with automatic safety pre-snapshot:
     ```bash
     python3 scripts/restore_database.py --snapshot storage/backups/backup_20261107.db
     ```

---

## 6. Observability, Health Checks & Uptime Probes

- **Fast Uptime Probe**:
  - `GET /health` — Cheap ping verifying API responsiveness and baseline DB connectivity (used by Render health probes).
- **Deep Health & Subsystem Diagnostics**:
  - `GET /health/deep` — Comprehensive readiness probe checking database query latency, SQLite/PostgreSQL integrity, R2/local storage writability, disk capacity, and process RSS memory.
- **Request Tracing**:
  - All incoming HTTP requests receive or preserve an `X-Request-ID` correlation token for end-to-end distributed tracing across logs and client bug reports.
