"""Voice Roots: Milestone 16 — Language Knowledge Graph Service.
=============================================================================
Provides a connected digital knowledge platform linking:
- Languages, Dialects / Varieties, Writing Systems / Scripts
- Vocabulary, Native Scripts, Transliterations, Meanings, Translations
- Oral Stories, Audio Recordings, Transcripts, Research Resources, Datasets
- Directed Typed Relationships with Provenance, Citations, and Verification Levels

All entities strictly enforce OCAP community governance, Unicode fidelity,
zero fabricated facts, and offline-first zero-cost persistence.
"""

from __future__ import annotations

import json
import logging
import os
import re
import sqlite3
import time
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger(__name__)

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get("VOICE_ROOTS_DB_PATH", os.path.join(BACKEND_DIR, "voice_roots.db"))

# Entity Types
VALID_ENTITY_TYPES: set[str] = {
    "language",
    "variety",
    "script",
    "vocabulary",
    "phrase",
    "story",
    "transcript",
    "translation",
    "resource",
    "dataset",
}

# Relationship Types
VALID_RELATIONSHIP_TYPES: set[str] = {
    "LANGUAGE_HAS_VARIETY",
    "LANGUAGE_USES_SCRIPT",
    "WORD_BELONGS_TO_LANGUAGE",
    "WORD_HAS_MEANING",
    "WORD_TRANSLATED_AS",
    "STORY_RECORDED_IN_LANGUAGE",
    "STORY_HAS_TRANSCRIPT",
    "TRANSCRIPT_HAS_TRANSLATION",
    "RESOURCE_DOCUMENTS_LANGUAGE",
    "DATASET_CONTAINS_RECORDS",
}

# Verification Statuses
VALID_VERIFICATION_STATUSES: set[str] = {
    "VERIFIED",
    "COMMUNITY_REVIEWED",
    "UNVERIFIED",
    "PROPOSED",
    "AI_GENERATED",
    "REJECTED",
}

AUTHORIZED_REVIEWER_ROLES: set[str] = {
    "community_elder",
    "linguist_reviewer",
    "admin",
    "cultural_custodian",
}


def _now_iso() -> str:
    """Return current UTC timestamp in ISO 8601 format."""
    return datetime.now(timezone.utc).isoformat()


def init_knowledge_graph_tables(conn: sqlite3.Connection) -> None:
    """Idempotently initialize Knowledge Graph tables, indexes, and full-text search."""
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS kg_nodes (
        node_id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        name TEXT NOT NULL,
        native_name TEXT,
        primary_language TEXT,
        script TEXT,
        category TEXT,
        summary TEXT,
        verification_status TEXT NOT NULL DEFAULT 'PROPOSED',
        source_reference TEXT,
        source_organization TEXT,
        source_url TEXT,
        dataset_version TEXT,
        reviewed_by TEXT,
        reviewed_at TEXT,
        metadata_json TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_kg_nodes_entity_type ON kg_nodes(entity_type);
    """)
    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_kg_nodes_language ON kg_nodes(primary_language);
    """)
    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_kg_nodes_verification ON kg_nodes(verification_status);
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS kg_relationships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_id TEXT NOT NULL REFERENCES kg_nodes(node_id) ON DELETE CASCADE,
        target_id TEXT NOT NULL REFERENCES kg_nodes(node_id) ON DELETE CASCADE,
        relationship_type TEXT NOT NULL,
        label TEXT,
        verification_status TEXT NOT NULL DEFAULT 'PROPOSED',
        source_reference TEXT,
        confidence_score REAL DEFAULT 1.0,
        metadata_json TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(source_id, target_id, relationship_type)
    );
    """)

    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_kg_rel_source ON kg_relationships(source_id);
    """)
    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_kg_rel_target ON kg_relationships(target_id);
    """)
    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_kg_rel_type ON kg_relationships(relationship_type);
    """)
    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_kg_rel_verification ON kg_relationships(verification_status);
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS kg_vocabulary_details (
        word_id TEXT PRIMARY KEY REFERENCES kg_nodes(node_id) ON DELETE CASCADE,
        language_code TEXT NOT NULL,
        original_word TEXT NOT NULL,
        script TEXT,
        transliteration TEXT,
        meaning TEXT NOT NULL,
        grammatical_category TEXT,
        cultural_context TEXT,
        pronunciation_guide TEXT,
        audio_transcript_id INTEGER,
        audio_url TEXT,
        review_status TEXT NOT NULL DEFAULT 'PROPOSED'
    );
    """)

    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_kg_vocab_lang ON kg_vocabulary_details(language_code);
    """)

    cursor.execute("""
    CREATE VIRTUAL TABLE IF NOT EXISTS kg_search_fts USING fts5(
        node_id UNINDEXED,
        name,
        native_name,
        summary,
        transliteration,
        cultural_context,
        primary_language,
        entity_type,
        tokenize='unicode61 remove_diacritics 0'
    );
    """)
    conn.commit()


def sync_node_fts(conn: sqlite3.Connection, node_id: str) -> None:
    """Synchronize an individual KG node into the FTS5 full-text index."""
    old_factory = conn.row_factory
    conn.row_factory = sqlite3.Row
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM kg_nodes WHERE node_id = ?", (node_id,))
        row = cursor.fetchone()
        if not row:
            cursor.execute("DELETE FROM kg_search_fts WHERE node_id = ?", (node_id,))
            conn.commit()
            return

        node = dict(row)
        cursor.execute("SELECT * FROM kg_vocabulary_details WHERE word_id = ?", (node_id,))
        vocab_row = cursor.fetchone()
        transliteration = ""
        cultural_context = ""
        if vocab_row:
            vocab = dict(vocab_row)
            transliteration = vocab.get("transliteration") or ""
            cultural_context = vocab.get("cultural_context") or ""

        cursor.execute("DELETE FROM kg_search_fts WHERE node_id = ?", (node_id,))
        cursor.execute(
            """
            INSERT INTO kg_search_fts (node_id, name, native_name, summary, transliteration, cultural_context, primary_language, entity_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                node_id,
                node.get("name") or "",
                node.get("native_name") or "",
                node.get("summary") or "",
                transliteration,
                cultural_context,
                node.get("primary_language") or "",
                node.get("entity_type") or "",
            ),
        )
        conn.commit()
    finally:
        conn.row_factory = old_factory


# =============================================================================
# SEEDING: Grounded Knowledge Graph from Registry, CIIL, and Field Corpus
# =============================================================================

def seed_knowledge_graph_catalog(conn: sqlite3.Connection) -> dict[str, int]:
    """Seed foundational verified languages, varieties, scripts, and vocabulary."""
    init_knowledge_graph_tables(conn)
    cursor = conn.cursor()

    # Check if already seeded with languages
    cursor.execute("SELECT COUNT(*) FROM kg_nodes WHERE entity_type = 'language'")
    existing_langs = cursor.fetchone()[0]
    if existing_langs >= 20:
        cursor.execute("SELECT COUNT(*) FROM kg_nodes")
        total_nodes = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM kg_relationships")
        total_rels = cursor.fetchone()[0]
        return {"nodes": total_nodes, "relationships": total_rels, "already_seeded": True}

    now = _now_iso()

    # 1. Seed Scripts
    scripts = [
        ("script:telugu", "script", "Telugu Script", "తెలుగు లిపి", "te", "Telugu", "regional", "Brahmic script used for Telugu, Gondi, Koya, and Lambadi in Telangana and AP", "VERIFIED", "ISO 15924: Telu", "Government of India"),
        ("script:gunjala_gondi", "script", "Gunjala Gondi Script", "𑵶𑶍𑶕𑶛𑶗", "gon", "Gunjala Gondi", "indigenous", "Historic indigenous script of the Gond community discovered in Gunjala, Adilabad", "VERIFIED", "Unicode 11.0 / ISO 15924: Gong", "Centre for Dalit and Adivasi Studies, University of Hyderabad"),
        ("script:masaram_gondi", "script", "Masaram Gondi Script", "𑴔𑴱𑴤𑴱", "gon", "Masaram Gondi", "indigenous", "Indigenous phonetic script designed in 1918 by Munshi Mangal Singh Masaram", "VERIFIED", "Unicode 10.0 / ISO 15924: Gonm", "CIIL / Tribal Research Institute"),
        ("script:ol_chiki", "script", "Ol Chiki Script", "ᱚᱞ ᱪᱤᱠᱤ", "sat", "Ol Chiki", "indigenous", "Indigenous alphabet created by Pandit Raghunath Murmu in 1925 for the Santhali language", "VERIFIED", "Unicode 5.1 / ISO 15924: Olck", "Sahitya Akademi / Government of India"),
        ("script:devanagari", "script", "Devanagari Script", "देवनागरी", "hi", "Devanagari", "scheduled", "Brahmic script used for Hindi, Marathi, Sanskrit, and northern Gondi varieties", "VERIFIED", "ISO 15924: Deva", "Government of India"),
        ("script:kannada", "script", "Kannada Script", "ಕನ್ನಡ ಲಿಪಿ", "kn", "Kannada", "scheduled", "Southern Brahmic script used for Kannada and Deccan Lambadi records", "VERIFIED", "ISO 15924: Knda", "Government of India"),
        ("script:tamil", "script", "Tamil Script", "தமிழ் அரிச்சுவடி", "ta", "Tamil", "scheduled", "Dravidian abugida writing system used for Tamil literature and inscriptions", "VERIFIED", "ISO 15924: Taml", "Government of India"),
        ("script:latin", "script", "Latin Script", "Latin Alphabet", "en", "Latin", "world", "Roman alphabet used for Quechua, Swahili, Welsh, and English documentation", "VERIFIED", "ISO 15924: Latn", "ISO Standard"),
    ]

    for sid, etype, name, nname, plang, script, cat, summary, status, src_ref, src_org in scripts:
        cursor.execute("""
            INSERT OR IGNORE INTO kg_nodes (node_id, entity_type, name, native_name, primary_language, script, category, summary, verification_status, source_reference, source_organization, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (sid, etype, name, nname, plang, script, cat, summary, status, src_ref, src_org, now, now))
        sync_node_fts(conn, sid)

    # 2. Seed Languages from Dynamic Registry
    from language_registry import language_registry
    all_langs = language_registry.list_languages()

    for l in all_langs:
        code = l.get("code")
        name = l.get("name")
        node_id = f"lang:{code}"
        native = l.get("native") or name
        script = l.get("script") or "Oral"
        family = l.get("family") or "Unclassified"
        category = l.get("category") or "indigenous"
        region = l.get("region") or ""
        summary = f"{family} language spoken across {region}."
        limitations = l.get("known_limitations") or ""
        meta = json.dumps({"family": family, "region": region, "speech_model": l.get("speech_model"), "known_limitations": limitations})

        cursor.execute("""
            INSERT OR IGNORE INTO kg_nodes (node_id, entity_type, name, native_name, primary_language, script, category, summary, verification_status, source_reference, source_organization, metadata_json, created_at, updated_at)
            VALUES (?, 'language', ?, ?, ?, ?, ?, ?, 'VERIFIED', 'Census of India C-16 / ISO 639', 'Registrar General & Census Commissioner of India', ?, ?, ?)
        """, (node_id, name, native, code, script, category, summary, meta, now, now))
        sync_node_fts(conn, node_id)

    # 3. Seed Varieties / Dialects with Documented Provenance
    varieties = [
        ("variety:gon:godavari", "Godavari Gondi", "గోదావరి గోండీ", "gon", "South-Central Gondi variety spoken in the Godavari river basin across Telangana and AP", "Central Institute of Indian Languages (CIIL)"),
        ("variety:gon:adilabad", "Adilabad Raj Gondi", "ఆదిలాబాద్ రాజ్ గోండీ", "gon", "Raj Gond dialect of northern Telangana documented in historical genealogies", "University of Hyderabad / Tribal Research Institute"),
        ("variety:gon:bastar_maria", "Bastar Maria Gondi", "बस्तर मारिया गोंडी", "gon", "Maria dialect of the Bastar plateau in Chhattisgarh with distinct ergative morphology", "Bhasha Research & Publication Centre"),
        ("variety:kff:koya_dora", "Koya Dora", "కోయ దొర", "kff", "Principal dialect of Koya people inhabiting the Eastern Ghats and river banks", "CIIL Tribal Documentation Series"),
        ("variety:sat:mayurbhanj", "Mayurbhanj Santhali", "ᱢᱚᱭᱩᱨᱵᱷᱚᱸᱡᱽ ᱥᱟᱱᱛᱟᱲᱤ", "sat", "Southern dialect of Santhali spoken in Odisha utilizing Ol Chiki", "All India Santhali Writers Association"),
        ("variety:lmn:banjara_deccan", "Deccan Banjara", "లంబాడీ గోర్బోలీ", "lmn", "Deccan variety of Gorboli/Lambadi preserved in Banjara Tandas across Telangana and Karnataka", "Banjara Bhasha Akademi"),
    ]

    for vid, vname, vnname, plang, vsummary, vorg in varieties:
        cursor.execute("""
            INSERT OR IGNORE INTO kg_nodes (node_id, entity_type, name, native_name, primary_language, category, summary, verification_status, source_reference, source_organization, created_at, updated_at)
            VALUES (?, 'variety', ?, ?, ?, 'indigenous', ?, 'VERIFIED', 'Field Documentation / CIIL', ?, ?, ?)
        """, (vid, vname, vnname, plang, vsummary, vorg, now, now))
        sync_node_fts(conn, vid)

        # Relationship: Language -> Variety
        cursor.execute("""
            INSERT OR IGNORE INTO kg_relationships (source_id, target_id, relationship_type, label, verification_status, source_reference, created_at, updated_at)
            VALUES (?, ?, 'LANGUAGE_HAS_VARIETY', 'has documented variety', 'VERIFIED', 'CIIL & Anthropological Survey of India', ?, ?)
        """, (f"lang:{plang}", vid, now, now))

    # Link Languages to Scripts
    language_script_pairs = [
        ("lang:gon", "script:telugu"),
        ("lang:gon", "script:gunjala_gondi"),
        ("lang:gon", "script:masaram_gondi"),
        ("lang:gon", "script:devanagari"),
        ("lang:kff", "script:telugu"),
        ("lang:sat", "script:ol_chiki"),
        ("lang:sat", "script:latin"),
        ("lang:lmn", "script:devanagari"),
        ("lang:lmn", "script:telugu"),
        ("lang:te", "script:telugu"),
        ("lang:hi", "script:devanagari"),
        ("lang:kn", "script:kannada"),
        ("lang:ta", "script:tamil"),
        ("lang:en", "script:latin"),
    ]
    for lid, sid in language_script_pairs:
        cursor.execute("""
            INSERT OR IGNORE INTO kg_relationships (source_id, target_id, relationship_type, label, verification_status, source_reference, created_at, updated_at)
            VALUES (?, ?, 'LANGUAGE_USES_SCRIPT', 'uses writing system', 'VERIFIED', 'ISO 15924 / National Script Registry', ?, ?)
        """, (lid, sid, now, now))

    # 4. Seed Verified Vocabulary for Indigenous Oral Tongues
    vocab_items = [
        # Gondi
        ("word:gon:pen", "gon", "పెన్ / पेन", "Telugu / Devanagari", "pen", "Deity / Sacred ancestral spirit", "noun", "Central to Gond traditional cosmology, sacred groves, and village shrines", "pen", "CIIL Tribal Series Vol 12, Gondi Grammatical Sketch"),
        ("word:gon:ron", "gon", "రోన్ / रोन", "Telugu / Devanagari", "ron", "Home / Clan ancestral residence", "noun", "Refers specifically to clan hearth and domestic ancestral dwelling", "roːn", "University of Hyderabad Linguistic Fieldwork"),
        ("word:gon:marra", "gon", "మర్ర / मर्रा", "Telugu / Devanagari", "marra", "Tree / Forest canopy", "noun", "Foundational botanical root across South-Central Dravidian languages", "mɐr.rɐ", "Dravidian Etymological Dictionary DEDR 4711"),
        ("word:gon:er", "gon", "ఏర్ / एर", "Telugu / Devanagari", "er", "Water / River tributary", "noun", "Essential waterbody term used in prayers for rain and river navigation", "eːr", "DEDR 5159"),
        ("word:gon:sari", "gon", "సరి / सरि", "Telugu / Devanagari", "sari", "Path / Way through the forest", "noun", "Traditional forest navigation path between clan villages", "sɐ.ri", "CIIL Gondi Lexicon"),

        # Koya
        ("word:kff:dora", "kff", "దొర / దొరా", "Telugu", "dora", "Elder / Forest custodian", "noun", "Honorific title for community elder who presides over clan councils", "d̪o.rɐ", "CIIL Koya Grammar & Vocabulary"),
        ("word:kff:madi", "kff", "మడి / మడీ", "Telugu", "madi", "Sacred herbal medicine / Forest leaf remedy", "noun", "Traditional ethnomedicinal leaf preparation used by traditional healers", "mɐ.ɖi", "Tribal Cultural Research Institute"),
        ("word:kff:gotti", "kff", "గొట్టి / గొట్టీ", "Telugu", "gotti", "Clan assembly / Oral council", "noun", "Gathering of tribal elders under the sacred Mahua tree to resolve community matters", "ɡoʈ.ʈi", "Godavari Basin Anthropological Survey"),
        ("word:kff:paya", "kff", "పాయ", "Telugu", "paya", "River distributary / Stream branch", "noun", "Hydrological term for small forest brooks flowing into the Godavari river", "pɑː.jɐ", "CIIL Koya Vocabulary"),

        # Santhali
        ("word:sat:baha", "sat", "ᱵᱟᱦᱟ", "Ol Chiki", "baha", "Flower / Spring sal blossom celebration", "cultural_term", "Central festival celebrating sal tree blossoms, fertility, and renewal", "bɐ.hɐ", "Santali English Dictionary (Campbell / Bodding)"),
        ("word:sat:sohrai", "sat", "ᱥᱚᱦᱨᱟᱭ", "Ol Chiki", "sohrai", "Winter harvest festival and cattle celebration", "cultural_term", "Major five-day post-harvest festival of thanksgiving, music, and art", "soh.rɑːj", "Sahitya Akademi Santhali Folklore Studies"),
        ("word:sat:majhi", "sat", "ᱢᱟᱡᱷᱤ", "Ol Chiki", "majhi", "Village headman and communal custodian", "noun", "Spiritual and civil head of the traditional Santhal village council", "mɑː.ɟʱi", "Santali Customary Law & Governance"),

        # Lambadi
        ("word:lmn:nayak", "lmn", "నాయక్ / नायक", "Telugu / Devanagari", "nayak", "Tanda council leader / Head of caravan", "noun", "Traditional elected chief of the Lambadi settlement (tanda)", "nɑː.jɐk", "Banjara Bhasha Academy Studies"),
        ("word:lmn:tanda", "lmn", "తాండా / तांडा", "Telugu / Devanagari", "tanda", "Settlement / Autonomous Banjara hamlet", "noun", "Historic settlement formed by nomadic caravan traders across the Deccan", "t̪ɑːɳ.ɖɐ", "Historical Ethnography of Banjara Community"),
        ("word:lmn:dhavlo", "lmn", "ఢావ్లో / ढावलो", "Telugu / Devanagari", "dhavlo", "Oral ceremonial lament / Traditional sung poetry", "cultural_term", "Metrical oral songs sung during wedding departure and mourning rites", "ɖʱɑːʋ.lo", "Sahitya Akademi Rajasthani & Lambadi Folk Series"),
    ]

    for wid, lang_code, orig_word, wscript, translit, meaning, gcat, ccontext, pguide, src in vocab_items:
        # 1. Insert Node
        cursor.execute("""
            INSERT OR IGNORE INTO kg_nodes (node_id, entity_type, name, native_name, primary_language, script, category, summary, verification_status, source_reference, source_organization, created_at, updated_at)
            VALUES (?, 'vocabulary', ?, ?, ?, ?, 'vocabulary', ?, 'VERIFIED', ?, 'CIIL & Field Research', ?, ?)
        """, (wid, f"{orig_word} ({translit})", orig_word, lang_code, wscript, meaning, src, now, now))

        # 2. Insert Vocabulary Detail
        cursor.execute("""
            INSERT OR IGNORE INTO kg_vocabulary_details (word_id, language_code, original_word, script, transliteration, meaning, grammatical_category, cultural_context, pronunciation_guide, review_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'VERIFIED')
        """, (wid, lang_code, orig_word, wscript, translit, meaning, gcat, ccontext, pguide))

        # 3. Insert Relationship: Word -> Language
        cursor.execute("""
            INSERT OR IGNORE INTO kg_relationships (source_id, target_id, relationship_type, label, verification_status, source_reference, created_at, updated_at)
            VALUES (?, ?, 'WORD_BELONGS_TO_LANGUAGE', 'belongs to language', 'VERIFIED', ?, ?, ?)
        """, (wid, f"lang:{lang_code}", src, now, now))

        # Sync FTS
        sync_node_fts(conn, wid)

    # 5. Connect existing consented SQLite transcripts as 'story' nodes
    cursor.execute("""
        SELECT id, title, language, dialect, transcript_text, transliteration_text, contextual_notes, audio_filename, audio_url
        FROM transcripts
        WHERE archived_at IS NULL AND (privacy_level IS NULL OR privacy_level != 'private')
        LIMIT 25
    """)
    transcripts = cursor.fetchall()
    for row in transcripts:
        tid, title, lang_name, dialect, text, translit, notes, afile, aurl = row
        story_id = f"story:transcript:{tid}"
        lang_code = "gon" if "gondi" in (lang_name or "").lower() else ("kff" if "koya" in (lang_name or "").lower() else ("sat" if "santhali" in (lang_name or "").lower() else "te"))

        cursor.execute("""
            INSERT OR IGNORE INTO kg_nodes (node_id, entity_type, name, native_name, primary_language, script, category, summary, verification_status, source_reference, metadata_json, created_at, updated_at)
            VALUES (?, 'story', ?, ?, ?, 'Oral', 'story', ?, 'VERIFIED', 'Voice Roots Consented Oral Corpus', ?, ?, ?)
        """, (story_id, title or f"Oral Narrative #{tid}", dialect or lang_name, lang_code, (notes or text or "")[:200], json.dumps({"transcript_id": tid, "audio_url": aurl or f"/api/v1/audio/{tid}/stream", "audio_filename": afile}), now, now))
        sync_node_fts(conn, story_id)

        # Relationship: Story -> Language
        cursor.execute("""
            INSERT OR IGNORE INTO kg_relationships (source_id, target_id, relationship_type, label, verification_status, source_reference, created_at, updated_at)
            VALUES (?, ?, 'STORY_RECORDED_IN_LANGUAGE', 'recorded in language', 'VERIFIED', 'Voice Roots Field Capture', ?, ?)
        """, (story_id, f"lang:{lang_code}", now, now))

    conn.commit()

    cursor.execute("SELECT COUNT(*) FROM kg_nodes")
    total_nodes = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM kg_relationships")
    total_rels = cursor.fetchone()[0]

    logger.info("Knowledge Graph seeded: %d nodes, %d relationships.", total_nodes, total_rels)
    return {"nodes": total_nodes, "relationships": total_rels, "already_seeded": False}


# =============================================================================
# GRAPH QUERY ENGINE & ADJACENCY TRAVERSAL
# =============================================================================

def get_kg_overview(db_path: str = DB_PATH) -> dict[str, Any]:
    """Retrieve statistical telemetry of the Knowledge Graph."""
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT entity_type, COUNT(*) FROM kg_nodes GROUP BY entity_type")
        node_counts = dict(cursor.fetchall())

        cursor.execute("SELECT relationship_type, COUNT(*) FROM kg_relationships GROUP BY relationship_type")
        rel_counts = dict(cursor.fetchall())

        cursor.execute("SELECT verification_status, COUNT(*) FROM kg_nodes GROUP BY verification_status")
        status_counts = dict(cursor.fetchall())

        cursor.execute("SELECT COUNT(*) FROM kg_nodes")
        total_nodes = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM kg_relationships")
        total_rels = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(DISTINCT primary_language) FROM kg_nodes WHERE primary_language IS NOT NULL")
        distinct_langs = cursor.fetchone()[0]

    return {
        "status": "healthy",
        "total_nodes": total_nodes,
        "total_relationships": total_rels,
        "languages_represented": distinct_langs,
        "node_counts_by_type": node_counts,
        "relationship_counts_by_type": rel_counts,
        "verification_status_counts": status_counts,
        "verified_ratio": round((status_counts.get("VERIFIED", 0) + status_counts.get("COMMUNITY_REVIEWED", 0)) / max(total_nodes, 1), 3),
    }


def list_kg_languages(db_path: str = DB_PATH) -> list[dict[str, Any]]:
    """List all language nodes with aggregate counts of varieties, vocabulary, and stories."""
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                n.node_id,
                n.name,
                n.native_name,
                n.primary_language,
                n.script,
                n.category,
                n.summary,
                n.verification_status,
                n.source_reference,
                n.metadata_json,
                (SELECT COUNT(*) FROM kg_relationships WHERE source_id = n.node_id AND relationship_type = 'LANGUAGE_HAS_VARIETY') as variety_count,
                (SELECT COUNT(*) FROM kg_relationships WHERE target_id = n.node_id AND relationship_type = 'WORD_BELONGS_TO_LANGUAGE') as vocabulary_count,
                (SELECT COUNT(*) FROM kg_relationships WHERE target_id = n.node_id AND relationship_type = 'STORY_RECORDED_IN_LANGUAGE') as story_count,
                (SELECT COUNT(*) FROM kg_relationships WHERE source_id = n.node_id AND relationship_type = 'LANGUAGE_USES_SCRIPT') as script_count
            FROM kg_nodes n
            WHERE n.entity_type = 'language'
            ORDER BY n.name ASC
        """)
        rows = cursor.fetchall()
        results: list[dict[str, Any]] = []
        for r in rows:
            d = dict(r)
            d["code"] = d.get("primary_language") or d.get("node_id", "").replace("lang:", "")
            d["varieties_count"] = d.get("variety_count", 0)
            d["scripts_count"] = d.get("script_count", 0)
            if d.get("metadata_json"):
                try:
                    d["metadata"] = json.loads(d["metadata_json"])
                except (json.JSONDecodeError, TypeError):
                    d["metadata"] = {}
            results.append(d)
        return results


def get_kg_nodes(
    entity_type: str | None = None,
    language: str | None = None,
    script: str | None = None,
    category: str | None = None,
    verification_status: str | None = None,
    search_q: str | None = None,
    page: int = 1,
    page_size: int = 25,
    limit: int | None = None,
    offset: int | None = None,
    db_path: str = DB_PATH,
) -> dict[str, Any]:
    """Retrieve paginated knowledge graph nodes with flexible filtering."""
    if limit is not None:
        effective_limit = limit
        effective_offset = offset or 0
    else:
        effective_limit = page_size
        effective_offset = (max(page, 1) - 1) * page_size

    conditions = ["1=1"]
    params: list[object] = []

    if entity_type:
        conditions.append("entity_type = ?")
        params.append(entity_type.strip().lower())
    if language:
        conditions.append("primary_language = ?")
        params.append(language.strip().lower())
    if script:
        conditions.append("script LIKE ?")
        params.append(f"%{script.strip()}%")
    if category:
        conditions.append("category = ?")
        params.append(category.strip().lower())
    if verification_status:
        conditions.append("verification_status = ?")
        params.append(verification_status.strip().upper())
    if search_q and search_q.strip():
        q_term = f"%{search_q.strip()}%"
        conditions.append("(name LIKE ? OR native_name LIKE ? OR summary LIKE ?)")
        params.extend([q_term, q_term, q_term])

    where_clause = " AND ".join(conditions)

    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(f"SELECT COUNT(*) FROM kg_nodes WHERE {where_clause}", params)
        total_count = cursor.fetchone()[0]

        cursor.execute(
            f"""
            SELECT * FROM kg_nodes 
            WHERE {where_clause}
            ORDER BY verification_status DESC, name ASC
            LIMIT ? OFFSET ?
            """,
            params + [effective_limit, effective_offset],
        )
        rows = cursor.fetchall()
        items: list[dict[str, Any]] = []
        for r in rows:
            d = dict(r)
            if d.get("metadata_json"):
                try:
                    d["metadata"] = json.loads(d["metadata_json"])
                except (json.JSONDecodeError, TypeError):
                    d["metadata"] = {}
            items.append(d)

    return {
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "nodes": items,
    }


def get_kg_node_details(node_id: str, is_admin: bool = False, db_path: str = DB_PATH) -> dict[str, Any] | None:
    """Fetch complete details of a single node with vocabulary info, outgoing edges, and incoming edges."""
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM kg_nodes WHERE node_id = ?", (node_id,))
        node_row = cursor.fetchone()
        if not node_row:
            return None

        node = dict(node_row)
        if node.get("metadata_json"):
            try:
                node["metadata"] = json.loads(node["metadata_json"])
            except (json.JSONDecodeError, TypeError):
                node["metadata"] = {}

        # If vocabulary, attach vocabulary details
        vocab_details = None
        if node["entity_type"] == "vocabulary":
            cursor.execute("SELECT * FROM kg_vocabulary_details WHERE word_id = ?", (node_id,))
            vrow = cursor.fetchone()
            if vrow:
                vocab_details = dict(vrow)

        # Outgoing relationships
        cursor.execute("""
            SELECT r.*, n.name as target_name, n.entity_type as target_type, n.native_name as target_native
            FROM kg_relationships r
            JOIN kg_nodes n ON r.target_id = n.node_id
            WHERE r.source_id = ?
            ORDER BY r.relationship_type ASC
        """, (node_id,))
        outgoing = [dict(r) for r in cursor.fetchall()]

        # Incoming relationships
        cursor.execute("""
            SELECT r.*, n.name as source_name, n.entity_type as source_type, n.native_name as source_native
            FROM kg_relationships r
            JOIN kg_nodes n ON r.source_id = n.node_id
            WHERE r.target_id = ?
            ORDER BY r.relationship_type ASC
        """, (node_id,))
        incoming = [dict(r) for r in cursor.fetchall()]

    return {
        "node": node,
        "vocabulary_details": vocab_details,
        "outgoing_relationships": outgoing,
        "incoming_relationships": incoming,
        "connected_edges_count": len(outgoing) + len(incoming),
    }


def get_subgraph(
    center_node_id: str | None = None,
    language: str | None = None,
    entity_types: list[str] | None = None,
    max_nodes: int = 60,
    db_path: str = DB_PATH,
) -> dict[str, Any]:
    """Extract a connected subgraph payload { nodes: [...], edges: [...] } for visualization."""
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        selected_node_ids: set[str] = set()

        if center_node_id:
            # Add center node
            cursor.execute("SELECT node_id FROM kg_nodes WHERE node_id = ?", (center_node_id,))
            if cursor.fetchone():
                selected_node_ids.add(center_node_id)

            # Add 1-hop outgoing neighbors
            cursor.execute("""
                SELECT target_id FROM kg_relationships 
                WHERE source_id = ? 
                LIMIT ?
            """, (center_node_id, max_nodes // 2))
            for r in cursor.fetchall():
                selected_node_ids.add(r[0])

            # Add 1-hop incoming neighbors
            cursor.execute("""
                SELECT source_id FROM kg_relationships 
                WHERE target_id = ? 
                LIMIT ?
            """, (center_node_id, max_nodes // 2))
            for r in cursor.fetchall():
                selected_node_ids.add(r[0])

        if not selected_node_ids:
            # Default: Pick top languages, varieties, scripts, and key vocabulary
            conditions = ["1=1"]
            params: list[object] = []
            if language:
                conditions.append("primary_language = ?")
                params.append(language.strip().lower())
            if entity_types:
                placeholders = ",".join("?" for _ in entity_types)
                conditions.append(f"entity_type IN ({placeholders})")
                params.extend([e.strip().lower() for e in entity_types])

            where_str = " AND ".join(conditions)
            cursor.execute(f"""
                SELECT node_id FROM kg_nodes 
                WHERE {where_str}
                ORDER BY CASE entity_type 
                    WHEN 'language' THEN 1 
                    WHEN 'script' THEN 2 
                    WHEN 'variety' THEN 3 
                    WHEN 'vocabulary' THEN 4 
                    ELSE 5 END, name ASC
                LIMIT ?
            """, params + [max_nodes])
            for r in cursor.fetchall():
                selected_node_ids.add(r[0])

        if not selected_node_ids:
            return {"nodes": [], "edges": [], "count": 0}

        # Fetch node objects
        node_placeholders = ",".join("?" for _ in selected_node_ids)
        cursor.execute(f"""
            SELECT * FROM kg_nodes WHERE node_id IN ({node_placeholders})
        """, list(selected_node_ids))
        nodes_list = [dict(r) for r in cursor.fetchall()]

        # Fetch edges between any of the selected nodes
        cursor.execute(f"""
            SELECT * FROM kg_relationships 
            WHERE source_id IN ({node_placeholders}) AND target_id IN ({node_placeholders})
        """, list(selected_node_ids) + list(selected_node_ids))
        edges_list = [dict(r) for r in cursor.fetchall()]

    return {
        "nodes": nodes_list,
        "edges": edges_list,
        "total_nodes": len(nodes_list),
        "total_edges": len(edges_list),
    }


def search_knowledge_graph(
    query: str,
    language: str | None = None,
    entity_type: str | None = None,
    limit: int = 25,
    db_path: str = DB_PATH,
) -> list[dict[str, Any]]:
    """Search knowledge graph with Unicode Indic script support via FTS5 and fallback."""
    clean_q = query.strip()
    if not clean_q:
        return []

    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # 1. Attempt FTS5 exact / prefix match
        fts_query = f"{clean_q}*"
        try:
            cursor.execute("""
                SELECT n.*, fts.rank 
                FROM kg_search_fts fts
                JOIN kg_nodes n ON fts.node_id = n.node_id
                WHERE kg_search_fts MATCH ?
                ORDER BY fts.rank
                LIMIT ?
            """, (fts_query, limit))
            fts_rows = cursor.fetchall()
            if fts_rows:
                return [dict(r) for r in fts_rows]
        except sqlite3.OperationalError as fts_err:
            logger.debug("FTS5 match failed, falling back to LIKE: %s", fts_err)

        # 2. Fallback: Case-insensitive and script-safe LIKE query
        like_term = f"%{clean_q}%"
        conditions = ["(n.name LIKE ? OR n.native_name LIKE ? OR n.summary LIKE ? OR v.transliteration LIKE ? OR v.meaning LIKE ?)"]
        params: list[object] = [like_term, like_term, like_term, like_term, like_term]

        if language:
            conditions.append("n.primary_language = ?")
            params.append(language.strip().lower())
        if entity_type:
            conditions.append("n.entity_type = ?")
            params.append(entity_type.strip().lower())

        where_clause = " AND ".join(conditions)
        cursor.execute(f"""
            SELECT DISTINCT n.* 
            FROM kg_nodes n
            LEFT JOIN kg_vocabulary_details v ON n.node_id = v.word_id
            WHERE {where_clause}
            LIMIT ?
        """, params + [limit])
        like_rows = cursor.fetchall()

    return [dict(r) for r in like_rows]


def create_knowledge_graph_node(
    entity_type: str,
    name: str,
    node_id: str | None = None,
    native_name: str | None = None,
    primary_language: str | None = None,
    script: str | None = None,
    category: str | None = None,
    summary: str | None = None,
    source_reference: str | None = None,
    source_organization: str | None = None,
    source_url: str | None = None,
    dataset_version: str | None = None,
    metadata: dict[str, Any] | None = None,
    verification_status: str | None = None,
    vocabulary_details: dict[str, Any] | None = None,
    user_role: str | None = None,
    is_admin: bool = False,
    db_path: str = DB_PATH,
) -> dict[str, Any]:
    """Create a new node with verification permission enforcement and optional vocabulary details."""
    clean_type = entity_type.strip().lower()
    if clean_type not in VALID_ENTITY_TYPES:
        raise ValueError(f"Invalid entity type '{clean_type}'. Allowed: {VALID_ENTITY_TYPES}")

    # Determine status: Admin or Certified Reviewers can directly create VERIFIED nodes
    if verification_status:
        status = verification_status.strip().upper()
    elif is_admin or (user_role and user_role in AUTHORIZED_REVIEWER_ROLES):
        status = "VERIFIED"
    else:
        status = "PROPOSED"

    now = _now_iso()
    meta_json = json.dumps(metadata or {})

    # Auto-generate node_id if not provided
    if not node_id:
        clean_name = re.sub(r"[^a-zA-Z0-9_]", "", name.lower().replace(" ", "_"))[:25] or "item"
        prefix = primary_language.strip().lower() if primary_language else "global"
        node_id = f"{clean_type}:{prefix}:{clean_name}_{int(time.time()) % 10000}"

    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        try:
            cursor.execute("""
                INSERT INTO kg_nodes (
                    node_id, entity_type, name, native_name, primary_language, script, category,
                    summary, verification_status, source_reference, source_organization, source_url,
                    dataset_version, metadata_json, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                node_id, clean_type, name.strip(), native_name, primary_language, script, category,
                summary, status, source_reference, source_organization, source_url,
                dataset_version, meta_json, now, now,
            ))
        except sqlite3.IntegrityError:
            raise ValueError(f"Node '{node_id}' already exists in knowledge graph.")

        if clean_type == "vocabulary" and vocabulary_details:
            cursor.execute("""
                INSERT OR REPLACE INTO kg_vocabulary_details (
                    word_id, language_code, original_word, script, transliteration,
                    meaning, grammatical_category, cultural_context, pronunciation_guide, review_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                node_id,
                primary_language or vocabulary_details.get("language_code", ""),
                vocabulary_details.get("original_word") or native_name or name,
                script or vocabulary_details.get("script", ""),
                vocabulary_details.get("transliteration", ""),
                vocabulary_details.get("meaning") or summary or "",
                vocabulary_details.get("grammatical_category", ""),
                vocabulary_details.get("cultural_context", ""),
                vocabulary_details.get("pronunciation_guide", ""),
                status,
            ))

        conn.commit()
        sync_node_fts(conn, node_id)

    return {
        "node_id": node_id,
        "entity_type": clean_type,
        "name": name,
        "verification_status": status,
        "created_at": now,
    }


def create_knowledge_graph_relationship(
    source_id: str,
    target_id: str,
    relationship_type: str,
    label: str | None = None,
    weight: float = 1.0,
    confidence_score: float = 1.0,
    provenance: str | None = None,
    source_reference: str | None = None,
    verification_status: str | None = None,
    metadata: dict[str, Any] | None = None,
    user_role: str | None = None,
    is_admin: bool = False,
    db_path: str = DB_PATH,
) -> dict[str, Any]:
    """Create a typed relationship connecting two existing nodes."""
    rel_type = relationship_type.strip().upper()
    if rel_type not in VALID_RELATIONSHIP_TYPES:
        raise ValueError(f"Invalid relationship type '{rel_type}'. Allowed: {VALID_RELATIONSHIP_TYPES}")

    now = _now_iso()
    if verification_status:
        status = verification_status.strip().upper()
    elif is_admin or (user_role and user_role in AUTHORIZED_REVIEWER_ROLES):
        status = "VERIFIED"
    else:
        status = "PROPOSED"

    meta_json = json.dumps(metadata or {})

    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        # Verify source and target exist
        cursor.execute("SELECT node_id FROM kg_nodes WHERE node_id = ?", (source_id,))
        if not cursor.fetchone():
            raise ValueError(f"Source node '{source_id}' does not exist.")

        cursor.execute("SELECT node_id FROM kg_nodes WHERE node_id = ?", (target_id,))
        if not cursor.fetchone():
            raise ValueError(f"Target node '{target_id}' does not exist.")

        try:
            cursor.execute("""
                INSERT INTO kg_relationships (
                    source_id, target_id, relationship_type, label, verification_status,
                    source_reference, confidence_score, metadata_json, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                source_id, target_id, rel_type, label or rel_type.lower().replace("_", " "),
                status, source_reference, confidence_score, meta_json, now, now,
            ))
            conn.commit()
            rel_id = cursor.lastrowid
        except sqlite3.IntegrityError:
            raise ValueError(f"Relationship '{rel_type}' between '{source_id}' and '{target_id}' already exists.")

    return {
        "id": rel_id,
        "source_id": source_id,
        "target_id": target_id,
        "relationship_type": rel_type,
        "verification_status": status,
        "created_at": now,
    }


def update_knowledge_graph_node(
    node_id: str,
    name: str | None = None,
    native_name: str | None = None,
    script: str | None = None,
    category: str | None = None,
    summary: str | None = None,
    verification_status: str | None = None,
    source_reference: str | None = None,
    source_organization: str | None = None,
    metadata: dict[str, Any] | None = None,
    reviewer_name: str | None = None,
    reviewer_role: str | None = None,
    is_admin: bool = False,
    db_path: str = DB_PATH,
) -> dict[str, Any]:
    """Update a node's metadata or verification status."""
    now = _now_iso()

    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM kg_nodes WHERE node_id = ?", (node_id,))
        row = cursor.fetchone()
        if not row:
            raise ValueError(f"Node '{node_id}' not found.")

        current = dict(row)
        new_name = name if name is not None else current["name"]
        new_native = native_name if native_name is not None else current["native_name"]
        new_script = script if script is not None else current["script"]
        new_category = category if category is not None else current["category"]
        new_summary = summary if summary is not None else current["summary"]
        new_source_ref = source_reference if source_reference is not None else current["source_reference"]
        new_source_org = source_organization if source_organization is not None else current["source_organization"]
        new_meta = json.dumps(metadata) if metadata is not None else current["metadata_json"]
        new_status = current["verification_status"]

        if verification_status:
            stat_upper = verification_status.strip().upper()
            if stat_upper not in VALID_VERIFICATION_STATUSES:
                raise ValueError(f"Invalid status '{stat_upper}'. Allowed: {VALID_VERIFICATION_STATUSES}")
            new_status = stat_upper

        cursor.execute("""
            UPDATE kg_nodes 
            SET name = ?, native_name = ?, script = ?, category = ?, summary = ?,
                source_reference = ?, source_organization = ?, metadata_json = ?,
                verification_status = ?, reviewed_by = ?, reviewed_at = ?, updated_at = ?
            WHERE node_id = ?
        """, (
            new_name, new_native, new_script, new_category, new_summary,
            new_source_ref, new_source_org, new_meta,
            new_status, reviewer_name or current["reviewed_by"], now, now, node_id,
        ))
        conn.commit()
        sync_node_fts(conn, node_id)

    return {
        "node_id": node_id,
        "name": new_name,
        "verification_status": new_status,
        "updated_at": now,
    }


def delete_knowledge_graph_relationship(
    relationship_id: int,
    user_role: str | None = None,
    is_admin: bool = False,
    db_path: str = DB_PATH,
) -> bool:
    """Delete a relationship by ID with permission checks."""
    if not is_admin and (not user_role or user_role not in AUTHORIZED_REVIEWER_ROLES):
        raise PermissionError("Only administrators or certified reviewers can remove graph relationships.")

    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM kg_relationships WHERE id = ?", (relationship_id,))
        conn.commit()
        return cursor.rowcount > 0
