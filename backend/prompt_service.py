"""Voice Roots: Prompt Service & Seed Lexicon for Prompted Recording Mode (T2.4).
=============================================================================
Manages prompt lists (Swadesh-style core vocabulary + short daily sentences)
stored in the database (not hardcoded).
Supports:
1. Dynamic DB table creation and automatic seeding (>= 50 prompts each for Gondi, Koya, Santhali).
2. Explicit placeholder and provenance tagging (`is_placeholder=1`, `provenance='swadesh_seed_placeholder'`).
3. Querying prompts by language and category with pagination.
4. Linking recordings to `prompt_id` for phonetic forced alignment and vocabulary indexing.
"""

from __future__ import annotations

import logging
import os
import sqlite3
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger(__name__)

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get(
    "VOICE_ROOTS_DB_PATH",
    os.environ.get("VOICE_ROOTS_DB", os.path.join(BACKEND_DIR, "voice_roots.db")),
)


def init_prompt_tables(conn: sqlite3.Connection) -> None:
    """Create the prompts table and index if not already present."""
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS prompts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prompt_id TEXT UNIQUE NOT NULL,
            language TEXT NOT NULL,
            language_code TEXT NOT NULL,
            category TEXT NOT NULL,
            prompt_text TEXT NOT NULL,
            phonetic_target TEXT,
            english_meaning TEXT NOT NULL,
            telugu_meaning TEXT,
            difficulty_level TEXT NOT NULL DEFAULT 'beginner',
            is_placeholder INTEGER NOT NULL DEFAULT 1,
            provenance TEXT NOT NULL DEFAULT 'swadesh_seed_placeholder',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_prompts_lang ON prompts(language)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_prompts_lang_code ON prompts(language_code)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_prompts_cat ON prompts(category)")
    conn.commit()


# ─────────────────────────────────────────────────────────────────────────────
# SEED DATA: GONDI (50 Prompts: 30 Swadesh Vocabulary + 20 Sentences)
# ─────────────────────────────────────────────────────────────────────────────
GONDI_PROMPTS = [
    # Swadesh Core Vocabulary (30)
    ("gon-swadesh-001", "Gondi", "gon", "swadesh_word", "యేర్", "yeːr", "Water", "నీరు / ఉదకం", "beginner"),
    ("gon-swadesh-002", "Gondi", "gon", "swadesh_word", "కిస్", "kis", "Fire", "నిప్పు / అగ్ని", "beginner"),
    ("gon-swadesh-003", "Gondi", "gon", "swadesh_word", "పొద్దు", "poddu", "Sun", "సూర్యుడు / ఎండ", "beginner"),
    ("gon-swadesh-004", "Gondi", "gon", "swadesh_word", "నేలా", "neːlaː", "Moon", "చంద్రుడు", "beginner"),
    ("gon-swadesh-005", "Gondi", "gon", "swadesh_word", "మరా", "maraː", "Tree", "చెట్టు", "beginner"),
    ("gon-swadesh-006", "Gondi", "gon", "swadesh_word", "ఆకి", "aːki", "Leaf", "ఆకు", "beginner"),
    ("gon-swadesh-007", "Gondi", "gon", "swadesh_word", "కాడు", "kaːɽu", "Forest", "అడవి", "beginner"),
    ("gon-swadesh-008", "Gondi", "gon", "swadesh_word", "రోన్", "roːn", "House / Home", "ఇల్లు", "beginner"),
    ("gon-swadesh-009", "Gondi", "gon", "swadesh_word", "నార", "naːra", "Village / Settlement", "ఊరు / గ్రామం", "beginner"),
    ("gon-swadesh-0010", "Gondi", "gon", "swadesh_word", "కల్", "kal", "Stone / Rock", "రాయి / బండ", "beginner"),
    ("gon-swadesh-011", "Gondi", "gon", "swadesh_word", "దొడ్డా", "doɖɖaː", "River / Stream", "నది / వాగు", "beginner"),
    ("gon-swadesh-012", "Gondi", "gon", "swadesh_word", "పిర్ర్", "pirr", "Rain", "వాన / వర్షం", "beginner"),
    ("gon-swadesh-013", "Gondi", "gon", "swadesh_word", "నర్కా", "narkaː", "Night", "రాత్రి", "beginner"),
    ("gon-swadesh-014", "Gondi", "gon", "swadesh_word", "నరోజ్", "naroːj", "Day", "పగలు / దినం", "beginner"),
    ("gon-swadesh-015", "Gondi", "gon", "swadesh_word", "యావాల్", "yaːwaːl", "Mother", "తల్లి / అవ్వ", "beginner"),
    ("gon-swadesh-016", "Gondi", "gon", "swadesh_word", "బాబాల్", "baːbaːl", "Father", "తండ్రి / అయ్యా", "beginner"),
    ("gon-swadesh-017", "Gondi", "gon", "swadesh_word", "పిల్లా", "pillaː", "Child / Youth", "పిల్లవాడు / బిడ్డ", "beginner"),
    ("gon-swadesh-018", "Gondi", "gon", "swadesh_word", "కణ్", "kaɳ", "Eye", "కన్ను", "beginner"),
    ("gon-swadesh-019", "Gondi", "gon", "swadesh_word", "కెవి", "kewi", "Ear", "చెవి", "beginner"),
    ("gon-swadesh-020", "Gondi", "gon", "swadesh_word", "తపల్", "tapal", "Mouth", "నోరు", "beginner"),
    ("gon-swadesh-021", "Gondi", "gon", "swadesh_word", "కై", "kay", "Hand", "చేయి", "beginner"),
    ("gon-swadesh-022", "Gondi", "gon", "swadesh_word", "కాల్", "kaːl", "Foot / Leg", "కాలు", "beginner"),
    ("gon-swadesh-023", "Gondi", "gon", "swadesh_word", "నై", "nay", "Dog", "కుక్క", "beginner"),
    ("gon-swadesh-024", "Gondi", "gon", "swadesh_word", "పిట్టే", "piʈʈeː", "Bird", "పక్షి / పిట్ట", "beginner"),
    ("gon-swadesh-025", "Gondi", "gon", "swadesh_word", "మీన్", "miːn", "Fish", "చేప", "beginner"),
    ("gon-swadesh-026", "Gondi", "gon", "swadesh_word", "నన్నా", "nannaː", "I / Me", "నేను", "beginner"),
    ("gon-swadesh-027", "Gondi", "gon", "swadesh_word", "నిమ్మా", "nimmaː", "You", "నువ్వు", "beginner"),
    ("gon-swadesh-028", "Gondi", "gon", "swadesh_word", "మమ్మోట్", "mammoːʈ", "We / Us", "మేము / మనము", "beginner"),
    ("gon-swadesh-029", "Gondi", "gon", "swadesh_word", "బాటా", "baːʈaː", "Path / Trail", "బాట / దారి", "beginner"),
    ("gon-swadesh-030", "Gondi", "gon", "swadesh_word", "బింజ", "binja", "Seed / Grain", "విత్తనం / గింజ", "beginner"),
    # Short Sentences & Everyday Oral Expressions (20)
    ("gon-sent-031", "Gondi", "gon", "short_sentence", "నిమ్మా బగా హందోంతీ?", "nimmaː bagaː handoːntiː", "Where are you going?", "నువ్వు ఎక్కడికి వెళ్తున్నావు?", "intermediate"),
    ("gon-sent-032", "Gondi", "gon", "short_sentence", "నార లోపల రారా.", "naːra loːpala raːraː", "Come inside the village.", "ఊరి లోపలికి రండి.", "intermediate"),
    ("gon-sent-033", "Gondi", "gon", "short_sentence", "మహువా పూలు రాలిపడ్డాయి.", "mahuaː puːlu raːlipaɖɖaːyi", "Mahua blossoms have fallen on the earth.", "ఇప్ప పూలు నేలరాలాయి.", "intermediate"),
    ("gon-sent-034", "Gondi", "gon", "short_sentence", "పెద్దల కథ వినండి.", "peddala katha vinanɖi", "Listen to the elder's story.", "పెద్దల కథను వినండి.", "intermediate"),
    ("gon-sent-035", "Gondi", "gon", "short_sentence", "యేర్ నన్నా పాయే.", "yeːr nannaː paːyeː", "Give me water to drink.", "నాకు తాగడానికి నీరు ఇవ్వండి.", "intermediate"),
    ("gon-sent-036", "Gondi", "gon", "short_sentence", "పిర్ర్ పెను వాన వస్తుంది.", "pirr penu vaːna vastundi", "Heavy monsoon rain is coming.", "భారీ వర్షం పడుతోంది.", "intermediate"),
    ("gon-sent-037", "Gondi", "gon", "short_sentence", "పొద్దు కొండ మీదికి లేచింది.", "poddu konɖa miːdiki leːcindi", "The sun has risen above the mountain.", "కొండ మీద సూర్యుడు ఉదయించాడు.", "intermediate"),
    ("gon-sent-038", "Gondi", "gon", "short_sentence", "కాడు లోపల పక్షులు పాడుతున్నాయి.", "kaːɖu loːpala pakshulu paːɖutunnaːyi", "Birds are singing in the forest.", "అడవిలో పిట్టలు కూస్తున్నాయి.", "intermediate"),
    ("gon-sent-039", "Gondi", "gon", "short_sentence", "నన్నా రోన్ పోతాను.", "nannaː roːn poːtaːnu", "I am returning home.", "నేను ఇంటికి వెళ్తున్నాను.", "intermediate"),
    ("gon-sent-040", "Gondi", "gon", "short_sentence", "ఈ బాటా దొడ్డా దాకా పోతాది.", "iː baːʈaː doɖɖaː daːkaː poːtaːdi", "This path leads to the river.", "ఈ దారి నది వరకు వెళ్తుంది.", "intermediate"),
    ("gon-sent-041", "Gondi", "gon", "short_sentence", "మన పెద్దల భూమి పవిత్రమైనది.", "mana peddala bhuːmi pavitramainadi", "The land of our elders is sacred.", "మన పెద్దల భూమి పవిత్రమైనది.", "intermediate"),
    ("gon-sent-042", "Gondi", "gon", "short_sentence", "దండారీ పండుగ వచ్చింది.", "danɖaːriː panɖuga vaccindi", "The sacred Dandari festival has arrived.", "దండారీ పండుగ వచ్చింది.", "intermediate"),
    ("gon-sent-043", "Gondi", "gon", "short_sentence", "కిస్ వెలిగించి కూర్చోండి.", "kis veliginci kuːrcoːnɖi", "Light the fire and sit down.", "నిప్పు వెలిగించి కూర్చోండి.", "intermediate"),
    ("gon-sent-044", "Gondi", "gon", "short_sentence", "చిన్న పిల్లలు నదిలో ఆడుతున్నారు.", "cinna pillalu nadiloː aːɖutunnaːru", "Children are playing in the river.", "పిల్లలు నదిలో ఆడుకుంటున్నారు.", "intermediate"),
    ("gon-sent-045", "Gondi", "gon", "short_sentence", "ఆకాశంలో చుక్కలు మెరుస్తున్నాయి.", "aːkaːsamloː cukkalu merustunnaːyi", "Stars are twinkling in the night sky.", "ఆకాశంలో నక్షత్రాలు మెరుస్తున్నాయి.", "intermediate"),
    ("gon-sent-046", "Gondi", "gon", "short_sentence", "రేపు పొద్దున చేనుకు పోవాలి.", "reːpu podduna ceːnuku poːvaːli", "Tomorrow morning we must go to the field.", "రేపు ఉదయాన్నే పొలానికి వెళ్ళాలి.", "intermediate"),
    ("gon-sent-047", "Gondi", "gon", "short_sentence", "మావాల్ గోండీ బాసా అమృతము.", "maːwaːl gonɖiː baːsaː amrutamu", "Our Gondi tongue is our ancestral breath.", "మా గోండీ భాష అమృతం.", "intermediate"),
    ("gon-sent-048", "Gondi", "gon", "short_sentence", "కోయితూర్ కులం కలిసి ఉండాలి.", "koːyituːr kulam kalisi unɖaːli", "The Koitur community must stand united.", "కోయితీర్ జాతి ఐక్యంగా ఉండాలి.", "intermediate"),
    ("gon-sent-049", "Gondi", "gon", "short_sentence", "పత్తి పంట ఏపుగా పెరిగింది.", "patti panʈa eːpugaː perigindi", "The cotton crop has flourished with the rains.", "పత్తి పంట చక్కగా పండింది.", "intermediate"),
    ("gon-sent-050", "Gondi", "gon", "short_sentence", "సేవా జోహార్ సమస్త ప్రజలకు.", "seːvaː joːhaːr samasta prajalaku", "Sewa Johar blessings to all people.", "అందరికీ సేవ జోహార్ శుభాకాంక్షలు.", "intermediate"),
]

# ─────────────────────────────────────────────────────────────────────────────
# SEED DATA: KOYA (50 Prompts: 30 Swadesh Vocabulary + 20 Sentences)
# ─────────────────────────────────────────────────────────────────────────────
KOYA_PROMPTS = [
    # Swadesh Core Vocabulary (30)
    ("koy-swadesh-001", "Koya", "koy", "swadesh_word", "యేరు", "yeːru", "Water", "నీరు", "beginner"),
    ("koy-swadesh-002", "Koya", "koy", "swadesh_word", "కిచ్చు", "kiccu", "Fire", "నిప్పు", "beginner"),
    ("koy-swadesh-003", "Koya", "koy", "swadesh_word", "పొద్దు", "poddu", "Sun", "సూర్యుడు", "beginner"),
    ("koy-swadesh-004", "Koya", "koy", "swadesh_word", "నెలా", "nelaː", "Moon", "చంద్రుడు", "beginner"),
    ("koy-swadesh-005", "Koya", "koy", "swadesh_word", "మరం", "maram", "Tree", "చెట్టు", "beginner"),
    ("koy-swadesh-006", "Koya", "koy", "swadesh_word", "ఆకు", "aːku", "Leaf", "ఆకు", "beginner"),
    ("koy-swadesh-007", "Koya", "koy", "swadesh_word", "అడవి", "aɖawi", "Forest", "అడవి", "beginner"),
    ("koy-swadesh-008", "Koya", "koy", "swadesh_word", "లోను", "loːnu", "House / Dwelling", "ఇల్లు", "beginner"),
    ("koy-swadesh-009", "Koya", "koy", "swadesh_word", "నారు", "naːru", "Village / Hamlet", "గ్రామం / ఊరు", "beginner"),
    ("koy-swadesh-010", "Koya", "koy", "swadesh_word", "కల్లు", "kallu", "Stone / Boulder", "రాయి", "beginner"),
    ("koy-swadesh-011", "Koya", "koy", "swadesh_word", "గోదావరి", "goːdaːvari", "River / Riverbed", "నది / ఏరు", "beginner"),
    ("koy-swadesh-012", "Koya", "koy", "swadesh_word", "వాన", "vaːna", "Rain", "వాన", "beginner"),
    ("koy-swadesh-013", "Koya", "koy", "swadesh_word", "రేయి", "reːyi", "Night", "రాత్రి", "beginner"),
    ("koy-swadesh-014", "Koya", "koy", "swadesh_word", "పగలు", "pagalu", "Day", "పగలు", "beginner"),
    ("koy-swadesh-015", "Koya", "koy", "swadesh_word", "అవ్వ", "awwa", "Mother", "తల్లి", "beginner"),
    ("koy-swadesh-016", "Koya", "koy", "swadesh_word", "అయ్యా", "ayyaː", "Father", "తండ్రి", "beginner"),
    ("koy-swadesh-017", "Koya", "koy", "swadesh_word", "పిల్లడు", "pillaɖu", "Child / Youth", "పిల్లవాడు", "beginner"),
    ("koy-swadesh-018", "Koya", "koy", "swadesh_word", "కన్ను", "kannu", "Eye", "కన్ను", "beginner"),
    ("koy-swadesh-019", "Koya", "koy", "swadesh_word", "కెవ్వు", "kewwu", "Ear", "చెవి", "beginner"),
    ("koy-swadesh-020", "Koya", "koy", "swadesh_word", "నోరు", "noːru", "Mouth", "నోరు", "beginner"),
    ("koy-swadesh-021", "Koya", "koy", "swadesh_word", "కయ్యి", "kayyi", "Hand", "చేయి", "beginner"),
    ("koy-swadesh-022", "Koya", "koy", "swadesh_word", "కాలు", "kaːlu", "Foot / Leg", "కాలు", "beginner"),
    ("koy-swadesh-023", "Koya", "koy", "swadesh_word", "నెయ్యి", "neyyi", "Dog", "కుక్క", "beginner"),
    ("koy-swadesh-024", "Koya", "koy", "swadesh_word", "పిట్ట", "piʈʈa", "Bird", "పక్షి", "beginner"),
    ("koy-swadesh-025", "Koya", "koy", "swadesh_word", "మీను", "miːnu", "Fish", "చేప", "beginner"),
    ("koy-swadesh-026", "Koya", "koy", "swadesh_word", "నన్నా", "nannaː", "I / Me", "నేను", "beginner"),
    ("koy-swadesh-027", "Koya", "koy", "swadesh_word", "నిమ్మా", "nimmaː", "You", "నువ్వు", "beginner"),
    ("koy-swadesh-028", "Koya", "koy", "swadesh_word", "మాటు", "maːʈu", "We / Us", "మేము", "beginner"),
    ("koy-swadesh-029", "Koya", "koy", "swadesh_word", "బాట", "baːʈa", "Road / Footpath", "దారి", "beginner"),
    ("koy-swadesh-030", "Koya", "koy", "swadesh_word", "విత్తనం", "wittanam", "Seed", "విత్తనం", "beginner"),
    # Short Sentences & Everyday Oral Expressions (20)
    ("koy-sent-031", "Koya", "koy", "short_sentence", "నిమ్మా ఎక్కడికి పోతావు?", "nimmaː ekkaɖiki poːtaːvu", "Where are you going?", "నువ్వు ఎక్కడికి వెళ్తున్నావు?", "intermediate"),
    ("koy-sent-032", "Koya", "koy", "short_sentence", "నారు లోపలికి రండి.", "naːru loːpaliki ranɖi", "Please come into the village.", "గ్రామంలోనికి రండి.", "intermediate"),
    ("koy-sent-033", "Koya", "koy", "short_sentence", "గోదావరి ఏరు నిండుగా పారుతోంది.", "goːdaːvari eːru ninɖugaː paːrutondi", "Godavari river is flowing full.", "గోదావరి నది నిండుగా ప్రవహిస్తోంది.", "intermediate"),
    ("koy-sent-034", "Koya", "koy", "short_sentence", "వాన కురిసి నేల తడిసింది.", "vaːna kurisi nela taɖisindi", "The soil is soaked by the rain.", "వర్షం పడి నేల తడిసింది.", "intermediate"),
    ("koy-sent-035", "Koya", "koy", "short_sentence", "తాగడానికి చల్లని నీరు ఇవ్వు.", "taːgaɖaːniki callani niːru ivvu", "Give me cool water to drink.", "తాగడానికి చల్లని నీళ్ళు ఇవ్వండి.", "intermediate"),
    ("koy-sent-036", "Koya", "koy", "short_sentence", "పెద్దల మాటను జాగ్రత్తగా వినాలి.", "peddala maːʈanu jaːgrattagaː vinaːli", "We must carefully listen to elder counsel.", "పెద్దల మాట వినాలి.", "intermediate"),
    ("koy-sent-037", "Koya", "koy", "short_sentence", "పొద్దు గ్రుంకి చీకటి పడింది.", "poddu grunki ciːkaʈi paɖindi", "The sun has set and night has fallen.", "సూర్యుడు అస్తమించి చీకటి పడింది.", "intermediate"),
    ("koy-sent-038", "Koya", "koy", "short_sentence", "చెట్ల కొమ్మల మీద పక్షులు ఉన్నాయి.", "ceʈla kommala miːda pakshulu unnaːyi", "Birds are perched on tree branches.", "చెట్ల కొమ్మలపై పిట్టలు ఉన్నాయి.", "intermediate"),
    ("koy-sent-039", "Koya", "koy", "short_sentence", "మాట్లాడుతుంటే హాయిగా ఉంది.", "maːʈlaːɖutunʈeː haːyigaː undi", "Speaking our oral dialect brings peace.", "మన భాషలో మాట్లాడడం సంతోషం.", "intermediate"),
    ("koy-sent-040", "Koya", "koy", "short_sentence", "నన్నా లోనుకు వెళ్తున్నాను.", "nannaː loːnuku veɭtunnaːnu", "I am going back home.", "నేను ఇంటికి వెళ్తున్నాను.", "intermediate"),
    ("koy-sent-041", "Koya", "koy", "short_sentence", "చేనులో జొన్న పంట బాగుంది.", "ceːnuloː jonna panʈa baːgundi", "The sorghum crop looks healthy in the field.", "పొలంలో జొన్న పంట బాగుంది.", "intermediate"),
    ("koy-sent-042", "Koya", "koy", "short_sentence", "మేడారం సమ్మక్క సారలమ్మ పండుగ.", "meːɖaːram sammakka saːralamma panɖuga", "Medaram festival celebrates Sammakka & Saralamma.", "మేడారం జాతర పవిత్రమైనది.", "intermediate"),
    ("koy-sent-043", "Koya", "koy", "short_sentence", "కొమ్ము వాయిద్యం ఊదండి.", "kommu vaːyidyam uːdanɖi", "Blow the sacred bison-horn trumpet.", "కొమ్ము బూరను ఊదండి.", "intermediate"),
    ("koy-sent-044", "Koya", "koy", "short_sentence", "మనం అడవిని కాపాడుకోవాలి.", "manam aɖavini kaːpaːɖukoːvaːli", "We must protect our mother forest.", "మనం అడవిని సంరక్షించుకోవాలి.", "intermediate"),
    ("koy-sent-045", "Koya", "koy", "short_sentence", "మంచం మీద విశ్రాంతి తీసుకోండి.", "mancam miːda visraːnti tiːsukoːnɖi", "Rest upon the woven cot.", "మంచంపై విశ్రాంతి తీసుకోండి.", "intermediate"),
    ("koy-sent-046", "Koya", "koy", "short_sentence", "రేపు సంతకు వెళ్ళాలి.", "reːpu santaku veɭɭaːli", "Tomorrow we will go to the weekly market.", "రేపు వారపు సంతకు వెళ్ళాలి.", "intermediate"),
    ("koy-sent-047", "Koya", "koy", "short_sentence", "ఇంట్లో అందరూ బాగున్నారా?", "inʈloː andaruː baːgunnaːraː", "Is everyone well at your home?", "ఇంట్లో అందరూ క్షేమంగా ఉన్నారా?", "intermediate"),
    ("koy-sent-048", "Koya", "koy", "short_sentence", "కోయ భాష మన ప్రాణము.", "koːya baːsha mana praːɳamu", "Koya language is our living breath.", "కోయ భాష మన జీవనాడి.", "intermediate"),
    ("koy-sent-049", "Koya", "koy", "short_sentence", "అతిథులకు అన్నం పెట్టండి.", "atithulaku annam peʈʈanɖi", "Serve food to the respected guests.", "అతిథులకు భోజనం పెట్టండి.", "intermediate"),
    ("koy-sent-050", "Koya", "koy", "short_sentence", "జోహార్ అందరికీ వందనాలు.", "joːhaːr andarikiː vandanaːlu", "Johar and respectful greetings to all.", "అందరికీ జోహార్లు.", "intermediate"),
]

# ─────────────────────────────────────────────────────────────────────────────
# SEED DATA: SANTHALI (50 Prompts: 30 Swadesh Vocabulary + 20 Sentences)
# ─────────────────────────────────────────────────────────────────────────────
SANTHALI_PROMPTS = [
    # Swadesh Core Vocabulary in Ol Chiki & Roman Transliteration (30)
    ("sat-swadesh-001", "Santhali", "sat", "swadesh_word", "ᱫᱟᱜ (daag)", "daːkʼ", "Water", "నీరు", "beginner"),
    ("sat-swadesh-002", "Santhali", "sat", "swadesh_word", "ᱥᱮᱸᱜᱮᱞ (sengel)", "sẽgel", "Fire", "నిప్పు", "beginner"),
    ("sat-swadesh-003", "Santhali", "sat", "swadesh_word", "ᱵᱮᱲᱟ (bera)", "beɽa", "Sun / Daylight", "సూర్యుడు", "beginner"),
    ("sat-swadesh-004", "Santhali", "sat", "swadesh_word", "ᱪᱟᱸᱫᱚ (chando)", "cãndo", "Moon", "చంద్రుడు", "beginner"),
    ("sat-swadesh-005", "Santhali", "sat", "swadesh_word", "ᱫᱟᱨᱮ (dare)", "dare", "Tree", "చెట్టు", "beginner"),
    ("sat-swadesh-006", "Santhali", "sat", "swadesh_word", "ᱥᱟᱠᱟᱢ (sakam)", "sakam", "Leaf", "ఆకు", "beginner"),
    ("sat-swadesh-007", "Santhali", "sat", "swadesh_word", "ᱵᱤᱨ (bir)", "bir", "Forest / Woodland", "అడవి", "beginner"),
    ("sat-swadesh-008", "Santhali", "sat", "swadesh_word", "ᱚᱲᱟᱜ (orak)", "oṛakʼ", "House / Home", "ఇల్లు", "beginner"),
    ("sat-swadesh-009", "Santhali", "sat", "swadesh_word", "ᱟᱹᱛᱩ (atu)", "aːtu", "Village", "గ్రామం", "beginner"),
    ("sat-swadesh-010", "Santhali", "sat", "swadesh_word", "ᱫᱷᱤᱨᱤ (dhiri)", "dhiri", "Stone / Rock", "రాయి", "beginner"),
    ("sat-swadesh-011", "Santhali", "sat", "swadesh_word", "ᱜᱟᱰᱟ (gada)", "gaɖa", "River", "నది", "beginner"),
    ("sat-swadesh-012", "Santhali", "sat", "swadesh_word", "ᱡᱟᱹᱯᱩᱫ (japud)", "japud", "Rain / Downpour", "వర్షం", "beginner"),
    ("sat-swadesh-013", "Santhali", "sat", "swadesh_word", "ᱧᱤᱫᱟᱹ (nida)", "ɲida", "Night", "రాత్రి", "beginner"),
    ("sat-swadesh-014", "Santhali", "sat", "swadesh_word", "ᱢᱟᱦᱟᱸ (maha)", "mãhã", "Day", "పగలు", "beginner"),
    ("sat-swadesh-015", "Santhali", "sat", "swadesh_word", "ᱟᱭᱳ (ayo)", "aːyo", "Mother", "తల్లి", "beginner"),
    ("sat-swadesh-016", "Santhali", "sat", "swadesh_word", "ᱵᱟᱵᱟ (baba)", "baba", "Father", "తండ్రి", "beginner"),
    ("sat-swadesh-017", "Santhali", "sat", "swadesh_word", "ᱜᱤᱫᱽᱨᱟᱹ (gidra)", "gidra", "Child", "పిల్లవాడు", "beginner"),
    ("sat-swadesh-018", "Santhali", "sat", "swadesh_word", "ᱢᱮᱫ (med)", "med", "Eye", "కన్ను", "beginner"),
    ("sat-swadesh-019", "Santhali", "sat", "swadesh_word", "ᱞᱩᱛᱩᱨ (lutur)", "lutur", "Ear", "చెవి", "beginner"),
    ("sat-swadesh-020", "Santhali", "sat", "swadesh_word", "ᱢᱚᱪᱟ (moca)", "moca", "Mouth", "నోరు", "beginner"),
    ("sat-swadesh-021", "Santhali", "sat", "swadesh_word", "ᱛᱤ (ti)", "ti", "Hand", "చేయి", "beginner"),
    ("sat-swadesh-022", "Santhali", "sat", "swadesh_word", "ᱡᱟᱝᱜᱟ (janga)", "jaŋga", "Foot / Leg", "కాలు", "beginner"),
    ("sat-swadesh-023", "Santhali", "sat", "swadesh_word", "ᱥᱮᱛᱟ (seta)", "seta", "Dog", "కుక్క", "beginner"),
    ("sat-swadesh-024", "Santhali", "sat", "swadesh_word", "ᱪᱮᱬᱮ (cene)", "ceɳe", "Bird", "పక్షి", "beginner"),
    ("sat-swadesh-025", "Santhali", "sat", "swadesh_word", "ᱦᱟᱹᱠᱩ (haku)", "haku", "Fish", "చేప", "beginner"),
    ("sat-swadesh-026", "Santhali", "sat", "swadesh_word", "ᱤᱧ (ing)", "iɲ", "I / Me", "నేను", "beginner"),
    ("sat-swadesh-027", "Santhali", "sat", "swadesh_word", "ᱟᱢ (am)", "am", "You", "నువ్వు", "beginner"),
    ("sat-swadesh-028", "Santhali", "sat", "swadesh_word", "ᱟᱵᱚ (abo)", "abo", "We / Us", "మేము", "beginner"),
    ("sat-swadesh-029", "Santhali", "sat", "swadesh_word", "ᱦᱚᱨ (hor)", "hor", "Road / Path", "దారి", "beginner"),
    ("sat-swadesh-030", "Santhali", "sat", "swadesh_word", "ᱡᱟᱝ (jang)", "jaŋ", "Seed / Grain", "విత్తనం", "beginner"),
    # Short Sentences & Everyday Oral Expressions (20)
    ("sat-sent-031", "Santhali", "sat", "short_sentence", "ᱟᱢ ᱚᱠᱟᱛᱮᱢ ᱪᱟᱞᱟᱜ ᱠᱟᱱᱟ? (Am okatem chalak kana?)", "am okatem calakʼ kana", "Where are you going?", "ఎక్కడికి వెళ్తున్నావు?", "intermediate"),
    ("sat-sent-032", "Santhali", "sat", "short_sentence", "ᱟᱹᱛᱩ ᱛᱮ ᱦᱤᱡᱩᱜ ᱢᱮ᱾ (Atu te hijuk me.)", "aːtu te hijukʼ me", "Come to our village.", "మా గ్రామానికి రండి.", "intermediate"),
    ("sat-sent-033", "Santhali", "sat", "short_sentence", "ᱫᱟᱜ ᱧᱩ ᱤᱧ ᱢᱮ᱾ (Daag nyu ing me.)", "daːkʼ ɲuː iɲ me", "Give me water to drink.", "నాకు నీరు ఇవ్వండి.", "intermediate"),
    ("sat-sent-034", "Santhali", "sat", "short_sentence", "ᱥᱚᱦᱨᱟᱭ ᱯᱚᱨᱚᱵᱽ ᱥᱮᱴᱮᱨᱮᱱᱟ᱾ (Sohrai parab seteren.)", "sohrai porob seʈerena", "The Sohrai harvest festival has arrived.", "సొహ్రాయ్ పండుగ వచ్చింది.", "intermediate"),
    ("sat-sent-035", "Santhali", "sat", "short_sentence", "ᱵᱤᱨ ᱨᱮ ᱫᱟᱨᱮ ᱠᱚ ᱡᱚᱛᱚᱱ ᱢᱮ᱾ (Bir re dare ko joton me.)", "bir re dare ko joton me", "Care for the trees in the forest.", "అడవిలో చెట్లను సంరక్షించండి.", "intermediate"),
    ("sat-sent-036", "Santhali", "sat", "short_sentence", "ᱜᱟᱰᱟ ᱫᱟᱜ ᱟᱹᱰᱤ ᱯᱷᱟᱹᱨᱪᱟᱹ ᱜᱮᱭᱟ᱾ (Gada daag adi pharcha geya.)", "gaɖa daːkʼ aɖi pharcha geya", "The river water is crystal clear.", "నది నీరు చాలా స్వచ్ఛంగా ఉంది.", "intermediate"),
    ("sat-sent-037", "Santhali", "sat", "short_sentence", "ᱦᱟᱲᱟᱢ ᱠᱚᱣᱟᱜ ᱠᱟᱛᱷᱟ ᱟᱸᱡᱚᱢ ᱢᱮ᱾ (Haram kowag katha anjom me.)", "haɽam kowakʼ katha ãnjom me", "Listen to the words of the elders.", "పెద్దల కథను శ్రద్ధగా వినండి.", "intermediate"),
    ("sat-sent-038", "Santhali", "sat", "short_sentence", "ᱛᱩᱢᱫᱟᱜ ᱟᱨ ᱴᱟᱢᱟᱠ ᱨᱩᱭ ᱢᱮ᱾ (Tumdak ar tamak rui me.)", "tumdakʼ ar ʈamak rui me", "Beat the sacred Tumdak and Tamak drums.", "సాంప్రదాయ డప్పులను వాయించండి.", "intermediate"),
    ("sat-sent-039", "Santhali", "sat", "short_sentence", "ᱵᱮᱲᱟ ᱨᱟᱠᱟᱵ ᱮᱱᱟ᱾ (Bera rakab ena.)", "beɽa rakab ena", "The sun has risen.", "సూర్యుడు ఉదయించాడు.", "intermediate"),
    ("sat-sent-040", "Santhali", "sat", "short_sentence", "ᱤᱧ ᱚᱲᱟᱜ ᱤᱧ ᱨᱩᱣᱟᱹᱲ ᱠᱟᱱᱟ᱾ (Ing orak ing ruwar kana.)", "iɲ oṛakʼ iɲ ruwaɽ kana", "I am returning home.", "నేను ఇంటికి తిరిగి వెళ్తున్నాను.", "intermediate"),
    ("sat-sent-041", "Santhali", "sat", "short_sentence", "ᱫᱟᱜ ᱟᱹᱰᱤ ᱡᱩᱨ ᱡᱟᱹᱯᱩᱫ ᱮᱫᱟᱭ᱾ (Daag adi jur japud edae.)", "daːkʼ aɖi jur japud edae", "Heavy rainfall is pouring down.", "భారీ వర్షం కురుస్తోంది.", "intermediate"),
    ("sat-sent-042", "Santhali", "sat", "short_sentence", "ᱥᱟᱱᱛᱟᱲᱤ ᱯᱟᱹᱨᱥᱤ ᱟᱵᱚᱣᱟᱜ ᱡᱤᱣᱤ᱾ (Santhali parsi abowag jiwi.)", "santali parsi abowakʼ jiwi", "Santhali language is our living spirit.", "సంతాలీ భాష మన ఆత్మ.", "intermediate"),
    ("sat-sent-043", "Santhali", "sat", "short_sentence", "ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚ ᱟᱹᱛᱩ ᱨᱮᱠᱚ ᱠᱷᱮᱞᱚᱸᱰ ᱠᱟᱱᱟ᱾ (Gidra ko atu reko khelod kana.)", "gidra ko aːtu reko kheloɖ kana", "Children are playing in the village.", "పిల్లలు ఆడుకుంటున్నారు.", "intermediate"),
    ("sat-sent-044", "Santhali", "sat", "short_sentence", "ᱡᱟᱦᱮᱨ ᱛᱷᱟᱱ ᱨᱮ ᱵᱚᱸᱜᱟ ᱠᱚ ᱥᱮᱵᱟᱭ ᱢᱮ᱾ (Jaher than re bonga ko sebay me.)", "jaher than re boŋga ko sebay me", "Worship in the sacred Jaher Than grove.", "పవిత్రమైన జహేర్ థాన్ లో ప్రార్థించండి.", "intermediate"),
    ("sat-sent-045", "Santhali", "sat", "short_sentence", "ᱥᱮᱸᱜᱮᱞ ᱡᱩᱞ ᱢᱮ ᱟᱨ ᱫᱩᱲᱩᱵ ᱢᱮ᱾ (Sengel jul me ar durub me.)", "sẽgel jul me ar duɽub me", "Kindle the fire and sit together.", "అగ్ని వెలిగించి కూర్చోండి.", "intermediate"),
    ("sat-sent-046", "Santhali", "sat", "short_sentence", "ᱜᱟᱯᱟ ᱥᱮᱛᱟᱜ ᱠᱷᱮᱛ ᱛᱮ ᱪᱟᱞᱟᱜ ᱦᱩᱭᱩᱜᱼᱟ᱾ (Gapa setak khet te chalak huyuk-a.)", "gapa setaːkʼ khet te calakʼ huyukʼa", "Tomorrow morning we must go to the farmland.", "రేపు ఉదయం పొలానికి వెళ్ళాలి.", "intermediate"),
    ("sat-sent-047", "Santhali", "sat", "short_sentence", "ᱫᱟᱨᱮ ᱥᱟᱠᱟᱢ ᱦᱤᱞᱟᱹᱣᱜ ᱠᱟᱱᱟ᱾ (Dare sakam hilauk kana.)", "dare sakam hilauːkʼ kana", "Tree leaves are rustling in the breeze.", "చెట్ల ఆకులు గాలికి కదులుతున్నాయి.", "intermediate"),
    ("sat-sent-048", "Santhali", "sat", "short_sentence", "ᱡᱚᱛᱚ ᱦᱚᱲ ᱢᱤᱫ ᱛᱮ ᱛᱟᱦᱮᱸᱱ ᱢᱟ᱾ (Joto hor mid te tahen ma.)", "joto hor mid te tahẽn ma", "May all people live in harmony.", "అందరూ ఐక్యంగా ఉండాలి.", "intermediate"),
    ("sat-sent-049", "Santhali", "sat", "short_sentence", "ᱢᱟᱸᱡᱷᱤ ᱦᱟᱲᱟᱢ ᱴᱷᱮᱱ ᱠᱩᱞᱤ ᱢᱮ᱾ (Manjhi haram then kuli me.)", "manjhi haɽam ʈhen kuli me", "Inquire with the Manjhi village headman.", "గ్రామ పెద్దను సంప్రదించండి.", "intermediate"),
    ("sat-sent-050", "Santhali", "sat", "short_sentence", "ᱡᱚᱦᱟᱨ ᱜᱮ ᱥᱟᱱᱟᱢ ᱠᱚ! (Johar ge sanam ko!)", "johar ge sanam ko", "Warm Johar greetings to everyone!", "అందరికీ జోహార్ శుభాకాంక్షలు!", "intermediate"),
]

# ─────────────────────────────────────────────────────────────────────────────
# SEED DATA: LAMBADI / BANJARA (20 Prompts)
# ─────────────────────────────────────────────────────────────────────────────
LAMBADI_PROMPTS = [
    ("lam-swadesh-001", "Lambadi", "lam", "swadesh_word", "పాణి", "paːɳi", "Water", "నీరు", "beginner"),
    ("lam-swadesh-002", "Lambadi", "lam", "swadesh_word", "ఆగి", "aːgi", "Fire", "నిప్పు", "beginner"),
    ("lam-swadesh-003", "Lambadi", "lam", "swadesh_word", "సూరజ్", "suːraj", "Sun", "సూర్యుడు", "beginner"),
    ("lam-swadesh-004", "Lambadi", "lam", "swadesh_word", "చాంద్", "caːnd", "Moon", "చంద్రుడు", "beginner"),
    ("lam-swadesh-005", "Lambadi", "lam", "swadesh_word", "ఝాడ్", "jhaːɖ", "Tree", "చెట్టు", "beginner"),
    ("lam-swadesh-006", "Lambadi", "lam", "swadesh_word", "తాండా", "taːnɖaː", "Tanda / Settlement", "తాండా / ఊరు", "beginner"),
    ("lam-swadesh-007", "Lambadi", "lam", "swadesh_word", "ఘర్", "ghar", "House / Home", "ఇల్లు", "beginner"),
    ("lam-swadesh-008", "Lambadi", "lam", "swadesh_word", "జంగల్", "jangal", "Forest", "అడవి", "beginner"),
    ("lam-swadesh-009", "Lambadi", "lam", "swadesh_word", "ఆయీ", "aːyiː", "Mother", "తల్లి", "beginner"),
    ("lam-swadesh-010", "Lambadi", "lam", "swadesh_word", "బాపూ", "baːpuː", "Father", "తండ్రి", "beginner"),
    ("lam-swadesh-011", "Lambadi", "lam", "swadesh_word", "ఆంకి", "ãːki", "Eye", "కన్ను", "beginner"),
    ("lam-swadesh-012", "Lambadi", "lam", "swadesh_word", "హాత్", "haːt", "Hand", "చేయి", "beginner"),
    ("lam-swadesh-013", "Lambadi", "lam", "swadesh_word", "పగ్", "pag", "Foot / Leg", "కాలు", "beginner"),
    ("lam-swadesh-014", "Lambadi", "lam", "swadesh_word", "పాఖీ", "paːkhiː", "Bird", "పక్షి", "beginner"),
    ("lam-swadesh-015", "Lambadi", "lam", "swadesh_word", "వాట్", "vaːʈ", "Path / Trail", "దారి", "beginner"),
    ("lam-sent-016", "Lambadi", "lam", "short_sentence", "తుం కహా జాతే ఛో?", "tum kahaː jaːte cho", "Where are you going?", "ఎక్కడికి వెళ్తున్నారు?", "intermediate"),
    ("lam-sent-017", "Lambadi", "lam", "short_sentence", "తాండా మా ఆవో.", "taːnɖaː maː aːwo", "Come to our Tanda.", "మా తాండాకు రండి.", "intermediate"),
    ("lam-sent-018", "Lambadi", "lam", "short_sentence", "పీనేసాటీ పాణి ద్యో.", "piːnesaːʈiː paːɳi dyo", "Please give water to drink.", "తాగడానికి నీళ్ళు ఇవ్వండి.", "intermediate"),
    ("lam-sent-019", "Lambadi", "lam", "short_sentence", "తీజ్ పండుగ తాండా మా మనావో.", "tiːj panɖuga taːnɖaː maː manaːwo", "Celebrate the holy Teej festival in the Tanda.", "తాండాలో తీజ్ పండుగ జరుపుకోండి.", "intermediate"),
    ("lam-sent-020", "Lambadi", "lam", "short_sentence", "సేవాలాల్ మహారాజ్ కీ జై!", "seːvaːlaːl mahaːraːj kiː jai", "Victory to Guru Sevalal Maharaj!", "సేవాలాల్ మహారాజ్ కి జై!", "intermediate"),
]


def seed_prompts_if_empty(db_path: str = DB_PATH) -> int:
    """Seed DB with at least 50 prompts each for Gondi, Koya, and Santhali (marked as placeholders)."""
    all_seeds = GONDI_PROMPTS + KOYA_PROMPTS + SANTHALI_PROMPTS + LAMBADI_PROMPTS
    now = datetime.now(timezone.utc).isoformat()
    inserted_count = 0

    with sqlite3.connect(db_path) as conn:
        init_prompt_tables(conn)
        cursor = conn.cursor()

        for p in all_seeds:
            prompt_id, lang, lang_code, cat, text, ipa, eng, tel, diff = p
            try:
                cursor.execute(
                    """
                    INSERT INTO prompts (
                        prompt_id, language, language_code, category, prompt_text,
                        phonetic_target, english_meaning, telugu_meaning, difficulty_level,
                        is_placeholder, provenance, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'swadesh_seed_placeholder', ?, ?)
                    ON CONFLICT(prompt_id) DO UPDATE SET
                        prompt_text = excluded.prompt_text,
                        phonetic_target = excluded.phonetic_target,
                        english_meaning = excluded.english_meaning,
                        telugu_meaning = excluded.telugu_meaning,
                        updated_at = excluded.updated_at
                    """,
                    (prompt_id, lang, lang_code, cat, text, ipa, eng, tel, diff, now, now),
                )
                inserted_count += 1
            except Exception as e:
                logger.warning("Error inserting prompt %s: %s", prompt_id, e)

        conn.commit()

    return inserted_count


def list_prompts(
    language: str | None = None,
    category: str | None = None,
    limit: int = 100,
    offset: int = 0,
    db_path: str = DB_PATH,
) -> dict[str, Any]:
    """Retrieve prompts filtered by language and category."""
    with sqlite3.connect(db_path) as conn:
        init_prompt_tables(conn)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        query = "SELECT * FROM prompts WHERE 1=1"
        params: list[Any] = []

        if language:
            lang_clean = language.strip().lower()
            query += " AND (LOWER(language) = ? OR LOWER(language_code) = ?)"
            params.extend([lang_clean, lang_clean])

        if category:
            query += " AND LOWER(category) = ?"
            params.append(category.strip().lower())

        count_query = query.replace("SELECT *", "SELECT COUNT(*)")
        cursor.execute(count_query, params)
        total = cursor.fetchone()[0]

        query += " ORDER BY id ASC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cursor.execute(query, params)
        rows = cursor.fetchall()

        return {
            "status": "success",
            "total": total,
            "language": language,
            "category": category,
            "limit": limit,
            "offset": offset,
            "prompts": [dict(r) for r in rows],
        }


def get_prompt_by_id(prompt_id: str, db_path: str = DB_PATH) -> dict[str, Any] | None:
    """Retrieve single prompt by its unique prompt_id."""
    with sqlite3.connect(db_path) as conn:
        init_prompt_tables(conn)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM prompts WHERE prompt_id = ? OR id = ?", (prompt_id, prompt_id))
        row = cursor.fetchone()
        return dict(row) if row else None
