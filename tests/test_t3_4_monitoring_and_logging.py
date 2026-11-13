"""Tests for Task T3.4 – Production Monitoring, Structured Logging, and Error Tracking.

Covers:
1. Standard health check endpoint (/health)
2. Deep observability health probe (/health/deep and /api/v1/health/deep)
3. Distributed tracing and X-Request-ID header propagation
4. Structured JSON log formatter (JSONLogFormatter)
5. Sentry error tracking initialization and graceful fallback
"""

import json
import logging
import os
import sys
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import monitoring_service  # noqa: E402
from main import app  # noqa: E402


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_standard_health_check(client):
    """Verify standard /health endpoint returns HTTP 200 and baseline system status."""
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] in ("healthy", "degraded")
    assert data["app"] == "Voice Roots"
    assert "database" in data
    assert "database_status" in data


def test_deep_health_check(client):
    """Verify deep health probe (/health/deep) returns detailed subsystems diagnostics."""
    resp = client.get("/health/deep")
    assert resp.status_code in (200, 503)
    data = resp.json()
    assert "status" in data
    assert "timestamp" in data
    assert "checks" in data
    assert "database" in data["checks"]
    assert "storage" in data["checks"]
    assert "observability" in data["checks"]
    assert "metrics" in data
    assert "disk" in data["metrics"]


def test_deep_health_check_api_prefix(client):
    """Verify deep health probe is also reachable at /api/v1/health/deep."""
    resp = client.get("/api/v1/health/deep")
    assert resp.status_code in (200, 503)
    data = resp.json()
    assert data["app"] == "Voice Roots"
    assert "checks" in data


def test_request_id_generation_and_propagation(client):
    """Verify X-Request-ID is automatically generated and returned on all API responses."""
    resp = client.get("/health")
    assert resp.status_code == 200
    assert "X-Request-ID" in resp.headers
    req_id = resp.headers["X-Request-ID"]
    assert req_id.startswith("req_")


def test_custom_request_id_preservation(client):
    """Verify custom X-Request-ID provided by client is preserved through the response pipeline."""
    custom_id = "req_custom_trace_987654321"
    resp = client.get("/health", headers={"X-Request-ID": custom_id})
    assert resp.status_code == 200
    assert resp.headers.get("X-Request-ID") == custom_id


def test_structured_json_log_formatter():
    """Verify JSONLogFormatter serializes records into valid JSON with expected telemetry attributes."""
    formatter = monitoring_service.JSONLogFormatter()
    record = logging.LogRecord(
        name="voice_roots.test",
        level=logging.INFO,
        pathname="test.py",
        lineno=10,
        msg="Test request processed",
        args=(),
        exc_info=None,
    )
    # Attach telemetry attributes
    record.request_id = "req_test_123"
    record.method = "POST"
    record.path = "/api/v1/transcripts/upload"
    record.status_code = 200
    record.duration_ms = 45.67
    record.client_ip = "192.168.1.100"

    formatted_str = formatter.format(record)
    parsed = json.loads(formatted_str)

    assert parsed["level"] == "INFO"
    assert parsed["logger"] == "voice_roots.test"
    assert parsed["message"] == "Test request processed"
    assert parsed["request_id"] == "req_test_123"
    assert parsed["method"] == "POST"
    assert parsed["path"] == "/api/v1/transcripts/upload"
    assert parsed["status_code"] == 200
    assert parsed["duration_ms"] == 45.67
    assert parsed["client_ip"] == "192.168.1.100"
    assert "timestamp" in parsed


def test_structured_json_log_formatter_exception():
    """Verify JSONLogFormatter properly formats exception tracebacks."""
    formatter = monitoring_service.JSONLogFormatter()
    try:
        raise ValueError("Simulated pipeline failure")
    except ValueError:
        exc_info = sys.exc_info()

    record = logging.LogRecord(
        name="voice_roots.test",
        level=logging.ERROR,
        pathname="test.py",
        lineno=25,
        msg="Critical error occurred",
        args=(),
        exc_info=exc_info,
    )
    formatted_str = formatter.format(record)
    parsed = json.loads(formatted_str)

    assert parsed["level"] == "ERROR"
    assert "exception" in parsed
    assert "ValueError: Simulated pipeline failure" in parsed["exception"]


def test_error_tracking_disabled_when_dsn_absent():
    """Verify init_error_tracking returns clean disabled state when SENTRY_DSN is absent."""
    with patch.dict(os.environ, {}, clear=True):
        status = monitoring_service.init_error_tracking()
        assert status["enabled"] is False
        assert status["provider"] == "none"


def test_error_tracking_graceful_when_sentry_sdk_uninstalled():
    """Verify init_error_tracking gracefully falls back if sentry-sdk package is not available."""
    with (
        patch.dict(os.environ, {"SENTRY_DSN": "https://examplePublicKey@o0.ingest.sentry.io/0"}),
        patch.dict(sys.modules, {"sentry_sdk": None}),
    ):
        status = monitoring_service.init_error_tracking()
        assert status["enabled"] is False
        assert status["provider"] == "sentry"
        assert "error" in status
