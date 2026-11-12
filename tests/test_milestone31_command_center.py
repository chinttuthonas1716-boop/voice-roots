"""Voice Roots: Milestone 31 — Institutional Command Center Test Suite.
=============================================================================
Tests preservation telemetry, elder moderation queue with role clearance,
model evaluation & 1-click rollback, atomic SQLite backups, and security audit streams.
"""

import os
import sys

import pytest
from fastapi.testclient import TestClient

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from main import app  # noqa: E402


@pytest.fixture
def client():
    return TestClient(app)


def test_command_center_overview_health(client):
    """Verify command center top-level health, metrics, and zero-spend compliance."""
    resp = client.get("/api/v1/command-center/overview")
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["status"] == "healthy"
    assert "preservation_summary" in data
    summary = data["preservation_summary"]
    assert summary["registered_languages"] == 44
    assert summary["total_transcripts_indexed"] >= 1
    assert "total_cultural_stories" in summary
    assert "sacred_lore_shielded" in summary

    assert "active_production_model" in data
    assert "disaster_recovery" in data
    assert "security_governance" in data
    assert "$0.00" in data["security_governance"]["cloud_spend_target"]


def test_preservation_telemetry_dialects_and_audio(client):
    """Verify detailed preservation telemetry across languages and master audio protections."""
    resp = client.get("/api/v1/command-center/telemetry")
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["status"] == "success"
    assert data["total_audio_hours"] >= 0.0
    assert "15,000,000+" in data["indigenous_demographic_reach"]

    telemetry = data["language_telemetry"]
    assert len(telemetry) >= 1
    first_lang = telemetry[0]
    assert "language" in first_lang
    assert "transcripts" in first_lang
    assert "phonetic_transcription_coverage_pct" in first_lang

    protection = data["master_audio_protection"]
    assert "SHA-256" in protection["checksum_algorithm"]
    assert "Immutable" in protection["storage_mode"]


def test_elder_moderation_queue_and_clearance(client):
    """Verify elder moderation queue retrieval, role clearance enforcement, and approval."""
    # 1. Fetch moderation queue
    resp_q = client.get("/api/v1/command-center/moderation-queue?limit=10")
    assert resp_q.status_code == 200, resp_q.text
    q_data = resp_q.json()
    assert q_data["status"] == "success"
    assert "items" in q_data

    # 2. Attempt unauthorized moderation (regular contributor role) -> must return 403
    resp_unauth = client.post(
        "/api/v1/command-center/moderation/resolve",
        json={
            "item_type": "transcript",
            "item_id": "1",
            "decision": "APPROVE",
            "reviewer_name": "Unauthorized User",
            "reviewer_role": "contributor",
            "cultural_notes": "Attempted unauthorized bypass",
        },
    )
    assert resp_unauth.status_code == 403

    # 3. Authorized elder moderation
    resp_auth = client.post(
        "/api/v1/command-center/moderation/resolve",
        json={
            "item_type": "transcript",
            "item_id": "1",
            "decision": "APPROVE",
            "reviewer_name": "Clan Elder Kumuram",
            "reviewer_role": "elder",
            "cultural_notes": "Verified authentic oral phrasing and sacred clan attribution.",
        },
    )
    assert resp_auth.status_code == 200
    auth_data = resp_auth.json()
    assert auth_data["decision"] == "APPROVE"
    assert auth_data["moderator_role"] == "elder"


def test_model_evaluation_and_rollback(client):
    """Verify model performance matrix tracking and rollback execution."""
    resp_models = client.get("/api/v1/command-center/models")
    assert resp_models.status_code == 200, resp_models.text
    models_data = resp_models.json()
    assert models_data["status"] == "success"
    assert len(models_data["models"]) >= 1

    # Execute model rollback
    resp_rollback = client.post(
        "/api/v1/command-center/models/rollback",
        json={
            "target_model_id": "whisper-v2-gondi-finetuned",
            "switched_by": "System Admin",
            "reason": "Milestone 31 regression safety verification rollback test.",
        },
    )
    assert resp_rollback.status_code == 200, resp_rollback.text
    rb_data = resp_rollback.json()
    assert rb_data["status"] == "success"
    assert "production_model_id" in rb_data["rollback_event"]


def test_atomic_backup_creation_and_listing(client):
    """Verify atomic SQLite snapshot generation and backup catalog listing."""
    resp_backup = client.post(
        "/api/v1/command-center/backups/create",
        json={
            "reason": "Milestone 31 Disaster Recovery Test",
            "triggered_by": "System Admin",
        },
    )
    assert resp_backup.status_code == 200, resp_backup.text
    b_data = resp_backup.json()
    assert b_data["status"] == "success"
    assert b_data["backup_filename"].endswith(".db")
    assert b_data["size_bytes"] > 0
    assert len(b_data["sha256_checksum"]) == 64

    # List backups
    resp_list = client.get("/api/v1/command-center/backups")
    assert resp_list.status_code == 200, resp_list.text
    list_data = resp_list.json()
    assert list_data["status"] == "success"
    assert list_data["total_backups"] >= 1
    filenames = [b["filename"] for b in list_data["backups"]]
    assert b_data["backup_filename"] in filenames


def test_security_audit_stream(client):
    """Verify security audit event stream capturing administrative actions."""
    resp = client.get("/api/v1/command-center/audit-stream?limit=25")
    assert resp.status_code == 200, resp.text
    stream_data = resp.json()
    assert stream_data["status"] == "success"
    assert stream_data["total_events"] >= 1

    events = stream_data["events"]
    actions = {e["action"] for e in events}
    assert any("MODERATION" in a or "BACKUP" in a or "MODEL" in a for a in actions)
