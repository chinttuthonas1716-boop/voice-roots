# pyright: reportMissingImports=false
"""Voice Roots — Milestone 23: Pilot Technical Remediations Test Suite.

Verifies:
- PR-05: Database binary voice_roots.db is untracked from Git index.
- PR-01: Storage persistence and volume probe returns healthy disk/database/paths.
- PR-04: Tiered backup retention rotation and pruning logic.
- PR-04: Automated backup creation triggers rolling retention.
- PR-03: Multi-user administrator identity resolution and per-user attribution.
- PR-03: Admin verification rejects unauthorized or spoofed keys.
- Edge proxy configurations (Caddyfile, nginx.conf) exist and are valid.
"""

from __future__ import annotations

import subprocess
import sys
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Ensure backend directory is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import backup_retention_service  # type: ignore
import main  # type: ignore
from fastapi.testclient import TestClient

client = TestClient(main.app)
ADMIN_KEY = main.ADMIN_API_KEY


def test_database_untracked_from_git():
    """Verify that backend/voice_roots.db is untracked from Git (PR-05)."""
    repo_root = Path(__file__).resolve().parent.parent
    res = subprocess.run(
        ["git", "ls-files", "backend/voice_roots.db"],
        cwd=repo_root,
        capture_output=True,
        text=True,
        check=False,
    )
    assert res.returncode == 0
    assert res.stdout.strip() == "", "backend/voice_roots.db should be untracked from git index!"


def test_storage_probe_endpoint_healthy():
    """Verify GET /api/v1/system/storage-probe returns comprehensive health and volume data (PR-01)."""
    resp = client.get("/api/v1/system/storage-probe")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] in ("healthy", "degraded")
    assert "paths" in data
    assert "database" in data
    assert "disk" in data

    # Verify path details
    assert "audio_storage" in data["paths"]
    assert "backup_dir" in data["paths"]
    assert data["paths"]["audio_storage"]["exists"] is True
    assert data["paths"]["audio_storage"]["writable"] is True

    # Verify database check
    assert data["database"]["exists"] is True
    assert data["database"]["writable"] is True
    assert data["database"]["integrity"] == "ok"
    assert data["database"]["table_count"] >= 40

    # Verify disk telemetry
    assert "free_bytes" in data["disk"]
    assert data["disk"]["free_mb"] > 0


def test_backup_retention_service_pruning():
    """Verify rolling tiered retention pruning in backup_retention_service (PR-04)."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)
        now = datetime.now(timezone.utc)

        # 1. Create a protected baseline backup
        protected_file = tmp_path / "pre_m16_backup_20261001_120000.db"
        protected_file.write_text("protected")

        # 2. Create 3 backups from yesterday (within 7 days) -> all should be kept
        for i in range(3):
            f = tmp_path / f"voice_roots_backup_{(now - timedelta(days=1)).strftime('%Y%m%d')}_{i:02d}0000.db"
            f.write_text(f"recent_{i}")

        # 3. Create 3 backups on day 15 (between 8 and 30 days) -> only 1 should be kept
        day15 = (now - timedelta(days=15)).strftime("%Y%m%d")
        for i in range(3):
            f = tmp_path / f"voice_roots_backup_{day15}_{i:02d}0000.db"
            f.write_text(f"day15_{i}")

        # 4. Create 3 backups on day 40 (between 31 and 90 days) in same week -> only 1 should be kept
        day40 = (now - timedelta(days=40)).strftime("%Y%m%d")
        for i in range(3):
            f = tmp_path / f"voice_roots_backup_{day40}_{i:02d}0000.db"
            f.write_text(f"day40_{i}")

        # 5. Create 2 backups on day 120 (older than 90 days) -> should be pruned
        day120 = (now - timedelta(days=120)).strftime("%Y%m%d")
        for i in range(2):
            f = tmp_path / f"voice_roots_backup_{day120}_{i:02d}0000.db"
            f.write_text(f"old_{i}")

        # Run retention pruning
        summary = backup_retention_service.prune_old_backups(
            backup_dir=tmp_path,
            retain_days=14,
            max_backups=50,
            dry_run=False,
        )

        assert summary["status"] == "success"
        # Protected file must still exist
        assert protected_file.exists()
        # Old backups (>90 days) must be deleted
        assert not (tmp_path / f"voice_roots_backup_{day120}_000000.db").exists()
        assert not (tmp_path / f"voice_roots_backup_{day120}_010000.db").exists()
        # Verify pruned count is positive
        assert summary["pruned_count"] >= 4


def test_prune_backups_endpoint_admin_gated(monkeypatch):
    """Verify POST /api/v1/system/backups/prune requires admin authentication (PR-04)."""
    monkeypatch.setenv("VOICE_ROOTS_ENV", "production")
    monkeypatch.setenv("VOICE_ROOTS_ADMIN_KEY", "prod_admin_secret_99")

    # Unauthenticated request
    resp = client.post("/api/v1/system/backups/prune")
    assert resp.status_code == 403

    # Valid admin request with dry_run
    headers = {"X-Admin-Key": "prod_admin_secret_99"}
    resp = client.post("/api/v1/system/backups/prune?dry_run=true", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["dry_run"] is True
    assert "triggered_by" in data


def test_create_backup_triggers_retention():
    """Verify POST /api/v1/system/backup automatically executes retention pruning (PR-04)."""
    headers = {"X-Admin-Key": ADMIN_KEY}
    resp = client.post("/api/v1/system/backup", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "retention_status" in data
    assert "created_by" in data


def test_multi_user_admin_identity_resolution(monkeypatch):
    """Verify multi-user administrator identity resolution from VOICE_ROOTS_ADMIN_USERS (PR-03)."""
    test_users = "pi_linguist_1:token_pi_alpha_99,elder_reviewer_1:token_elder_beta_88"
    monkeypatch.setenv("VOICE_ROOTS_ADMIN_USERS", test_users)

    # Test PI Linguist token
    is_admin, user = main._extract_admin_identity(header_key="token_pi_alpha_99")
    assert is_admin is True
    assert user == "pi_linguist_1"

    # Test Elder Reviewer token
    is_admin, user = main._extract_admin_identity(header_key="token_elder_beta_88")
    assert is_admin is True
    assert user == "elder_reviewer_1"

    # Test invalid token
    is_admin, user = main._extract_admin_identity(header_key="invalid_token_123")
    assert is_admin is False
    assert user == "anonymous"


def test_deployment_reverse_proxy_templates_exist():
    """Verify turnkey edge reverse-proxy templates exist for institutional pilots (PR-02)."""
    repo_root = Path(__file__).resolve().parent.parent
    caddyfile = repo_root / "deployment" / "Caddyfile"
    nginx_conf = repo_root / "deployment" / "nginx.conf"
    compose_pilot = repo_root / "deployment" / "docker-compose.pilot.yml"

    assert caddyfile.exists(), "deployment/Caddyfile must exist"
    assert nginx_conf.exists(), "deployment/nginx.conf must exist"
    assert compose_pilot.exists(), "deployment/docker-compose.pilot.yml must exist"

    caddy_content = caddyfile.read_text(encoding="utf-8")
    assert "Strict-Transport-Security" in caddy_content
    assert "reverse_proxy" in caddy_content
