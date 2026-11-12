"""Tests for Voice Roots Authentication, JWT Session Management, and RBAC."""

import os
import sys
from pathlib import Path
from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import auth_service  # noqa: E402
from main import app, DB_PATH  # noqa: E402

client = TestClient(app)


def test_default_seeded_accounts_available():
    """Verify default seeded institutional, elder, and worker accounts can authenticate."""
    # 1. Admin login
    res_admin = client.post(
        "/api/v1/auth/login",
        json={"identifier": "admin@voiceroots.ai", "password": "VoiceRootsAdmin2026!"},
    )
    assert res_admin.status_code == 200
    data_admin = res_admin.json()["data"]
    assert data_admin["role"] == "admin"
    assert "access_token" in data_admin
    assert data_admin["token_type"] == "bearer"

    # 2. Researcher login
    res_res = client.post(
        "/api/v1/auth/login",
        json={"identifier": "researcher@ciil.res.in", "password": "ResearchScholar2026!"},
    )
    assert res_res.status_code == 200
    assert res_res.json()["data"]["role"] == "researcher"

    # 3. Reviewer login
    res_rev = client.post(
        "/api/v1/auth/login",
        json={"identifier": "elder.reviewer@gondi.org", "password": "ElderReviewer2026!"},
    )
    assert res_rev.status_code == 200
    assert res_rev.json()["data"]["role"] == "reviewer"

    # 4. Field worker login
    res_wrk = client.post(
        "/api/v1/auth/login",
        json={"identifier": "field.worker@voiceroots.org", "password": "preservation2026"},
    )
    assert res_wrk.status_code == 200
    assert res_wrk.json()["data"]["role"] == "contributor"


def test_user_registration_and_login_lifecycle():
    """Verify new user registration, token issuance, and login flow."""
    unique_user = f"tester_{os.urandom(4).hex()}"
    email = f"{unique_user}@example.org"
    password = "SecurePassword2026!"

    # 1. Register
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "username": unique_user,
            "email": email,
            "password": password,
            "full_name": "Test Contributor User",
            "role": "contributor",
            "bio": "Linguistic documentation volunteer",
        },
    )
    assert reg_res.status_code == 201
    reg_data = reg_res.json()["data"]
    assert reg_data["username"] == unique_user
    assert reg_data["email"] == email
    assert reg_data["role"] == "contributor"
    assert "access_token" in reg_data
    assert "password" not in reg_data
    assert "hashed_password" not in reg_data

    # 2. Login with email
    login_res = client.post(
        "/api/v1/auth/login",
        json={"identifier": email, "password": password},
    )
    assert login_res.status_code == 200
    token = login_res.json()["data"]["access_token"]

    # 3. Access /api/v1/auth/me
    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    user_me = me_res.json()["user"]
    assert user_me["username"] == unique_user
    assert user_me["email"] == email
    assert "hashed_password" not in user_me


def test_login_invalid_credentials_rejected():
    """Verify wrong password or unknown user returns 401."""
    res_wrong_pw = client.post(
        "/api/v1/auth/login",
        json={"identifier": "admin@voiceroots.ai", "password": "WrongPassword999!"},
    )
    assert res_wrong_pw.status_code == 401
    assert "Invalid credentials" in res_wrong_pw.json()["detail"]

    res_unknown = client.post(
        "/api/v1/auth/login",
        json={"identifier": "nonexistent@voiceroots.ai", "password": "AnyPassword!"},
    )
    assert res_unknown.status_code == 401


def test_duplicate_registration_rejected():
    """Verify duplicate username or email returns 400 Bad Request."""
    res = client.post(
        "/api/v1/auth/register",
        json={
            "username": "admin",
            "email": "different_admin@example.org",
            "password": "Password123!",
            "full_name": "Duplicate Admin",
        },
    )
    assert res.status_code == 400
    assert "already taken" in res.json()["detail"]


def test_auth_me_missing_or_invalid_token():
    """Verify /api/v1/auth/me rejects missing or tampered bearer tokens."""
    # Missing token
    res_no_tok = client.get("/api/v1/auth/me")
    assert res_no_tok.status_code == 401

    # Tampered token
    res_bad_tok = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer bad.token.here"},
    )
    assert res_bad_tok.status_code == 401


def test_rbac_admin_protected_endpoints():
    """Verify admin JWT can list all users while contributor JWT is blocked with 403."""
    # 1. Login as admin
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"identifier": "admin", "password": "VoiceRootsAdmin2026!"},
    ).json()["data"]
    admin_token = admin_login["access_token"]

    # 2. Login as field_worker
    worker_login = client.post(
        "/api/v1/auth/login",
        json={"identifier": "field_worker", "password": "preservation2026"},
    ).json()["data"]
    worker_token = worker_login["access_token"]

    # 3. Admin lists users
    res_admin_users = client.get(
        "/api/v1/auth/users",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_admin_users.status_code == 200
    assert res_admin_users.json()["total_users"] >= 4

    # 4. Worker blocked from listing users
    res_worker_users = client.get(
        "/api/v1/auth/users",
        headers={"Authorization": f"Bearer {worker_token}"},
    )
    assert res_worker_users.status_code == 403


def test_auth_logout_endpoint():
    """Verify logout endpoint returns success."""
    res = client.post("/api/v1/auth/logout")
    assert res.status_code == 200
    assert res.json()["status"] == "success"
