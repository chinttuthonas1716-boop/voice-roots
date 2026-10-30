"""
Voice Roots: Community Partnerships and Language Governance Service
===================================================================
Manages verified community partnerships, organization profiles, accredited
expert/elder reviewers, project workspaces, review assignments, formal dispute
resolution, immutable audit trails, and OCAP data governance protocols.
"""

from __future__ import annotations

import json
import logging
import os
import sqlite3
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

VALID_ORG_TYPES = {
    "tribal_council",
    "preservation_society",
    "university_research",
    "cultural_ngo",
    "language_committee",
    "indigenous_academy",
}

VALID_REVIEWER_ROLES = {
    "community_elder",
    "linguist",
    "native_speaker_reviewer",
    "project_coordinator",
    "moderator",
}

VALID_DISPUTE_TYPES = {
    "misattribution",
    "inaccurate_transcription",
    "sacred_knowledge_leak",
    "unauthorized_dialect",
    "elder_disagreement",
}


def get_db_path() -> str:
    return os.environ.get(
        "VOICE_ROOTS_DB_PATH",
        os.path.join(os.path.dirname(__file__), "voice_roots.db")
    )


def init_governance_tables(db_path: Optional[str] = None):
    """Initialize governance and partnership schema tables if not existing."""
    target_db = db_path or get_db_path()
    with sqlite3.connect(target_db) as conn:
        cursor = conn.cursor()

        # 1. Partner Organizations
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS organizations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slug TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                org_type TEXT NOT NULL,
                description TEXT,
                website_url TEXT,
                contact_email TEXT NOT NULL,
                lead_coordinator_name TEXT NOT NULL,
                target_languages TEXT NOT NULL, -- JSON array of language codes
                verification_status TEXT NOT NULL DEFAULT 'pending_accreditation', -- 'verified_partner', 'pending_accreditation', 'suspended'
                accreditation_notes TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(verification_status)")

        # 2. Partnership Projects / Workspaces
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS partnership_projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                org_id INTEGER NOT NULL,
                project_name TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                target_languages TEXT NOT NULL, -- JSON array
                collection_goal TEXT,
                license_policy TEXT NOT NULL DEFAULT 'CC BY-NC 4.0',
                tk_labels TEXT, -- JSON array of Traditional Knowledge labels
                status TEXT NOT NULL DEFAULT 'active', -- 'active', 'review_phase', 'completed', 'archived'
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
            )
            """
        )
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_projects_org ON partnership_projects(org_id)")

        # 3. Accredited Expert & Elder Reviewers
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS expert_reviewers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                reviewer_name TEXT NOT NULL,
                reviewer_role TEXT NOT NULL,
                org_id INTEGER,
                languages_qualified TEXT NOT NULL, -- JSON array of language codes
                accreditation_status TEXT NOT NULL DEFAULT 'pending', -- 'accredited', 'pending', 'revoked'
                accredited_by TEXT,
                accredited_at TEXT,
                total_reviews_completed INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE SET NULL
            )
            """
        )
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_reviewers_status ON expert_reviewers(accreditation_status)")

        # 4. Review Assignments
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS review_assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                transcript_id INTEGER NOT NULL,
                reviewer_id INTEGER NOT NULL,
                assigned_by TEXT NOT NULL,
                project_id INTEGER,
                status TEXT NOT NULL DEFAULT 'assigned', -- 'assigned', 'in_progress', 'completed', 'reassigned'
                due_date TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (transcript_id) REFERENCES transcripts(id) ON DELETE CASCADE,
                FOREIGN KEY (reviewer_id) REFERENCES expert_reviewers(id) ON DELETE CASCADE
            )
            """
        )
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_assignments_transcript ON review_assignments(transcript_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_assignments_reviewer ON review_assignments(reviewer_id)")

        # 5. Governance Disputes & Appeals
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS governance_disputes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                target_type TEXT NOT NULL, -- 'transcript', 'translation', 'publication', 'attribution'
                target_id INTEGER NOT NULL,
                dispute_type TEXT NOT NULL,
                filed_by_name TEXT NOT NULL,
                filed_by_role TEXT NOT NULL,
                description TEXT NOT NULL,
                suggested_resolution TEXT,
                status TEXT NOT NULL DEFAULT 'open', -- 'open', 'under_elder_review', 'resolved', 'dismissed'
                resolved_by TEXT,
                resolved_at TEXT,
                resolution_notes TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_disputes_target ON governance_disputes(target_type, target_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_disputes_status ON governance_disputes(status)")

        # 6. Immutable Governance Audit Log
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS governance_audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action_type TEXT NOT NULL,
                actor_name TEXT NOT NULL,
                actor_role TEXT NOT NULL,
                entity_type TEXT NOT NULL,
                entity_id TEXT NOT NULL,
                details_json TEXT,
                timestamp TEXT NOT NULL
            )
            """
        )
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_action ON governance_audit_logs(action_type)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_entity ON governance_audit_logs(entity_type, entity_id)")

        conn.commit()


# Seed default accredited tribal preservation partnerships if empty
def seed_default_partnerships_if_empty(db_path: Optional[str] = None):
    init_governance_tables(db_path)
    target_db = db_path or get_db_path()
    now = datetime.now(timezone.utc).isoformat()

    with sqlite3.connect(target_db) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM organizations")
        if cursor.fetchone()[0] == 0:
            # 1. Central Gondi Tribal Preservation Council
            cursor.execute(
                """
                INSERT INTO organizations (
                    slug, name, org_type, description, website_url, contact_email,
                    lead_coordinator_name, target_languages, verification_status,
                    accreditation_notes, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    "gondi-tribal-council",
                    "Adivasi Gondwana Mahasabha & Language Preservation Council",
                    "tribal_council",
                    "Apex representative council dedicated to preserving Central Dravidian Gondi oral heritage, sacred clan songs, and Gunjala script reviving.",
                    "https://gondwana-council.org",
                    "governance@gondwana-council.org",
                    "Elder Motiram Kangali",
                    json.dumps(["gon", "kff", "te"]),
                    "verified_partner",
                    "Accredited by Tribal Elders Assembly under OCAP Data Sovereignty Protocols.",
                    now,
                    now,
                ),
            )
            org1_id = cursor.lastrowid

            # Project 1: Godavari Valley Oral Lore Preservation Project
            cursor.execute(
                """
                INSERT INTO partnership_projects (
                    org_id, project_name, slug, target_languages, collection_goal,
                    license_policy, tk_labels, status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    org1_id,
                    "Godavari Basin Gondi & Koya Oral Corpus",
                    "godavari-gondi-corpus",
                    json.dumps(["gon", "kff"]),
                    "Preserve 100+ oral agricultural songs, lineage chants, and herbal medicine recitations across Adilabad and Bhadrachalam.",
                    "CC BY-NC 4.0",
                    json.dumps(["TK Notice", "Clan Attribution", "Non-Commercial Community Use"]),
                    "active",
                    now,
                    now,
                ),
            )

            # Expert 1: Accredited Elder Reviewer
            cursor.execute(
                """
                INSERT INTO expert_reviewers (
                    reviewer_name, reviewer_role, org_id, languages_qualified,
                    accreditation_status, accredited_by, accredited_at, total_reviews_completed,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    "Dr. K. Sunitha Rao",
                    "linguist",
                    org1_id,
                    json.dumps(["gon", "kff", "te"]),
                    "accredited",
                    "CIIL Mysore & Gondwana Council",
                    now,
                    14,
                    now,
                    now,
                ),
            )

            # Record initial audit entry
            cursor.execute(
                """
                INSERT INTO governance_audit_logs (
                    action_type, actor_name, actor_role, entity_type, entity_id, details_json, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    "org_accredited",
                    "System Admin",
                    "admin",
                    "organization",
                    str(org1_id),
                    json.dumps({"name": "Adivasi Gondwana Mahasabha", "status": "verified_partner"}),
                    now,
                ),
            )
            conn.commit()


# ==============================================================================
# Organization Management Services
# ==============================================================================

def register_organization(
    name: str,
    slug: str,
    org_type: str,
    contact_email: str,
    lead_coordinator_name: str,
    target_languages: List[str],
    description: Optional[str] = None,
    website_url: Optional[str] = None,
    db_path: Optional[str] = None,
) -> Dict[str, Any]:
    """Register a new candidate organization with pending accreditation status."""
    if org_type not in VALID_ORG_TYPES:
        raise ValueError(f"Invalid organization type '{org_type}'. Must be one of {sorted(VALID_ORG_TYPES)}.")

    if not name.strip() or not slug.strip() or not contact_email.strip():
        raise ValueError("Name, slug, and contact email are required.")

    if not target_languages:
        raise ValueError("At least one target language must be specified.")

    init_governance_tables(db_path)
    target_db = db_path or get_db_path()
    now = datetime.now(timezone.utc).isoformat()
    clean_slug = slug.strip().lower().replace(" ", "-")

    with sqlite3.connect(target_db) as conn:
        cursor = conn.cursor()
        try:
            cursor.execute(
                """
                INSERT INTO organizations (
                    slug, name, org_type, description, website_url, contact_email,
                    lead_coordinator_name, target_languages, verification_status,
                    accreditation_notes, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending_accreditation', ?, ?, ?)
                """,
                (
                    clean_slug,
                    name.strip(),
                    org_type,
                    description.strip() if description else None,
                    website_url.strip() if website_url else None,
                    contact_email.strip(),
                    lead_coordinator_name.strip(),
                    json.dumps([l.lower().strip() for l in target_languages]),
                    "Submitted for accreditation review by Voice Roots Governance Committee.",
                    now,
                    now,
                ),
            )
            org_id = cursor.lastrowid
            conn.commit()
        except sqlite3.IntegrityError:
            raise ValueError(f"Organization with slug '{clean_slug}' already exists.")

    record_governance_audit(
        action_type="org_registered",
        actor_name=lead_coordinator_name,
        actor_role="coordinator",
        entity_type="organization",
        entity_id=str(org_id),
        details={"name": name, "status": "pending_accreditation"},
        db_path=target_db,
    )

    return get_organization(org_id, db_path=target_db)


def accredit_organization(
    org_id: int,
    admin_key: str,
    accreditation_notes: str = "Verified by Voice Roots Governance Council",
    status: str = "verified_partner",
    db_path: Optional[str] = None,
) -> Dict[str, Any]:
    """Accredit or update partnership status for an organization (Requires Admin Key)."""
    expected_key = os.environ.get("VOICE_ROOTS_ADMIN_KEY", "voice-roots-admin-key").strip()
    if not admin_key or admin_key.strip() != expected_key:
        raise PermissionError("Access denied: Valid administrative authorization key required to accredit organizations.")

    target_db = db_path or get_db_path()
    now = datetime.now(timezone.utc).isoformat()

    with sqlite3.connect(target_db) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM organizations WHERE id = ?", (org_id,))
        row = cursor.fetchone()
        if not row:
            raise ValueError(f"Organization ID {org_id} not found.")

        cursor.execute(
            """
            UPDATE organizations
            SET verification_status = ?, accreditation_notes = ?, updated_at = ?
            WHERE id = ?
            """,
            (status, accreditation_notes, now, org_id),
        )
        conn.commit()

    record_governance_audit(
        action_type="org_accredited",
        actor_name="Administrator",
        actor_role="admin",
        entity_type="organization",
        entity_id=str(org_id),
        details={"status": status, "notes": accreditation_notes},
        db_path=target_db,
    )

    return get_organization(org_id, db_path=target_db)


def get_organization(id_or_slug: Any, db_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Retrieve full organization profile, affiliated projects, and verified reviewers."""
    target_db = db_path or get_db_path()
    with sqlite3.connect(target_db) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        if isinstance(id_or_slug, int) or (isinstance(id_or_slug, str) and id_or_slug.isdigit()):
            cursor.execute("SELECT * FROM organizations WHERE id = ?", (int(id_or_slug),))
        else:
            cursor.execute("SELECT * FROM organizations WHERE slug = ?", (str(id_or_slug),))

        row = cursor.fetchone()
        if not row:
            return None

        org = dict(row)
        try:
            org["target_languages"] = json.loads(org["target_languages"])
        except Exception:
            org["target_languages"] = []

        # Affiliated projects
        cursor.execute("SELECT * FROM partnership_projects WHERE org_id = ?", (org["id"],))
        org["projects"] = []
        for p in cursor.fetchall():
            pd = dict(p)
            try:
                pd["target_languages"] = json.loads(pd["target_languages"])
            except Exception:
                pd["target_languages"] = []
            try:
                pd["tk_labels"] = json.loads(pd["tk_labels"]) if pd.get("tk_labels") else []
            except Exception:
                pd["tk_labels"] = []
            org["projects"].append(pd)

        # Affiliated accredited reviewers
        cursor.execute("SELECT * FROM expert_reviewers WHERE org_id = ?", (org["id"],))
        org["reviewers"] = []
        for r in cursor.fetchall():
            rd = dict(r)
            try:
                rd["languages_qualified"] = json.loads(rd["languages_qualified"])
            except Exception:
                rd["languages_qualified"] = []
            org["reviewers"].append(rd)

        return org


def list_organizations(status: Optional[str] = None, db_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """List partner organizations with optional status filter."""
    init_governance_tables(db_path)
    target_db = db_path or get_db_path()
    query = "SELECT * FROM organizations"
    params = []
    if status:
        query += " WHERE verification_status = ?"
        params.append(status)
    query += " ORDER BY id ASC"

    with sqlite3.connect(target_db) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(query, tuple(params))
        orgs = []
        for row in cursor.fetchall():
            d = dict(row)
            try:
                d["target_languages"] = json.loads(d["target_languages"])
            except Exception:
                d["target_languages"] = []
            orgs.append(d)
        return orgs


# ==============================================================================
# Partnership Projects & Workspaces
# ==============================================================================

def create_partnership_project(
    org_id: int,
    project_name: str,
    slug: str,
    target_languages: List[str],
    collection_goal: Optional[str] = None,
    license_policy: str = "CC BY-NC 4.0",
    tk_labels: Optional[List[str]] = None,
    db_path: Optional[str] = None,
) -> Dict[str, Any]:
    """Create a scoped project workspace for community lore collection."""
    target_db = db_path or get_db_path()
    now = datetime.now(timezone.utc).isoformat()
    clean_slug = slug.strip().lower().replace(" ", "-")

    with sqlite3.connect(target_db) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM organizations WHERE id = ?", (org_id,))
        if not cursor.fetchone():
            raise ValueError(f"Organization ID {org_id} does not exist.")

        try:
            cursor.execute(
                """
                INSERT INTO partnership_projects (
                    org_id, project_name, slug, target_languages, collection_goal,
                    license_policy, tk_labels, status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
                """,
                (
                    org_id,
                    project_name.strip(),
                    clean_slug,
                    json.dumps([l.lower().strip() for l in target_languages]),
                    collection_goal.strip() if collection_goal else None,
                    license_policy.strip(),
                    json.dumps(tk_labels or []),
                    now,
                    now,
                ),
            )
            proj_id = cursor.lastrowid
            conn.commit()
        except sqlite3.IntegrityError:
            raise ValueError(f"Project with slug '{clean_slug}' already exists.")

    record_governance_audit(
        action_type="project_created",
        actor_name="Project Coordinator",
        actor_role="coordinator",
        entity_type="project",
        entity_id=str(proj_id),
        details={"name": project_name, "org_id": org_id},
        db_path=target_db,
    )

    return {
        "id": proj_id,
        "org_id": org_id,
        "project_name": project_name,
        "slug": clean_slug,
        "target_languages": target_languages,
        "collection_goal": collection_goal,
        "license_policy": license_policy,
        "tk_labels": tk_labels or [],
        "status": "active",
        "created_at": now,
        "updated_at": now,
    }


def list_partnership_projects(
    org_id: Optional[int] = None,
    language: Optional[str] = None,
    db_path: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """List project workspaces with optional organization or language filter."""
    init_governance_tables(db_path)
    target_db = db_path or get_db_path()
    query = "SELECT p.*, o.name as org_name, o.slug as org_slug FROM partnership_projects p JOIN organizations o ON p.org_id = o.id WHERE 1=1"
    params = []

    if org_id:
        query += " AND p.org_id = ?"
        params.append(org_id)

    query += " ORDER BY p.id ASC"

    with sqlite3.connect(target_db) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(query, tuple(params))
        projects = []
        for r in cursor.fetchall():
            pd = dict(r)
            try:
                pd["target_languages"] = json.loads(pd["target_languages"])
            except Exception:
                pd["target_languages"] = []
            try:
                pd["tk_labels"] = json.loads(pd["tk_labels"]) if pd.get("tk_labels") else []
            except Exception:
                pd["tk_labels"] = []

            # Filter by language if specified
            if language:
                if language.lower().strip() not in pd["target_languages"]:
                    continue

            projects.append(pd)
        return projects


# ==============================================================================
# Accredited Expert & Reviewer Services
# ==============================================================================

def register_expert_reviewer(
    reviewer_name: str,
    reviewer_role: str,
    languages_qualified: List[str],
    org_id: Optional[int] = None,
    db_path: Optional[str] = None,
) -> Dict[str, Any]:
    """Register an expert reviewer profile with qualification claims."""
    if reviewer_role not in VALID_REVIEWER_ROLES:
        raise ValueError(f"Invalid reviewer role '{reviewer_role}'. Must be one of {sorted(VALID_REVIEWER_ROLES)}.")

    if not languages_qualified:
        raise ValueError("Reviewer must specify at least one qualified language.")

    init_governance_tables(db_path)
    target_db = db_path or get_db_path()
    now = datetime.now(timezone.utc).isoformat()

    with sqlite3.connect(target_db) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO expert_reviewers (
                reviewer_name, reviewer_role, org_id, languages_qualified,
                accreditation_status, total_reviews_completed, created_at, updated_at
            ) VALUES (?, ?, ?, ?, 'pending', 0, ?, ?)
            """,
            (
                reviewer_name.strip(),
                reviewer_role,
                org_id,
                json.dumps([l.lower().strip() for l in languages_qualified]),
                now,
                now,
            ),
        )
        rev_id = cursor.lastrowid
        conn.commit()

    record_governance_audit(
        action_type="reviewer_registered",
        actor_name=reviewer_name,
        actor_role=reviewer_role,
        entity_type="reviewer",
        entity_id=str(rev_id),
        details={"name": reviewer_name, "languages": languages_qualified},
        db_path=target_db,
    )

    return {
        "id": rev_id,
        "reviewer_name": reviewer_name,
        "reviewer_role": reviewer_role,
        "org_id": org_id,
        "languages_qualified": languages_qualified,
        "accreditation_status": "pending",
        "total_reviews_completed": 0,
        "created_at": now,
        "updated_at": now,
    }


def accredit_expert_reviewer(
    reviewer_id: int,
    admin_key: str,
    accredited_by: str = "Voice Roots Linguistic Committee",
    status: str = "accredited",
    db_path: Optional[str] = None,
) -> Dict[str, Any]:
    """Certify an expert reviewer profile (Requires Admin Key)."""
    expected_key = os.environ.get("VOICE_ROOTS_ADMIN_KEY", "voice-roots-admin-key").strip()
    if not admin_key or admin_key.strip() != expected_key:
        raise PermissionError("Access denied: Valid administrative authorization key required to certify reviewers.")

    target_db = db_path or get_db_path()
    now = datetime.now(timezone.utc).isoformat()

    with sqlite3.connect(target_db) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM expert_reviewers WHERE id = ?", (reviewer_id,))
        if not cursor.fetchone():
            raise ValueError(f"Reviewer ID {reviewer_id} not found.")

        cursor.execute(
            """
            UPDATE expert_reviewers
            SET accreditation_status = ?, accredited_by = ?, accredited_at = ?, updated_at = ?
            WHERE id = ?
            """,
            (status, accredited_by, now, now, reviewer_id),
        )
        conn.commit()

    record_governance_audit(
        action_type="reviewer_accredited",
        actor_name=accredited_by,
        actor_role="admin",
        entity_type="reviewer",
        entity_id=str(reviewer_id),
        details={"status": status, "accredited_by": accredited_by},
        db_path=target_db,
    )

    with sqlite3.connect(target_db) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM expert_reviewers WHERE id = ?", (reviewer_id,))
        row = dict(cursor.fetchone())
        row["languages_qualified"] = json.loads(row["languages_qualified"])
        return row


def list_expert_reviewers(
    language: Optional[str] = None,
    status: Optional[str] = None,
    db_path: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """List registered and accredited expert reviewers."""
    init_governance_tables(db_path)
    target_db = db_path or get_db_path()
    query = "SELECT r.*, o.name as org_name FROM expert_reviewers r LEFT JOIN organizations o ON r.org_id = o.id WHERE 1=1"
    params = []

    if status:
        query += " AND r.accreditation_status = ?"
        params.append(status)

    query += " ORDER BY r.id ASC"

    with sqlite3.connect(target_db) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(query, tuple(params))
        reviewers = []
        for r in cursor.fetchall():
            rd = dict(r)
            try:
                rd["languages_qualified"] = json.loads(rd["languages_qualified"])
            except Exception:
                rd["languages_qualified"] = []

            if language and language.lower().strip() not in rd["languages_qualified"]:
                continue

            reviewers.append(rd)
        return reviewers


# ==============================================================================
# Review Assignment Allocations
# ==============================================================================

def assign_review(
    transcript_id: int,
    reviewer_id: int,
    assigned_by: str,
    project_id: Optional[int] = None,
    due_date: Optional[str] = None,
    db_path: Optional[str] = None,
) -> Dict[str, Any]:
    """Assign a pending recording to an accredited reviewer qualified in that language."""
    target_db = db_path or get_db_path()
    now = datetime.now(timezone.utc).isoformat()

    with sqlite3.connect(target_db) as conn:
        cursor = conn.cursor()

        # 1. Verify transcript exists and get its language
        cursor.execute("SELECT id, language, title, verification_status FROM transcripts WHERE id = ? AND archived_at IS NULL", (transcript_id,))
        t_row = cursor.fetchone()
        if not t_row:
            raise ValueError(f"Recording ID {transcript_id} not found.")
        trans_lang = t_row[1].lower().strip()

        # 2. Verify reviewer exists and is qualified in the language
        cursor.execute("SELECT id, reviewer_name, accreditation_status, languages_qualified FROM expert_reviewers WHERE id = ?", (reviewer_id,))
        r_row = cursor.fetchone()
        if not r_row:
            raise ValueError(f"Reviewer ID {reviewer_id} not found.")

        rev_status = r_row[2]
        if rev_status != "accredited":
            raise PermissionError(f"Reviewer '{r_row[1]}' is not accredited (status: {rev_status}).")

        qualified_langs = json.loads(r_row[3])
        # Check if reviewer qualified in this tongue
        if trans_lang not in qualified_langs and not any(l in trans_lang for l in qualified_langs):
            raise ValueError(
                f"Reviewer '{r_row[1]}' is qualified in {qualified_langs}, but recording is in '{trans_lang}'."
            )

        cursor.execute(
            """
            INSERT INTO review_assignments (
                transcript_id, reviewer_id, assigned_by, project_id, status, due_date, created_at, updated_at
            ) VALUES (?, ?, ?, ?, 'assigned', ?, ?, ?)
            """,
            (transcript_id, reviewer_id, assigned_by, project_id, due_date, now, now),
        )
        assign_id = cursor.lastrowid

        # Update transcript status to under_review
        cursor.execute(
            "UPDATE transcripts SET verification_status = 'under_review', updated_at = ? WHERE id = ?",
            (now, transcript_id),
        )
        conn.commit()

    record_governance_audit(
        action_type="review_assigned",
        actor_name=assigned_by,
        actor_role="coordinator",
        entity_type="assignment",
        entity_id=str(assign_id),
        details={"transcript_id": transcript_id, "reviewer_id": reviewer_id, "language": trans_lang},
        db_path=target_db,
    )

    return {
        "id": assign_id,
        "transcript_id": transcript_id,
        "reviewer_id": reviewer_id,
        "assigned_by": assigned_by,
        "project_id": project_id,
        "status": "assigned",
        "due_date": due_date,
        "created_at": now,
    }


def list_review_assignments(
    reviewer_id: Optional[int] = None,
    status: Optional[str] = None,
    db_path: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """List review assignments with transcript and reviewer metadata."""
    init_governance_tables(db_path)
    target_db = db_path or get_db_path()
    query = """
        SELECT a.*, t.title as transcript_title, t.language as transcript_language,
               r.reviewer_name, r.reviewer_role
        FROM review_assignments a
        JOIN transcripts t ON a.transcript_id = t.id
        JOIN expert_reviewers r ON a.reviewer_id = r.id
        WHERE 1=1
    """
    params = []
    if reviewer_id:
        query += " AND a.reviewer_id = ?"
        params.append(reviewer_id)
    if status:
        query += " AND a.status = ?"
        params.append(status)
    query += " ORDER BY a.id DESC"

    with sqlite3.connect(target_db) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(query, tuple(params))
        return [dict(row) for row in cursor.fetchall()]


# ==============================================================================
# Governance Disputes & Appeal Workflows
# ==============================================================================

def file_governance_dispute(
    target_type: str,
    target_id: int,
    dispute_type: str,
    filed_by_name: str,
    filed_by_role: str,
    description: str,
    suggested_resolution: Optional[str] = None,
    db_path: Optional[str] = None,
) -> Dict[str, Any]:
    """File a formal community or ethical dispute regarding a transcript, translation, or publication."""
    if dispute_type not in VALID_DISPUTE_TYPES:
        raise ValueError(f"Invalid dispute type '{dispute_type}'. Must be one of {sorted(VALID_DISPUTE_TYPES)}.")

    if not description.strip():
        raise ValueError("Dispute description is required.")

    init_governance_tables(db_path)
    target_db = db_path or get_db_path()
    now = datetime.now(timezone.utc).isoformat()

    with sqlite3.connect(target_db) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO governance_disputes (
                target_type, target_id, dispute_type, filed_by_name, filed_by_role,
                description, suggested_resolution, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)
            """,
            (
                target_type,
                target_id,
                dispute_type,
                filed_by_name.strip(),
                filed_by_role.strip(),
                description.strip(),
                suggested_resolution.strip() if suggested_resolution else None,
                now,
                now,
            ),
        )
        disp_id = cursor.lastrowid
        conn.commit()

    record_governance_audit(
        action_type="dispute_filed",
        actor_name=filed_by_name,
        actor_role=filed_by_role,
        entity_type="dispute",
        entity_id=str(disp_id),
        details={"dispute_type": dispute_type, "target_type": target_type, "target_id": target_id},
        db_path=target_db,
    )

    return {
        "id": disp_id,
        "target_type": target_type,
        "target_id": target_id,
        "dispute_type": dispute_type,
        "filed_by_name": filed_by_name,
        "filed_by_role": filed_by_role,
        "description": description,
        "suggested_resolution": suggested_resolution,
        "status": "open",
        "created_at": now,
        "updated_at": now,
    }


def resolve_governance_dispute(
    dispute_id: int,
    resolver_name: str,
    resolver_role: str,
    decision: str,
    resolution_notes: str,
    db_path: Optional[str] = None,
) -> Dict[str, Any]:
    """Resolve an open dispute with community elder or coordinator decision."""
    if resolver_role not in ("community_elder", "admin", "project_coordinator"):
        raise PermissionError("Only Community Elders, Project Coordinators, or Admins can resolve governance disputes.")

    if decision not in ("resolved", "dismissed"):
        raise ValueError("Decision must be 'resolved' or 'dismissed'.")

    target_db = db_path or get_db_path()
    now = datetime.now(timezone.utc).isoformat()

    with sqlite3.connect(target_db) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM governance_disputes WHERE id = ?", (dispute_id,))
        if not cursor.fetchone():
            raise ValueError(f"Dispute ID {dispute_id} not found.")

        cursor.execute(
            """
            UPDATE governance_disputes
            SET status = ?, resolved_by = ?, resolved_at = ?, resolution_notes = ?, updated_at = ?
            WHERE id = ?
            """,
            (decision, resolver_name, now, resolution_notes, now, dispute_id),
        )
        conn.commit()

    record_governance_audit(
        action_type="dispute_resolved",
        actor_name=resolver_name,
        actor_role=resolver_role,
        entity_type="dispute",
        entity_id=str(dispute_id),
        details={"decision": decision, "notes": resolution_notes},
        db_path=target_db,
    )

    with sqlite3.connect(target_db) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM governance_disputes WHERE id = ?", (dispute_id,))
        return dict(cursor.fetchone())


def list_governance_disputes(status: Optional[str] = None, db_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """List filed disputes with optional status filter."""
    init_governance_tables(db_path)
    target_db = db_path or get_db_path()
    query = "SELECT * FROM governance_disputes"
    params = []
    if status:
        query += " WHERE status = ?"
        params.append(status)
    query += " ORDER BY id DESC"

    with sqlite3.connect(target_db) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(query, tuple(params))
        return [dict(r) for r in cursor.fetchall()]


# ==============================================================================
# Governance Audit Logging
# ==============================================================================

def record_governance_audit(
    action_type: str,
    actor_name: str,
    actor_role: str,
    entity_type: str,
    entity_id: str,
    details: Optional[Dict[str, Any]] = None,
    db_path: Optional[str] = None,
):
    """Write an immutable audit log entry for governance accountability."""
    target_db = db_path or get_db_path()
    now = datetime.now(timezone.utc).isoformat()
    try:
        with sqlite3.connect(target_db) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO governance_audit_logs (
                    action_type, actor_name, actor_role, entity_type, entity_id, details_json, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    action_type,
                    actor_name,
                    actor_role,
                    entity_type,
                    str(entity_id),
                    json.dumps(details or {}),
                    now,
                ),
            )
            conn.commit()
    except Exception as e:
        logger.warning("Failed to record governance audit log: %s", e)


def get_governance_audit_logs(limit: int = 50, db_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieve immutable audit trail records."""
    init_governance_tables(db_path)
    target_db = db_path or get_db_path()
    with sqlite3.connect(target_db) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM governance_audit_logs ORDER BY id DESC LIMIT ?", (limit,))
        logs = []
        for r in cursor.fetchall():
            d = dict(r)
            try:
                d["details"] = json.loads(d["details_json"])
            except Exception:
                d["details"] = {}
            del d["details_json"]
            logs.append(d)
        return logs


# ==============================================================================
# Non-Competitive Governance & Community Telemetry
# ==============================================================================

def get_community_partnership_telemetry(db_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Generate transparent, non-competitive community partnership telemetry.
    Aggregates verified contributions per accredited partner without ranking
    communities competitively by volume.
    """
    init_governance_tables(db_path)
    target_db = db_path or get_db_path()

    with sqlite3.connect(target_db) as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM organizations WHERE verification_status = 'verified_partner'")
        verified_orgs = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM organizations WHERE verification_status = 'pending_accreditation'")
        pending_orgs = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM partnership_projects WHERE status = 'active'")
        active_projects = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM expert_reviewers WHERE accreditation_status = 'accredited'")
        accredited_reviewers = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM review_assignments WHERE status = 'completed'")
        completed_assignments = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM governance_disputes WHERE status = 'open'")
        open_disputes = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM governance_disputes WHERE status = 'resolved'")
        resolved_disputes = cursor.fetchone()[0]

        # Verified contributions per language (no competitive ranking)
        cursor.execute(
            """
            SELECT language, COUNT(*) as cnt
            FROM transcripts
            WHERE verification_status IN ('verified', 'corrected', 'published')
              AND archived_at IS NULL
            GROUP BY language
            ORDER BY language ASC
            """
        )
        verified_per_lang = {r[0]: r[1] for r in cursor.fetchall()}

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "partnerships_summary": {
            "verified_partner_organizations": verified_orgs,
            "pending_accreditations": pending_orgs,
            "active_partnership_projects": active_projects,
            "accredited_expert_reviewers": accredited_reviewers,
            "completed_review_assignments": completed_assignments,
        },
        "disputes_and_appeals": {
            "open_disputes": open_disputes,
            "resolved_disputes": resolved_disputes,
            "appeal_mechanism_active": True,
        },
        "verified_language_preservation_records": verified_per_lang,
        "ethical_principles": {
            "non_competitive_reporting": "Communities are never ranked competitively by volume or model accuracy.",
            "attribution_preference": "Contributions respect Clan, Tribe, and Individual attribution choices.",
            "ocap_compliance": "OCAP Principles: Ownership, Control, Access, and Possession remain with indigenous language communities.",
        },
    }

