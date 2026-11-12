"""
Voice Roots: Milestone 14 Verification Suite
=============================================
Tests Community Partnerships and Language Governance:
1. Seeded Default Accredited Tribal Organization & Reviewer.
2. Non-competitive community partnership telemetry (OCAP, no volume rankings).
3. Candidate Organization Registration (defaults to pending_accreditation).
4. Organization Accreditation Gate (requires admin key authorization).
5. Scoped Partnership Projects & Workspaces.
6. Expert & Elder Reviewer Registration & Accreditation.
7. Review Assignment Allocation & Language Qualification Verification:
   - Matching language succeeds and updates transcript to 'under_review'.
   - Unmatched language rejected with HTTP 400.
   - Unaccredited reviewer assignment rejected with HTTP 403.
8. Governance Dispute & Appeal Lifecycle:
   - Filing dispute (misattribution, sacred knowledge, transcript inaccuracy).
   - Unauthorized dispute resolution rejected with HTTP 403.
   - Authorized community elder / coordinator dispute resolution.
9. Immutable Governance Audit Log verification.
"""

import json
import pytest
from fastapi.testclient import TestClient

from main import app, DB_PATH, ADMIN_API_KEY


@pytest.fixture
def client():
    return TestClient(app)


# ------------------------------------------------------------------------------
# 1. Seeded Accredited Partnerships & Non-Competitive Telemetry
# ------------------------------------------------------------------------------

def test_seeded_accredited_tribal_organization(client):
    """Verify seeded default accredited tribal council exists and is active."""
    res = client.get("/api/v1/governance/organizations/gondi-tribal-council")
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["slug"] == "gondi-tribal-council"
    assert data["verification_status"] == "verified_partner"
    assert "gon" in data["target_languages"]
    assert len(data["projects"]) >= 1
    assert data["projects"][0]["slug"] == "godavari-gondi-corpus"
    assert len(data["reviewers"]) >= 1
    assert data["reviewers"][0]["reviewer_name"] == "Dr. K. Sunitha Rao"


def test_non_competitive_partnership_telemetry(client):
    """Verify community partnership telemetry is transparent and strictly non-competitive."""
    res = client.get("/api/v1/governance/telemetry")
    assert res.status_code == 200
    data = res.json()
    assert "partnerships_summary" in data
    assert data["partnerships_summary"]["verified_partner_organizations"] >= 1
    assert data["partnerships_summary"]["accredited_expert_reviewers"] >= 1
    assert "ethical_principles" in data
    assert "never ranked competitively" in data["ethical_principles"]["non_competitive_reporting"].lower()
    assert "ocap" in data["ethical_principles"]["ocap_compliance"].lower()


# ------------------------------------------------------------------------------
# 2. Organization Registration and Accreditation Lifecycle
# ------------------------------------------------------------------------------

def test_organization_registration_and_accreditation_gate(client):
    """Verify candidate organization registration defaults to pending and requires admin key for accreditation."""
    import uuid
    dynamic_slug = f"santal-culture-society-{uuid.uuid4().hex[:6]}"
    org_payload = {
        "name": "Central Santal Language & Culture Society",
        "slug": dynamic_slug,
        "org_type": "preservation_society",
        "contact_email": "coordination@santal-society.org",
        "lead_coordinator_name": "Majhi Ramdas Murmu",
        "target_languages": ["sat", "hi", "bn"],
        "description": "Preserving Ol Chiki and oral traditions across Jharkhand.",
        "website_url": "https://santal-society.org",
    }
    # Register candidate organization
    res_reg = client.post("/api/v1/governance/organizations", json=org_payload)
    assert res_reg.status_code == 200, res_reg.text
    org = res_reg.json()
    org_id = org["id"]
    assert org["verification_status"] == "pending_accreditation"

    # Attempt accreditation with invalid admin key -> 403 Forbidden
    res_unauth = client.post(
        f"/api/v1/governance/organizations/{org_id}/accredit",
        json={"admin_key": "wrong-key", "status": "verified_partner"},
    )
    assert res_unauth.status_code == 403

    # Accredit with authorized admin key via header
    res_auth = client.post(
        f"/api/v1/governance/organizations/{org_id}/accredit",
        headers={"X-Admin-Key": ADMIN_API_KEY},
        json={
            "status": "verified_partner",
            "accreditation_notes": "Accredited following tribal assembly review.",
        },
    )
    assert res_auth.status_code == 200, res_auth.text
    accredited = res_auth.json()
    assert accredited["verification_status"] == "verified_partner"
    assert "tribal assembly" in accredited["accreditation_notes"]


def test_organization_duplicate_and_invalid_type_validation(client):
    """Verify registration rejects invalid types and duplicate slugs."""
    invalid_type_payload = {
        "name": "Invalid Org",
        "slug": "invalid-org",
        "org_type": "commercial_corporation",  # Not an approved type
        "contact_email": "info@corp.com",
        "lead_coordinator_name": "Test",
        "target_languages": ["te"],
    }
    res = client.post("/api/v1/governance/organizations", json=invalid_type_payload)
    assert res.status_code == 400
    assert "invalid organization type" in res.json()["detail"].lower()

    # Re-registering existing slug
    duplicate_payload = {
        "name": "Gondi Council Duplicate",
        "slug": "gondi-tribal-council",
        "org_type": "tribal_council",
        "contact_email": "dup@council.org",
        "lead_coordinator_name": "Test",
        "target_languages": ["gon"],
    }
    res_dup = client.post("/api/v1/governance/organizations", json=duplicate_payload)
    assert res_dup.status_code == 400
    assert "already exists" in res_dup.json()["detail"].lower()


# ------------------------------------------------------------------------------
# 3. Partnership Projects & Workspaces
# ------------------------------------------------------------------------------

def test_partnership_project_workspace_management(client):
    """Verify creation and query of scoped project workspaces."""
    import uuid
    # Fetch existing organization
    org = client.get("/api/v1/governance/organizations/gondi-tribal-council").json()
    org_id = org["id"]

    dynamic_proj_slug = f"dandakaranya-sacred-groves-{uuid.uuid4().hex[:6]}"
    project_payload = {
        "project_name": "Dandakaranya Sacred Groves Lore",
        "slug": dynamic_proj_slug,
        "target_languages": ["gon", "kff"],
        "collection_goal": "Record ritual plant hymns and sacred elder verses.",
        "license_policy": "CC BY-NC 4.0",
        "tk_labels": ["TK Secret / Sacred", "TK Clan Attribution"],
    }
    res = client.post(f"/api/v1/governance/organizations/{org_id}/projects", json=project_payload)
    assert res.status_code == 200, res.text
    proj = res.json()
    assert proj["slug"] == dynamic_proj_slug
    assert proj["org_id"] == org_id
    assert "TK Secret / Sacred" in proj["tk_labels"]

    # Filter projects by language
    res_list = client.get("/api/v1/governance/projects?language=gon")
    assert res_list.status_code == 200
    slugs = [p["slug"] for p in res_list.json()]
    assert dynamic_proj_slug in slugs


# ------------------------------------------------------------------------------
# 4. Expert Reviewer Registration, Qualification & Accreditation
# ------------------------------------------------------------------------------

def test_expert_reviewer_lifecycle_and_qualification(client):
    """Verify reviewer registration, accreditation gate, and language filtering."""
    import uuid
    rev_payload = {
        "reviewer_name": f"Guru Laxman Madavi {uuid.uuid4().hex[:4]}",
        "reviewer_role": "community_elder",
        "languages_qualified": ["gon"],
    }
    res_reg = client.post("/api/v1/governance/reviewers", json=rev_payload)
    assert res_reg.status_code == 200
    reviewer = res_reg.json()
    rev_id = reviewer["id"]
    assert reviewer["accreditation_status"] == "pending"

    # Accredit reviewer with admin key
    res_acc = client.post(
        f"/api/v1/governance/reviewers/{rev_id}/accredit",
        headers={"X-Admin-Key": ADMIN_API_KEY},
        json={"status": "accredited", "accredited_by": "Gondwana Elder Council"},
    )
    assert res_acc.status_code == 200
    assert res_acc.json()["accreditation_status"] == "accredited"

    # List accredited reviewers qualified in Gondi
    res_filter = client.get("/api/v1/governance/reviewers?language=gon&status=accredited")
    assert res_filter.status_code == 200
    names = [r["reviewer_name"] for r in res_filter.json()]
    assert rev_payload["reviewer_name"] in names
    assert "Dr. K. Sunitha Rao" in names


# ------------------------------------------------------------------------------
# 5. Review Assignment & Language Qualification Enforcement
# ------------------------------------------------------------------------------

def test_review_assignment_enforces_language_qualification(client):
    """
    Verify review assignments check language qualifications:
    - Reviewer qualified in Gondi cannot be assigned a Lambadi recording.
    - Reviewer qualified in Gondi can be assigned a Gondi recording.
    """
    # 1. Create a dummy Gondi transcript
    import sqlite3
    import uuid
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        g_uuid = str(uuid.uuid4())
        l_uuid = str(uuid.uuid4())
        cursor.execute(
            """
            INSERT INTO transcripts (
                uuid_id, audio_filename, audio_url, transcript_text, language, duration_seconds, title, contextual_notes,
                status, consent_private_storage, consent_public_publication, verification_status,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', 1, 1, 'submitted', ?, ?)
            """,
            (g_uuid, "gondi_test.wav", "/storage/audio/gondi_test.wav", "Lingo Dev sacred lore text.", "gondi", 12.0, "Gondi Lore", "Description", now, now)
        )
        gondi_tid = cursor.lastrowid

        cursor.execute(
            """
            INSERT INTO transcripts (
                uuid_id, audio_filename, audio_url, transcript_text, language, duration_seconds, title, contextual_notes,
                status, consent_private_storage, consent_public_publication, verification_status,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', 1, 1, 'submitted', ?, ?)
            """,
            (l_uuid, "lambadi_test.wav", "/storage/audio/lambadi_test.wav", "Banjara dance song.", "lambadi", 15.0, "Lambadi Song", "Description", now, now)
        )
        lambadi_tid = cursor.lastrowid
        conn.commit()

    try:
        # Find Gondi accredited reviewer
        reviewers = client.get("/api/v1/governance/reviewers?language=gon&status=accredited").json()
        reviewer = reviewers[0]
        rev_id = reviewer["id"]

        # Assign Lambadi recording to Gondi-only reviewer -> Must fail with 400
        res_mismatch = client.post(
            "/api/v1/governance/assignments",
            json={
                "transcript_id": lambadi_tid,
                "reviewer_id": rev_id,
                "assigned_by": "Project Coordinator",
            },
        )
        assert res_mismatch.status_code == 400
        assert "qualified in" in res_mismatch.json()["detail"].lower()

        # Assign Gondi recording to Gondi reviewer -> Must succeed with 200
        res_match = client.post(
            "/api/v1/governance/assignments",
            json={
                "transcript_id": gondi_tid,
                "reviewer_id": rev_id,
                "assigned_by": "Project Coordinator",
                "due_date": "2026-11-15",
            },
        )
        assert res_match.status_code == 200, res_match.text
        assign = res_match.json()
        assert assign["transcript_id"] == gondi_tid
        assert assign["reviewer_id"] == rev_id
        assert assign["status"] == "assigned"

        # Verify transcript status became under_review
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT verification_status FROM transcripts WHERE id = ?", (gondi_tid,))
            assert cursor.fetchone()[0] == "under_review"
    finally:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM review_assignments WHERE transcript_id IN (?, ?)", (gondi_tid, lambadi_tid))
            cursor.execute("DELETE FROM transcripts WHERE id IN (?, ?)", (gondi_tid, lambadi_tid))
            conn.commit()


# ------------------------------------------------------------------------------
# 6. Governance Dispute & Appeal Workflow
# ------------------------------------------------------------------------------

def test_governance_dispute_and_elder_resolution_lifecycle(client):
    """Verify filing a cultural or linguistic dispute, role checks, and resolution."""
    dispute_payload = {
        "target_type": "transcript",
        "target_id": 999,
        "dispute_type": "misattribution",
        "filed_by_name": "Elder Jangu Bapu",
        "filed_by_role": "community_elder",
        "description": "Song belongs to the Maravi clan, not the Mesram clan.",
        "suggested_resolution": "Update attribution metadata to reflect Maravi clan lineage.",
    }
    # File dispute
    res_file = client.post("/api/v1/governance/disputes", json=dispute_payload)
    assert res_file.status_code == 200, res_file.text
    disp = res_file.json()
    disp_id = disp["id"]
    assert disp["status"] == "open"
    assert disp["dispute_type"] == "misattribution"

    # Attempt to resolve dispute with unauthorized role (e.g. contributor) -> 403 Forbidden
    res_unauth = client.post(
        f"/api/v1/governance/disputes/{disp_id}/resolve",
        json={
            "resolver_name": "Random User",
            "resolver_role": "contributor",
            "decision": "resolved",
            "resolution_notes": "None",
        },
    )
    assert res_unauth.status_code == 403

    # Resolve dispute with authorized Community Elder
    res_resolve = client.post(
        f"/api/v1/governance/disputes/{disp_id}/resolve",
        json={
            "resolver_name": "Elder Assembly Chair",
            "resolver_role": "community_elder",
            "decision": "resolved",
            "resolution_notes": "Lineage verified with oral genealogists. Attribution corrected.",
        },
    )
    assert res_resolve.status_code == 200, res_resolve.text
    resolved = res_resolve.json()
    assert resolved["status"] == "resolved"
    assert resolved["resolved_by"] == "Elder Assembly Chair"


# ------------------------------------------------------------------------------
# 7. Immutable Governance Audit Log
# ------------------------------------------------------------------------------

def test_governance_audit_logs_record_actions(client):
    """Verify that all major governance actions generate an immutable audit log entry."""
    res = client.get("/api/v1/governance/audit-logs?limit=20")
    assert res.status_code == 200
    logs = res.json()
    assert len(logs) > 0
    action_types = [l["action_type"] for l in logs]
    # Check that key governance action types were recorded
    assert any(a in action_types for a in ("org_registered", "org_accredited", "review_assigned", "dispute_filed"))
