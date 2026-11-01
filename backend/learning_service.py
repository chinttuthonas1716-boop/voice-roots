"""Voice Roots — Milestone 19: Language Learning & Interactive Practice Service.

Provides educational language learning modules, vocabulary drills, listening
comprehension exercises, and learner progress tracking.

OCAP Sovereignty Compliance:
- Strictly enforces `consent_educational_reuse = 1` filter before serving any
  community story, vocabulary, or audio prompt in educational modules.
- Preserves cultural attributions, clan provenance, and cultural contextual notes.
- Offline-first execution with $0 external inference cost.
"""

from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).resolve().parent / "voice_roots.db"


def _get_connection(db_path: Path | str | None = None) -> sqlite3.Connection:
    target = Path(db_path) if db_path else DB_PATH
    conn = sqlite3.connect(str(target), timeout=15.0)
    conn.row_factory = sqlite3.Row
    return conn


# ─────────────────────────────────────────────────────────────────────────────
# CURATED EDUCATIONAL SEED DATA
# ─────────────────────────────────────────────────────────────────────────────

SEED_LEARNING_COLLECTIONS: list[dict[str, Any]] = [
    {
        "collection_id": "learn_gon_01",
        "language": "Gondi",
        "variety": "Adilabad Southern",
        "title": "Gondi Foundational Vocab & Kinship",
        "description": "Essential Gondi vocabulary, communal pronouns, and traditional agrarian kinship terms.",
        "proficiency_level": "BEGINNER",
        "is_published": 1,
        "modules": [
            {
                "module_id": "mod_gon_01_mava",
                "order_index": 1,
                "title": "Communal Pronoun: Māva",
                "module_type": "VOCABULARY",
                "prompt_native_script": "మావ",
                "prompt_latin": "Māva",
                "prompt_translation": "Our / Ours (Communal inclusive possessive)",
                "audio_url": "/api/static/sample_gondi.wav",
                "options": ["Our / Ours", "River", "Forest", "Sunlight"],
                "correct_answer": "Our / Ours",
                "cultural_note": "In Gondi worldview, 'Māva' emphasizes communal custodianship over individual property.",
                "consent_educational_reuse": 1,
            },
            {
                "module_id": "mod_gon_02_jatara",
                "order_index": 2,
                "title": "Sacred Assembly: Jātara",
                "module_type": "LISTENING_COMPREHENSION",
                "prompt_native_script": "జాతర",
                "prompt_latin": "Jātara",
                "prompt_translation": "Sacred indigenous pilgrimage festival",
                "audio_url": "/api/static/sample_gondi.wav",
                "options": ["Pilgrimage Festival", "Market Trade", "Harvest Day", "Clan Meeting"],
                "correct_answer": "Pilgrimage Festival",
                "cultural_note": "Jātara represents the biennial gathering celebrating ancestors and resistance against unjust taxation.",
                "consent_educational_reuse": 1,
            },
            {
                "module_id": "mod_gon_03_kor",
                "order_index": 3,
                "title": "Fauna Contrast: Kōr",
                "module_type": "VOCABULARY",
                "prompt_native_script": "కోర్",
                "prompt_latin": "Kōr (/køːr/)",
                "prompt_translation": "Rooster / Fowl",
                "audio_url": "/api/static/sample_gondi.wav",
                "options": ["Rooster / Fowl", "Fingernail", "Tree branch", "Morning mist"],
                "correct_answer": "Rooster / Fowl",
                "cultural_note": "Contrasts phonemically with 'Gōr' (claw/nail). Integral to morning routines in Gondwana villages.",
                "consent_educational_reuse": 1,
            },
        ],
    },
    {
        "collection_id": "learn_koy_01",
        "language": "Koya",
        "variety": "Godavari Valley",
        "title": "Koya Nature & Riverine Heritage",
        "description": "Vocabulary and phrases honoring the Godavari river, forest flora, and clan kinship.",
        "proficiency_level": "BEGINNER",
        "is_published": 1,
        "modules": [
            {
                "module_id": "mod_koy_01_gondla",
                "order_index": 1,
                "title": "Kinship Structure: Gondla",
                "module_type": "VOCABULARY",
                "prompt_native_script": "గొండ్ల",
                "prompt_latin": "Gondla",
                "prompt_translation": "Ancestral Clan / Phratry",
                "audio_url": "/api/static/sample_gondi.wav",
                "options": ["Ancestral Clan", "Water Stream", "Sacred Stone", "Village Gate"],
                "correct_answer": "Ancestral Clan",
                "cultural_note": "Governs exogamous marriage alliances and mutual ceremonial responsibilities among Koya phratries.",
                "consent_educational_reuse": 1,
            },
            {
                "module_id": "mod_koy_02_vate",
                "order_index": 2,
                "title": "Phrasal Expression: Māva Nāte",
                "module_type": "PHRASE_BUILDER",
                "prompt_native_script": "మావ నాతె",
                "prompt_latin": "Māva nāte",
                "prompt_translation": "In our homeland village",
                "audio_url": "/api/static/sample_gondi.wav",
                "options": ["In our homeland village", "Near the river bend", "By the fire hearth", "Under the sal canopy"],
                "correct_answer": "In our homeland village",
                "cultural_note": "Root phrase used by Koya storytellers when recounting migrations along the Godavari basin.",
                "consent_educational_reuse": 1,
            },
        ],
    },
    {
        "collection_id": "learn_sat_01",
        "language": "Santhali",
        "variety": "Chota Nagpur",
        "title": "Santhali Greetings & Seasonal Cycles",
        "description": "Core Santhali greetings, Ol Chiki script representations, and sacred seasonal festivals.",
        "proficiency_level": "BEGINNER",
        "is_published": 1,
        "modules": [
            {
                "module_id": "mod_sat_01_johar",
                "order_index": 1,
                "title": "Sacred Greeting: Johar",
                "module_type": "VOCABULARY",
                "prompt_native_script": "ᱡᱚᱦᱟᱨ",
                "prompt_latin": "Johar",
                "prompt_translation": "Traditional reverential greeting to people and nature",
                "audio_url": "/api/static/sample_gondi.wav",
                "options": ["Traditional Greeting", "Farewell", "Thanksgiving", "Morning Song"],
                "correct_answer": "Traditional Greeting",
                "cultural_note": "'Johar' expresses deep egalitarian mutual respect, greeting both fellow human beings and living nature.",
                "consent_educational_reuse": 1,
            },
            {
                "module_id": "mod_sat_02_baha",
                "order_index": 2,
                "title": "Spring Festival: Baha Parab",
                "module_type": "CULTURAL_DIALOGUE",
                "prompt_native_script": "ᱵᱟᱦᱟ ᱯᱚᱨᱚᱵᱽ",
                "prompt_latin": "Baha Parab",
                "prompt_translation": "Flower festival celebrating Sal blossoms and renewal",
                "audio_url": "/api/static/sample_gondi.wav",
                "options": [
                    "Flower festival celebrating Sal blossoms",
                    "Winter harvest threshing ritual",
                    "Monsoon arrow dance",
                    "New moon storytelling vigil",
                ],
                "correct_answer": "Flower festival celebrating Sal blossoms",
                "cultural_note": "During Baha, no fresh Sal blossoms are worn or plucked until the Jaherthan priests offer the first blossoms.",
                "consent_educational_reuse": 1,
            },
        ],
    },
    {
        "collection_id": "learn_lmn_01",
        "language": "Lambadi",
        "variety": "Deccan Banjara",
        "title": "Lambadi Identity & Tanda Culture",
        "description": "Oral vocabulary reflecting Banjara clan settlement structures and pastoral heritage.",
        "proficiency_level": "BEGINNER",
        "is_published": 1,
        "modules": [
            {
                "module_id": "mod_lmn_01_tanda",
                "order_index": 1,
                "title": "Settlement: Tanda",
                "module_type": "VOCABULARY",
                "prompt_native_script": "తాండా",
                "prompt_latin": "Tanda",
                "prompt_translation": "Banjara clan settlement / autonomous hamlet",
                "audio_url": "/api/static/sample_gondi.wav",
                "options": ["Banjara clan settlement", "Caravan pack bull", "Embroidered bodice", "Silver currency"],
                "correct_answer": "Banjara clan settlement",
                "cultural_note": "A traditional autonomous settlement governed by the Naik (headman) and Karbari (councilor).",
                "consent_educational_reuse": 1,
            },
        ],
    },
]


def seed_default_learning_data(db_path: Path | str | None = None) -> None:
    """Idempotently seed default educational collections and modules."""
    now = datetime.now(timezone.utc).isoformat()
    with _get_connection(db_path) as conn:
        cursor = conn.cursor()
        for col in SEED_LEARNING_COLLECTIONS:
            cursor.execute(
                "SELECT id FROM learning_collections WHERE collection_id = ?",
                (col["collection_id"],),
            )
            if not cursor.fetchone():
                cursor.execute(
                    """
                    INSERT INTO learning_collections (
                        collection_id, language, variety, title, description,
                        proficiency_level, is_published, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        col["collection_id"],
                        col["language"],
                        col.get("variety"),
                        col["title"],
                        col["description"],
                        col["proficiency_level"],
                        col["is_published"],
                        now,
                    ),
                )

            # Seed modules
            for mod in col.get("modules", []):
                cursor.execute(
                    "SELECT id FROM learning_modules WHERE module_id = ?",
                    (mod["module_id"],),
                )
                if not cursor.fetchone():
                    cursor.execute(
                        """
                        INSERT INTO learning_modules (
                            module_id, collection_id, order_index, title, module_type,
                            prompt_native_script, prompt_latin, prompt_translation,
                            audio_url, options_json, correct_answer, cultural_note,
                            consent_educational_reuse, created_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            mod["module_id"],
                            col["collection_id"],
                            mod["order_index"],
                            mod["title"],
                            mod["module_type"],
                            mod.get("prompt_native_script"),
                            mod["prompt_latin"],
                            mod["prompt_translation"],
                            mod.get("audio_url"),
                            json.dumps(mod["options"]),
                            mod["correct_answer"],
                            mod.get("cultural_note"),
                            mod.get("consent_educational_reuse", 1),
                            now,
                        ),
                    )
        conn.commit()


# ─────────────────────────────────────────────────────────────────────────────
# DOMAIN QUERIES
# ─────────────────────────────────────────────────────────────────────────────

def get_learning_collections(
    language: str | None = None,
    proficiency: str | None = None,
    db_path: Path | str | None = None,
) -> list[dict[str, Any]]:
    """Retrieve published learning collections with module counts."""
    with _get_connection(db_path) as conn:
        cursor = conn.cursor()
        query = """
            SELECT c.id, c.collection_id, c.language, c.variety, c.title, c.description,
                   c.proficiency_level, c.is_published, c.created_at,
                   COUNT(m.id) as module_count
            FROM learning_collections c
            LEFT JOIN learning_modules m ON c.collection_id = m.collection_id
                 AND m.consent_educational_reuse = 1
            WHERE c.is_published = 1
        """
        params: list[Any] = []
        if language and language.lower() != "all":
            query += " AND LOWER(c.language) = LOWER(?)"
            params.append(language)
        if proficiency and proficiency.lower() != "all":
            query += " AND LOWER(c.proficiency_level) = LOWER(?)"
            params.append(proficiency)

        query += " GROUP BY c.id ORDER BY c.language ASC, c.title ASC"
        cursor.execute(query, params)
        rows = cursor.fetchall()

        return [
            {
                "id": r["id"],
                "collection_id": r["collection_id"],
                "language": r["language"],
                "variety": r["variety"],
                "title": r["title"],
                "description": r["description"],
                "proficiency_level": r["proficiency_level"],
                "is_published": bool(r["is_published"]),
                "created_at": r["created_at"],
                "module_count": r["module_count"],
            }
            for r in rows
        ]


def get_collection_details(
    collection_id: str,
    db_path: Path | str | None = None,
) -> dict[str, Any] | None:
    """Retrieve full details of a specific collection including its active modules."""
    with _get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, collection_id, language, variety, title, description,
                   proficiency_level, is_published, created_at
            FROM learning_collections
            WHERE collection_id = ?
            """,
            (collection_id,),
        )
        row = cursor.fetchone()
        if not row:
            return None

        col_dict = {
            "id": row["id"],
            "collection_id": row["collection_id"],
            "language": row["language"],
            "variety": row["variety"],
            "title": row["title"],
            "description": row["description"],
            "proficiency_level": row["proficiency_level"],
            "is_published": bool(row["is_published"]),
            "created_at": row["created_at"],
        }

        # Fetch modules enforcing OCAP consent filter
        cursor.execute(
            """
            SELECT id, module_id, collection_id, order_index, title, module_type,
                   prompt_native_script, prompt_latin, prompt_translation,
                   audio_url, options_json, correct_answer, cultural_note,
                   consent_educational_reuse, created_at
            FROM learning_modules
            WHERE collection_id = ? AND consent_educational_reuse = 1
            ORDER BY order_index ASC
            """,
            (collection_id,),
        )
        mod_rows = cursor.fetchall()
        modules = []
        for mr in mod_rows:
            try:
                options = json.loads(mr["options_json"])
            except (json.JSONDecodeError, TypeError):
                options = []
            modules.append({
                "id": mr["id"],
                "module_id": mr["module_id"],
                "collection_id": mr["collection_id"],
                "order_index": mr["order_index"],
                "title": mr["title"],
                "module_type": mr["module_type"],
                "prompt_native_script": mr["prompt_native_script"],
                "prompt_latin": mr["prompt_latin"],
                "prompt_translation": mr["prompt_translation"],
                "audio_url": mr["audio_url"],
                "options": options,
                "correct_answer": mr["correct_answer"],
                "cultural_note": mr["cultural_note"],
                "consent_educational_reuse": bool(mr["consent_educational_reuse"]),
                "created_at": mr["created_at"],
            })

        col_dict["modules"] = modules
        col_dict["module_count"] = len(modules)
        return col_dict


def get_learning_modules(
    collection_id: str,
    db_path: Path | str | None = None,
) -> list[dict[str, Any]]:
    """Get active modules for a collection with educational reuse consent strictly verified."""
    col = get_collection_details(collection_id, db_path)
    return col.get("modules", []) if col else []


def submit_module_practice(
    learner_id: str,
    module_id: str,
    selected_answer: str,
    db_path: Path | str | None = None,
) -> dict[str, Any]:
    """Evaluate learner's answer and record progress state in learner_progress."""
    with _get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, title, correct_answer, cultural_note, consent_educational_reuse
            FROM learning_modules
            WHERE module_id = ?
            """,
            (module_id,),
        )
        mod = cursor.fetchone()
        if not mod:
            raise ValueError(f"Module '{module_id}' not found.")

        if not mod["consent_educational_reuse"]:
            raise PermissionError("Content not cleared for educational reuse under OCAP consent.")

        correct_answer = mod["correct_answer"].strip()
        is_correct = selected_answer.strip().lower() == correct_answer.lower()
        now = datetime.now(timezone.utc).isoformat()

        # Fetch existing progress
        cursor.execute(
            """
            SELECT id, status, score, attempts_count
            FROM learner_progress
            WHERE learner_id = ? AND module_id = ?
            """,
            (learner_id, module_id),
        )
        prog = cursor.fetchone()

        if prog:
            curr_attempts = prog["attempts_count"] + 1
            new_score = 100.0 if is_correct else max(0.0, prog["score"] - 20.0)
            if is_correct:
                status = "MASTERED" if curr_attempts >= 2 and prog["status"] in ("COMPLETED", "MASTERED") else "COMPLETED"
            else:
                status = "IN_PROGRESS"

            cursor.execute(
                """
                UPDATE learner_progress
                SET status = ?, score = ?, attempts_count = ?, last_attempt_at = ?
                WHERE id = ?
                """,
                (status, new_score, curr_attempts, now, prog["id"]),
            )
            progress_id = prog["id"]
        else:
            curr_attempts = 1
            new_score = 100.0 if is_correct else 0.0
            status = "COMPLETED" if is_correct else "IN_PROGRESS"
            cursor.execute(
                """
                INSERT INTO learner_progress (
                    learner_id, module_id, status, score, attempts_count, last_attempt_at
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                (learner_id, module_id, status, new_score, curr_attempts, now),
            )
            progress_id = cursor.lastrowid

        conn.commit()

        return {
            "learner_id": learner_id,
            "module_id": module_id,
            "is_correct": is_correct,
            "selected_answer": selected_answer,
            "correct_answer": correct_answer,
            "cultural_note": mod["cultural_note"],
            "progress": {
                "id": progress_id,
                "status": status,
                "score": new_score,
                "attempts_count": curr_attempts,
                "last_attempt_at": now,
            },
        }


def get_learner_progress(
    learner_id: str,
    db_path: Path | str | None = None,
) -> dict[str, Any]:
    """Retrieve accumulated progress summary for a given learner."""
    with _get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT p.id, p.module_id, p.status, p.score, p.attempts_count, p.last_attempt_at,
                   m.title as module_title, m.module_type, m.collection_id
            FROM learner_progress p
            JOIN learning_modules m ON p.module_id = m.module_id
            WHERE p.learner_id = ?
            ORDER BY p.last_attempt_at DESC
            """,
            (learner_id,),
        )
        rows = cursor.fetchall()

        items = [
            {
                "id": r["id"],
                "module_id": r["module_id"],
                "module_title": r["module_title"],
                "module_type": r["module_type"],
                "collection_id": r["collection_id"],
                "status": r["status"],
                "score": r["score"],
                "attempts_count": r["attempts_count"],
                "last_attempt_at": r["last_attempt_at"],
            }
            for r in rows
        ]

        total_attempted = len(items)
        completed_count = sum(1 for it in items if it["status"] in ("COMPLETED", "MASTERED"))
        mastered_count = sum(1 for it in items if it["status"] == "MASTERED")
        avg_score = round(sum(it["score"] for it in items) / max(1, total_attempted), 1)

        return {
            "learner_id": learner_id,
            "total_modules_attempted": total_attempted,
            "completed_count": completed_count,
            "mastered_count": mastered_count,
            "average_score": avg_score,
            "records": items,
        }


def get_learning_overview(db_path: Path | str | None = None) -> dict[str, Any]:
    """Provide ecosystem overview of learning resources and pedagogical coverage."""
    with _get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM learning_collections WHERE is_published = 1")
        total_cols = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM learning_modules WHERE consent_educational_reuse = 1")
        total_mods = cursor.fetchone()[0]

        cursor.execute("SELECT DISTINCT language FROM learning_collections WHERE is_published = 1")
        languages = [r[0] for r in cursor.fetchall()]

        cursor.execute("SELECT COUNT(DISTINCT learner_id) FROM learner_progress")
        total_learners = cursor.fetchone()[0]

        return {
            "total_collections": total_cols,
            "total_modules": total_mods,
            "languages": languages,
            "total_learners": total_learners,
            "consent_gated": True,
            "status": "active",
        }
