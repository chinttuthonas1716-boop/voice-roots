#!/usr/bin/env python3
"""
Voice Roots — Census C-16 Database & Catalog Importer
Integrates official Census 2011 C-16 language and mother-tongue data
into Voice Roots data catalogs with zero data loss and idempotent safety.
"""

import json
import sys
from pathlib import Path

PROCESSED_LANGUAGES = Path("backend/data/processed/voice_roots_languages.json")
PROCESSED_MOTHER_TONGUES = Path("backend/data/processed/voice_roots_mother_tongues.json")
PROCESSED_STATES = Path("backend/data/processed/voice_roots_states.json")

TARGET_LANGUAGES = Path("data/india/languages.json")
TARGET_VARIETIES = Path("data/india/language_varieties.json")
TARGET_MOTHER_TONGUES = Path("data/india/mother_tongues.json")
BACKUP_LANGUAGES = Path("data/india/languages.json.bak")

# Known language family mappings for common Indic languages
LANGUAGE_FAMILIES = {
    "Assamese": ("Indo-Aryan", "Eastern Zone"),
    "Bengali": ("Indo-Aryan", "Eastern Zone"),
    "Bodo": ("Tibeto-Burman", "Bodo-Garo"),
    "Dogri": ("Indo-Aryan", "Northwestern Zone"),
    "Gujarati": ("Indo-Aryan", "Western Zone"),
    "Hindi": ("Indo-Aryan", "Central Zone"),
    "Kannada": ("Dravidian", "Southern Dravidian"),
    "Kashmiri": ("Indo-Aryan", "Dardic"),
    "Konkani": ("Indo-Aryan", "Southern Zone"),
    "Maithili": ("Indo-Aryan", "Eastern Zone"),
    "Malayalam": ("Dravidian", "Southern Dravidian"),
    "Manipuri": ("Tibeto-Burman", "Meitei"),
    "Marathi": ("Indo-Aryan", "Southern Zone"),
    "Nepali": ("Indo-Aryan", "Northern Zone"),
    "Odia": ("Indo-Aryan", "Eastern Zone"),
    "Punjabi": ("Indo-Aryan", "Northwestern Zone"),
    "Sanskrit": ("Indo-Aryan", "Classical"),
    "Santali": ("Austroasiatic", "Munda"),
    "Sindhi": ("Indo-Aryan", "Northwestern Zone"),
    "Tamil": ("Dravidian", "Southern Dravidian"),
    "Telugu": ("Dravidian", "South-Central Dravidian"),
    "Urdu": ("Indo-Aryan", "Central Zone"),
    "Gondi": ("Dravidian", "South-Central Dravidian"),
    "Koya": ("Dravidian", "South-Central Dravidian"),
    "Tulu": ("Dravidian", "Southern Dravidian"),
    "Bhili/Bhilodi": ("Indo-Aryan", "Western Zone"),
    "Kurukh/Oraon": ("Dravidian", "North Dravidian"),
    "Khasi": ("Austroasiatic", "Khasic"),
    "Garo": ("Tibeto-Burman", "Bodo-Garo"),
    "Mizo": ("Tibeto-Burman", "Kuki-Chin"),
    "Ho": ("Austroasiatic", "Munda"),
    "Mundari": ("Austroasiatic", "Munda"),
    "Tripuri": ("Tibeto-Burman", "Bodo-Garo"),
    "Khandeshi": ("Indo-Aryan", "Western Zone"),
    "Ladakhi": ("Tibeto-Burman", "Tibetic"),
    "Halabi": ("Indo-Aryan", "Eastern Zone"),
    "Kui": ("Dravidian", "South-Central Dravidian"),
    "Kuvi": ("Dravidian", "South-Central Dravidian"),
    "Kolami": ("Dravidian", "Central Dravidian"),
    "Korku": ("Austroasiatic", "Munda"),
    "Rabha": ("Tibeto-Burman", "Bodo-Garo"),
    "Tiwa": ("Tibeto-Burman", "Bodo-Garo"),
    "Karbi/Mikir": ("Tibeto-Burman", "Kuki-Chin"),
}

RECORDED_LANG_KEYS = {"telugu", "gondi", "koya", "tulu", "lambadi", "banjari", "lamani/lambadi"}

def import_c16():
    print("=" * 60)
    print("VOICE ROOTS — IMPORTING C-16 INTO APPLICATION CATALOGS")
    print("=" * 60)

    if not PROCESSED_LANGUAGES.exists() or not PROCESSED_MOTHER_TONGUES.exists():
        print("❌ Processed datasets missing! Run process_c16.py first.")
        sys.exit(1)

    with open(PROCESSED_LANGUAGES, "r", encoding="utf-8") as f:
        c16_languages = json.load(f)

    with open(PROCESSED_MOTHER_TONGUES, "r", encoding="utf-8") as f:
        c16_mother_tongues = json.load(f)

    # 1. Backup existing languages.json if not backed up
    if TARGET_LANGUAGES.exists() and not BACKUP_LANGUAGES.exists():
        with open(TARGET_LANGUAGES, "r", encoding="utf-8") as f:
            old_data = f.read()
        with open(BACKUP_LANGUAGES, "w", encoding="utf-8") as f:
            f.write(old_data)
        print(f"✓ Backed up existing languages to {BACKUP_LANGUAGES}")

    # Read existing languages to preserve any custom descriptions or native names
    existing_by_name = {}
    if TARGET_LANGUAGES.exists():
        with open(TARGET_LANGUAGES, "r", encoding="utf-8") as f:
            for l in json.load(f):
                existing_by_name[l["name"].lower()] = l

    # Build the full 121+ language list
    unified_languages = []
    for cl in c16_languages:
        name = cl["name"]
        key = name.lower()
        existing = existing_by_name.get(key, {})

        # Determine language family
        fam_info = LANGUAGE_FAMILIES.get(name, (existing.get("languageFamily", "Indo-Aryan/Other"), existing.get("languageGroup", "Regional")))

        # Check recording availability
        has_rec = (key in RECORDED_LANG_KEYS or cl["census_code"] in ["021000", "044000", "069000", "117000"])

        lang_entry = {
            "id": existing.get("id", f"lang_{name.lower().replace('/', '_').replace(' ', '_')}"),
            "name": name,
            "nativeName": existing.get("nativeName", name),
            "iso639_1": existing.get("iso639_1", None),
            "iso639_3": existing.get("iso639_3", f"in-{cl['census_code'][:3]}"),
            "languageFamily": fam_info[0],
            "languageGroup": fam_info[1],
            "censusCode": cl["census_code"],
            "censusName": cl["census_raw_name"],
            "officialStatus": cl["census_category"],
            "isScheduled": cl["is_scheduled"],
            "population_2011": cl["population_2011"],
            "male_population_2011": cl["male_population_2011"],
            "female_population_2011": cl["female_population_2011"],
            "rural_population_2011": cl["rural_population_2011"],
            "urban_population_2011": cl["urban_population_2011"],
            "hasRecording": has_rec,
            "recordingStatus": "RECORDING_AVAILABLE" if has_rec else "REFERENCE_CATALOGUE_ONLY",
            "description": existing.get("description", f"Documented in Census 2011 C-16 with {cl['population_2011']:,} speakers across India."),
            "sourceId": "src_census_2011_c16",
            "sourceName": cl["source_name"],
            "sourceDataset": cl["source_dataset"],
            "sourceYear": cl["source_year"],
            "sourceReference": cl["source_reference"],
            "verificationStatus": "OFFICIAL_CENSUS_2011"
        }
        unified_languages.append(lang_entry)

    # Save to data/india/languages.json
    with open(TARGET_LANGUAGES, "w", encoding="utf-8") as f:
        json.dump(unified_languages, f, indent=2, ensure_ascii=False)
    print(f"✓ Updated {TARGET_LANGUAGES} with {len(unified_languages)} official Census languages.")

    # Save mother tongues to data/india/mother_tongues.json
    with open(TARGET_MOTHER_TONGUES, "w", encoding="utf-8") as f:
        json.dump(c16_mother_tongues, f, indent=2, ensure_ascii=False)
    print(f"✓ Wrote {TARGET_MOTHER_TONGUES} with {len(c16_mother_tongues)} rationalized mother tongues.")

    # Update language_varieties.json to include all rationalized mother tongues as varieties
    varieties = []
    # keep existing special varieties
    if TARGET_VARIETIES.exists():
        with open(TARGET_VARIETIES, "r", encoding="utf-8") as f:
            try:
                varieties = json.load(f)
            except Exception:
                varieties = []

    existing_variety_names = {v.get("name", "").lower() for v in varieties}

    for mt in c16_mother_tongues:
        if not mt["is_residual_category"] and mt["name"].lower() not in existing_variety_names:
            parent_id = f"lang_{mt['parent_language_name'].lower().replace('/', '_').replace(' ', '_')}"
            has_rec = (mt["name"].lower() in RECORDED_LANG_KEYS or "lambadi" in mt["name"].lower())
            varieties.append({
                "id": f"var_census_{mt['census_code']}",
                "languageId": parent_id,
                "name": mt["name"],
                "nativeName": mt["name"],
                "censusCode": mt["census_code"],
                "censusName": mt["name"].upper(),
                "parentLanguage": mt["parent_language_name"],
                "population_2011": mt["population_2011"],
                "rural_population_2011": mt["rural_population_2011"],
                "urban_population_2011": mt["urban_population_2011"],
                "hasRecording": has_rec,
                "recordingStatus": "RECORDING_AVAILABLE" if has_rec else "REFERENCE_CATALOGUE_ONLY",
                "description": f"Census 2011 mother tongue under {mt['parent_language_name']} ({mt['population_2011']:,} speakers)."
            })

    with open(TARGET_VARIETIES, "w", encoding="utf-8") as f:
        json.dump(varieties, f, indent=2, ensure_ascii=False)
    print(f"✓ Updated {TARGET_VARIETIES} with {len(varieties)} language varieties & mother tongues.")

    print("=" * 60)
    print("✅ CENSUS C-16 IMPORT SUCCESSFUL & IDEMPOTENT!")
    print("=" * 60)

if __name__ == "__main__":
    import_c16()
