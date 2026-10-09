# Voice Roots — Security & Data Sovereignty Policy

## 1. Indigenous Data Sovereignty (OCAP Principles)
Voice Roots is architected to honor the **OCAP** framework:
- **Ownership**: The cultural community owns its oral stories, dialects, and sacred narratives.
- **Control**: Indigenous elders determine whether a recording is public, clan-restricted, or ceremonial.
- **Access**: Communities maintain perpetual access to their archives.
- **Possession**: Community custodians hold the cryptographic keys and provenance records of their data.

---

## 2. Secrets & Credential Management
- **Zero Secrets in Repository**: No API keys, passwords, private tokens, or session secrets are committed to Git.
- **Environment Variable Protection**: All external API keys (`HF_TOKEN`, `OPENAI_API_KEY`, `AUTH_SECRET`) are injected via environment variables at runtime.
- **Render Production Secrets**: Configured via the Render Dashboard Environment tab.

---

## 3. Cryptographic Password Hashing & Verification
- **Hash Algorithm**: Salted `scrypt` (`crypto.scryptSync(password, salt, 64)`).
- **Salt Generation**: 16 cryptographically secure random bytes per user (`crypto.randomBytes(16).toString("hex")`).
- **Timing Attack Mitigation**: All credential checks utilize `crypto.timingSafeEqual` over fixed-length binary buffers to eliminate side-channel timing leakage.

---

## 4. Session Security & CSRF Defense
- **Token Format**: Signed HMAC-SHA256 tokens (`vr_sess_<base64url(payload)>_<signature>`).
- **Token Validity**: Strictly capped at 7 days from creation.
- **Tamper Detection**: Server re-calculates HMAC signature on every authenticated request and rejects invalid signatures.
- **Cookie Flags**: Cookies set with `SameSite=Lax` and `secure` in production environments.

---

## 5. Rate Limiting & Denial-of-Service Defense
- **Auth Endpoints**: Sliding-window rate limiter restricts requests to **10 attempts per minute per IP** for `/api/auth/login`, `/register`, and `/forgot-password`.
- **429 Response**: Returns standard `Retry-After` metadata with remaining cool-off duration.

---

## 6. Audio Upload Validation
- **MIME Whitelist**: `audio/wav`, `audio/mpeg`, `audio/mp4`, `audio/webm`, `audio/ogg`, `audio/x-m4a`.
- **Payload Limit**: Strict 25MB file size limit to prevent memory exhaustion on server workers.
- **Stream Sanitization**: Audio files are read directly into memory buffers without writing unvetted temporary files to disk.
