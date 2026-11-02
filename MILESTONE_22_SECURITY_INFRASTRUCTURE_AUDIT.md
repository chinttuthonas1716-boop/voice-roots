# 🛡️ Voice Roots — Milestone 22: Production Security & Infrastructure Audit Report

> **Audit Date:** November 2, 2026  
> **Audited Branch:** `feature/m22-production-hardening` (branched from `integration/milestones-16-20`)  
> **Baseline Commit:** `3334613` (`docs(progress): log milestone 21 all-in-one unified ecosystem entrypoint`)  
> **Database Version:** `4c5d6e7f8a9b` (49 tables in `backend/voice_roots.db`)  
> **Audit Status:** **STAGE A & STAGE B COMPLETE — AWAITING EXPLICIT APPROVAL FOR STAGE C**

---

## 1. Repository & Commit Information

- **Repository:** `https://github.com/chinttuthonas1716-boop/voice-roots`
- **Active Working Branch:** `feature/m22-production-hardening`
- **Parent Baseline:** `integration/milestones-16-20` (Commit `3334613`)
- **Working Tree Cleanliness:** Clean working tree; no uncommitted files or unverified changes.
- **Milestone History Preservation:** All 21 milestones (M1–M21) preserved linearly.

---

## 2. Authentication & Authorization Findings

### Finding 2.1 — Arbitrary Role Spoofing via Client-Controlled `X-User-Role` Header (CRITICAL)
- **Affected File:** `backend/main.py` lines 4349–4365, 4495–4520, 4650–4665
- **Evidence:** 
  ```python
  def _extract_archive_auth_context(
      x_admin_key: str | None = None,
      x_user_role: str | None = None,
      x_user_language: str | None = None,
  ) -> tuple[bool, list[str], str | None]:
      is_auth = False
      roles: list[str] = []
      if x_admin_key == ADMIN_API_KEY:
          is_auth = True
          roles.append("admin")
      if x_user_role:
          is_auth = True
          for r in x_user_role.split(","):
              rc = r.strip().lower()
              if rc:
                  roles.append(rc)
      return is_auth, roles, x_user_language
  ```
- **Vulnerability:** The backend accepts `X-User-Role` directly from the client without cryptographic signing, session tokens, or credential verification.
- **Empirical Test:**
  Sending `X-User-Role: elder` to `GET /api/v1/cultural-archives/stories` immediately returned the restricted clan story:
  `"Secret Totem Rites of the Four-Fold Saga Phratries"` (`story:gondi:clan_sacred_totem`), which is completely hidden from public users.
- **Risk:** Complete bypass of elder moderation and cultural authorization gates.

### Finding 2.2 — Hardcoded Insecure Default for Admin API Key (HIGH)
- **Affected File:** `backend/main.py` line 137
- **Evidence:**
  ```python
  ADMIN_API_KEY = os.environ.get("VOICE_ROOTS_ADMIN_KEY", "voice-roots-admin-key").strip()
  ```
- **Vulnerability:** If `VOICE_ROOTS_ADMIN_KEY` is omitted in the environment, the admin key defaults to `"voice-roots-admin-key"`.
- **Risk:** Anyone with knowledge of the repository code can execute administrative actions (e.g. approving submissions, updating KG nodes).

### Finding 2.3 — Purely Client-Side Mock Login Form (MEDIUM)
- **Affected File:** `frontend/src/App.tsx` line 6123
- **Evidence:**
  ```tsx
  <form onSubmit={(e) => { e.preventDefault(); handleTabChange('home'); }} ...>
  ```
- **Vulnerability:** The login tab is a static mock form that redirects to the home tab. There is no user account model, password hashing, session issuance, or password reset procedure.

---

## 3. API Security & Rate Limiting Findings

### Finding 3.1 — Unauthenticated Research API Key Registration (CRITICAL)
- **Affected File:** `backend/main.py` lines 4999–5016
- **Evidence:**
  ```python
  @app.post("/api/v1/research/keys/register")
  def register_research_api_key(
      req: ResearchKeyCreateRequest,
      x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
      x_user_role: str | None = Header(None, alias="X-User-Role"),
  ):
      _is_auth, _roles, _ = _extract_archive_auth_context(x_admin_key, x_user_role)
      # Notice: _is_auth and _roles are never checked! Execution continues unconditionally!
      new_key = research_interoperability_service.create_research_api_key(...)
      return new_key
  ```
- **Empirical Test:**
  An unauthenticated POST request to `/api/v1/research/keys/register` with zero headers successfully registered an institutional research key (`key_d416cc55a5e3fc7b`) with `export:corpus` permissions.
- **Risk:** Any external party can self-issue valid research credentials to bulk-export permitted language corpora.

### Finding 3.2 — Reported 60 req/min Research API Rate Limit is NOT Enforced (HIGH)
- **Affected File:** `backend/research_interoperability_service.py` lines 48, 92–148, `backend/main.py` lines 5033–5086
- **Empirical Test:**
  Executed 70 rapid consecutive requests to `/api/v1/research/corpus/export` using a valid research token (`vr_res_ciil_indigenous_linguistics_2026_auth`) within 1.2 seconds:
  - **Total Requests:** 70
  - **Status 200 OK:** 70 (100%)
  - **Status 429 Too Many Requests:** 0 (0%)
- **Finding:** The rate limit value (`rate_limit_per_minute = 60`) is stored in the database column `research_api_keys.rate_limit_per_minute`, but no rate-limiting middleware or sliding-window tracker evaluates it.

### Finding 3.3 — Missing API Token Revocation Endpoint (MEDIUM)
- **Affected File:** `backend/main.py` lines 4999–5086
- **Finding:** There is no endpoint (such as `DELETE /api/v1/research/keys/{key_id}`) to revoke or deactivate a compromised research API key. Keys remain valid until their expiration timestamp (default 365 days).

### Finding 3.4 — Missing HTTP Security Headers (HIGH)
- **Affected File:** `backend/main.py` lines 488–508
- **Evidence:** HTTP response headers inspected via `curl -s -I http://127.0.0.1:8000/`:
  - `Content-Security-Policy`: **MISSING**
  - `X-Content-Type-Options: nosniff`: **MISSING**
  - `X-Frame-Options: DENY`: **MISSING**
  - `Strict-Transport-Security` (HSTS): **MISSING**
  - `Referrer-Policy`: **MISSING**

---

## 4. Data Protection & File Access Findings

### Finding 4.1 — Direct Static Audio Storage Mount Bypasses Authorization (CRITICAL)
- **Affected File:** `backend/main.py` lines 510–512, `backend/storage_service.py` line 110
- **Evidence:**
  ```python
  if os.path.exists(AUDIO_STORAGE):
      app.mount("/storage/audio", StaticFiles(directory=AUDIO_STORAGE), name="audio_storage")
  ```
- **Vulnerability:** `StaticFiles` serves raw files directly from disk without consulting the SQLite database.
- **Empirical Test:**
  `curl -s -I http://127.0.0.1:8000/storage/audio/00592b5f-32ec-4367-8d53-cf882389b1ae.wav` returned `HTTP 200 OK`.
- **Ethical Impact:** If a speaker withdraws consent for their recording, or if an audio recording is marked `SACRED_ELDER_ONLY`, the file remains directly downloadable over `/storage/audio/{filename}` as long as the filename is known.
- **Remediation:** Remove the public `/storage/audio` static mount; route all audio playback through streaming endpoints that enforce affirmative consent, access tier validation, and right-to-withdraw masking.

---

## 5. Database & Audio Persistence Findings

### Finding 5.1 — SQLite Concurrency & Journal Mode (MEDIUM)
- **Affected Files:** `backend/main.py`, `backend/storage_service.py`, `backend/*_service.py`
- **Finding:**
  - SQLite runs in default `DELETE` rollback journal mode. Under concurrent writing (e.g. concurrent audio uploads or submissions), full database locks occur.
  - `PRAGMA journal_mode=WAL;` is not configured.
  - `PRAGMA busy_timeout=5000;` is not set on connections in `main.py`.
  - `PRAGMA foreign_keys = ON;` is set in only 2 of 8 services (`cultural_archive_service.py`, `speech_analysis_service.py`).
- **Remediation:** Initialize connections with a standardized connection helper enforcing WAL mode, busy timeout, and foreign key integrity.

### Finding 5.2 — Immutable Audio Masters Verified (SECURE)
- **Affected File:** `backend/storage_service.py` lines 103–104
- **Verification:**
  - Files are written with restricted permissions (`0o600`).
  - No update or overwrite route exists for audio files.
  - Verification audit confirmed 654 audio masters on disk matching exact SHA-256 hashes (0 corrupted).

---

## 6. Backup Restoration Evidence

In accordance with Milestone 22 requirements, recoverability was tested by performing a real restoration into an isolated scratch environment:

```
[Target Backup] backend/storage/backups/pre_m21_integration_backup_20261102_134751.db
[File Size]     1,720,320 bytes
[SHA-256 Hash]  0933f2cd204926de68f0f656b4bb96996dbf234a126260f2666884460abe89bb
```

### Empirical Restoration Results:
1. **Isolated Restoration Location:** `scratch/isolated_restore_test/restored_test.db`
2. **SQLite Integrity Check:** `PRAGMA integrity_check` -> `['ok']`
3. **Foreign Key Integrity:** `PRAGMA foreign_key_check` -> `0 violations`
4. **Data Fidelity in Backup:**
   - Transcripts: `661 rows`
   - Translations: `104 rows`
   - Community Corrections: `364 rows`
   - Alembic Revision in Backup: `c4820d491f21` (31 tables)
5. **Live Migration Upgrade of Restored Database:**
   - Ran: `VOICE_ROOTS_DB_URL=sqlite:////.../restored_test.db alembic upgrade head`
   - **Exit Code:** `0` (Success)
   - **Upgrades Executed:** `c4820d491f21` -> `e7193b58f012` -> `9eb5cd35b326` -> `2a8b3c4d5e6f` -> `4c5d6e7f8a9b`
   - **Tables after upgrade:** `49 tables`
   - **Post-upgrade Data Integrity:** All 661 transcripts, translations, and corrections 100% intact.

---

## 7. Infrastructure Readiness Evaluation

| Evaluation Criteria | Local Development | Controlled Pilot | Public Production | Current Status |
| :--- | :---: | :---: | :---: | :--- |
| **Process Supervision** | Uvicorn CLI | Docker / systemd | Container Orchestration | 🟡 Local Uvicorn running |
| **Reverse Proxy (Nginx/TLS)** | None | Nginx / Caddy | Reverse Proxy + WAF + TLS | 🔴 Missing reverse proxy config |
| **TLS/HTTPS Certificates** | HTTP | Let's Encrypt / Self-Signed | Automated TLS (Certbot) | 🔴 Plain HTTP only |
| **Secret Management** | Defaults in code | `.env` file | Encrypted Secret Store | 🔴 Insecure fallback defaults |
| **Rate Limiting** | None | In-memory token bucket | Redis / Sliding Window | 🔴 Unenforced |
| **Non-Root Container User** | Root | `appuser` (UID 1000) | `appuser` (UID 1000) | 🔴 Dockerfile runs as `root` |
| **Audit Logging** | stdout | Structured JSON to file | Centralized log aggregator | 🟡 Stdout structured logging |

---

## 8. Performance Findings

Benchmark latencies measured across live integrated endpoints:

| Endpoint | Method | Latency (ms) | Assessment |
| :--- | :---: | :---: | :--- |
| `GET /` (SPA index.html) | GET | 10.91 ms | Optimal |
| `GET /health` | GET | 3.36 ms | Optimal |
| `GET /api/v1/knowledge-graph/overview` | GET | 2.88 ms | Optimal |
| `GET /api/v1/knowledge-graph/search?q=పెన్` | GET | 7.70 ms | Optimal (Unicode FTS5) |
| `GET /api/v1/cultural-archives/stories` | GET | 3.71 ms | Optimal |
| `GET /api/v1/speech/overview` | GET | 2.43 ms | Optimal |
| `GET /api/v1/learning/collections` | GET | 2.82 ms | Optimal |
| `GET /api/v1/research/manifest` | GET | 4.12 ms | Optimal |
| `GET /api/v1/discovery/search?query=forest` | GET | 236.51 ms | Subword character n-gram cosine matching in Python |

---

## 9. Dependency & Configuration Risks

1. **Python Dependencies:** All core packages (`fastapi==0.141.1`, `pydantic==2.14.1`, `chromadb==1.5.9`, `starlette==1.6.0`, `cryptography==50.0.2`) are pinned and current.
2. **Frontend Dependencies:** `npm audit` flagged `esbuild <= 0.24.2` and `vite <= 6.4.3` dev-server vulnerability (`GHSA-67mh-4wv8-2f99`). Note: This affects development server mode (`vite dev`), not the compiled static assets in production.
3. **CORS Headers:** `allow_headers=["*"]` allows arbitrary client headers.

---

## 10. Ethical Governance Verification

- **OCAP Data Leakage Test:** Public queries return zero sacred stories.
- **Audio Master Protection:** Audio master files cannot be overwritten via any REST API endpoint.
- **Indigenous Translation Guardrails:** Automated AI translation of oral heritage tongues (Gondi, Koya, Santhali, Lambadi) is strictly blocked (HTTP 503) without elder approval.
- **Right to Withdraw:** Speaker withdrawal instantly marks records hidden (`HTTP 404`) from public search.

---

## 11. Prioritized Findings Matrix

| Finding ID | Title | Severity | Impact | Remediation Priority |
| :--- | :--- | :---: | :--- | :---: |
| **SEC-01** | Unauthenticated Research Key Registration | 🔴 **CRITICAL** | Unauthorized key issuance & corpus export | **P0** |
| **SEC-02** | Header-based Role Spoofing (`X-User-Role`) | 🔴 **CRITICAL** | Bypass of elder review & sacred lore leakage | **P0** |
| **SEC-03** | Public Static Audio Mount (`/storage/audio`) | 🔴 **CRITICAL** | Direct access to raw audio bypassing OCAP | **P0** |
| **SEC-04** | Hardcoded Fallback for Admin Key | 🟠 **HIGH** | Predictable admin credential | **P1** |
| **SEC-05** | Research API Rate Limit Not Enforced | 🟠 **HIGH** | Potential API abuse & denial of service | **P1** |
| **SEC-06** | Missing HTTP Security Headers | 🟠 **HIGH** | Clickjacking & MIME-sniffing exposure | **P1** |
| **SEC-07** | Missing Token Revocation Endpoint | 🟡 **MEDIUM** | Inability to deactivate compromised tokens | **P2** |
| **SEC-08** | SQLite Concurrency (No WAL Mode) | 🟡 **MEDIUM** | Database locking under concurrent load | **P2** |
| **SEC-09** | Container Execution as Root | 🟡 **MEDIUM** | Container escape risk | **P2** |
| **SEC-10** | Missing True User Authentication | 🟡 **MEDIUM** | Inability to track distinct user sessions | **P2** |

---

## 12. Recommended Implementation Order (Stage C Roadmap)

```
[Phase 1: Critical Access Control Fixes]
  ├── Fix SEC-01: Protect POST /api/v1/research/keys/register with mandatory Admin Authentication
  ├── Fix SEC-02: Eliminate raw X-User-Role spoofing; enforce signed tokens/HMAC or admin gating
  └── Fix SEC-03: Remove /storage/audio static mount; route all audio through authorized streaming endpoints
       │
[Phase 2: API Protection & Hardening]
  ├── Fix SEC-04: Enforce strict environment-based admin secret; disallow default fallback in production
  ├── Fix SEC-05: Implement active sliding-window in-memory rate limiting (60 req/min) on research endpoints
  ├── Fix SEC-06: Add Security Headers middleware (CSP, X-Content-Type-Options, X-Frame-Options, HSTS)
  └── Fix SEC-07: Add DELETE /api/v1/research/keys/{key_id} token revocation route
       │
[Phase 3: Database & Container Hardening]
  ├── Fix SEC-08: Enable SQLite PRAGMA journal_mode=WAL and PRAGMA busy_timeout=5000 across all connections
  ├── Fix SEC-09: Update Dockerfile with non-root appuser (UID 1000)
  └── Add comprehensive test suite in tests/test_milestone22_security_hardening.py
```

---

## 13. Production Blockers

Before Voice Roots can be declared public production ready, the following **3 blockers** must be resolved:
1. **Blocker 1 (SEC-01):** Unrestricted key self-issuance at `/api/v1/research/keys/register`.
2. **Blocker 2 (SEC-02):** Unauthenticated role spoofing via `X-User-Role: elder`.
3. **Blocker 3 (SEC-03):** Direct static file streaming at `/storage/audio` bypassing OCAP withdrawal and sacred lore access tiers.

---

## 14. Proposed Rollback Procedures

If any hardening change introduces regressions:
1. **Git Rollback:** Revert commit on `feature/m22-production-hardening` back to `3334613` via `git reset --hard 3334613`.
2. **Database Rollback:** If database changes are needed, restore from verified backup `backend/storage/backups/pre_m21_integration_backup_20261102_134751.db`.
3. **Baseline Test Gate:** Every change must maintain 100% pass rate on `pytest tests/`, `pre_faculty_release_audit.py`, and `test_every_feature.py`.

---

## 15. Test Results & Baseline Evidence

```
======================================================================
1. Pytest Suite: 199 / 199 Passed in 27.34s (100% Pass Rate)
2. Pre-Faculty Release Audit: 26 / 26 Checkpoints Passed (100%)
3. Live Feature Verification: 27 / 27 Features Passed (100%)
4. Frontend Production Build: Compiled in 1.69s (0 TypeScript errors)
5. Ruff Static Analysis: 0 errors, 0 warnings across all files
6. Backup Restoration Test: Successfully restored and upgraded to Head (49 tables, 0 errors)
======================================================================
```

---

## Approval Gate Status

> **STAGE A (Audit) & STAGE B (Implementation Plan):** **COMPLETE**  
> **STAGE C (Implementation):** **STOPPED — AWAITING EXPLICIT APPROVAL**  
> *No production changes, credential resets, or architectural migrations will be applied until approved.*

