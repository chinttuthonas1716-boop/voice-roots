"""Comprehensive Security Pass Test Suite (Task T3.5).

Validates:
1. Access-tier enforcement (OCAP boundaries: public, community, research, private, withdrawn)
2. Cryptographic signed-URL generation, HMAC validation, and timestamp expiration
3. Role-based access control (RBAC) across administrative and reviewer endpoints
4. Sliding-window rate limiter and HTTP 429 enforcement under burst conditions
5. Mandatory HTTP security headers (nosniff, DENY, CSP, Referrer-Policy)
"""

import os
import sqlite3
import sys
import time

import pytest
from fastapi.testclient import TestClient

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import auth_service  # noqa: E402
import security_service  # noqa: E402
from main import DB_PATH, app  # noqa: E402


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def auth_tokens():
    """Generate authenticated tokens for different roles."""
    admin_token = auth_service.create_access_token("admin_001", "superadmin", "admin@voiceroots.ai", "admin")
    reviewer_token = auth_service.create_access_token("rev_001", "elder_reviewer", "elder@voiceroots.ai", "reviewer")
    researcher_token = auth_service.create_access_token("res_001", "ling_researcher", "research@univ.edu", "researcher")
    contributor_token = auth_service.create_access_token("usr_001", "storyteller_ramesh", "ramesh@community.org", "contributor")
    other_user_token = auth_service.create_access_token("usr_002", "other_speaker", "other@community.org", "contributor")

    return {
        "admin": admin_token,
        "reviewer": reviewer_token,
        "researcher": researcher_token,
        "contributor": contributor_token,
        "other_user": other_user_token,
    }


@pytest.fixture
def seeded_audio_records():
    """Seed test audio files and database records across access tiers."""
    audio_dir = os.path.join(backend_dir, "storage", "audio")
    os.makedirs(audio_dir, exist_ok=True)

    records = {
        "public": "sec_test_public.wav",
        "community": "sec_test_community.wav",
        "research": "sec_test_research.wav",
        "private": "sec_test_private.wav",
        "withdrawn": "sec_test_withdrawn.wav",
    }

    # Create dummy wav files
    dummy_wav = b"RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x80>\x00\x00\x00}\x00\x00\x02\x00\x10\x00data\x00\x00\x00\x00"
    for filename in records.values():
        filepath = os.path.join(audio_dir, filename)
        with open(filepath, "wb") as f:
            f.write(dummy_wav)

    # Insert into database
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            INSERT INTO transcripts (
                uuid_id, title, audio_filename, audio_url, transcript_text, language,
                privacy_level, status, archived_at, contributor_name, created_at, updated_at
            ) VALUES
            ('sec-uuid-pub', 'Public Blessing', 'sec_test_public.wav', '/storage/audio/sec_test_public.wav', 'Public traditional blessing.', 'gondi', 'public', 'approved', NULL, 'Elder Lingaiah', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            ('sec-uuid-comm', 'Community Song', 'sec_test_community.wav', '/storage/audio/sec_test_community.wav', 'Sacred community song.', 'koya', 'community', 'approved', NULL, 'Elder Laxmi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            ('sec-uuid-res', 'Dialect Survey', 'sec_test_research.wav', '/storage/audio/sec_test_research.wav', 'Phonetic dialect survey.', 'santhali', 'research', 'approved', NULL, 'Dr. Murmu', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            ('sec-uuid-priv', 'Family Diary', 'sec_test_private.wav', '/storage/audio/sec_test_private.wav', 'Personal family diary.', 'lambadi', 'private', 'draft', NULL, 'storyteller_ramesh', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            ('sec-uuid-with', 'Revoked Lore', 'sec_test_withdrawn.wav', '/storage/audio/sec_test_withdrawn.wav', 'Revoked recording.', 'gondi', 'public', 'withdrawn', '2026-11-06T10:00:00Z', 'Former Speaker', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """
        )
        conn.commit()

    yield records

    # Cleanup seeded database records
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("DELETE FROM transcripts WHERE uuid_id LIKE 'sec-uuid-%'")
        conn.commit()


# ---------------------------------------------------------------------------
# 1. Access-Tier Enforcement Tests
# ---------------------------------------------------------------------------


def test_public_tier_accessible_to_anonymous(client, seeded_audio_records):
    """Verify public recordings can be streamed anonymously without credentials."""
    resp = client.get(f"/storage/audio/{seeded_audio_records['public']}")
    assert resp.status_code == 200
    assert resp.headers["content-type"] in ("audio/wav", "audio/x-wav")


def test_community_tier_blocks_anonymous_allows_authenticated(client, seeded_audio_records, auth_tokens):
    """Verify community recordings require authentication and reject anonymous requests."""
    # Anonymous request -> 403 Forbidden
    resp_anon = client.get(f"/storage/audio/{seeded_audio_records['community']}")
    assert resp_anon.status_code == 403
    assert "Community access tier requires an authenticated community member" in resp_anon.text

    # Authenticated member -> 200 OK
    resp_auth = client.get(
        f"/storage/audio/{seeded_audio_records['community']}",
        headers={"Authorization": f"Bearer {auth_tokens['contributor']}"},
    )
    assert resp_auth.status_code == 200


def test_research_tier_blocks_standard_contributor_allows_researcher(client, seeded_audio_records, auth_tokens):
    """Verify research recordings block ordinary contributors and permit verified researchers."""
    # Contributor token -> 403 Forbidden
    resp_contrib = client.get(
        f"/storage/audio/{seeded_audio_records['research']}",
        headers={"Authorization": f"Bearer {auth_tokens['contributor']}"},
    )
    assert resp_contrib.status_code == 403
    assert "Research tier requires verified researcher credentials" in resp_contrib.text

    # Researcher token -> 200 OK
    resp_res = client.get(
        f"/storage/audio/{seeded_audio_records['research']}",
        headers={"Authorization": f"Bearer {auth_tokens['researcher']}"},
    )
    assert resp_res.status_code == 200


def test_private_tier_blocks_unauthorized_allows_owner_and_admin(client, seeded_audio_records, auth_tokens):
    """Verify private recordings are accessible only by owner or administrator."""
    # Unrelated user -> 403 Forbidden
    resp_other = client.get(
        f"/storage/audio/{seeded_audio_records['private']}",
        headers={"Authorization": f"Bearer {auth_tokens['other_user']}"},
    )
    assert resp_other.status_code == 403
    assert "private under user controls" in resp_other.text

    # Owner -> 200 OK
    resp_owner = client.get(
        f"/storage/audio/{seeded_audio_records['private']}",
        headers={"Authorization": f"Bearer {auth_tokens['contributor']}"},
    )
    assert resp_owner.status_code == 200

    # Admin -> 200 OK
    resp_admin = client.get(
        f"/storage/audio/{seeded_audio_records['private']}",
        headers={"X-Admin-Key": "voice-roots-admin-key"},
    )
    assert resp_admin.status_code == 200


def test_withdrawn_consent_blocks_all_access(client, seeded_audio_records, auth_tokens):
    """Verify consent withdrawal permanently blocks streaming for all callers."""
    # Even admin must not bypass withdrawn consent (OCAP non-negotiable)
    resp = client.get(
        f"/storage/audio/{seeded_audio_records['withdrawn']}",
        headers={"X-Admin-Key": "voice-roots-admin-key"},
    )
    assert resp.status_code == 404
    assert "withdrawn under speaker consent" in resp.text


# ---------------------------------------------------------------------------
# 2. Cryptographic Signed URLs & Expiry Tests
# ---------------------------------------------------------------------------


def test_signed_audio_url_verification():
    """Verify security_service HMAC signed URL token generation and validation."""
    filename = "test_audio.wav"
    secret = b"test-secret-key-12345"
    signed_url = security_service.generate_signed_audio_url(
        filename=filename,
        expires_in=600,
        secret_key=secret,
    )
    assert f"/storage/audio/{filename}?expires=" in signed_url
    assert "&sig=" in signed_url

    # Parse query parameters
    query = signed_url.split("?")[1]
    params = dict(param.split("=") for param in query.split("&"))

    # Valid verification
    is_valid, msg = security_service.verify_signed_audio_token(
        filename=filename,
        expires=params["expires"],
        sig=params["sig"],
        secret_key=secret,
    )
    assert is_valid is True
    assert msg == "Valid signature"

    # Mismatched filename verification
    bad_fn_valid, bad_fn_msg = security_service.verify_signed_audio_token(
        filename="other_audio.wav",
        expires=params["expires"],
        sig=params["sig"],
        secret_key=secret,
    )
    assert bad_fn_valid is False
    assert "Invalid signature" in bad_fn_msg

    # Tampered signature
    tampered_valid, _ = security_service.verify_signed_audio_token(
        filename=filename,
        expires=params["expires"],
        sig="deadbeef" * 8,
        secret_key=secret,
    )
    assert tampered_valid is False

    # Expired timestamp verification
    now = time.time()
    expired_valid, expired_msg = security_service.verify_signed_audio_token(
        filename=filename,
        expires=int(now - 100),
        sig=params["sig"],
        secret_key=secret,
        current_time=now,
    )
    assert expired_valid is False
    assert "expired" in expired_msg.lower()


def test_signed_url_streaming_access_and_expiry(client, seeded_audio_records):
    """Verify signed URLs permit streaming of private files and reject expired signatures."""
    filename = seeded_audio_records["private"]

    # 1. Valid signed URL allows unauthenticated access to private recording
    valid_signed_url = security_service.generate_signed_audio_url(filename, expires_in=300)
    resp_valid = client.get(valid_signed_url)
    assert resp_valid.status_code == 200

    # 2. Expired signed URL rejected with 403 Forbidden
    expired_signed_url = security_service.generate_signed_audio_url(filename, expires_in=-10)
    resp_expired = client.get(expired_signed_url)
    assert resp_expired.status_code == 403
    assert "Signed URL validation failed" in resp_expired.text

    # 3. Tampered signature rejected with 403 Forbidden
    query = valid_signed_url.split("?")[1]
    params = dict(p.split("=") for p in query.split("&"))
    tampered_url = f"/storage/audio/{filename}?expires={params['expires']}&sig=tampered12345"
    resp_tampered = client.get(tampered_url)
    assert resp_tampered.status_code == 403


def test_signed_url_generation_endpoint(client, seeded_audio_records, auth_tokens):
    """Verify /api/v1/storage/signed-url/{filename} generates signed URLs for authorized callers."""
    filename = seeded_audio_records["private"]

    # Unauthorized caller -> 403 Forbidden
    resp_unauth = client.get(f"/api/v1/storage/signed-url/{filename}")
    assert resp_unauth.status_code == 403

    # Authorized owner -> 200 OK with signed_url
    resp_auth = client.get(
        f"/api/v1/storage/signed-url/{filename}?expires_in=1800",
        headers={"Authorization": f"Bearer {auth_tokens['contributor']}"},
    )
    assert resp_auth.status_code == 200
    data = resp_auth.json()
    assert "signed_url" in data
    assert data["expires_in"] == 1800
    assert "sig=" in data["signed_url"]


# ---------------------------------------------------------------------------
# 3. Role-Based Access Control (RBAC) Tests
# ---------------------------------------------------------------------------


def test_admin_endpoints_require_admin_role(client, auth_tokens):
    """Verify administrative endpoints reject non-admin users and require admin authorization."""
    # Attempting database restore with contributor token -> 403
    resp_restore = client.post(
        "/api/v1/system/restore",
        headers={"Authorization": f"Bearer {auth_tokens['contributor']}"},
        json={"backup_filename": "test.db", "dry_run": True},
    )
    assert resp_restore.status_code in (401, 403)

    # Attempting restricted audio export without credentials -> 403
    resp_export = client.post(
        "/api/v1/export/public-audio",
        headers={"Authorization": f"Bearer {auth_tokens['contributor']}"},
        json={"dry_run": True},
    )
    assert resp_export.status_code in (401, 403)


# ---------------------------------------------------------------------------
# 4. Rate Limiting Tests
# ---------------------------------------------------------------------------


def test_burst_rate_limiting_triggers_429(client):
    """Verify rapid request bursts trigger HTTP 429 Too Many Requests with telemetry headers."""
    # Using explicit test header to activate rate limiter during pytest
    headers = {"x-test-rate-limit": "1"}

    hit_429 = False
    last_response = None

    # Default auth limit is 30/min; send 35 rapid requests to trigger limiter
    for _ in range(40):
        resp = client.post(
            "/api/v1/auth/login",
            json={"username": "test", "password": "wrongpassword"},
            headers=headers,
        )
        if resp.status_code == 429:
            hit_429 = True
            last_response = resp
            break

    assert hit_429 is True
    assert last_response is not None
    assert "Retry-After" in last_response.headers
    assert "X-RateLimit-Limit" in last_response.headers
    assert last_response.headers.get("X-RateLimit-Remaining") == "0"
    data = last_response.json()
    assert data["error"] == "Too Many Requests"


# ---------------------------------------------------------------------------
# 5. Security Headers Tests
# ---------------------------------------------------------------------------


def test_mandatory_security_headers_present(client):
    """Verify mandatory defense-in-depth security headers are attached to all API responses."""
    resp = client.get("/health")
    assert resp.status_code == 200

    headers = resp.headers
    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert headers.get("X-Frame-Options") == "DENY"
    assert headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert headers.get("X-XSS-Protection") == "0"
    assert "Content-Security-Policy" in headers
    assert "default-src 'self'" in headers["Content-Security-Policy"]
    assert "camera=(), microphone=(self), geolocation=()" in headers.get("Permissions-Policy", "")
