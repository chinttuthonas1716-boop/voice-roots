"""Voice Roots: Unit & Integration Tests for Config & Security Basics (T1.6)
========================================================================
Validates:
1. Security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, etc.).
2. Sliding-window rate limiting on API endpoints with proper 429 and Retry-After headers.
3. Rate limit exemption for health and monitoring endpoints.
4. .env.example completeness and absence of leaked repository secrets.
"""

from __future__ import annotations

import os
import subprocess

import pytest
from fastapi.testclient import TestClient

from backend.main import _GLOBAL_RATE_LIMITER, app


@pytest.fixture(autouse=True)
def clean_rate_limiter():
    """Reset rate limiter state between tests."""
    _GLOBAL_RATE_LIMITER.clear()
    yield
    _GLOBAL_RATE_LIMITER.clear()


@pytest.fixture
def client():
    return TestClient(app)


# ============================================================================
# Security Headers Verification
# ============================================================================


def test_standard_security_headers_present_on_api_responses(client):
    """Every HTTP response includes hardening security headers."""
    response = client.get("/health")
    assert response.status_code == 200

    headers = response.headers
    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert headers.get("X-Frame-Options") == "DENY"
    assert headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert headers.get("X-XSS-Protection") == "0"
    assert "microphone=(self)" in headers.get("Permissions-Policy", "")
    assert headers.get("Cross-Origin-Opener-Policy") == "same-origin"
    assert "default-src 'self'" in headers.get("Content-Security-Policy", "")


def test_strict_transport_security_on_https_or_forwarded_proto(client):
    """HSTS header is attached when request is secure or forwarded from SSL terminator."""
    # Plain HTTP: no HSTS
    res_http = client.get("/health")
    assert "Strict-Transport-Security" not in res_http.headers

    # Forwarded HTTPS (Render reverse-proxy standard)
    res_https = client.get("/health", headers={"x-forwarded-proto": "https"})
    assert "Strict-Transport-Security" in res_https.headers
    assert "max-age=31536000" in res_https.headers["Strict-Transport-Security"]


# ============================================================================
# Sliding-Window Rate Limiting Verification
# ============================================================================


def test_sliding_window_rate_limiter_permits_within_quota(client):
    """Requests under quota succeed and carry rate limit telemetry headers."""
    # Send request with testing flag
    response = client.get("/api/languages", headers={"x-test-rate-limit": "true"})
    assert response.status_code == 200
    assert "X-RateLimit-Limit" in response.headers
    assert "X-RateLimit-Remaining" in response.headers
    assert "X-RateLimit-Reset" in response.headers


def test_rate_limiter_blocks_excessive_requests_with_429(client, monkeypatch):
    """Exceeding quota triggers HTTP 429 Too Many Requests with Retry-After header."""
    monkeypatch.setenv("API_RATE_LIMIT_PER_MINUTE", "5")

    # Send 5 permitted requests
    for _ in range(5):
        res = client.get("/api/languages", headers={"x-test-rate-limit": "true"})
        assert res.status_code == 200

    # 6th request must be rejected
    rejected = client.get("/api/languages", headers={"x-test-rate-limit": "true"})
    assert rejected.status_code == 429
    assert "Rate limit exceeded" in rejected.json()["detail"]
    assert "Retry-After" in rejected.headers
    assert rejected.headers["X-RateLimit-Remaining"] == "0"
    assert int(rejected.headers["Retry-After"]) >= 1


def test_auth_endpoints_have_stricter_rate_limits(client, monkeypatch):
    """Authentication routes enforce dedicated stricter rate limits to prevent brute force."""
    monkeypatch.setenv("AUTH_RATE_LIMIT_PER_MINUTE", "3")

    for _ in range(3):
        res = client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "fake", "password": "wrong"},
            headers={"x-test-rate-limit": "true"},
        )
        assert res.status_code in (400, 401)  # Invalid credentials, not throttled yet

    # 4th request exceeds auth limit
    throttled = client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "fake", "password": "wrong"},
        headers={"x-test-rate-limit": "true"},
    )
    assert throttled.status_code == 429
    assert "Rate limit exceeded" in throttled.json()["detail"]


def test_health_endpoints_are_exempt_from_rate_limiting(client, monkeypatch):
    """Health check routes must never be throttled even under high traffic."""
    monkeypatch.setenv("API_RATE_LIMIT_PER_MINUTE", "2")

    for _ in range(10):
        res = client.get("/health", headers={"x-test-rate-limit": "true"})
        assert res.status_code == 200


# ============================================================================
# Configuration & Secret Leak Prevention
# ============================================================================


def test_env_example_contains_all_production_keys():
    """Verify .env.example contains all required production infrastructure keys."""
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env_example_path = os.path.join(repo_root, ".env.example")
    assert os.path.exists(env_example_path)

    with open(env_example_path, encoding="utf-8") as f:
        content = f.read()

    required_keys = [
        "DATABASE_URL",
        "CORS_ORIGINS",
        "SECRET_KEY",
        "R2_ENDPOINT_URL",
        "R2_ACCESS_KEY_ID",
        "R2_SECRET_ACCESS_KEY",
        "R2_BUCKET",
        "API_BASE_URL",
        "API_RATE_LIMIT_PER_MINUTE",
        "AUTH_RATE_LIMIT_PER_MINUTE",
    ]

    for key in required_keys:
        assert key in content, f"Missing required configuration key {key} in .env.example"


def test_git_tracked_files_do_not_contain_live_secrets():
    """Ensure no real .env or credential files are committed to git."""
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    res = subprocess.run(
        ["git", "ls-files"],
        cwd=repo_root,
        capture_output=True,
        text=True,
    )
    assert res.returncode == 0
    files = res.stdout.splitlines()

    for filename in files:
        # No actual .env files other than .env.example
        if os.path.basename(filename).startswith(".env") and not filename.endswith(".example"):
            pytest.fail(f"Found tracked environment secret file: {filename}")
        if filename.endswith((".pem", ".key", ".p12", ".keystore")):
            pytest.fail(f"Found tracked private key / keystore file: {filename}")
