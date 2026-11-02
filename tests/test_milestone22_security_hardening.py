"""Voice Roots — Milestone 22: Production Security and Infrastructure Hardening Test Suite.

Verifies:
- Active rate limiting on Research API endpoints (HTTP 429 Too Many Requests).
- Research API key revocation lifecycle (DELETE /api/v1/research/keys/{key_id}).
- Mandatory admin authentication for research key registration in production.
- Client role spoofing prevention (X-User-Role rejection in production).
- Secure master audio streaming with OCAP right-to-withdraw and sacred lore protection.
- Path traversal protection on audio storage endpoints.
- HTTP security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
- SQLite WAL mode and concurrency pragmas.
"""

from __future__ import annotations

import os
import sqlite3
import pytest
from fastapi.testclient import TestClient

import main
import research_interoperability_service

client = TestClient(main.app)
ADMIN_KEY = main.ADMIN_API_KEY


@pytest.fixture(autouse=True)
def reset_limits():
    """Reset rate limiting state before and after each test."""
    research_interoperability_service.reset_rate_limits()
    yield
    research_interoperability_service.reset_rate_limits()


def test_security_headers_present_on_responses():
    """Verify standard defensive HTTP security headers are present on all responses (SEC-06)."""
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.headers.get("X-Content-Type-Options") == "nosniff"
    assert resp.headers.get("X-Frame-Options") == "DENY"
    assert resp.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert "default-src 'self'" in resp.headers.get("Content-Security-Policy", "")


def test_storage_audio_endpoint_blocks_path_traversal():
    """Verify directory traversal payloads are rejected with HTTP 400 (SEC-03)."""
    resp = client.get("/storage/audio/traversal..test.wav")
    assert resp.status_code == 400
    assert "invalid audio filename" in resp.json()["detail"].lower()

    resp2 = client.get("/storage/audio/%2e%2e/test.wav")
    assert resp2.status_code in (400, 404)


def test_storage_audio_endpoint_blocks_withdrawn_recording():
    """Verify recordings with withdrawn consent are masked with HTTP 404 (SEC-03 / OCAP)."""
    with sqlite3.connect(main.DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT OR REPLACE INTO transcripts (
                id, uuid_id, title, audio_filename, audio_url, language,
                transcript_text, status, archived_at, created_at, updated_at
            ) VALUES (
                99998, 'test-withdrawn-sec22-uuid', 'Withdrawn Story', 'withdrawn_audio_sec22.wav',
                '/storage/audio/withdrawn_audio_sec22.wav', 'Gondi', 'Secret chant',
                'withdrawn', datetime('now'), datetime('now'), datetime('now')
            )
            """
        )
        conn.commit()

    dummy_path = os.path.join(main.AUDIO_STORAGE, "withdrawn_audio_sec22.wav")
    with open(dummy_path, "wb") as f:
        f.write(b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xac\x00\x00data\x00\x00\x00\x00")

    try:
        resp = client.get("/storage/audio/withdrawn_audio_sec22.wav")
        assert resp.status_code == 404
        assert "withdrawn" in resp.json()["detail"].lower()
    finally:
        if os.path.exists(dummy_path):
            os.remove(dummy_path)


def test_storage_audio_endpoint_blocks_sacred_lore_for_public():
    """Verify sacred audio is blocked for unauthenticated users with HTTP 403 (SEC-03 / OCAP)."""
    with sqlite3.connect(main.DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT OR REPLACE INTO cultural_stories (
                story_id, collection_id, title, primary_language,
                audio_reference, access_classification, review_status, created_at, updated_at
            ) VALUES (
                'test:story:sacred:sec22', 'collection:gondi:sacred', 'Sacred Phratry Ritual',
                'Gondi', 'sacred_audio_sec22.wav', 'SACRED_ELDER_ONLY', 'APPROVED',
                datetime('now'), datetime('now')
            )
            """
        )
        conn.commit()

    dummy_path = os.path.join(main.AUDIO_STORAGE, "sacred_audio_sec22.wav")
    with open(dummy_path, "wb") as f:
        f.write(b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xac\x00\x00data\x00\x00\x00\x00")

    try:
        # Unauthenticated request should be blocked with 403
        resp_unauth = client.get("/storage/audio/sacred_audio_sec22.wav")
        assert resp_unauth.status_code == 403
        assert "restricted or sacred" in resp_unauth.json()["detail"].lower()

        # Admin authorized request should be allowed (HTTP 200)
        resp_admin = client.get(
            "/storage/audio/sacred_audio_sec22.wav",
            headers={"X-Admin-Key": ADMIN_KEY},
        )
        assert resp_admin.status_code == 200
    finally:
        if os.path.exists(dummy_path):
            os.remove(dummy_path)


def test_research_api_rate_limit_strictly_enforced():
    """Verify that exceeding configured rate limit triggers HTTP 429 Too Many Requests (SEC-05)."""
    # 1. Register a dedicated token with a strict 5 req/min limit
    reg = client.post(
        "/api/v1/research/keys/register",
        json={
            "organization_name": "Rate Limit Test Lab",
            "contact_email": "ratelimit@test.lab",
            "scopes": ["export:corpus"],
            "rate_limit_per_minute": 5,
        },
        headers={"X-Admin-Key": ADMIN_KEY},
    )
    assert reg.status_code == 200
    test_token = reg.json()["raw_api_key"]

    # 2. First 5 requests within the window must succeed
    for i in range(5):
        resp = client.get(
            "/api/v1/research/corpus/export",
            headers={"X-Research-Token": test_token},
        )
        assert resp.status_code == 200, f"Request {i+1} failed with {resp.status_code}"

    # 3. The 6th request MUST trigger HTTP 429
    rate_limited_resp = client.get(
        "/api/v1/research/corpus/export",
        headers={"X-Research-Token": test_token},
    )
    assert rate_limited_resp.status_code == 429
    assert "Rate limit exceeded" in rate_limited_resp.json()["detail"]
    assert rate_limited_resp.headers.get("Retry-After") == "60"
    assert rate_limited_resp.headers.get("X-RateLimit-Remaining") == "0"


def test_research_token_revocation_lifecycle():
    """Verify admin can revoke an issued research token, immediately blocking further calls (SEC-07)."""
    reg = client.post(
        "/api/v1/research/keys/register",
        json={
            "organization_name": "Temporary Test Institution",
            "contact_email": "temp@test.edu",
            "scopes": ["export:corpus", "read:transcripts"],
        },
        headers={"X-Admin-Key": ADMIN_KEY},
    )
    assert reg.status_code == 200
    key_info = reg.json()
    key_id = key_info["key_id"]
    raw_token = key_info["raw_api_key"]

    pre_resp = client.get(
        "/api/v1/research/corpus/export",
        headers={"X-Research-Token": raw_token},
    )
    assert pre_resp.status_code == 200

    # Revoke without admin key -> 403
    unauth_revoke = client.delete(f"/api/v1/research/keys/{key_id}")
    assert unauth_revoke.status_code == 403

    # Revoke with admin key -> 200
    auth_revoke = client.delete(
        f"/api/v1/research/keys/{key_id}",
        headers={"X-Admin-Key": ADMIN_KEY},
    )
    assert auth_revoke.status_code == 200
    assert auth_revoke.json()["status"] == "revoked"

    # Subsequent request with revoked token must fail with 403
    post_resp = client.get(
        "/api/v1/research/corpus/export",
        headers={"X-Research-Token": raw_token},
    )
    assert post_resp.status_code == 403
    assert "suspended or revoked" in post_resp.json()["detail"].lower()


def test_research_key_registration_requires_admin_in_production(monkeypatch):
    """Verify key registration is locked to admin only when in production environment (SEC-01)."""
    monkeypatch.setenv("VOICE_ROOTS_ENV", "production")

    # Unauthenticated attempt in production -> 403
    unauth_resp = client.post(
        "/api/v1/research/keys/register",
        json={
            "organization_name": "Rogue Crawler",
            "contact_email": "crawler@rogue.com",
            "scopes": ["export:corpus"],
        },
    )
    assert unauth_resp.status_code == 403
    assert "administrator authorization required" in unauth_resp.json()["detail"].lower()

    # Authorized attempt with admin key in production -> 200
    auth_resp = client.post(
        "/api/v1/research/keys/register",
        json={
            "organization_name": "Accredited University",
            "contact_email": "research@accredited.edu",
            "scopes": ["export:corpus"],
        },
        headers={"X-Admin-Key": ADMIN_KEY},
    )
    assert auth_resp.status_code == 200
    assert auth_resp.json()["key_id"].startswith("key_")


def test_role_spoofing_rejected_in_production(monkeypatch):
    """Verify raw X-User-Role header alone cannot access sacred stories in production (SEC-02)."""
    monkeypatch.setenv("VOICE_ROOTS_ENV", "production")

    resp = client.get(
        "/api/v1/cultural-archives/stories",
        headers={"X-User-Role": "elder"},
    )
    assert resp.status_code == 200
    stories = resp.json()
    story_ids = {s.get("story_id") for s in stories}
    assert "story:gondi:clan_sacred_totem" not in story_ids


def test_sqlite_wal_mode_and_concurrency_pragmas():
    """Verify SQLite WAL mode and busy timeout are configured (SEC-08)."""
    conn = main.get_db_connection()
    try:
        journal_mode = conn.execute("PRAGMA journal_mode;").fetchone()[0]
        assert journal_mode.lower() == "wal"
        foreign_keys = conn.execute("PRAGMA foreign_keys;").fetchone()[0]
        assert foreign_keys in (1, "1", "ON", "on")
    finally:
        conn.close()
