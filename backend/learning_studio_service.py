"""Voice Roots: Milestone 30 — Advanced Learning Studio Service.
=============================================================================
Provides advanced indigenous language learning systems:
1. Spaced Repetition System (SRS) using SuperMemo SM-2 & Leitner algorithm.
2. Formant-based pronunciation evaluation with acoustic elder benchmarking.
3. Audio-first listening comprehension quizzes without requiring dominant scripts.
4. Interactive sentence construction drills with Dravidian/Munda syntax validation.
5. Client-side offline progress synchronization and mastery analytics.

Strictly adheres to OCAP principles: all learning content is community-approved;
zero cloud API spend ($0.00); all computations run locally and deterministically.
"""

from __future__ import annotations

import json
import logging
import math
import os
import sqlite3
from datetime import datetime, timedelta, timezone
from typing import Any

logger = logging.getLogger(__name__)

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get(
    "VOICE_ROOTS_DB_PATH",
    os.environ.get("VOICE_ROOTS_DB", os.path.join(BACKEND_DIR, "voice_roots.db")),
)


def _get_db(db_path: str = DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path, timeout=15.0)
    conn.row_factory = sqlite3.Row
    return conn


# ─────────────────────────────────────────────────────────────────────────────
# 1. DATABASE SCHEMA & SEED INVENTORY
# ─────────────────────────────────────────────────────────────────────────────

SEED_SRS_FLASHCARDS: list[dict[str, Any]] = [
    {
        "card_template_id": "srs:gon:maram",
        "language": "Gondi",
        "variety": "Adilabad Raj Gondi",
        "front_prompt": "మరమ్ (Maram)",
        "front_audio_url": "/api/static/sample_gondi.wav",
        "back_meaning": "Tree / Sacred living grove",
        "back_ipa": "/ma.ram/",
        "cultural_context": "Deeply revered in Pen Katur cosmology as sacred clan habitat.",
    },
    {
        "card_template_id": "srs:gon:yer",
        "language": "Gondi",
        "variety": "Adilabad Raj Gondi",
        "front_prompt": "యేర్ (Yēr)",
        "front_audio_url": "/api/static/sample_gondi.wav",
        "back_meaning": "Fresh spring water / Life stream",
        "back_ipa": "/jeːr/",
        "cultural_context": "Associated with hill aquifer shrines and life renewal rituals.",
    },
    {
        "card_template_id": "srs:kff:veypu",
        "language": "Koya",
        "variety": "Godavari Valley Koya",
        "front_prompt": "వేయిపు (Veypu)",
        "front_audio_url": "/api/static/sample_gondi.wav",
        "back_meaning": "Dense bamboo thicket / Riverine canopy",
        "back_ipa": "/veːj.pu/",
        "cultural_context": "Primary forest building material and boundary indicator in Koya tradition.",
    },
    {
        "card_template_id": "srs:kff:tung",
        "language": "Koya",
        "variety": "Godavari Valley Koya",
        "front_prompt": "తుంగ్ (Tung)",
        "front_audio_url": "/api/static/sample_gondi.wav",
        "back_meaning": "Cool forest stream / Drinking spring",
        "back_ipa": "/tuŋ/",
        "cultural_context": "Ritually protected water source blessed during Sammakka-Sarakka festivals.",
    },
    {
        "card_template_id": "srs:sat:sarjom",
        "language": "Santhali",
        "variety": "Mayurbhanj / Chota Nagpur",
        "front_prompt": "ᱥᱟᱨᱡᱚᱢ (Sarjom)",
        "front_audio_url": "/api/static/sample_gondi.wav",
        "back_meaning": "Sal tree (Shorea robusta) / Canopy of Jaher",
        "back_ipa": "/sar.ɟom/",
        "cultural_context": "Sacred center of the Jaher Than grove where Marang Buru is venerated.",
    },
    {
        "card_template_id": "srs:lmn:tanda",
        "language": "Lambadi",
        "variety": "Telangana Banjara",
        "front_prompt": "तांडा (Tāndā)",
        "front_audio_url": "/api/static/sample_gondi.wav",
        "back_meaning": "Autonomous clan settlement / Encampment",
        "back_ipa": "/taːn.ɖaː/",
        "cultural_context": "Traditional sovereign settlement governed by the Naik and Karbari.",
    },
]

SEED_FORMANT_BENCHMARKS: list[dict[str, Any]] = [
    {
        "benchmark_id": "formant:gon:a",
        "language": "Gondi",
        "phoneme_or_word": "Open Low-Central Vowel /a/",
        "ipa": "/a/",
        "target_f0": 135.0,
        "target_f1": 730.0,
        "target_f2": 1280.0,
        "articulatory_guide": "Lower tongue body completely and open the pharynx for open Gondi /a/.",
    },
    {
        "benchmark_id": "formant:gon:retroflex_l",
        "language": "Gondi",
        "phoneme_or_word": "Retroflex Lateral Flap /ɭ/",
        "ipa": "/ɭ/",
        "target_f0": 140.0,
        "target_f1": 420.0,
        "target_f2": 1650.0,
        "articulatory_guide": "Curl tongue tip back to touch hard palate and release rapidly with lateral airflow.",
    },
    {
        "benchmark_id": "formant:kff:e_long",
        "language": "Koya",
        "phoneme_or_word": "Close-Mid Front Long Vowel /eː/",
        "ipa": "/eː/",
        "target_f0": 130.0,
        "target_f1": 480.0,
        "target_f2": 1980.0,
        "articulatory_guide": "Maintain fronted tongue posture without diphthongization for archaic Dravidian /eː/.",
    },
    {
        "benchmark_id": "formant:sat:glottal_stop",
        "language": "Santhali",
        "phoneme_or_word": "Glottal Stop /ʔ/",
        "ipa": "/ʔ/",
        "target_f0": 120.0,
        "target_f1": 500.0,
        "target_f2": 1400.0,
        "articulatory_guide": "Abruptly adduct vocal folds to create a crisp glottal closure characteristic of Ol Chiki codas.",
    },
]

SEED_SENTENCE_DRILLS: list[dict[str, Any]] = [
    {
        "drill_id": "drill:gon:01_clan_reverence",
        "language": "Gondi",
        "title": "Clan Sacred Tree Offering",
        "cultural_context": "Formal invocation spoken before harvesting seasonal forest timber.",
        "target_sentence": "మావ సగా పెన్ మరమ్ పూజ కీతోమ్",
        "target_audio_url": "/api/static/sample_gondi.wav",
        "tokens": ["కీతోమ్", "మరమ్", "మావ", "పూజ", "సగా పెన్"],
        "correct_order": ["మావ", "సగా పెన్", "మరమ్", "పూజ", "కీతోమ్"],
        "syntax_pattern": "SOV (Inclusive Possessive + Clan Deity + Sacred Object + Ritual Noun + Finite Verb)",
        "translation_english": "Our clan deity's tree we worship with reverence.",
    },
    {
        "drill_id": "drill:kff:01_river_harvest",
        "language": "Koya",
        "title": "Godavari Stream Blessing",
        "cultural_context": "Morning prayer offered by Koya fisherfolk to the river stream.",
        "target_sentence": "తుంగ్ నీరు మావా ఊరు వత్తు",
        "target_audio_url": "/api/static/sample_gondi.wav",
        "tokens": ["వత్తు", "నీరు", "ఊరు", "తుంగ్", "మావా"],
        "correct_order": ["తుంగ్", "నీరు", "మావా", "ఊరు", "వత్తు"],
        "syntax_pattern": "SOV (Adjective + River Stream + Genitive Pronoun + Village + Verb)",
        "translation_english": "The cool stream water comes toward our ancestral village.",
    },
    {
        "drill_id": "drill:sat:01_sal_grove",
        "language": "Santhali",
        "title": "Jaher Sacred Grove Gathering",
        "cultural_context": "Spring Baha festival assembly under blooming Shorea robusta trees.",
        "target_sentence": "ᱟᱞᱮ ᱡᱟᱦᱮᱨ ᱥᱟᱨᱡᱚᱢ ᱫᱟᱨᱮ ᱥᱮᱵᱟ ᱮᱫᱟ",
        "target_audio_url": "/api/static/sample_gondi.wav",
        "tokens": ["ᱥᱮᱵᱟ ᱮᱫᱟ", "ᱡᱟᱦᱮᱨ", "ᱥᱟᱨᱡᱚᱢ", "ᱟᱞᱮ", "ᱫᱟᱨᱮ"],
        "correct_order": ["ᱟᱞᱮ", "ᱡᱟᱦᱮᱨ", "ᱥᱟᱨᱡᱚᱢ", "ᱫᱟᱨᱮ", "ᱥᱮᱵᱟ ᱮᱫᱟ"],
        "syntax_pattern": "Munda SOV (Pronoun + Sacred Grove + Botanical Noun + Classifier + Compound Verb)",
        "translation_english": "We venerate the holy Sal tree in the sacred Jaher grove.",
    },
]

SEED_LISTENING_QUIZZES: list[dict[str, Any]] = [
    {
        "quiz_id": "quiz:gon:oral_01",
        "language": "Gondi",
        "title": "Forest Clan Welcoming Greeting",
        "audio_prompt_url": "/api/static/sample_gondi.wav",
        "audio_duration_seconds": 3.8,
        "question_text": "Listen to the elder's greeting. What traditional communal obligation is being spoken?",
        "options": [
            {"id": "opt_1", "text": "Welcoming relatives to the Pen Katur annual clan assembly", "is_correct": True},
            {"id": "opt_2", "text": "Announcing the arrival of market traders at the weekly haat", "is_correct": False},
            {"id": "opt_3", "text": "Warning hunters about sudden monsoon flooding", "is_correct": False},
            {"id": "opt_4", "text": "Instructing children to gather dried mahua blossoms", "is_correct": False},
        ],
        "cultural_note": "In Gondi etiquette, clan kinship formulas (Saga Pen) must always precede economic discussions.",
    },
    {
        "quiz_id": "quiz:kff:oral_01",
        "language": "Koya",
        "title": "Medicinal Root Preparation Chants",
        "audio_prompt_url": "/api/static/sample_gondi.wav",
        "audio_duration_seconds": 4.2,
        "question_text": "Listen to the healer's instruction. Which ecological zone is indicated for harvesting?",
        "options": [
            {"id": "opt_1", "text": "Along the shaded riverbank thicket before sunrise", "is_correct": True},
            {"id": "opt_2", "text": "In the dry open grassland during midday sun", "is_correct": False},
            {"id": "opt_3", "text": "Inside the village granary storehouse", "is_correct": False},
            {"id": "opt_4", "text": "Near the village cattle pen at dusk", "is_correct": False},
        ],
        "cultural_note": "Traditional Koya healers protect sacred botanical remedies by embedding harvest protocols in oral chants.",
    },
]


def init_learning_studio_db(db_path: str = DB_PATH) -> None:
    """Initialize database tables and seed baseline pedagogy if missing."""
    with _get_db(db_path) as conn:
        cursor = conn.cursor()

        # 1. Spaced Repetition Flashcards Table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS learning_srs_cards (
                card_id TEXT PRIMARY KEY,
                learner_id TEXT NOT NULL,
                language TEXT NOT NULL,
                variety TEXT,
                front_prompt TEXT NOT NULL,
                front_audio_url TEXT,
                back_meaning TEXT NOT NULL,
                back_ipa TEXT,
                cultural_context TEXT,
                repetition_number INTEGER DEFAULT 0,
                ease_factor REAL DEFAULT 2.5,
                interval_days INTEGER DEFAULT 1,
                leitner_box INTEGER DEFAULT 1,
                due_date TEXT NOT NULL,
                last_reviewed_at TEXT,
                created_at TEXT NOT NULL
            );
            """
        )
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_srs_learner ON learning_srs_cards(learner_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_srs_due ON learning_srs_cards(due_date);")

        # 2. SRS Review Log Table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS learning_srs_reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                card_id TEXT NOT NULL,
                learner_id TEXT NOT NULL,
                grade INTEGER NOT NULL,
                ease_factor_after REAL NOT NULL,
                interval_after INTEGER NOT NULL,
                leitner_box_after INTEGER NOT NULL,
                reviewed_at TEXT NOT NULL
            );
            """
        )

        # 3. Formant Benchmarks Table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS learning_formant_benchmarks (
                benchmark_id TEXT PRIMARY KEY,
                language TEXT NOT NULL,
                phoneme_or_word TEXT NOT NULL,
                ipa TEXT NOT NULL,
                target_f0 REAL NOT NULL,
                target_f1 REAL NOT NULL,
                target_f2 REAL NOT NULL,
                articulatory_guide TEXT NOT NULL
            );
            """
        )

        # 4. Sentence Drills Table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS learning_sentence_drills (
                drill_id TEXT PRIMARY KEY,
                language TEXT NOT NULL,
                title TEXT NOT NULL,
                cultural_context TEXT NOT NULL,
                target_sentence TEXT NOT NULL,
                target_audio_url TEXT,
                tokens_json TEXT NOT NULL,
                correct_order_json TEXT NOT NULL,
                syntax_pattern TEXT NOT NULL,
                translation_english TEXT NOT NULL
            );
            """
        )

        # 5. Listening Comprehension Quizzes Table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS learning_listening_quizzes (
                quiz_id TEXT PRIMARY KEY,
                language TEXT NOT NULL,
                title TEXT NOT NULL,
                audio_prompt_url TEXT NOT NULL,
                audio_duration_seconds REAL NOT NULL,
                question_text TEXT NOT NULL,
                options_json TEXT NOT NULL,
                cultural_note TEXT NOT NULL
            );
            """
        )

        # Seed Formant Benchmarks
        for fb in SEED_FORMANT_BENCHMARKS:
            cursor.execute(
                """
                INSERT OR IGNORE INTO learning_formant_benchmarks (
                    benchmark_id, language, phoneme_or_word, ipa, target_f0, target_f1, target_f2, articulatory_guide
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    fb["benchmark_id"],
                    fb["language"],
                    fb["phoneme_or_word"],
                    fb["ipa"],
                    fb["target_f0"],
                    fb["target_f1"],
                    fb["target_f2"],
                    fb["articulatory_guide"],
                ),
            )

        # Seed Sentence Drills
        for sd in SEED_SENTENCE_DRILLS:
            cursor.execute(
                """
                INSERT OR IGNORE INTO learning_sentence_drills (
                    drill_id, language, title, cultural_context, target_sentence,
                    target_audio_url, tokens_json, correct_order_json, syntax_pattern, translation_english
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    sd["drill_id"],
                    sd["language"],
                    sd["title"],
                    sd["cultural_context"],
                    sd["target_sentence"],
                    sd.get("target_audio_url"),
                    json.dumps(sd["tokens"]),
                    json.dumps(sd["correct_order"]),
                    sd["syntax_pattern"],
                    sd["translation_english"],
                ),
            )

        # Seed Listening Quizzes
        for lq in SEED_LISTENING_QUIZZES:
            cursor.execute(
                """
                INSERT OR IGNORE INTO learning_listening_quizzes (
                    quiz_id, language, title, audio_prompt_url, audio_duration_seconds, question_text, options_json, cultural_note
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    lq["quiz_id"],
                    lq["language"],
                    lq["title"],
                    lq["audio_prompt_url"],
                    lq["audio_duration_seconds"],
                    lq["question_text"],
                    json.dumps(lq["options"]),
                    lq["cultural_note"],
                ),
            )

        conn.commit()


# ─────────────────────────────────────────────────────────────────────────────
# 2. SPACED REPETITION SYSTEM (SM-2 & LEITNER ALGORITHM)
# ─────────────────────────────────────────────────────────────────────────────

def ensure_learner_cards(learner_id: str, language: str | None = None, db_path: str = DB_PATH) -> int:
    """Ensure learner has active SRS cards cloned from foundational seed inventory."""
    init_learning_studio_db(db_path)
    now = datetime.now(timezone.utc)
    added_count = 0

    with _get_db(db_path) as conn:
        cursor = conn.cursor()
        for tpl in SEED_SRS_FLASHCARDS:
            if language and tpl["language"].lower() != language.lower():
                continue
            card_id = f"{learner_id}:{tpl['card_template_id']}"
            cursor.execute("SELECT card_id FROM learning_srs_cards WHERE card_id = ?", (card_id,))
            if not cursor.fetchone():
                cursor.execute(
                    """
                    INSERT INTO learning_srs_cards (
                        card_id, learner_id, language, variety, front_prompt, front_audio_url,
                        back_meaning, back_ipa, cultural_context, repetition_number, ease_factor,
                        interval_days, leitner_box, due_date, last_reviewed_at, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 2.5, 1, 1, ?, NULL, ?)
                    """,
                    (
                        card_id,
                        learner_id,
                        tpl["language"],
                        tpl.get("variety"),
                        tpl["front_prompt"],
                        tpl.get("front_audio_url"),
                        tpl["back_meaning"],
                        tpl.get("back_ipa"),
                        tpl.get("cultural_context"),
                        now.isoformat(),
                        now.isoformat(),
                    ),
                )
                added_count += 1
        conn.commit()

    return added_count


def get_srs_review_queue(
    learner_id: str,
    language: str | None = None,
    include_future: bool = False,
    db_path: str = DB_PATH,
) -> dict[str, Any]:
    """Retrieve cards ready for review by the learner based on SuperMemo SM-2 due timestamps."""
    ensure_learner_cards(learner_id, language, db_path)
    now = datetime.now(timezone.utc).isoformat()

    with _get_db(db_path) as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM learning_srs_cards WHERE learner_id = ?"
        params: list[Any] = [learner_id]

        if language:
            query += " AND LOWER(language) = ?"
            params.append(language.lower())

        if not include_future:
            query += " AND due_date <= ?"
            params.append(now)

        query += " ORDER BY due_date ASC, leitner_box ASC"
        cursor.execute(query, params)
        rows = cursor.fetchall()

        cards = [
            {
                "card_id": r["card_id"],
                "learner_id": r["learner_id"],
                "language": r["language"],
                "variety": r["variety"],
                "front_prompt": r["front_prompt"],
                "front_audio_url": r["front_audio_url"],
                "back_meaning": r["back_meaning"],
                "back_ipa": r["back_ipa"],
                "cultural_context": r["cultural_context"],
                "repetition_number": r["repetition_number"],
                "ease_factor": round(r["ease_factor"], 2),
                "interval_days": r["interval_days"],
                "leitner_box": r["leitner_box"],
                "due_date": r["due_date"],
                "last_reviewed_at": r["last_reviewed_at"],
            }
            for r in rows
        ]

        return {
            "status": "success",
            "learner_id": learner_id,
            "total_due": len(cards),
            "cards": cards,
        }


def submit_srs_review(
    learner_id: str,
    card_id: str,
    grade: int,
    db_path: str = DB_PATH,
) -> dict[str, Any]:
    """Process review rating (0 to 5) under SuperMemo SM-2 & Leitner Box algorithms."""
    if not 0 <= grade <= 5:
        raise ValueError("Grade must be between 0 (complete blackout) and 5 (flawless recall).")

    init_learning_studio_db(db_path)
    now_dt = datetime.now(timezone.utc)
    now = now_dt.isoformat()

    with _get_db(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM learning_srs_cards WHERE card_id = ? AND learner_id = ?", (card_id, learner_id))
        card = cursor.fetchone()
        if not card:
            raise ValueError(f"Card '{card_id}' not found for learner '{learner_id}'.")

        rep = card["repetition_number"]
        ef = card["ease_factor"]
        interval = card["interval_days"]
        box = card["leitner_box"]

        # SuperMemo SM-2 Algorithm computation
        if grade >= 3:
            if rep == 0:
                interval = 1
            elif rep == 1:
                interval = 6
            else:
                interval = max(1, math.ceil(interval * ef))
            rep += 1
            box = min(5, box + 1)
        else:
            rep = 0
            interval = 1
            box = 1

        # Ease Factor formula: EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
        ef = ef + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
        ef = max(1.3, round(ef, 3))

        next_due = (now_dt + timedelta(days=interval)).isoformat()

        cursor.execute(
            """
            UPDATE learning_srs_cards
            SET repetition_number = ?,
                ease_factor = ?,
                interval_days = ?,
                leitner_box = ?,
                due_date = ?,
                last_reviewed_at = ?
            WHERE card_id = ?
            """,
            (rep, ef, interval, box, next_due, now, card_id),
        )

        cursor.execute(
            """
            INSERT INTO learning_srs_reviews (
                card_id, learner_id, grade, ease_factor_after, interval_after, leitner_box_after, reviewed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (card_id, learner_id, grade, ef, interval, box, now),
        )

        conn.commit()

        return {
            "status": "success",
            "card_id": card_id,
            "learner_id": learner_id,
            "grade": grade,
            "updated_repetition": rep,
            "updated_ease_factor": round(ef, 2),
            "updated_interval_days": interval,
            "updated_leitner_box": box,
            "next_due_date": next_due,
            "reviewed_at": now,
        }


# ─────────────────────────────────────────────────────────────────────────────
# 3. FORMANT-BASED PRONUNCIATION EVALUATION
# ─────────────────────────────────────────────────────────────────────────────

def evaluate_pronunciation_formants(
    phoneme_or_word: str,
    student_f0: float,
    student_f1: float,
    student_f2: float,
    language: str = "Gondi",
    db_path: str = DB_PATH,
) -> dict[str, Any]:
    """Compare student acoustic parameters (F0, F1, F2) with elder reference formants."""
    init_learning_studio_db(db_path)

    with _get_db(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT * FROM learning_formant_benchmarks
            WHERE LOWER(language) = ? AND (LOWER(phoneme_or_word) LIKE ? OR LOWER(ipa) LIKE ?)
            LIMIT 1
            """,
            (language.lower(), f"%{phoneme_or_word.lower()}%", f"%{phoneme_or_word.lower()}%"),
        )
        bench = cursor.fetchone()

        if not bench:
            # Fallback to general Dravidian vowel default
            target_f0 = 130.0
            target_f1 = 600.0
            target_f2 = 1500.0
            ipa = phoneme_or_word
            guide = "Ensure clear phonation and steady breath support."
        else:
            target_f0 = float(bench["target_f0"])
            target_f1 = float(bench["target_f1"])
            target_f2 = float(bench["target_f2"])
            ipa = bench["ipa"]
            guide = bench["articulatory_guide"]

        # Compute Euclidean deviations in formant acoustic space
        diff_f0 = abs(student_f0 - target_f0)
        diff_f1 = abs(student_f1 - target_f1)
        diff_f2 = abs(student_f2 - target_f2)

        # Normalized scores (F1 tolerance ~100Hz, F2 tolerance ~250Hz, F0 tolerance ~35Hz)
        score_f1 = max(0.0, 100.0 - (diff_f1 / 3.0))
        score_f2 = max(0.0, 100.0 - (diff_f2 / 6.0))
        score_f0 = max(0.0, 100.0 - (diff_f0 / 1.5))

        composite_score = round(score_f1 * 0.45 + score_f2 * 0.40 + score_f0 * 0.15, 1)

        # Articulatory feedback diagnostics
        feedback_points: list[str] = []
        if diff_f1 > 75:
            if student_f1 > target_f1:
                feedback_points.append("Your mouth is opened slightly too wide; raise your tongue body.")
            else:
                feedback_points.append("Lower your jaw slightly for an authentic open oral resonance.")

        if diff_f2 > 160:
            if student_f2 > target_f2:
                feedback_points.append("Tongue constriction is too far forward; retract slightly.")
            else:
                feedback_points.append("Front the tongue position slightly toward the alveolar ridge.")

        if diff_f0 > 45:
            feedback_points.append(
                f"Vocal pitch ({student_f0:.1f} Hz) differs from elder cadence ({target_f0:.1f} Hz)."
            )

        if not feedback_points:
            feedback_points.append("Excellent acoustic formant alignment with native elder cadence!")

        return {
            "status": "success",
            "phoneme_or_word": phoneme_or_word,
            "language": language,
            "target_ipa": ipa,
            "measured_formants": {
                "f0_pitch_hz": round(student_f0, 1),
                "f1_aperture_hz": round(student_f1, 1),
                "f2_frontness_hz": round(student_f2, 1),
            },
            "reference_formants": {
                "f0_pitch_hz": target_f0,
                "f1_aperture_hz": target_f1,
                "f2_frontness_hz": target_f2,
            },
            "acoustic_match_percentage": composite_score,
            "articulatory_guide": guide,
            "diagnostic_feedback": feedback_points,
            "is_verified_mastery": composite_score >= 80.0,
        }


# ─────────────────────────────────────────────────────────────────────────────
# 4. SENTENCE CONSTRUCTION DRILLS (DRAVIDIAN / MUNDA SOV SYNTAX)
# ─────────────────────────────────────────────────────────────────────────────

def list_sentence_drills(language: str | None = None, db_path: str = DB_PATH) -> list[dict[str, Any]]:
    """Retrieve sentence construction exercises with scrambled tokens and syntax models."""
    init_learning_studio_db(db_path)
    with _get_db(db_path) as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM learning_sentence_drills"
        params: list[Any] = []
        if language:
            query += " WHERE LOWER(language) = ?"
            params.append(language.lower())
        cursor.execute(query, params)
        rows = cursor.fetchall()

        return [
            {
                "drill_id": r["drill_id"],
                "language": r["language"],
                "title": r["title"],
                "cultural_context": r["cultural_context"],
                "target_sentence": r["target_sentence"],
                "target_audio_url": r["target_audio_url"],
                "scrambled_tokens": json.loads(r["tokens_json"]),
                "syntax_pattern": r["syntax_pattern"],
                "translation_english": r["translation_english"],
            }
            for r in rows
        ]


def submit_sentence_drill_attempt(
    learner_id: str,
    drill_id: str,
    assembled_tokens: list[str],
    db_path: str = DB_PATH,
) -> dict[str, Any]:
    """Validate student's assembled word sequence against authentic indigenous syntax."""
    init_learning_studio_db(db_path)
    with _get_db(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM learning_sentence_drills WHERE drill_id = ?", (drill_id,))
        drill = cursor.fetchone()
        if not drill:
            raise ValueError(f"Sentence drill '{drill_id}' not found.")

        correct_order = json.loads(drill["correct_order_json"])
        is_correct = assembled_tokens == correct_order

        assembled_str = " ".join(assembled_tokens)
        correct_str = " ".join(correct_order)

        return {
            "status": "success",
            "drill_id": drill_id,
            "learner_id": learner_id,
            "is_correct": is_correct,
            "assembled_sentence": assembled_str,
            "expected_sentence": correct_str,
            "syntax_pattern": drill["syntax_pattern"],
            "cultural_context": drill["cultural_context"],
            "translation_english": drill["translation_english"],
        }


# ─────────────────────────────────────────────────────────────────────────────
# 5. AUDIO-FIRST LISTENING COMPREHENSION QUIZZES
# ─────────────────────────────────────────────────────────────────────────────

def list_listening_quizzes(language: str | None = None, db_path: str = DB_PATH) -> list[dict[str, Any]]:
    """Retrieve audio-first listening quizzes testing oral comprehension without script literacy."""
    init_learning_studio_db(db_path)
    with _get_db(db_path) as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM learning_listening_quizzes"
        params: list[Any] = []
        if language:
            query += " WHERE LOWER(language) = ?"
            params.append(language.lower())
        cursor.execute(query, params)
        rows = cursor.fetchall()

        return [
            {
                "quiz_id": r["quiz_id"],
                "language": r["language"],
                "title": r["title"],
                "audio_prompt_url": r["audio_prompt_url"],
                "audio_duration_seconds": r["audio_duration_seconds"],
                "question_text": r["question_text"],
                "options": json.loads(r["options_json"]),
                "cultural_note": r["cultural_note"],
            }
            for r in rows
        ]


def submit_listening_quiz_attempt(
    learner_id: str,
    quiz_id: str,
    selected_option_id: str,
    db_path: str = DB_PATH,
) -> dict[str, Any]:
    """Verify chosen option for an audio-first comprehension exercise."""
    init_learning_studio_db(db_path)
    with _get_db(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM learning_listening_quizzes WHERE quiz_id = ?", (quiz_id,))
        quiz = cursor.fetchone()
        if not quiz:
            raise ValueError(f"Listening quiz '{quiz_id}' not found.")

        options = json.loads(quiz["options_json"])
        chosen_opt = next((o for o in options if o["id"] == selected_option_id), None)
        if not chosen_opt:
            raise ValueError(f"Option '{selected_option_id}' not found in quiz options.")

        is_correct = bool(chosen_opt.get("is_correct", False))
        correct_opt = next(o for o in options if o.get("is_correct"))

        return {
            "status": "success",
            "quiz_id": quiz_id,
            "learner_id": learner_id,
            "is_correct": is_correct,
            "selected_option": chosen_opt,
            "correct_option": correct_opt,
            "cultural_note": quiz["cultural_note"],
        }


# ─────────────────────────────────────────────────────────────────────────────
# 6. OFFLINE BATCH SYNCHRONIZATION & MASTERY ANALYTICS
# ─────────────────────────────────────────────────────────────────────────────

def sync_offline_learning_events(
    learner_id: str,
    events: list[dict[str, Any]],
    db_path: str = DB_PATH,
) -> dict[str, Any]:
    """Batch-process offline actions (SRS reviews, drill attempts, quiz attempts) when reconnected."""
    init_learning_studio_db(db_path)
    synced_srs = 0
    synced_drills = 0
    synced_quizzes = 0

    for ev in events:
        ev_type = ev.get("type")
        payload = ev.get("payload", {})
        try:
            if ev_type == "srs_review":
                card_id = payload["card_id"]
                grade = payload["grade"]
                submit_srs_review(learner_id, card_id, grade, db_path=db_path)
                synced_srs += 1
            elif ev_type == "sentence_drill":
                drill_id = payload["drill_id"]
                tokens = payload["tokens"]
                submit_sentence_drill_attempt(learner_id, drill_id, tokens, db_path=db_path)
                synced_drills += 1
            elif ev_type == "listening_quiz":
                quiz_id = payload["quiz_id"]
                option_id = payload["option_id"]
                submit_listening_quiz_attempt(learner_id, quiz_id, option_id, db_path=db_path)
                synced_quizzes += 1
        except Exception as e:
            logger.warning("Failed to sync offline event %s for learner %s: %s", ev, learner_id, e)

    return {
        "status": "success",
        "learner_id": learner_id,
        "total_events_received": len(events),
        "synced_counts": {
            "srs_reviews": synced_srs,
            "sentence_drills": synced_drills,
            "listening_quizzes": synced_quizzes,
        },
        "synced_at": datetime.now(timezone.utc).isoformat(),
    }


def get_learner_analytics(learner_id: str, db_path: str = DB_PATH) -> dict[str, Any]:
    """Compute comprehensive learner analytics: retention rate, Leitner distribution, and mastery."""
    init_learning_studio_db(db_path)
    with _get_db(db_path) as conn:
        cursor = conn.cursor()

        # Total cards and box distribution
        cursor.execute(
            """
            SELECT leitner_box, COUNT(*) as cnt
            FROM learning_srs_cards
            WHERE learner_id = ?
            GROUP BY leitner_box
            """,
            (learner_id,),
        )
        box_counts = {r["leitner_box"]: r["cnt"] for r in cursor.fetchall()}
        total_cards = sum(box_counts.values())

        # Review performance
        cursor.execute(
            """
            SELECT COUNT(*) as total_revs,
                   AVG(grade) as avg_grade,
                   SUM(CASE WHEN grade >= 3 THEN 1 ELSE 0 END) as successful_revs
            FROM learning_srs_reviews
            WHERE learner_id = ?
            """,
            (learner_id,),
        )
        rev_row = cursor.fetchone()
        total_revs = rev_row["total_revs"] if rev_row else 0
        avg_grade = round(rev_row["avg_grade"], 2) if rev_row and rev_row["avg_grade"] else 0.0
        successful_revs = rev_row["successful_revs"] if rev_row and rev_row["successful_revs"] else 0

        retention_rate = round((successful_revs / total_revs * 100), 1) if total_revs > 0 else 100.0

        # Mastered cards (Leitner Box 5 or repetition >= 5)
        cursor.execute(
            """
            SELECT COUNT(*) FROM learning_srs_cards
            WHERE learner_id = ? AND (leitner_box = 5 OR repetition_number >= 5)
            """,
            (learner_id,),
        )
        mastered_cards = cursor.fetchone()[0]

        return {
            "status": "success",
            "learner_id": learner_id,
            "total_cards_enrolled": total_cards,
            "cards_mastered": mastered_cards,
            "total_reviews_completed": total_revs,
            "retention_rate_pct": retention_rate,
            "average_recall_grade": avg_grade,
            "leitner_box_distribution": {
                "box_1_daily": box_counts.get(1, 0),
                "box_2_semiweekly": box_counts.get(2, 0),
                "box_3_weekly": box_counts.get(3, 0),
                "box_4_biweekly": box_counts.get(4, 0),
                "box_5_mastered": box_counts.get(5, 0),
            },
            "oral_proficiency_tier": "Autonomous Conversationalist" if mastered_cards >= 5 else "Active Clan Learner",
        }
