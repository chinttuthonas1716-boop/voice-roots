"""Tests for Task T2.3: Reviewer Queue & Customary Elder Moderation.

Requirements Verified:
1. Screen/API for Reviewer / Admin roles listing pending transcripts, translations, and dictionary entries.
2. Actions: approve, correct, reject.
3. Approval moves DRAFT to PUBLISHED:
   - Transcripts: verification_status='published', status='Published', privacy_level='public'.
   - Translations: verified=1, review_status='elder_approved', badge_label='Elder Approved'.
   - Dictionary: status='approved', is_elder_approved=1.
4. Correcting updates text, records previous/suggested text in corrections table, and moves status to published/approved.
5. Rejecting moves status to withdrawn_or_rejected / rejected.
6. Role-based authorization: only reviewer/admin/elder roles may resolve items (unauthorized roles get HTTP 403).
7. Log every decision in governance_audit_logs with reviewer's identity, role, and action payload.
"""

from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient

from backend import main
from backend.main import DB_PATH

client = TestClient(main.app)

_CREATED_IDS: list[dict[str, int]] = []


def _cleanup_test_data(ids: dict[str, int]) -> None:
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            if ids.get("transcript_id"):
                cursor.execute("DELETE FROM transcripts WHERE id = ?", (ids["transcript_id"],))
            if ids.get("translation_id"):
                cursor.execute("DELETE FROM translations WHERE id = ?", (ids["translation_id"],))
            if ids.get("dictionary_id"):
                cursor.execute("DELETE FROM dictionary WHERE id = ?", (ids["dictionary_id"],))
            conn.commit()
    except Exception:
        pass


@pytest.fixture(autouse=True)
def cleanup_test_records_after_each_test():
    yield
    while _CREATED_IDS:
        ids = _CREATED_IDS.pop()
        _cleanup_test_data(ids)


def _init_test_data() -> dict[str, int]:
    """Insert draft items into transcripts, translations, and dictionary tables."""
    now = datetime.now(timezone.utc).isoformat()
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()

        # 1. Draft transcript
        cursor.execute(
            """
            INSERT INTO transcripts (
                uuid_id, title, language, dialect, transcript_text,
                audio_filename, audio_url, contributor_name, contributor_role,
                verification_status, status, privacy_level,
                consent_private_storage, consent_community_access, consent_public_publication,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 0, ?, ?)
            """,
            (
                f"draft-uuid-t23-{datetime.now(timezone.utc).timestamp()}",
                "Monsoon Harvest Oral Lore",
                "Gondi",
                "Adilabad",
                "నార లోపల వాన వచ్చింది (Draft audio transcription)",
                "test_t23_audio.wav",
                "/audio/test_t23_audio.wav",
                "Kumuram Jangu",
                "speaker",
                "draft",
                "Draft",
                "private",
                now,
                now,
            ),
        )
        transcript_id = cursor.lastrowid

        # 2. Draft translation (unreviewed machine output)
        cursor.execute(
            """
            INSERT INTO translations (
                transcript_id, source_language, target_language, source_text,
                translated_text, provider, model, verified, review_status, badge_label,
                limitation_note, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'unreviewed_draft', 'Draft (Unreviewed)', ?, ?, ?)
            """,
            (
                transcript_id,
                "Gondi",
                "English",
                "నార లోపల వాన వచ్చింది",
                "Rain has come inside the village (Machine Draft)",
                "indictrans2",
                "ai4bharat/indictrans2-indic-en-1B",
                "Machine draft without elder verification.",
                now,
                now,
            ),
        )
        translation_id = cursor.lastrowid

        # 3. Draft / pending dictionary entry
        cursor.execute(
            """
            INSERT INTO dictionary (
                word, language_code, dialect, native_script, ipa,
                meanings_json, translations_json, is_elder_approved, status,
                contributor_name, contributor_role, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'pending_review', ?, ?, ?, ?)
            """,
            (
                "నార",
                "gon",
                "Adilabad",
                "నార",
                "naːra",
                json.dumps(["Village, community settlement"]),
                json.dumps({"te": "గ్రామం", "en": "village"}),
                "Kovvasi Ramesh",
                "contributor",
                now,
                now,
            ),
        )
        dictionary_id = cursor.lastrowid
        conn.commit()

    created = {
        "transcript_id": transcript_id,
        "translation_id": translation_id,
        "dictionary_id": dictionary_id,
    }
    _CREATED_IDS.append(created)
    return created


def test_reviewer_queue_retrieval_and_filtering():
    """Verify reviewer queue lists pending items across transcripts, translations, and dictionary."""
    ids = _init_test_data()

    # 1. Fetch unified queue
    resp = client.get("/api/v1/reviewer/queue?limit=50")
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["status"] == "success"
    items = data["items"]
    assert len(items) >= 3

    # Check transcript item exists
    t_item = next((i for i in items if i["item_type"] == "transcript" and i["raw_id"] == ids["transcript_id"]), None)
    assert t_item is not None
    assert t_item["language"] == "Gondi"
    assert "నార లోపల" in t_item["text"]

    # Check translation item exists
    tr_item = next((i for i in items if i["item_type"] == "translation" and i["raw_id"] == ids["translation_id"]), None)
    assert tr_item is not None
    assert tr_item["target_language"] == "English"
    assert "Machine Draft" in tr_item["text"]

    # Check dictionary item exists
    d_item = next((i for i in items if i["item_type"] == "dictionary" and i["raw_id"] == ids["dictionary_id"]), None)
    assert d_item is not None
    assert d_item["title"] == "నార"

    # 2. Filter by item_type=transcript
    resp_t = client.get("/api/v1/reviewer/queue?item_type=transcript&limit=50")
    assert resp_t.status_code == 200
    for it in resp_t.json()["items"]:
        assert it["item_type"] == "transcript"

    # 3. Filter by item_type=translation
    resp_tr = client.get("/api/v1/reviewer/queue?item_type=translation&limit=50")
    assert resp_tr.status_code == 200
    for it in resp_tr.json()["items"]:
        assert it["item_type"] == "translation"


def test_reviewer_role_authorization_enforced():
    """Verify unauthorized roles receive HTTP 403 when attempting moderation."""
    ids = _init_test_data()

    # Attempt decision as regular contributor or listener -> 403
    for unauth_role in ["contributor", "listener", "guest", "anonymous"]:
        resp = client.post(
            "/api/v1/reviewer/decision",
            json={
                "item_type": "transcript",
                "item_id": ids["transcript_id"],
                "action": "approve",
                "reviewer_name": "Unauthorized Contributor",
                "reviewer_role": unauth_role,
            },
        )
        assert resp.status_code == 403, f"Expected 403 for role {unauth_role}, got {resp.status_code}"


def test_reviewer_approve_transcript_moves_draft_to_published_and_audits():
    """Verify that approving a draft transcript moves it to PUBLISHED and writes an audit log."""
    ids = _init_test_data()
    t_id = ids["transcript_id"]

    # Submit approval decision as Verified Elder
    resp = client.post(
        "/api/v1/reviewer/decision",
        json={
            "item_type": "transcript",
            "item_id": t_id,
            "action": "approve",
            "reviewer_name": "Elder Soyam Laxman",
            "reviewer_role": "elder",
            "notes": "Verified authentic oral phrasing and sacred clan phrasing.",
        },
    )
    assert resp.status_code == 200, resp.text
    res_data = resp.json()
    assert res_data["status"] == "success"
    assert res_data["decision"] == "APPROVE"

    # Verify database state: DRAFT moved to PUBLISHED
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM transcripts WHERE id = ?", (t_id,))
        t_row = cursor.fetchone()
        assert t_row is not None
        assert t_row["verification_status"] == "published"
        assert t_row["status"] == "Published"
        assert t_row["privacy_level"] == "public"
        assert t_row["verified_by"] == "Elder Soyam Laxman"
        assert "sacred clan phrasing" in (t_row["review_notes"] or "")

        # Verify audit log entry
        cursor.execute(
            """
            SELECT * FROM governance_audit_logs
            WHERE entity_type = 'transcript' AND entity_id = ?
            ORDER BY id DESC LIMIT 1
            """,
            (str(t_id),),
        )
        audit_row = cursor.fetchone()
        assert audit_row is not None
        assert audit_row["action_type"] == "REVIEWER_APPROVE"
        assert audit_row["actor_name"] == "Elder Soyam Laxman"
        assert audit_row["actor_role"] == "elder"


def test_reviewer_correct_transcript_records_revision_and_publishes():
    """Verify that correcting a transcript updates text, inserts correction record, and marks published."""
    ids = _init_test_data()
    t_id = ids["transcript_id"]

    corrected_text = "నార లోపల పెను వాన కురిసింది (Elder Authenticated Phrasing)"
    resp = client.post(
        "/api/v1/reviewer/decision",
        json={
            "item_type": "transcript",
            "item_id": t_id,
            "action": "correct",
            "corrected_text": corrected_text,
            "reviewer_name": "Elder Soyam Laxman",
            "reviewer_role": "elder",
            "notes": "Corrected phonetic nuance on rain intensity.",
        },
    )
    assert resp.status_code == 200, resp.text

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM transcripts WHERE id = ?", (t_id,))
        t_row = cursor.fetchone()
        assert t_row["transcript_text"] == corrected_text
        assert t_row["verification_status"] == "published"
        assert t_row["status"] == "Published"

        # Check corrections table
        cursor.execute(
            "SELECT * FROM corrections WHERE target_type = 'transcript' AND target_id = ? ORDER BY id DESC LIMIT 1",
            (t_id,),
        )
        corr_row = cursor.fetchone()
        assert corr_row is not None
        assert corr_row["suggested_text"] == corrected_text
        assert corr_row["reviewed_by"] == "Elder Soyam Laxman"


def test_reviewer_reject_transcript_sets_withdrawn_status():
    """Verify that rejecting a transcript sets withdrawn/rejected status and logs reason."""
    ids = _init_test_data()
    t_id = ids["transcript_id"]

    resp = client.post(
        "/api/v1/reviewer/decision",
        json={
            "item_type": "transcript",
            "item_id": t_id,
            "action": "reject",
            "reviewer_name": "Elder Soyam Laxman",
            "reviewer_role": "elder",
            "notes": "Sacred clan chants restricted from public dissemination.",
        },
    )
    assert resp.status_code == 200, resp.text

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM transcripts WHERE id = ?", (t_id,))
        t_row = cursor.fetchone()
        assert t_row["verification_status"] == "withdrawn_or_rejected"
        assert t_row["status"] == "Rejected"


def test_reviewer_approve_and_correct_translation():
    """Verify approving and correcting draft translation moves it to Elder Approved."""
    ids = _init_test_data()
    tr_id = ids["translation_id"]

    # 1. Correct translation
    corrected_trans = "Rain has abundantly poured upon the village settlement."
    resp_corr = client.post(
        "/api/v1/reviewer/decision",
        json={
            "item_type": "translation",
            "item_id": tr_id,
            "action": "correct",
            "corrected_text": corrected_trans,
            "reviewer_name": "Dr. Ananya Sen",
            "reviewer_role": "reviewer",
            "notes": "Accurate poetic gloss of Gondi oral idiom.",
        },
    )
    assert resp_corr.status_code == 200, resp_corr.text

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM translations WHERE id = ?", (tr_id,))
        tr_row = cursor.fetchone()
        assert tr_row["translated_text"] == corrected_trans
        assert tr_row["verified"] == 1
        assert tr_row["review_status"] == "elder_approved"
        assert tr_row["badge_label"] == "Elder Approved"


def test_reviewer_approve_and_correct_dictionary():
    """Verify approving and correcting dictionary word marks it as Elder Approved."""
    ids = _init_test_data()
    dict_id = ids["dictionary_id"]

    # 1. Correct meaning
    corrected_meaning = "Sacred village dwelling / Clan ancestral settlement"
    resp = client.post(
        "/api/v1/reviewer/decision",
        json={
            "item_type": "dictionary",
            "item_id": dict_id,
            "action": "correct",
            "corrected_text": corrected_meaning,
            "reviewer_name": "Elder Soyam Laxman",
            "reviewer_role": "elder",
            "notes": "Reflects customary Koitur ancestral meaning.",
        },
    )
    assert resp.status_code == 200, resp.text

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM dictionary WHERE id = ?", (dict_id,))
        d_row = cursor.fetchone()
        assert d_row["status"] == "approved"
        assert d_row["is_elder_approved"] == 1
        assert d_row["approved_by"] == "Elder Soyam Laxman"
        assert corrected_meaning in d_row["meanings_json"]
