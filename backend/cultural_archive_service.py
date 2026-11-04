"""Cultural Archive Service (Milestone 17)

Provides domain models, database operations, 6-facet OCAP consent validation,
access-level filtering, Unicode full-text search, and bidirectional integration
with the Milestone 16 Language Knowledge Graph for oral history preservation.
"""

from __future__ import annotations

import datetime
import json
import logging
import os
import sqlite3
from dataclasses import asdict, dataclass
from typing import Any

logger = logging.getLogger(__name__)

# Valid Access Classifications
ACCESS_PUBLIC = "PUBLIC"
ACCESS_COMMUNITY_RESTRICTED = "COMMUNITY_RESTRICTED"
ACCESS_SACRED_ELDER_ONLY = "SACRED_ELDER_ONLY"
ACCESS_RESEARCH_ONLY = "RESEARCH_ONLY"
VALID_ACCESS_LEVELS = {ACCESS_PUBLIC, ACCESS_COMMUNITY_RESTRICTED, ACCESS_SACRED_ELDER_ONLY, ACCESS_RESEARCH_ONLY}

# Valid Submission & Story Review Statuses
STATUS_DRAFT = "DRAFT"
STATUS_SUBMITTED = "SUBMITTED"
STATUS_UNDER_REVIEW = "UNDER_REVIEW"
STATUS_APPROVED = "APPROVED"
STATUS_REJECTED = "REJECTED"
STATUS_WITHDRAWN = "WITHDRAWN"
VALID_STATUSES = {STATUS_DRAFT, STATUS_SUBMITTED, STATUS_UNDER_REVIEW, STATUS_APPROVED, STATUS_REJECTED, STATUS_WITHDRAWN}

# Valid Attribution Preferences
ATTRIBUTION_BY_NAME = "BY_NAME"
ATTRIBUTION_ANONYMOUS = "ANONYMOUS"
ATTRIBUTION_COMMUNITY_CLAN = "COMMUNITY_CLAN"


@dataclass
class ConsentMatrix:
    consent_recording: bool = True
    consent_transcription: bool = True
    consent_translation: bool = False
    consent_public_display: bool = True
    consent_research_reuse: bool = True
    consent_educational_reuse: bool = True

    @classmethod
    def from_dict(cls, data: dict[str, Any] | None) -> ConsentMatrix:
        if not data:
            return cls()
        return cls(
            consent_recording=bool(data.get("consent_recording", True)),
            consent_transcription=bool(data.get("consent_transcription", True)),
            consent_translation=bool(data.get("consent_translation", False)),
            consent_public_display=bool(data.get("consent_public_display", True)),
            consent_research_reuse=bool(data.get("consent_research_reuse", True)),
            consent_educational_reuse=bool(data.get("consent_educational_reuse", True)),
        )

    def to_dict(self) -> dict[str, bool]:
        return asdict(self)


def check_access_permission(
    record_access_level: str,
    is_authenticated: bool = False,
    user_roles: list[str] | None = None,
    user_language: str | None = None,
    record_language: str | None = None,
) -> bool:
    """Evaluate whether the caller is authorized to view a cultural record.

    Guardrails:
    - PUBLIC: accessible to anyone.
    - COMMUNITY_RESTRICTED: requires authentication and matching community or admin/elder role.
    - SACRED_ELDER_ONLY: accessible strictly to verified elder or admin roles. Never leaks to public.
    - RESEARCH_ONLY: accessible to verified researchers or admins.
    """
    if record_access_level == ACCESS_PUBLIC:
        return True

    roles = set(user_roles or [])
    if "admin" in roles:
        return True

    if record_access_level == ACCESS_SACRED_ELDER_ONLY:
        return "elder" in roles or "custodian" in roles

    if record_access_level == ACCESS_RESEARCH_ONLY:
        return "researcher" in roles or "elder" in roles

    if record_access_level == ACCESS_COMMUNITY_RESTRICTED:
        if not is_authenticated:
            return False
        if "elder" in roles or "community_member" in roles:
            return not (user_language and record_language and user_language != record_language)
        return False

    return False


def _get_db_connection(db_path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


# -------------------------------------------------------------------------
# Telemetry & Overview
# -------------------------------------------------------------------------

def get_cultural_archive_overview(
    db_path: str,
    is_authenticated: bool = False,
    user_roles: list[str] | None = None,
) -> dict[str, Any]:
    """Return high-level telemetry for the cultural archive."""
    roles = set(user_roles or [])
    conn = _get_db_connection(db_path)
    try:
        c = conn.cursor()

        # Count collections based on access
        if "admin" in roles or "elder" in roles:
            total_collections = c.execute("SELECT COUNT(*) FROM archive_collections").fetchone()[0]
            total_stories = c.execute("SELECT COUNT(*) FROM cultural_stories WHERE review_status = 'APPROVED'").fetchone()[0]
            total_duration = c.execute("SELECT COALESCE(SUM(audio_duration_seconds), 0) FROM cultural_stories WHERE review_status = 'APPROVED'").fetchone()[0]
        else:
            total_collections = c.execute(
                "SELECT COUNT(*) FROM archive_collections WHERE access_classification = 'PUBLIC'"
            ).fetchone()[0]
            total_stories = c.execute(
                "SELECT COUNT(*) FROM cultural_stories WHERE access_classification = 'PUBLIC' AND review_status = 'APPROVED'"
            ).fetchone()[0]
            total_duration = c.execute(
                "SELECT COALESCE(SUM(audio_duration_seconds), 0) FROM cultural_stories WHERE access_classification = 'PUBLIC' AND review_status = 'APPROVED'"
            ).fetchone()[0]

        # Languages represented
        lang_rows = c.execute("""
            SELECT primary_language, COUNT(*) as story_count
            FROM cultural_stories
            WHERE review_status = 'APPROVED'
            GROUP BY primary_language
            ORDER BY story_count DESC
        """).fetchall()

        languages = [{"language": r["primary_language"], "story_count": r["story_count"]} for r in lang_rows]

        # Submissions metrics
        sub_rows = c.execute("""
            SELECT status, COUNT(*) as cnt
            FROM cultural_submissions
            GROUP BY status
        """).fetchall()
        submissions_by_status = {r["status"]: r["cnt"] for r in sub_rows}

        # Categories
        cat_rows = c.execute("""
            SELECT category, COUNT(*) as coll_count
            FROM archive_collections
            GROUP BY category
            ORDER BY coll_count DESC
        """).fetchall()
        categories = [{"category": r["category"], "collection_count": r["coll_count"]} for r in cat_rows]

        return {
            "total_collections": total_collections,
            "total_stories": total_stories,
            "total_audio_duration_seconds": round(float(total_duration), 2),
            "languages_represented": languages,
            "categories": categories,
            "submissions_by_status": submissions_by_status,
            "status": "healthy",
        }
    finally:
        conn.close()


# -------------------------------------------------------------------------
# Archive Collections
# -------------------------------------------------------------------------

def list_archive_collections(
    db_path: str,
    language: str | None = None,
    category: str | None = None,
    access_level: str | None = None,
    is_authenticated: bool = False,
    user_roles: list[str] | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[dict[str, Any]]:
    """List cultural archive collections with access permission enforcement."""
    conn = _get_db_connection(db_path)
    try:
        c = conn.cursor()
        query = "SELECT * FROM archive_collections WHERE 1=1"
        params: list[Any] = []

        if language:
            query += " AND primary_language = ?"
            params.append(language)
        if category:
            query += " AND category = ?"
            params.append(category)

        query += " ORDER BY created_at DESC"
        rows = c.execute(query, params).fetchall()

        # Access filter
        results: list[dict[str, Any]] = []
        for row in rows:
            data = dict(row)
            if check_access_permission(
                data["access_classification"],
                is_authenticated=is_authenticated,
                user_roles=user_roles,
            ):
                # Count approved stories inside collection
                story_count = c.execute(
                    "SELECT COUNT(*) FROM cultural_stories WHERE collection_id = ? AND review_status = 'APPROVED'",
                    (data["collection_id"],),
                ).fetchone()[0]
                data["story_count"] = story_count
                results.append(data)

        return results[offset : offset + limit]
    finally:
        conn.close()


def get_archive_collection(
    db_path: str,
    collection_id: str,
    is_authenticated: bool = False,
    user_roles: list[str] | None = None,
) -> dict[str, Any] | None:
    """Retrieve collection details along with accessible stories."""
    conn = _get_db_connection(db_path)
    try:
        c = conn.cursor()
        row = c.execute(
            "SELECT * FROM archive_collections WHERE collection_id = ?", (collection_id,)
        ).fetchone()
        if not row:
            return None

        data = dict(row)
        if not check_access_permission(
            data["access_classification"],
            is_authenticated=is_authenticated,
            user_roles=user_roles,
        ):
            return None

        # Fetch contained stories
        story_rows = c.execute(
            "SELECT * FROM cultural_stories WHERE collection_id = ? AND review_status = 'APPROVED' ORDER BY created_at ASC",
            (collection_id,),
        ).fetchall()

        stories: list[dict[str, Any]] = []
        for s in story_rows:
            s_dict = dict(s)
            if check_access_permission(
                s_dict["access_classification"],
                is_authenticated=is_authenticated,
                user_roles=user_roles,
            ):
                stories.append(s_dict)

        data["stories"] = stories
        data["story_count"] = len(stories)
        return data
    finally:
        conn.close()


def create_archive_collection(
    db_path: str,
    title: str,
    description: str | None,
    primary_language: str,
    category: str = "Oral History",
    cover_image_url: str | None = None,
    creator_organization_id: str | None = None,
    creator_name: str = "Community Elder Council",
    provenance_details: str | None = None,
    access_classification: str = ACCESS_PUBLIC,
    traditional_knowledge_label: str = "TK Notice (Open)",
    is_admin: bool = False,
) -> dict[str, Any]:
    """Create a new cultural archive collection."""
    if access_classification not in VALID_ACCESS_LEVELS:
        raise ValueError(f"Invalid access_classification: {access_classification}")

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    collection_id = f"coll:{primary_language.lower()}:{title.lower().replace(' ', '_')[:25]}_{os.urandom(3).hex()}"

    conn = _get_db_connection(db_path)
    try:
        c = conn.cursor()
        c.execute("""
            INSERT INTO archive_collections (
                collection_id, title, description, primary_language, category,
                cover_image_url, creator_organization_id, creator_name,
                provenance_details, access_classification, traditional_knowledge_label,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            collection_id, title, description, primary_language, category,
            cover_image_url, creator_organization_id, creator_name,
            provenance_details, access_classification, traditional_knowledge_label,
            now_iso, now_iso
        ))
        conn.commit()

        # Link into Knowledge Graph as a resource node
        try:
            _sync_collection_to_kg(conn, collection_id, title, primary_language, description, provenance_details)
            conn.commit()
        except (sqlite3.Error, ValueError, KeyError) as e:
            logger.warning(f"Could not sync collection {collection_id} to KG: {e}")

        return get_archive_collection(db_path, collection_id, is_authenticated=True, user_roles=["admin"]) or {}
    finally:
        conn.close()


# -------------------------------------------------------------------------
# Cultural Stories
# -------------------------------------------------------------------------

def list_cultural_stories(
    db_path: str,
    collection_id: str | None = None,
    language: str | None = None,
    category: str | None = None,
    query: str | None = None,
    is_authenticated: bool = False,
    user_roles: list[str] | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[dict[str, Any]]:
    """Query cultural stories with full-text search and permission filtering."""
    conn = _get_db_connection(db_path)
    try:
        c = conn.cursor()
        story_ids: list[str] | None = None

        # Full-text search if query provided
        if query and query.strip():
            clean_q = query.replace('"', '""').strip()
            # Support prefix searching
            fts_query = f'"{clean_q}"*'
            try:
                fts_rows = c.execute(
                    "SELECT story_id FROM cultural_stories_fts WHERE cultural_stories_fts MATCH ? LIMIT 100",
                    (fts_query,),
                ).fetchall()
                story_ids = [r[0] for r in fts_rows]
            except (sqlite3.Error, ValueError) as e:
                logger.warning(f"FTS search error '{query}': {e}")
                # Fallback to LIKE
                like_pat = f"%{query.strip()}%"
                like_rows = c.execute(
                    "SELECT story_id FROM cultural_stories WHERE title LIKE ? OR native_title LIKE ? OR description LIKE ? LIMIT 100",
                    (like_pat, like_pat, like_pat),
                ).fetchall()
                story_ids = [r[0] for r in like_rows]

        base_query = "SELECT * FROM cultural_stories WHERE review_status = 'APPROVED'"
        params: list[Any] = []

        if story_ids is not None:
            if not story_ids:
                return []
            placeholders = ",".join("?" for _ in story_ids)
            base_query += f" AND story_id IN ({placeholders})"
            params.extend(story_ids)

        if collection_id:
            base_query += " AND collection_id = ?"
            params.append(collection_id)
        if language:
            base_query += " AND primary_language = ?"
            params.append(language)

        base_query += " ORDER BY created_at DESC"
        rows = c.execute(base_query, params).fetchall()

        results: list[dict[str, Any]] = []
        for row in rows:
            data = dict(row)
            if check_access_permission(
                data["access_classification"],
                is_authenticated=is_authenticated,
                user_roles=user_roles,
            ):
                results.append(data)

        return results[offset : offset + limit]
    finally:
        conn.close()


def get_cultural_story(
    db_path: str,
    story_id: str,
    is_authenticated: bool = False,
    user_roles: list[str] | None = None,
) -> dict[str, Any] | None:
    """Retrieve full cultural story by ID with access control."""
    conn = _get_db_connection(db_path)
    try:
        c = conn.cursor()
        row = c.execute("SELECT * FROM cultural_stories WHERE story_id = ?", (story_id,)).fetchone()
        if not row:
            return None

        data = dict(row)
        if not check_access_permission(
            data["access_classification"],
            is_authenticated=is_authenticated,
            user_roles=user_roles,
        ):
            return None

        # Fetch associated collection title if linked
        if data.get("collection_id"):
            coll = c.execute(
                "SELECT title, category, traditional_knowledge_label FROM archive_collections WHERE collection_id = ?",
                (data["collection_id"],),
            ).fetchone()
            if coll:
                data["collection_title"] = coll["title"]
                data["collection_category"] = coll["category"]
                data["traditional_knowledge_label"] = coll["traditional_knowledge_label"]

        if data.get("transcript_id"):
            trans = c.execute(
                "SELECT transcript_text, machine_transcript_text, transliteration_text FROM transcripts WHERE id = ?",
                (data["transcript_id"],),
            ).fetchone()
            if trans:
                data["raw_transcript_text"] = trans["transcript_text"] or trans["machine_transcript_text"]

        return data
    finally:
        conn.close()


def get_story_audio_stream_info(
    db_path: str,
    story_id: str,
    audio_base_dir: str,
    is_authenticated: bool = False,
    user_roles: list[str] | None = None,
) -> tuple[str, str] | None:
    """Validate permission and resolve local filepath to the master audio file.

    Returns (file_path, mime_type) or None if unauthorized/missing.
    """
    story = get_cultural_story(db_path, story_id, is_authenticated=is_authenticated, user_roles=user_roles)
    if not story:
        return None

    audio_ref = story.get("audio_reference")
    if not audio_ref:
        return None

    filename = os.path.basename(audio_ref)
    candidate_paths = [
        os.path.join(audio_base_dir, filename),
        os.path.join(os.path.dirname(audio_base_dir), "audio", filename),
        os.path.join("backend", "storage", "audio", filename),
        os.path.join("storage", "audio", filename),
    ]

    target_path = None
    for p in candidate_paths:
        if os.path.exists(p) and os.path.isfile(p):
            target_path = p
            break

    if not target_path:
        return None

    ext = os.path.splitext(target_path)[1].lower()
    mime = "audio/wav"
    if ext == ".mp3":
        mime = "audio/mpeg"
    elif ext == ".m4a":
        mime = "audio/mp4"
    elif ext == ".ogg":
        mime = "audio/ogg"

    return target_path, mime


# -------------------------------------------------------------------------
# Submissions & Review Workflow
# -------------------------------------------------------------------------

def create_cultural_submission(
    db_path: str,
    contributor_name: str,
    language: str,
    title: str,
    consent_matrix: dict[str, Any] | ConsentMatrix,
    contributor_email: str | None = None,
    variety: str | None = None,
    description: str | None = None,
    original_audio_path: str | None = None,
    audio_sha256: str | None = None,
    transcript_draft: str | None = None,
    translation_draft: str | None = None,
    attribution_preference: str = ATTRIBUTION_BY_NAME,
    collection_id: str | None = None,
    is_sacred_ceremonial: bool = False,
) -> dict[str, Any]:
    """Submit a cultural oral recording with mandatory 6-facet consent validation."""
    c_matrix = ConsentMatrix.from_dict(consent_matrix) if isinstance(consent_matrix, dict) else consent_matrix

    # Mandatory affirmative consent to record
    if not c_matrix.consent_recording:
        raise ValueError("Affirmative consent to preserve audio recording is mandatory under OCAP protocols.")

    # Guardrail: Sacred ceremonial lore cannot be submitted to public queues without verified elder custodian
    if is_sacred_ceremonial:
        raise ValueError(
            "Sacred or secret ceremonial knowledge cannot be submitted via public contribution. "
            "Please consult the Community Elder Council directly."
        )

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    submission_id = f"sub:{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d%H%M%S')}:{os.urandom(3).hex()}"

    conn = _get_db_connection(db_path)
    try:
        c = conn.cursor()
        c.execute("""
            INSERT INTO cultural_submissions (
                submission_id, collection_id, contributor_name, contributor_email,
                language, variety, title, description, original_audio_path,
                audio_sha256, transcript_draft, translation_draft,
                attribution_preference, consent_matrix_json, status,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SUBMITTED', ?, ?)
        """, (
            submission_id, collection_id, contributor_name, contributor_email,
            language, variety, title, description, original_audio_path,
            audio_sha256, transcript_draft, translation_draft,
            attribution_preference, json.dumps(c_matrix.to_dict()),
            now_iso, now_iso
        ))
        conn.commit()

        row = c.execute("SELECT * FROM cultural_submissions WHERE submission_id = ?", (submission_id,)).fetchone()
        return dict(row)
    finally:
        conn.close()


def review_cultural_submission(
    db_path: str,
    submission_id: str,
    review_decision: str,
    reviewer_name: str,
    review_notes: str | None = None,
    create_story_on_approval: bool = True,
    target_collection_id: str | None = None,
    access_classification: str = ACCESS_PUBLIC,
) -> dict[str, Any]:
    """Process elder or administrator review on a community submission."""
    if review_decision not in {STATUS_APPROVED, STATUS_REJECTED, STATUS_UNDER_REVIEW}:
        raise ValueError(f"Invalid review decision: {review_decision}")

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    conn = _get_db_connection(db_path)
    try:
        c = conn.cursor()
        sub = c.execute("SELECT * FROM cultural_submissions WHERE submission_id = ?", (submission_id,)).fetchone()
        if not sub:
            raise ValueError(f"Submission {submission_id} not found")

        c.execute("""
            UPDATE cultural_submissions
            SET status = ?, review_notes = ?, reviewed_by = ?, reviewed_at = ?, updated_at = ?
            WHERE submission_id = ?
        """, (review_decision, review_notes, reviewer_name, now_iso, now_iso, submission_id))

        new_story_id = None
        if review_decision == STATUS_APPROVED and create_story_on_approval:
            sub_dict = dict(sub)
            coll_id = target_collection_id or sub_dict.get("collection_id")
            new_story_id = f"story:cult:{sub_dict['submission_id'].replace(':', '_')}"

            # Insert into cultural_stories
            c.execute("""
                INSERT INTO cultural_stories (
                    story_id, collection_id, title, description, primary_language,
                    dialect_variety, translation_text, audio_reference,
                    audio_sha256, contributor_name, attribution_preference,
                    access_classification, review_status, reviewed_by, reviewed_at,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED', ?, ?, ?, ?)
            """, (
                new_story_id, coll_id, sub_dict["title"], sub_dict["description"],
                sub_dict["language"], sub_dict.get("variety"), sub_dict.get("translation_draft"),
                sub_dict.get("original_audio_path"), sub_dict.get("audio_sha256"),
                sub_dict["contributor_name"], sub_dict.get("attribution_preference", ATTRIBUTION_BY_NAME),
                access_classification, reviewer_name, now_iso, now_iso, now_iso
            ))

            # Sync to FTS5
            c.execute("""
                INSERT INTO cultural_stories_fts (
                    story_id, title, native_title, description, transliteration,
                    translation_text, primary_language, location_name
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                new_story_id, sub_dict["title"], None, sub_dict.get("description"),
                None, sub_dict.get("translation_draft"), sub_dict["language"], None
            ))

            # Sync to Knowledge Graph
            try:
                _sync_story_to_kg(conn, new_story_id, sub_dict["title"], sub_dict["language"], coll_id, reviewer_name)
            except (sqlite3.Error, ValueError, KeyError) as e:
                logger.warning(f"Could not sync story {new_story_id} to KG: {e}")

        conn.commit()

        updated_sub = c.execute("SELECT * FROM cultural_submissions WHERE submission_id = ?", (submission_id,)).fetchone()
        res = dict(updated_sub)
        if new_story_id:
            res["created_story_id"] = new_story_id
        return res
    finally:
        conn.close()


def withdraw_cultural_record(
    db_path: str,
    record_id: str,
    requester_name: str,
    reason: str | None = None,
    is_contributor: bool = False,
    is_admin: bool = False,
) -> dict[str, Any]:
    """Execute OCAP withdrawal of a submission or story, revoking public accessibility."""
    if not is_contributor and not is_admin:
        raise PermissionError("Only the original contributor or an authorized elder/admin can withdraw records.")

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    conn = _get_db_connection(db_path)
    try:
        c = conn.cursor()

        # Check if record_id is submission
        sub = c.execute("SELECT * FROM cultural_submissions WHERE submission_id = ?", (record_id,)).fetchone()
        if sub:
            c.execute("""
                UPDATE cultural_submissions
                SET status = 'WITHDRAWN', review_notes = ?, updated_at = ?
                WHERE submission_id = ?
            """, (f"Withdrawn by {requester_name}. Reason: {reason or 'Contributor request'}", now_iso, record_id))
            conn.commit()
            return {"status": "success", "message": f"Submission {record_id} withdrawn.", "record_id": record_id}

        # Check if record_id is story
        story = c.execute("SELECT * FROM cultural_stories WHERE story_id = ?", (record_id,)).fetchone()
        if story:
            c.execute("""
                UPDATE cultural_stories
                SET review_status = 'WITHDRAWN', updated_at = ?
                WHERE story_id = ?
            """, (now_iso, record_id))

            # Remove from FTS
            c.execute("DELETE FROM cultural_stories_fts WHERE story_id = ?", (record_id,))

            # Remove or mark withdrawn in KG
            c.execute("UPDATE kg_nodes SET verification_status = 'REJECTED' WHERE node_id = ?", (record_id,))
            conn.commit()
            return {"status": "success", "message": f"Story {record_id} withdrawn from public access.", "record_id": record_id}

        raise ValueError(f"Record {record_id} not found in submissions or stories.")
    finally:
        conn.close()


# -------------------------------------------------------------------------
# Knowledge Graph Bidirectional Sync
# -------------------------------------------------------------------------

def _sync_collection_to_kg(
    conn: sqlite3.Connection,
    collection_id: str,
    title: str,
    language: str,
    description: str | None,
    provenance: str | None,
) -> None:
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    c = conn.cursor()
    c.execute("""
        INSERT OR REPLACE INTO kg_nodes (
            node_id, entity_type, name, primary_language, category,
            summary, verification_status, source_reference,
            created_at, updated_at
        ) VALUES (?, 'resource', ?, ?, 'collection', ?, 'VERIFIED', ?, ?, ?)
    """, (collection_id, title, language, description, provenance, now_iso, now_iso))

    # Link to language node if it exists
    lang_node_id = f"lang:{language.lower()}"
    has_lang = c.execute("SELECT 1 FROM kg_nodes WHERE node_id = ?", (lang_node_id,)).fetchone()
    if has_lang:
        c.execute("""
            INSERT OR IGNORE INTO kg_relationships (
                source_id, target_id, relationship_type, label,
                verification_status, created_at, updated_at
            ) VALUES (?, ?, 'ASSOCIATED_WITH', 'associated collection', 'VERIFIED', ?, ?)
        """, (collection_id, lang_node_id, now_iso, now_iso))


def _sync_story_to_kg(
    conn: sqlite3.Connection,
    story_id: str,
    title: str,
    language: str,
    collection_id: str | None,
    reviewer: str,
) -> None:
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    c = conn.cursor()
    c.execute("""
        INSERT OR REPLACE INTO kg_nodes (
            node_id, entity_type, name, primary_language, category,
            verification_status, reviewed_by, reviewed_at,
            created_at, updated_at
        ) VALUES (?, 'story', ?, ?, 'oral_story', 'VERIFIED', ?, ?, ?, ?)
    """, (story_id, title, language, reviewer, now_iso, now_iso, now_iso))

    lang_node_id = f"lang:{language.lower()}"
    has_lang = c.execute("SELECT 1 FROM kg_nodes WHERE node_id = ?", (lang_node_id,)).fetchone()
    if has_lang:
        c.execute("""
            INSERT OR IGNORE INTO kg_relationships (
                source_id, target_id, relationship_type, label,
                verification_status, created_at, updated_at
            ) VALUES (?, ?, 'TRANSCRIBES', 'oral story in language', 'VERIFIED', ?, ?)
        """, (story_id, lang_node_id, now_iso, now_iso))

    if collection_id:
        has_coll = c.execute("SELECT 1 FROM kg_nodes WHERE node_id = ?", (collection_id,)).fetchone()
        if has_coll:
            c.execute("""
                INSERT OR IGNORE INTO kg_relationships (
                    source_id, target_id, relationship_type, label,
                    verification_status, created_at, updated_at
                ) VALUES (?, ?, 'ASSOCIATED_WITH', 'story in collection', 'VERIFIED', ?, ?)
            """, (story_id, collection_id, now_iso, now_iso))


# -------------------------------------------------------------------------
# Ground-Truth Seed Data
# -------------------------------------------------------------------------

def seed_default_cultural_archives(db_path: str) -> None:
    """Seed foundational curated collections and oral stories linked to real recordings."""
    conn = _get_db_connection(db_path)
    try:
        c = conn.cursor()
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # 1. Curated Collections
        collections = [
            (
                "coll:gondi:lingo",
                "Oral Epic of Pahandi Kupar Lingo & Gondi Saga Lore",
                "Sacred oral epic recitations preserved by Pardhan bards narrating the origin of Gondi phratries and customs.",
                "gon",
                "Mythology & Epic Narrative",
                None,
                "org:ciil",
                "Gondwana Elder Custodians & Pardhan Musicians",
                "Recorded in Adilabad and Bastar regions with traditional Kingri accompaniment.",
                ACCESS_PUBLIC,
                "TK Notice (Open Community Archive)",
            ),
            (
                "coll:koya:healers",
                "Koya Ethnobotanical Healing Lore & Forest Chants",
                "Traditional oral formulations, herbal knowledge, and medicinal forest prayers of Godavari river basin communities.",
                "kff",
                "Ethnobotany & Ecological Knowledge",
                None,
                "org:koya:council",
                "Bhadrachalam Koya Healers Guild",
                "Audio field recordings collected in agency tracts of Telangana and Andhra Pradesh.",
                ACCESS_PUBLIC,
                "TK Verified (Community Ecological Lore)",
            ),
            (
                "coll:santhali:sohrai",
                "Santhali Sohrai Harvest Songs & Creation Ballads",
                "Oral poetry and songs sung during the Sohrai winter harvest celebration, celebrating cattle, ancestors, and earth.",
                "sat",
                "Folklore & Song",
                None,
                "org:ciil",
                "Chota Nagpur Santhal Cultural Committee",
                "Oral transmission documented with Ol Chiki orthography and audio masters.",
                ACCESS_PUBLIC,
                "TK Open Heritage",
            ),
            (
                "coll:lambadi:ghor",
                "Lambadi Banjara Ghor Ballads & Migratory Epics",
                "Epic oral narratives recounting ancient nomadic migration across Rajputana, the Deccan, and forested tandas.",
                "lmn",
                "Oral Ballads & Historical Narratives",
                None,
                "org:ciil",
                "All India Banjara Seva Sangh Elders",
                "Preserved through oral stanza singing in Tanda communities.",
                ACCESS_PUBLIC,
                "TK Community Preserved",
            ),
            (
                "coll:gondi:sacred:clan",
                "Gondi Pen Katur Ceremonial Totem Recitations",
                "Secret ceremonial recitations invoking clan deities and ancestral spirits. Restricted to verified elders.",
                "gon",
                "Sacred Ceremonial Lore",
                None,
                "org:gondi:elders",
                "Sacred Clan Elder Council",
                "Preserved strictly under elder custodian supervision.",
                ACCESS_SACRED_ELDER_ONLY,
                "TK Secret / Sacred (Elder Discretion)",
            ),
        ]

        for coll in collections:
            c.execute("""
                INSERT OR IGNORE INTO archive_collections (
                    collection_id, title, description, primary_language, category,
                    cover_image_url, creator_organization_id, creator_name,
                    provenance_details, access_classification, traditional_knowledge_label,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (*coll, now_iso, now_iso))
            _sync_collection_to_kg(conn, coll[0], coll[1], coll[3], coll[2], coll[8])

        # 2. Oral Stories linked to real audio masters in transcripts table
        # Find transcript 5 (real Gondi audio)
        gondi_transcript = c.execute("SELECT id, audio_filename, audio_sha256 FROM transcripts WHERE id = 5").fetchone()
        gondi_audio_ref = gondi_transcript["audio_filename"] if gondi_transcript else "f172343b-e928-467b-8984-8f82ef9408bf.mp3"
        gondi_sha256 = gondi_transcript["audio_sha256"] if gondi_transcript else "28a08544889638b80d5bf86f39658e363d9ab1ef907355598ef79059300865fa"

        # Find transcript 6 (real Koya audio)
        koya_transcript = c.execute("SELECT id, audio_filename, audio_sha256 FROM transcripts WHERE id = 6").fetchone()
        koya_audio_ref = koya_transcript["audio_filename"] if koya_transcript else "08f70650-22e1-4929-9a90-35aea86512b7.wav"
        koya_sha256 = koya_transcript["audio_sha256"] if koya_transcript else "20c51a2ccfac3b8373f678d9f14b68c2e3ffc33dac17956b738f9241e4c0725b"

        stories = [
            (
                "story:gondi:lingo_recitation",
                "coll:gondi:lingo",
                5 if gondi_transcript else None,
                "Pahandi Kupar Lingo and the Creation of the First Flute",
                "పహండీ కుపార లింగో మరియు మొదటి పిల్లనగ్రోవి సృష్టి",
                "Recitation of how ancestor Pahandi Kupar Lingo fashioned the sacred bamboo flute and gathered the 750 Gond clans.",
                "gon",
                "Bastar / Adilabad Gondi",
                "Pahandi Kupar Lingo sagana penkun korite murra vatan.",
                "Pahandi Kupar Lingo carved the holy bamboo flute to invoke peace and assemble the clan elders.",
                gondi_audio_ref,
                217.16,
                gondi_sha256,
                "1998-04-12",
                "Adilabad Agency Forest, Telangana",
                "Tudum Debba Elder Bards",
                ATTRIBUTION_COMMUNITY_CLAN,
                ACCESS_PUBLIC,
                STATUS_APPROVED,
                "Dr. Ramana Rao (CIIL)",
                now_iso,
            ),
            (
                "story:koya:rain_forest_chant",
                "coll:koya:healers",
                6 if koya_transcript else None,
                "Song of the Rains and Forest Roots (Ethnobotanical Formulation)",
                "వాన దేవుడు మరియు వన మూలికల గాథ",
                "Healers prayer chanted when gathering bark and roots during the early monsoon showers along the Godavari gorge.",
                "kff",
                "Bhadrachalam Agency Koya",
                "Konda devata kondalu datinappudu mandu verulu pilisinavi.",
                "When the mountain deity passed the high hills, the medicinal roots called out their therapeutic powers.",
                koya_audio_ref,
                64.5,
                koya_sha256,
                "2004-08-20",
                "Papikondalu, Godavari Gorge",
                "Pochamma Clan Traditional Healers",
                ATTRIBUTION_BY_NAME,
                ACCESS_PUBLIC,
                STATUS_APPROVED,
                "Elder Koya Council",
                now_iso,
            ),
            (
                "story:santhali:sohrai_cattle_song",
                "coll:santhali:sohrai",
                None,
                "Sohrai Cattle Blessing & Earth Dance Song",
                "ᱥᱚᱦᱨᱟᱭ ᱜᱟᱹᱭ ᱟᱹᱥᱤᱥ ᱥᱮᱨᱮᱧ",
                "Traditional song thanking the working oxen and mother cows for sustaining the tribe throughout the seasons.",
                "sat",
                "Chota Nagpur Santhali",
                "Sohrai parwa re buru disom re gate dharwak johar.",
                "During the Sohrai festival in the hill country, we greet mother earth with dancing and reverence.",
                None,
                180.0,
                None,
                "2012-11-15",
                "Dumka, Santhal Parganas",
                "Santhal Youth Cultural Troupe",
                ATTRIBUTION_COMMUNITY_CLAN,
                ACCESS_PUBLIC,
                STATUS_APPROVED,
                "Santhal Sahitya Parishad",
                now_iso,
            ),
            (
                "story:lambadi:tanda_migration",
                "coll:lambadi:ghor",
                None,
                "Ballad of the Caravans Crossing the Narmada",
                "గారే బంజారా తాండా నర్మదా నది దాటిన కథ",
                "Historical narrative sung by elderly women while embroidering wedding cloths, telling of bullock caravans carrying grain across rivers.",
                "lmn",
                "Telangana Lambadi",
                "Baladiya ladan tanda aayo re Narmada kinare.",
                "Loaded with grain, our family caravan arrived at the shores of the great Narmada river.",
                None,
                145.0,
                None,
                "2018-02-10",
                "Nalgonda Tanda, Telangana",
                "Elder Sakru Bai",
                ATTRIBUTION_BY_NAME,
                ACCESS_PUBLIC,
                STATUS_APPROVED,
                "Banjara Heritage Trust",
                now_iso,
            ),
            (
                "story:gondi:clan_sacred_totem",
                "coll:gondi:sacred:clan",
                None,
                "Secret Totem Rites of the Four-Fold Saga Phratries",
                "నాలుగు సగాల పవిత్ర కులదైవ ఆవాహన",
                "Ceremonial rites strictly restricted to clan initiates during the annual Pen Katur gatherings.",
                "gon",
                "Traditional Gondi",
                "[Protected Ceremonial Text - Elder Initiation Required]",
                "[Translation restricted to accredited initiates under OCAP Protocols]",
                None,
                310.0,
                None,
                "1985-01-05",
                "Undisclosed Sacred Shrine, Bastar",
                "Elder Phratry Custodians",
                ATTRIBUTION_COMMUNITY_CLAN,
                ACCESS_SACRED_ELDER_ONLY,
                STATUS_APPROVED,
                "Supreme Pen Custodian",
                now_iso,
            ),
        ]

        for s in stories:
            c.execute("""
                INSERT OR IGNORE INTO cultural_stories (
                    story_id, collection_id, transcript_id, title, native_title,
                    description, primary_language, dialect_variety, transliteration,
                    translation_text, audio_reference, audio_duration_seconds,
                    audio_sha256, recording_date, location_name, contributor_name,
                    attribution_preference, access_classification, review_status,
                    reviewed_by, reviewed_at, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (*s, now_iso, now_iso))

            # FTS5 indexing
            c.execute("""
                INSERT OR IGNORE INTO cultural_stories_fts (
                    story_id, title, native_title, description, transliteration,
                    translation_text, primary_language, location_name
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (s[0], s[3], s[4], s[5], s[8], s[9], s[6], s[14]))

            # KG sync
            _sync_story_to_kg(conn, s[0], s[3], s[6], s[1], s[19])

        conn.commit()
        logger.info("Successfully seeded default cultural collections and stories.")
    finally:
        conn.close()
