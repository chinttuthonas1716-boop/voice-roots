# Voice Roots API Contract & Interface Specification

> **Official API Specification for Voice Roots**  
> Verified against FastAPI backend (`backend/main.py`) and Next.js 14 App Router client (`web/`).  
> Enforces OCAP® indigenous data sovereignty, dual affirmative consent, role-based access control, and defense-in-depth security.

---

## 1. Global Conventions & Protocol

### Base URLs
- **Production API Gateway**: `https://voice-roots-api.onrender.com`
- **Frontend App Router Proxy**: `https://voice-roots.onrender.com/api/v1/*` (rewrites transparently to API service)
- **Local Development**: `http://localhost:8000/api/v1/*`

### Authentication & Authorization Headers
- **Admin Endpoints**: `X-Admin-Key: <token>` or `Authorization: Bearer <admin_jwt>`
- **Authenticated Users (Contributor, Reviewer, Researcher)**: `Authorization: Bearer <jwt_access_token>`
- **Institutional Research**: `X-Research-Key: <research_api_key>`
- **Distributed Tracing**: All requests return an `X-Request-ID: req_<id>` response header. Clients may supply custom request IDs to preserve trace continuity.

### Standard Response Headers
Every API response attaches defense-in-depth headers:
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
X-XSS-Protection: 0
Permissions-Policy: camera=(), microphone=(self), geolocation=()
Content-Security-Policy: default-src 'self'; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains (on HTTPS)
X-Request-ID: req_<timestamp>_<random>
```

---

## 2. API Endpoints Specification

### Health & Observability (Task T1.1 & T3.4)

| Endpoint | Method | Auth | Parameters | Description |
| :--- | :---: | :---: | :--- | :--- |
| `/health` | `GET` | None | None | Fast, cheap uptime probe. Returns HTTP 200 with database engine and storage readiness. |
| `/health/deep` | `GET` | None | None | Deep health probe assessing DB query latency, SQLite/Postgres integrity, R2/local storage writability, disk space, and process RSS memory. Returns 503 if unhealthy. |
| `/ready` | `GET` | None | None | Readiness probe for container orchestration confirming database, storage, and vector store readiness. |

---

### Storage, Master Audio & Cryptographic Signed URLs (Task T1.4 & T3.5)

| Endpoint | Method | Auth | Parameters | Description |
| :--- | :---: | :---: | :--- | :--- |
| `/storage/audio/{filename}` | `GET` | None / OCAP | `expires` (opt), `sig` (opt) | Securely stream master audio. Verifies path safety, affirmative consent, OCAP access tiers (`public`, `community`, `research`, `private`), or HMAC-SHA256 signature. Withdrawn audio permanently returns 404. |
| `/api/v1/storage/signed-url/{filename}` | `GET` | Bearer / Admin | `expires_in` (int, default 3600) | Generate short-lived HMAC-SHA256 signed URL permitting streaming of private or restricted audio without leaking credentials. |

---

### Consent & Irrevocable OCAP Revocation (Task T2.2)

| Endpoint | Method | Auth | Parameters | Description |
| :--- | :---: | :---: | :--- | :--- |
| `POST /api/v1/transcripts/{id}/withdraw-consent` | `POST` | Contributor / Admin | JSON: `{"reason": string}` | Unilateral speaker consent withdrawal. Instantly executes cascade purge: marks status `withdrawn`, purges text from SQLite FTS5 search, deletes vectors from ChromaDB, blocks streaming, and records audit entry. |

---

### Reviewer & Elder Moderation Queue (Task T2.3)

| Endpoint | Method | Auth | Parameters | Description |
| :--- | :---: | :---: | :--- | :--- |
| `GET /api/v1/reviewer/queue` | `GET` | Reviewer / Admin | `language` (opt), `type` (opt), `status` (opt) | Retrieve pending community contributions (transcripts, translations, dictionary lemmas). |
| `POST /api/v1/reviewer/queue/{id}/approve` | `POST` | Reviewer / Admin | JSON: `{"notes": opt}` | Approve draft contribution; elevates status from `draft` to `approved` and clears unreviewed draft badges. |
| `POST /api/v1/reviewer/queue/{id}/correct` | `POST` | Reviewer / Admin | JSON: `{"corrected_text": string, "notes": opt}` | Record elder correction; preserves original machine annotation while publishing verified community text. |
| `POST /api/v1/reviewer/queue/{id}/reject` | `POST` | Reviewer / Admin | JSON: `{"rejection_reason": string}` | Reject unverified contribution; moves record to `withdrawn` status with audit trail. |

---

### Prompted Recording Studio (Task T2.4)

| Endpoint | Method | Auth | Parameters | Description |
| :--- | :---: | :---: | :--- | :--- |
| `GET /api/v1/prompts` | `GET` | None | `language`, `category`, `difficulty`, `limit` | Browse prompt catalog across Gondi, Koya, Santhali, and Lambadi with phonetic hints. |
| `GET /api/v1/prompts/{id}` | `GET` | None | Path ID | Retrieve single prompt card with contextual metadata, dialect notes, and reference script. |
| `GET /api/v1/prompts/{id}/audio` | `GET` | None | Path ID | Stream acoustic reference pronunciation audio for prompt prompt phrase. |

---

### Multilingual Dictionary & Phrasebook (Task T2.6)

| Endpoint | Method | Auth | Parameters | Description |
| :--- | :---: | :---: | :--- | :--- |
| `GET /api/v1/dictionary/overview` | `GET` | None | None | Corpus-level dictionary metrics: total lemmas, verified ratios, language breakdown. |
| `GET /api/v1/dictionary/search` | `GET` | None | `q`, `language`, `status`, `approval`, `page`, `page_size` | SQLite FTS5 full-text lexical search with dialect and status filters. |
| `GET /api/v1/dictionary/{id}` | `GET` | None | Path ID | Detailed entry with IPA phonetic notation, grammatical part-of-speech, and elder approval receipt. |
| `GET /api/v1/dictionary/{id}/pronunciation` | `GET` | None | Path ID | Stream elder-verified pronunciation WAV/MP3 snippet. |

---

### Public Statistics & Census Benchmarks (Task T2.7)

| Endpoint | Method | Auth | Parameters | Description |
| :--- | :---: | :---: | :--- | :--- |
| `GET /api/v1/stats/public` | `GET` | None | None | Public metrics: hours archived, verified community translations, speakers represented, and official Census 2011 endangered vulnerability benchmarks. |
| `GET /api/v1/stats/census/raw` | `GET` | None | None | Official Census demographic reference tables and vulnerability indexes. |

---

### PWA Offline Background Synchronization (Task T2.8)

| Endpoint | Method | Auth | Parameters | Description |
| :--- | :---: | :---: | :--- | :--- |
| `POST /api/v1/sync/idempotent` | `POST` | None / Bearer | JSON: `{"client_operation_id": string, "entity_type": string, "payload": object}` | Idempotent sync endpoint for queued offline client actions. Prevents duplicate ingestion across network flakiness. |

---

### Restricted Data Export (Task T2.9)

| Endpoint | Method | Auth | Parameters | Description |
| :--- | :---: | :---: | :--- | :--- |
| `GET /api/v1/export/public-audio` | `GET` | Admin Only | `dry_run` (bool, default true) | Dry-run summary of exportable records meeting strict OCAP public consent. |
| `POST /api/v1/export/public-audio` | `POST` | Admin Only | JSON: `{"dry_run": bool}` | Generates or streams standard ZIP archive containing consented audio masters, `manifest.jsonl`, `manifest.csv`, and `OCAP_GOVERNANCE.txt`. Rejects private or withdrawn assets. |

---

### Backup & Disaster Recovery (Task T3.3)

| Endpoint | Method | Auth | Parameters | Description |
| :--- | :---: | :---: | :--- | :--- |
| `POST /api/v1/system/backup` | `POST` | Admin Only | JSON: `{"label": opt}` | Executes point-in-time database snapshot with rolling retention. |
| `POST /api/v1/system/restore` | `POST` | Admin Only | JSON: `{"backup_filename": string, "dry_run": bool}` | Inspects or executes atomic database restore with automatic safety pre-snapshotting. |
