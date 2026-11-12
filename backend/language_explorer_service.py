"""Voice Roots: Milestone 29 — Interactive Language Explorer Service.
=============================================================================
Provides domain operations, phylogenetic family trees, dialect cartography,
morphological cognate graphs, and objective community vitality indicators across
all 44 registered world and minority languages, with specialized depth on
Central and South-Central Dravidian, Austroasiatic Munda, and Indo-Aryan diaspora.

Complies strictly with OCAP principles: no external extinction speculation;
all vitality indicators are grounded in community documentation metrics and census data.
"""

from __future__ import annotations

import logging
import os
import sqlite3
from typing import Any

from language_registry import language_registry

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


# ---------------------------------------------------------------------------
# 1. Phylogenetic Family Trees
# ---------------------------------------------------------------------------

DRAVIDIAN_HIERARCHY: dict[str, Any] = {
    "name": "Dravidian Macro-Family",
    "id": "family:dravidian",
    "description": "Indigenous linguistic lineage of South and Central Asia with non-Indo-European roots.",
    "subfamilies": [
        {
            "name": "Central Dravidian",
            "id": "subfamily:central_dravidian",
            "description": "Spoken across the Satpura and Vindhya ranges; rich in oral epic traditions.",
            "languages": ["gon"],
            "varieties": [
                {
                    "id": "variety:gon:adilabad",
                    "code": "gon",
                    "name": "Adilabad Raj Gondi",
                    "region": "Northern Telangana / Satpura Hills",
                    "dialect_marker": "Southern Raj Gondi oral literature and Pen Katur invocations",
                },
                {
                    "id": "variety:gon:betul",
                    "code": "gon",
                    "name": "Betul / Mandla Northern Gondi",
                    "region": "Madhya Pradesh",
                    "dialect_marker": "Northern phonological shifts; alveolar and retroflex contrasts",
                },
                {
                    "id": "variety:gon:bastar_maria",
                    "code": "gon",
                    "name": "Bastar Maria / Muria Gondi",
                    "region": "Chhattisgarh (Dandakaranya)",
                    "dialect_marker": "Ghotul oral ballads and clan totem poetry",
                },
                {
                    "id": "variety:gon:godavari",
                    "code": "gon",
                    "name": "Godavari Valley Gondi",
                    "region": "Godavari river basin",
                    "dialect_marker": "Transitional riverine dialect sharing vocabulary with Koya",
                },
            ],
        },
        {
            "name": "South-Central Dravidian",
            "id": "subfamily:south_central_dravidian",
            "description": "Encompasses forest oral tongues and literary riverine languages.",
            "languages": ["kff", "te"],
            "varieties": [
                {
                    "id": "variety:kff:godavari",
                    "code": "kff",
                    "name": "Godavari Valley Koya",
                    "region": "Bhadrachalam / Khammam Forest Belt",
                    "dialect_marker": "Ethnobotanical medicinal formulations and Sammakka-Sarakka chants",
                },
                {
                    "id": "variety:kff:malkangiri",
                    "code": "kff",
                    "name": "Malkangiri Koya",
                    "region": "Odisha Eastern Ghats Border",
                    "dialect_marker": "Highland Koya phonology with Desia Odia convergence",
                },
                {
                    "id": "variety:kff:koya_dora",
                    "code": "kff",
                    "name": "Koya Dora",
                    "region": "East Godavari / Alluri Sitarama Raju",
                    "dialect_marker": "Hill Dora dialect preserving archaic Dravidian pronouns",
                },
            ],
        },
        {
            "name": "South Dravidian",
            "id": "subfamily:south_dravidian",
            "description": "Literary and regional classical Dravidian tongues of peninsular India.",
            "languages": ["ta", "ml", "kn"],
            "varieties": [],
        },
    ],
}

AUSTROASIATIC_HIERARCHY: dict[str, Any] = {
    "name": "Austroasiatic Macro-Family",
    "id": "family:austroasiatic",
    "description": "One of the most ancient language families of South and Southeast Asia.",
    "subfamilies": [
        {
            "name": "Munda Branch",
            "id": "subfamily:munda",
            "description": "Agglutinative indigenous languages of the Chota Nagpur plateau and eastern forest belts.",
            "languages": ["sat"],
            "varieties": [
                {
                    "id": "variety:sat:mayurbhanj",
                    "code": "sat",
                    "name": "Mayurbhanj Santhali",
                    "region": "Odisha (Mayurbhanj / Keonjhar)",
                    "dialect_marker": "Original cradle of Pandit Raghunath Murmu's Ol Chiki script (1925)",
                },
                {
                    "id": "variety:sat:dumka",
                    "code": "sat",
                    "name": "Dumka / Santhal Parganas",
                    "region": "Jharkhand",
                    "dialect_marker": "Historical heartland of Hul rebellion oral epics",
                },
                {
                    "id": "variety:sat:purulia",
                    "code": "sat",
                    "name": "Purulia Jungle Mahals",
                    "region": "West Bengal",
                    "dialect_marker": "Chhau dance accompanying songs and Karam festival chants",
                },
            ],
        },
        {
            "name": "Vietic / Mon-Khmer Branch",
            "id": "subfamily:vietic",
            "description": "Southeast Asian mainland Austroasiatic lineage.",
            "languages": ["vi"],
            "varieties": [],
        },
    ],
}

INDO_ARYAN_HIERARCHY: dict[str, Any] = {
    "name": "Indo-Aryan & Diaspora Lineage",
    "id": "family:indo_aryan",
    "description": "Spoken widely across the Indian subcontinent, including nomadic diaspora oral tongues.",
    "subfamilies": [
        {
            "name": "Banjara & Rajasthani Diaspora",
            "id": "subfamily:banjara_diaspora",
            "description": "Nomadic oral heritage language of the Banjara/Lambada community.",
            "languages": ["lmn"],
            "varieties": [
                {
                    "id": "variety:lmn:banjara_deccan",
                    "code": "lmn",
                    "name": "Deccan Banjara",
                    "region": "Telangana, Andhra Pradesh, Marathwada",
                    "dialect_marker": "Tanda clan migration ballads and Teej festival songs",
                },
                {
                    "id": "variety:lmn:western",
                    "code": "lmn",
                    "name": "Western Gorboli",
                    "region": "Maharashtra, Karnataka, Gujarat border",
                    "dialect_marker": "Gorboli phonology retaining archaic Western Rajasthani cases",
                },
                {
                    "id": "variety:lmn:rajasthani",
                    "code": "lmn",
                    "name": "Northern Rajasthani Gorboli",
                    "region": "Rajasthan / Thar Desert fringe",
                    "dialect_marker": "Ancestral desert caravan chants and nomadic folklore",
                },
            ],
        },
        {
            "name": "Major Indic Tongues",
            "id": "subfamily:major_indic",
            "description": "Regional scheduled languages of the northern and eastern plains.",
            "languages": ["hi", "bn", "mr", "or", "pa", "gu", "ur"],
            "varieties": [],
        },
    ],
}

GLOBAL_INDIGENOUS_HIERARCHY: dict[str, Any] = {
    "name": "Global Indigenous & First Nations Lineages",
    "id": "family:global_indigenous",
    "description": "Indigenous and First Nations oral heritages across the Americas, Pacific, Africa, and Eurasia.",
    "subfamilies": [
        {
            "name": "Americas Indigenous",
            "id": "subfamily:americas_indigenous",
            "languages": ["qu", "gn", "nv", "iu", "nah"],
            "varieties": [],
        },
        {
            "name": "Pacific & Oceanian",
            "id": "subfamily:pacific_oceanian",
            "languages": ["mi", "haw", "id"],
            "varieties": [],
        },
        {
            "name": "Celtic & Eurasian Heritage",
            "id": "subfamily:celtic_eurasian",
            "languages": ["cy", "ga", "ain", "eu"],
            "varieties": [],
        },
        {
            "name": "African Indigenous & Regional",
            "id": "subfamily:african_indigenous",
            "languages": ["sw", "yo", "zu", "am"],
            "varieties": [],
        },
    ],
}

MAJOR_WORLD_HIERARCHY: dict[str, Any] = {
    "name": "Major World Languages",
    "id": "family:world_languages",
    "description": "Global cross-continental languages.",
    "subfamilies": [
        {
            "name": "European Branches",
            "id": "subfamily:european_branches",
            "languages": ["en", "de", "fr", "es", "pt", "ru"],
            "varieties": [],
        },
        {
            "name": "East Asian & Sino-Tibetan",
            "id": "subfamily:east_asian",
            "languages": ["zh", "ja", "ko", "bo"],
            "varieties": [],
        },
        {
            "name": "Semitic & Turkic",
            "id": "subfamily:semitic_turkic",
            "languages": ["ar", "tr"],
            "varieties": [],
        },
    ],
}


def get_phylogenetic_tree(db_path: str = DB_PATH) -> dict[str, Any]:
    """Retrieve full hierarchical phylogenetic tree connecting all 44 languages in registry."""
    all_langs = {l["code"]: l for l in language_registry.list_languages()}
    total_languages = len(all_langs)

    def _enrich_subfamily(subfam: dict[str, Any]) -> dict[str, Any]:
        enriched_langs: list[dict[str, Any]] = []
        for code in subfam.get("languages", []):
            if code in all_langs:
                l = all_langs[code]
                enriched_langs.append({
                    "code": code,
                    "name": l["name"],
                    "native": l.get("native", ""),
                    "script": l.get("script", ""),
                    "family": l.get("family", ""),
                    "region": l.get("region", ""),
                    "category": l.get("category", "world"),
                    "tested_status": l.get("tested_status", "benchmarked"),
                })
        res = dict(subfam)
        res["language_count"] = len(enriched_langs)
        res["languages"] = enriched_langs
        return res

    def _enrich_macro_family(macro: dict[str, Any]) -> dict[str, Any]:
        enriched_subfams = [_enrich_subfamily(s) for s in macro.get("subfamilies", [])]
        member_count = sum(s["language_count"] for s in enriched_subfams)
        res = dict(macro)
        res["subfamilies"] = enriched_subfams
        res["total_languages"] = member_count
        return res

    families = [
        _enrich_macro_family(DRAVIDIAN_HIERARCHY),
        _enrich_macro_family(AUSTROASIATIC_HIERARCHY),
        _enrich_macro_family(INDO_ARYAN_HIERARCHY),
        _enrich_macro_family(GLOBAL_INDIGENOUS_HIERARCHY),
        _enrich_macro_family(MAJOR_WORLD_HIERARCHY),
    ]

    return {
        "status": "success",
        "title": "Phylogenetic Tree of Registered World & Oral Minority Languages",
        "total_languages": total_languages,
        "total_registered_languages": total_languages,
        "total_macro_families": len(families),
        "families": families,
    }


# ---------------------------------------------------------------------------
# 2. Dialect Cartography & Geographic Distribution
# ---------------------------------------------------------------------------

DIALECT_CARTOGRAPHY_DATA: list[dict[str, Any]] = [
    {
        "id": "variety:gon:adilabad",
        "language_code": "gon",
        "language_name": "Gondi",
        "variety_name": "Adilabad Raj Gondi",
        "latitude": 19.6641,
        "longitude": 78.5320,
        "region_name": "Satpura Foothills / Adilabad & Kumuram Bheem",
        "states": ["Telangana", "Maharashtra Border"],
        "speaking_population": 420000,
        "vitality_tier": "Vital Oral Tradition",
        "writing_systems": ["Gunjala Gondi", "Telugu", "Devanagari"],
        "cultural_anchor": "Keslapur Nagoba Temple & Utnoor ITDA Cultural Center",
        "phonological_features": [
            "Preserves retroflex lateral flap [ɭ]",
            "Distinct voiceless velar stop [k] in sacred chant prefixes",
            "Two-gender grammatical system in verbal agreements",
        ],
        "sample_phrase": "మారామ్ తియ్ పారత్ సగా పెన్ పూజ (Tree planting clan deity rite)",
    },
    {
        "id": "variety:gon:bastar_maria",
        "language_code": "gon",
        "language_name": "Gondi",
        "variety_name": "Bastar Maria / Muria",
        "latitude": 19.0748,
        "longitude": 82.0080,
        "region_name": "Dandakaranya / Bastar Plateau",
        "states": ["Chhattisgarh", "Odisha Border"],
        "speaking_population": 680000,
        "vitality_tier": "Rich Oral Epic Tradition",
        "writing_systems": ["Masaram Gondi", "Devanagari", "Oral Liturgical"],
        "cultural_anchor": "Ghotul Youth Dormitories & Annual Pen Katur Assembly",
        "phonological_features": [
            "Medial consonant gemination",
            "Phonetic vowel harmony across polysyllabic verbal stems",
            "Rich inventory of hunting and forest canopy terms",
        ],
        "sample_phrase": "గయ్యే పెన్ కాటూర్ సగా రోట్ (Ancestral clan spirit assembly)",
    },
    {
        "id": "variety:gon:betul",
        "language_code": "gon",
        "language_name": "Gondi",
        "variety_name": "Betul / Mandla Northern Gondi",
        "latitude": 21.9014,
        "longitude": 77.9024,
        "region_name": "Maikal Hills / Betul & Mandla",
        "states": ["Madhya Pradesh"],
        "speaking_population": 520000,
        "vitality_tier": "Oral Narrative Active",
        "writing_systems": ["Devanagari", "Masaram Gondi"],
        "cultural_anchor": "Maikal Sacred Groves & Narmada Basin Gondwana Kingdoms",
        "phonological_features": [
            "Alveolar-retroflex contrast retention",
            "Partial convergence with neighboring Chhattisgarhi/Bundeli",
        ],
        "sample_phrase": "मरम तिया येर कसीर (Tree root waters of life)",
    },
    {
        "id": "variety:gon:godavari",
        "language_code": "gon",
        "language_name": "Gondi",
        "variety_name": "Godavari Valley Gondi",
        "latitude": 18.2500,
        "longitude": 80.2000,
        "region_name": "Lower Godavari Basin",
        "states": ["Telangana", "Andhra Pradesh"],
        "speaking_population": 260000,
        "vitality_tier": "Bilingual Convergence Zone",
        "writing_systems": ["Telugu script", "Oral Tradition"],
        "cultural_anchor": "Eturnagaram Wildlife Sanctuary & Godavari Tributaries",
        "phonological_features": [
            "Shared lexical items with riverine Koya",
            "Extensive Dravidian retroflex consonant preservation",
        ],
        "sample_phrase": "పర్సాపెన్ సగా కుల రక్షణ (Persapen protective clan rite)",
    },
    {
        "id": "variety:kff:godavari",
        "language_code": "kff",
        "language_name": "Koya",
        "variety_name": "Godavari Valley Koya",
        "latitude": 17.6689,
        "longitude": 80.8937,
        "region_name": "Bhadrachalam / Godavari River Belt",
        "states": ["Telangana", "Andhra Pradesh"],
        "speaking_population": 280000,
        "vitality_tier": "Living Forest Ethnobotany Tradition",
        "writing_systems": ["Telugu script", "Oral Chants"],
        "cultural_anchor": "Sammakka-Sarakka Medaram & Bhadrachalam ITDA",
        "phonological_features": [
            "Characteristic bilabial semivowel [w] vs [v] alternation",
            "Elaborate ethnobotanical healing vocabulary",
            "Short vs long vowel phonemic length contrasts",
        ],
        "sample_phrase": "గోదావరి లోయలో మా వన మూలికల వైద్యం (Healing roots of the Godavari valley)",
    },
    {
        "id": "variety:kff:malkangiri",
        "language_code": "kff",
        "language_name": "Koya",
        "variety_name": "Malkangiri Koya",
        "latitude": 18.3436,
        "longitude": 81.8809,
        "region_name": "Eastern Ghats / Malkangiri",
        "states": ["Odisha", "Telangana Border"],
        "speaking_population": 110000,
        "vitality_tier": "Highland Oral Heritage",
        "writing_systems": ["Odia script", "Telugu script", "Oral Tradition"],
        "cultural_anchor": "Sabari River Confluence & Balimela Reservoir",
        "phonological_features": [
            "Contact influence with Southern Odia and Gutob",
            "Aspiration contrast in initial loan consonants",
        ],
        "sample_phrase": "కొయ్తూర్ తంగ్ పయ్య నడక (Path of the Koitur clan through the forest)",
    },
    {
        "id": "variety:sat:mayurbhanj",
        "language_code": "sat",
        "language_name": "Santhali",
        "variety_name": "Mayurbhanj Santhali",
        "latitude": 21.9287,
        "longitude": 86.7416,
        "region_name": "Similipal Hills / Mayurbhanj",
        "states": ["Odisha"],
        "speaking_population": 1850000,
        "vitality_tier": "Vibrant Literary & Oral Heritage",
        "writing_systems": ["Ol Chiki (ᱚᱞ ᱪᱤᱠᱤ)"],
        "cultural_anchor": "Rairangpur & Pandit Raghunath Murmu Memorial",
        "phonological_features": [
            "Six distinctive vowel qualities with checked consonants (agglutinative)",
            "Glottal stop finality on noun stems",
            "Complex Austroasiatic dual and plural inclusive/exclusive pronouns",
        ],
        "sample_phrase": "ᱡᱟᱦᱮᱨ ᱛᱷᱟᱱ ᱨᱮ ᱥᱟᱨᱡᱚᱢ ᱵᱟᱦᱟ ᱵᱚᱸᱜᱟ (Sal blossom invocation in the Jaher grove)",
    },
    {
        "id": "variety:sat:dumka",
        "language_code": "sat",
        "language_name": "Santhali",
        "variety_name": "Dumka / Santhal Parganas",
        "latitude": 24.2676,
        "longitude": 87.2472,
        "region_name": "Rajmahal Hills / Santhal Parganas",
        "states": ["Jharkhand", "Bihar Border"],
        "speaking_population": 2900000,
        "vitality_tier": "Vibrant National Scheduled Language",
        "writing_systems": ["Ol Chiki", "Devanagari", "Latin"],
        "cultural_anchor": "Bhognaadih (Sidho-Kanho Memorial) & Dumka University",
        "phonological_features": [
            "Agglutinative morphological infixes",
            "Sarna religion traditional ceremonial chant cadences",
        ],
        "sample_phrase": "ᱫᱷᱚᱨᱚᱢ ᱥᱟᱨᱡᱚᱢ ᱟᱨ ᱢᱟᱹᱧᱡᱷᱤ ᱦᱟᱲᱟᱢ (Sacred Sal tree and Village Elder Council)",
    },
    {
        "id": "variety:lmn:banjara_deccan",
        "language_code": "lmn",
        "language_name": "Lambadi",
        "variety_name": "Deccan Banjara",
        "latitude": 17.3850,
        "longitude": 78.4867,
        "region_name": "Deccan Plateau / Telangana & Andhra Tanda Clusters",
        "states": ["Telangana", "Andhra Pradesh", "Karnataka"],
        "speaking_population": 2800000,
        "vitality_tier": "Vibrant Nomadic Diaspora Heritage",
        "writing_systems": ["Telugu script", "Devanagari", "Oral Tradition"],
        "cultural_anchor": "Sevadas Maharaj Pohradevi & Hyderabad Tanda Councils",
        "phonological_features": [
            "Rajasthani-Gujarati historical phonological core with Dravidian adoptions",
            "Prefix-based clan governance terminology (Naayak, Karobari, Bhat)",
            "Vigorous oral epic repertoire sung at communal gatherings",
        ],
        "sample_phrase": "తాండా నాయక్ భలా రామ్ రామ్ (Salutations to the autonomous Tanda chief)",
    },
    {
        "id": "variety:lmn:western",
        "language_code": "lmn",
        "language_name": "Lambadi",
        "variety_name": "Western Gorboli",
        "latitude": 19.8762,
        "longitude": 75.3433,
        "region_name": "Marathwada & Western Ghats Foothills",
        "states": ["Maharashtra", "Karnataka Border"],
        "speaking_population": 1200000,
        "vitality_tier": "Communal Song & Embroidery Lore",
        "writing_systems": ["Devanagari", "Kannada script"],
        "cultural_anchor": "Pohradevi Shrine & Nanded Banjara Centers",
        "phonological_features": [
            "Preservation of retroflex [ɖ] and voiced sibilants",
            "Rich textile embroidery terminology and nomadic trade vocab",
        ],
        "sample_phrase": "गोरबोली गीत तांडा मांहि (Gorboli ballad inside the Tanda settlement)",
    },
]


def get_dialect_cartography() -> dict[str, Any]:
    """Retrieve dialect coordinates, regional boundaries, and speaker demographics."""
    grouped_langs: dict[str, Any] = {}
    for d in DIALECT_CARTOGRAPHY_DATA:
        code = d["language_code"]
        lang_name = d["language_name"]
        key = lang_name.lower()
        if key not in grouped_langs:
            grouped_langs[key] = {
                "language_code": code,
                "language_name": lang_name,
                "census_speakers": CENSUS_POPULATION_BASELINES.get(code, {}).get("census_speakers", 0),
                "varieties": [],
            }
        grouped_langs[key]["varieties"].append({
            "id": d["id"],
            "name": d["variety_name"],
            "region": d["region_name"],
            "territory": ", ".join(d["states"]),
            "coordinates": {"lat": d["latitude"], "lon": d["longitude"]},
            "speaker_population": d["speaking_population"],
            "cultural_anchor": d["cultural_anchor"],
            "phonological_markers": d["phonological_features"],
            "sample_phrase": d["sample_phrase"],
        })

    return {
        "status": "success",
        "total_dialects": len(DIALECT_CARTOGRAPHY_DATA),
        "primary_languages_covered": ["gon", "kff", "sat", "lmn"],
        "dialects": DIALECT_CARTOGRAPHY_DATA,
        "languages": grouped_langs,
    }


# ---------------------------------------------------------------------------
# 3. Morphological & Lexical Relationship Graph
# ---------------------------------------------------------------------------

MORPHOLOGICAL_NODES: list[dict[str, Any]] = [
    # Proto-Roots
    {"id": "root:maram", "type": "proto_root", "label": "*mar-am (Tree / Forest)", "family": "Proto-Dravidian", "meaning": "Tree, timber, sacred living grove"},
    {"id": "root:neeru", "type": "proto_root", "label": "*nīr- / *yer (Water)", "family": "Proto-Dravidian", "meaning": "Fresh water, rain, stream, life fluid"},
    {"id": "root:konda", "type": "proto_root", "label": "*kun- / *konda (Hill / Mountain)", "family": "Proto-Dravidian", "meaning": "Hill, highland ridge, sacred elevated shrine"},
    {"id": "root:velpu_persapen", "type": "proto_root", "label": "*pēr- / *vel- (Great / Clan Guardian)", "family": "Proto-Dravidian", "meaning": "Tutelary ancestor deity, clan guardian spirit"},
    {"id": "root:sarjom", "type": "proto_root", "label": "*sarjom (Shorea robusta)", "family": "Proto-Austroasiatic", "meaning": "Sacred Sal tree, flowering canopy of the Jaher grove"},
    {"id": "root:tanda", "type": "proto_root", "label": "*tāndā (Caravan Camp)", "family": "Indo-Aryan (Rajasthani)", "meaning": "Autonomous settlement, caravan encampment, self-governing clan unit"},

    # Lexical Realizations in Languages
    {"id": "word:gon:maram", "type": "vocabulary", "language": "Gondi", "code": "gon", "label": "maram (మరమ్)", "ipa": "/ma.ram/", "pos": "noun", "meaning": "Tree, timber, shade-giving forest shelter"},
    {"id": "word:kff:veypu", "type": "vocabulary", "language": "Koya", "code": "kff", "label": "veypu (వేయిపు)", "ipa": "/veːj.pu/", "pos": "noun", "meaning": "Dense forest canopy, bamboo grove"},
    {"id": "word:ta:maram", "type": "vocabulary", "language": "Tamil", "code": "ta", "label": "maram (மரம்)", "ipa": "/ma.ɾam/", "pos": "noun", "meaning": "Tree, wood, timber (Classical Dravidian cognate)"},
    {"id": "word:te:manu", "type": "vocabulary", "language": "Telugu", "code": "te", "label": "mānu (మాను)", "ipa": "/maː.nu/", "pos": "noun", "meaning": "Tree, trunk (South-Central cognate)"},

    {"id": "word:gon:yer", "type": "vocabulary", "language": "Gondi", "code": "gon", "label": "yer (యేర్)", "ipa": "/jeːr/", "pos": "noun", "meaning": "Spring water, drinking water"},
    {"id": "word:kff:tung", "type": "vocabulary", "language": "Koya", "code": "kff", "label": "tung (తుంగ్)", "ipa": "/tuŋ/", "pos": "noun", "meaning": "Cool stream, forest water"},
    {"id": "word:ta:neer", "type": "vocabulary", "language": "Tamil", "code": "ta", "label": "nīr (நீர்)", "ipa": "/niːɾ/", "pos": "noun", "meaning": "Water (Classical Dravidian cognate)"},
    {"id": "word:te:neeru", "type": "vocabulary", "language": "Telugu", "code": "te", "label": "nīru (నీరు)", "ipa": "/niː.ru/", "pos": "noun", "meaning": "Water"},

    {"id": "word:gon:konda", "type": "vocabulary", "language": "Gondi", "code": "gon", "label": "konda (కొండ)", "ipa": "/kɔɳ.ɖa/", "pos": "noun", "meaning": "Highland hill ridge"},
    {"id": "word:kff:konda", "type": "vocabulary", "language": "Koya", "code": "kff", "label": "konda (కొండ)", "ipa": "/kɔɳ.ɖa/", "pos": "noun", "meaning": "Sacred forested ridge"},
    {"id": "word:te:konda", "type": "vocabulary", "language": "Telugu", "code": "te", "label": "konda (కొండ)", "ipa": "/kɔɳ.ɖa/", "pos": "noun", "meaning": "Hill, mountain"},

    {"id": "word:gon:persapen", "type": "vocabulary", "language": "Gondi", "code": "gon", "label": "persapen (పెర్సాపెన్)", "ipa": "/per.saː.pen/", "pos": "sacred_noun", "meaning": "Great clan tutelary deity (Pēr + Pen)"},
    {"id": "word:kff:velpu", "type": "vocabulary", "language": "Koya", "code": "kff", "label": "velpu (వెల్పు)", "ipa": "/vel.pu/", "pos": "sacred_noun", "meaning": "Ancestral protective guardian spirit"},

    {"id": "word:sat:sarjom", "type": "vocabulary", "language": "Santhali", "code": "sat", "label": "sarjom (ᱥᱟᱨᱡᱚᱢ)", "ipa": "/sar.d͡ʒɔm/", "pos": "noun", "meaning": "Sal tree, central sacred botanical of Baha festival"},
    {"id": "word:hi:sal", "type": "vocabulary", "language": "Hindi", "code": "hi", "label": "sāl (साल)", "ipa": "/saːl/", "pos": "noun", "meaning": "Sal tree (Sanskrit / Indo-Aryan loanword reflection)"},

    {"id": "word:lmn:tanda", "type": "vocabulary", "language": "Lambadi", "code": "lmn", "label": "tanda (తాండా / तांडा)", "ipa": "/taːɳ.ɖaː/", "pos": "noun", "meaning": "Autonomous Banjara settlement presided over by the Naayak"},
    {"id": "word:te:thanda", "type": "vocabulary", "language": "Telugu", "code": "te", "label": "thāndā (తాండా)", "ipa": "/tʰaːn.ɖaː/", "pos": "noun", "meaning": "Banjara settlement (Regional Telugu borrowing)"},
]

MORPHOLOGICAL_EDGES: list[dict[str, Any]] = [
    # maram root connections
    {"source": "root:maram", "target": "word:gon:maram", "type": "ETYMOLOGICAL_ROOT", "confidence": 0.99},
    {"source": "root:maram", "target": "word:ta:maram", "type": "ETYMOLOGICAL_ROOT", "confidence": 0.99},
    {"source": "root:maram", "target": "word:te:manu", "type": "ETYMOLOGICAL_ROOT", "confidence": 0.94},
    {"source": "word:gon:maram", "target": "word:ta:maram", "type": "COGNATE_OF", "confidence": 0.98},
    {"source": "word:gon:maram", "target": "word:kff:veypu", "type": "SEMANTIC_ECOLOGICAL_PARALLEL", "confidence": 0.91},

    # water root connections
    {"source": "root:neeru", "target": "word:gon:yer", "type": "ETYMOLOGICAL_ROOT", "confidence": 0.95},
    {"source": "root:neeru", "target": "word:ta:neer", "type": "ETYMOLOGICAL_ROOT", "confidence": 0.99},
    {"source": "root:neeru", "target": "word:te:neeru", "type": "ETYMOLOGICAL_ROOT", "confidence": 0.99},
    {"source": "word:ta:neer", "target": "word:te:neeru", "type": "COGNATE_OF", "confidence": 0.99},
    {"source": "word:gon:yer", "target": "word:kff:tung", "type": "SEMANTIC_ECOLOGICAL_PARALLEL", "confidence": 0.92},

    # konda root connections
    {"source": "root:konda", "target": "word:gon:konda", "type": "ETYMOLOGICAL_ROOT", "confidence": 0.99},
    {"source": "root:konda", "target": "word:kff:konda", "type": "ETYMOLOGICAL_ROOT", "confidence": 0.99},
    {"source": "root:konda", "target": "word:te:konda", "type": "ETYMOLOGICAL_ROOT", "confidence": 0.99},
    {"source": "word:gon:konda", "target": "word:kff:konda", "type": "COGNATE_OF", "confidence": 0.99},
    {"source": "word:kff:konda", "target": "word:te:konda", "type": "COGNATE_OF", "confidence": 0.99},

    # sacred guardian connections
    {"source": "root:velpu_persapen", "target": "word:gon:persapen", "type": "ETYMOLOGICAL_ROOT", "confidence": 0.96},
    {"source": "root:velpu_persapen", "target": "word:kff:velpu", "type": "ETYMOLOGICAL_ROOT", "confidence": 0.96},
    {"source": "word:gon:persapen", "target": "word:kff:velpu", "type": "COGNATE_OF", "confidence": 0.95},

    # Austroasiatic botanical connections
    {"source": "root:sarjom", "target": "word:sat:sarjom", "type": "ETYMOLOGICAL_ROOT", "confidence": 0.99},
    {"source": "word:sat:sarjom", "target": "word:hi:sal", "type": "REGIONAL_LOAN_TRANSITION", "confidence": 0.93},

    # Banjara settlement connections
    {"source": "root:tanda", "target": "word:lmn:tanda", "type": "ETYMOLOGICAL_ROOT", "confidence": 0.99},
    {"source": "word:lmn:tanda", "target": "word:te:thanda", "type": "REGIONAL_LOAN_TRANSITION", "confidence": 0.98},
]


def get_morphological_graph() -> dict[str, Any]:
    """Retrieve Cytoscape-formatted nodes and edges for cognate and morphological visualization."""
    cy_nodes = [{"data": n} for n in MORPHOLOGICAL_NODES]
    cy_edges = [
        {
            "data": {
                **e,
                "relationship": e.get("type", "COGNATE_OF"),
                "id": f"{e['source']}->{e['target']}",
            }
        }
        for e in MORPHOLOGICAL_EDGES
    ]
    return {
        "status": "success",
        "total_nodes": len(MORPHOLOGICAL_NODES),
        "total_edges": len(MORPHOLOGICAL_EDGES),
        "nodes": MORPHOLOGICAL_NODES,
        "edges": MORPHOLOGICAL_EDGES,
        "elements": {
            "nodes": cy_nodes,
            "edges": cy_edges,
        },
    }


# ---------------------------------------------------------------------------
# 4. Objective Vitality Indicators (Community-Grounded Telemetry)
# ---------------------------------------------------------------------------

CENSUS_POPULATION_BASELINES: dict[str, dict[str, Any]] = {
    "gon": {
        "census_speakers": 2984453,
        "census_year": "2011 Census of India",
        "official_classification": "Non-Scheduled Major Indigenous Language",
        "primary_states": "Madhya Pradesh, Maharashtra, Odisha, Chhattisgarh, Telangana",
        "writing_systems": ["Gunjala Gondi", "Masaram Gondi", "Telugu", "Devanagari"],
    },
    "kff": {
        "census_speakers": 432850,
        "census_year": "2011 Census of India",
        "official_classification": "Indigenous Oral Heritage Language",
        "primary_states": "Telangana, Andhra Pradesh, Odisha, Chhattisgarh",
        "writing_systems": ["Telugu script", "Oral Tradition"],
    },
    "sat": {
        "census_speakers": 7368192,
        "census_year": "2011 Census of India",
        "official_classification": "Eighth Schedule Official Language (2003)",
        "primary_states": "Jharkhand, West Bengal, Odisha, Bihar, Assam",
        "writing_systems": ["Ol Chiki (ᱚᱞ ᱪᱤᱠᱤ)", "Devanagari", "Latin", "Bengali"],
    },
    "lmn": {
        "census_speakers": 4208000,
        "census_year": "2011 Census of India (Gorboli / Banjara)",
        "official_classification": "Non-Scheduled Nomadic Diaspora Heritage",
        "primary_states": "Maharashtra, Telangana, Andhra Pradesh, Karnataka, Gujarat",
        "writing_systems": ["Devanagari", "Telugu", "Kannada", "Oral Tradition"],
    },
}


def get_objective_vitality_indicators(db_path: str = DB_PATH) -> dict[str, Any]:
    """Compute community-grounded preservation vitality indicators based on authentic holdings."""
    languages_vitality: list[dict[str, Any]] = []

    with _get_db(db_path) as conn:
        cursor = conn.cursor()

        for code, meta in CENSUS_POPULATION_BASELINES.items():
            lang_entry = language_registry.get_language(code) or {}
            lang_name = lang_entry.get("name", code.upper())

            # Count transcripts
            t_row = cursor.execute(
                """
                SELECT COUNT(*) as cnt, COALESCE(SUM(duration_seconds), 0) as total_dur
                FROM transcripts
                WHERE language = ? OR language LIKE ?
                """,
                (code, f"%{lang_name}%"),
            ).fetchone()
            transcripts_count = t_row["cnt"] if t_row else 0
            audio_duration_sec = float(t_row["total_dur"]) if t_row else 0.0

            # Count cultural stories
            s_row = cursor.execute(
                """
                SELECT COUNT(*) as cnt
                FROM cultural_stories
                WHERE primary_language = ? AND review_status = 'APPROVED'
                """,
                (code,),
            ).fetchone()
            stories_count = s_row["cnt"] if s_row else 0

            # Count dictionary approved words
            d_row = cursor.execute(
                """
                SELECT COUNT(*) as cnt,
                       SUM(CASE WHEN audio_url IS NOT NULL AND audio_url != '' THEN 1 ELSE 0 END) as audio_cnt
                FROM dictionary
                WHERE language_code = ? AND status = 'approved'
                """,
                (code,),
            ).fetchone()
            words_count = d_row["cnt"] if d_row else 0
            audio_words_count = d_row["audio_cnt"] if d_row else 0
            audio_cov_pct = round((audio_words_count / words_count * 100), 1) if words_count > 0 else 0.0

            languages_vitality.append({
                "language_code": code,
                "language_name": lang_name,
                "native_name": lang_entry.get("native", ""),
                "family": lang_entry.get("family", ""),
                "census_speakers": meta["census_speakers"],
                "census_source": meta["census_year"],
                "official_classification": meta["official_classification"],
                "primary_states": meta["primary_states"],
                "writing_systems": meta["writing_systems"],
                "preservation_metrics": {
                    "total_recorded_stories": stories_count,
                    "total_transcripts_indexed": transcripts_count,
                    "archived_audio_hours": round(audio_duration_sec / 3600.0, 2),
                    "approved_dictionary_entries": words_count,
                    "audio_pronunciation_coverage_pct": audio_cov_pct,
                },
                "community_status": (
                    "Actively Documented & Elder-Governed"
                    if words_count > 0 or stories_count > 0
                    else "Pending Archive Ingestion"
                ),
                "vitality_assessment": (
                    "Vigorous oral transmission across multi-generational speaking communities. "
                    "Digital sovereignty secured via OCAP community custody."
                ),
            })

    return {
        "status": "success",
        "description": "Objective community-grounded vitality matrix based on 2011 Census baselines and digital archive holdings.",
        "anti_extinction_policy": (
            "Voice Roots strictly rejects speculative external 'endangerment' grades. "
            "Living oral traditions are defined by community sovereignty and active intergenerational transmission."
        ),
        "languages": languages_vitality,
    }
