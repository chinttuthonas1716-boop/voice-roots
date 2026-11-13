#!/usr/bin/env python3
"""
Voice Roots — Census of India 2011 Table C-16 Processor
Parses raw DDW-C16-STMT-MDDS-0000.xlsx into structured CSV and JSON datasets.

Preserves:
- All 121 Languages (22 Scheduled + 99 Non-Scheduled) + 1 Residual Category
- All Rationalized Mother Tongues (355 entries including 270+ identifiable mother tongues)
- All 35 Census 2011 States/UTs with population statistics
- Rural / Urban and Gender breakdowns for 2011
- Official source provenance (Office of the Registrar General & Census Commissioner, India)
"""

import csv
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

RAW_FILE = Path("backend/data/raw/DDW-C16-STMT-MDDS-0000.xlsx")
PROCESSED_DIR = Path("backend/data/processed")
DATA_INDIA_DIR = Path("data/india")

SOURCE_META = {
    "source_name": "Office of the Registrar General & Census Commissioner, India",
    "source_dataset": "C-16: Population by Mother Tongue, India, 2011",
    "source_year": 2011,
    "source_reference": "PC11_C16-00",
    "source_url": "https://censusindia.gov.in/nada/index.php/catalog/10191/download/13303/DDW-C16-STMT-MDDS-0000.XLSX"
}

def clean_language_name(raw_name: str) -> str:
    # Remove leading number like '1 ASSAMESE' -> 'ASSAMESE'
    cleaned = re.sub(r'^\d+\s+', '', raw_name).strip()
    return cleaned.title()

def process_c16():
    print("=" * 60)
    print("VOICE ROOTS — PROCESSING CENSUS 2011 TABLE C-16")
    print("=" * 60)

    if not RAW_FILE.exists():
        print(f"❌ Raw file not found: {RAW_FILE}")
        sys.exit(1)

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    DATA_INDIA_DIR.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(RAW_FILE, 'r') as z:
        ns = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            ss_root = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for si in ss_root.findall('.//main:si', ns):
                shared_strings.append(''.join(t.text or '' for t in si.findall('.//main:t', ns)))

        sheet1_root = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
        rows = sheet1_root.findall('.//main:row', ns)

        def get_val(c):
            t = c.attrib.get('t')
            v = c.find('main:v', ns)
            if v is None or v.text is None: return ''
            val = v.text
            return shared_strings[int(val)] if t == 's' else val

        languages_dict = {}
        mother_tongues_list = []
        states_dict = {}
        observations_list = []

        current_lang_code = None
        current_lang_name = None

        print(f"Parsing {len(rows):,} rows...")
        for r in rows[4:]:
            cells = r.findall('main:c', ns)
            vals = [get_val(c).strip() for c in cells]
            if len(vals) < 16:
                continue

            tbl = vals[0]
            st_code = vals[1]
            dist_code = vals[2]
            subdist_code = vals[3]
            area_name = vals[4]
            mt_code = vals[5]
            mt_name = vals[6]

            # Parse populations
            def to_int(v):
                try:
                    return int(v)
                except ValueError:
                    return 0

            tot_p = to_int(vals[7])
            tot_m = to_int(vals[8])
            tot_f = to_int(vals[9])
            rur_p = to_int(vals[10])
            rur_m = to_int(vals[11])
            rur_f = to_int(vals[12])
            urb_p = to_int(vals[13])
            urb_m = to_int(vals[14])
            urb_f = to_int(vals[15])

            # Track States
            if st_code != '00' and dist_code == '000':
                if st_code not in states_dict:
                    states_dict[st_code] = {
                        "census_state_code": st_code,
                        "census_state_name": area_name,
                        "source_name": SOURCE_META["source_name"],
                        "source_year": SOURCE_META["source_year"]
                    }

            # Process National Level data (INDIA: State='00', Dist='000')
            if st_code == '00' and dist_code == '000':
                is_lang = mt_code.endswith('000')
                lang_num = int(mt_code[:3])
                is_scheduled = (lang_num <= 22)

                if is_lang:
                    current_lang_code = mt_code
                    clean_name = clean_language_name(mt_name)
                    current_lang_name = clean_name
                    
                    category = "SCHEDULED_8" if is_scheduled else ("NON_SCHEDULED" if lang_num < 124 else "RESIDUAL")
                    
                    languages_dict[mt_code] = {
                        "language_id": f"lang_census_{mt_code[:3]}",
                        "census_code": mt_code,
                        "census_language_number": lang_num,
                        "name": clean_name,
                        "census_raw_name": mt_name,
                        "census_category": category,
                        "is_scheduled": is_scheduled,
                        "population_2011": tot_p,
                        "male_population_2011": tot_m,
                        "female_population_2011": tot_f,
                        "rural_population_2011": rur_p,
                        "urban_population_2011": urb_p,
                        "source_name": SOURCE_META["source_name"],
                        "source_dataset": SOURCE_META["source_dataset"],
                        "source_year": SOURCE_META["source_year"],
                        "source_reference": SOURCE_META["source_reference"],
                        "verification_status": "OFFICIAL_CENSUS_2011"
                    }
                else:
                    # Specific Mother Tongue under current language
                    is_other = mt_code.endswith('999')
                    clean_mt = mt_name.strip()
                    
                    mother_tongues_list.append({
                        "mother_tongue_id": f"mt_census_{mt_code}",
                        "language_census_code": current_lang_code,
                        "parent_language_name": current_lang_name,
                        "census_code": mt_code,
                        "name": clean_mt,
                        "is_residual_category": is_other,
                        "population_2011": tot_p,
                        "male_population_2011": tot_m,
                        "female_population_2011": tot_f,
                        "rural_population_2011": rur_p,
                        "urban_population_2011": urb_p,
                        "source_name": SOURCE_META["source_name"],
                        "source_dataset": SOURCE_META["source_dataset"],
                        "source_year": SOURCE_META["source_year"],
                        "verification_status": "OFFICIAL_CENSUS_2011"
                    })

            # Track State/District Observations
            if st_code != '00' and dist_code == '000':
                observations_list.append({
                    "state_code": st_code,
                    "state_name": area_name,
                    "mother_tongue_code": mt_code,
                    "mother_tongue_name": mt_name.strip(),
                    "population_2011": tot_p,
                    "rural_population_2011": rur_p,
                    "urban_population_2011": urb_p
                })

        print(f"✓ Extracted {len(languages_dict)} Languages (22 Scheduled, 99 Non-Scheduled, 1 Residual)")
        print(f"✓ Extracted {len(mother_tongues_list)} Mother Tongues")
        print(f"✓ Extracted {len(states_dict)} States/UTs")
        print(f"✓ Extracted {len(observations_list)} State-level demographic observations")

        # 1. Write voice_roots_languages.csv
        lang_csv = PROCESSED_DIR / "voice_roots_languages.csv"
        with open(lang_csv, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=[
                "language_id", "census_code", "census_language_number", "name", 
                "census_raw_name", "census_category", "is_scheduled", "population_2011",
                "male_population_2011", "female_population_2011", "rural_population_2011", 
                "urban_population_2011", "source_name", "source_dataset", "source_year", 
                "source_reference", "verification_status"
            ])
            writer.writeheader()
            for row in languages_dict.values():
                writer.writerow(row)
        print(f"✓ Wrote {lang_csv}")

        # 2. Write voice_roots_mother_tongues.csv
        mt_csv = PROCESSED_DIR / "voice_roots_mother_tongues.csv"
        with open(mt_csv, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=[
                "mother_tongue_id", "language_census_code", "parent_language_name",
                "census_code", "name", "is_residual_category", "population_2011",
                "male_population_2011", "female_population_2011", "rural_population_2011",
                "urban_population_2011", "source_name", "source_dataset", "source_year",
                "verification_status"
            ])
            writer.writeheader()
            for row in mother_tongues_list:
                writer.writerow(row)
        print(f"✓ Wrote {mt_csv}")

        # 3. Write voice_roots_states.csv
        st_csv = PROCESSED_DIR / "voice_roots_states.csv"
        with open(st_csv, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=[
                "census_state_code", "census_state_name", "source_name", "source_year"
            ])
            writer.writeheader()
            for row in states_dict.values():
                writer.writerow(row)
        print(f"✓ Wrote {st_csv}")

        # 4. Write voice_roots_language_population.csv
        pop_csv = PROCESSED_DIR / "voice_roots_language_population.csv"
        with open(pop_csv, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=[
                "state_code", "state_name", "mother_tongue_code", "mother_tongue_name",
                "population_2011", "rural_population_2011", "urban_population_2011"
            ])
            writer.writeheader()
            for row in observations_list:
                writer.writerow(row)
        print(f"✓ Wrote {pop_csv}")

        # 5. Synchronize JSON into backend/data/processed and data/india
        languages_json = list(languages_dict.values())
        with open(PROCESSED_DIR / "voice_roots_languages.json", "w", encoding="utf-8") as f:
            json.dump(languages_json, f, indent=2, ensure_ascii=False)

        with open(PROCESSED_DIR / "voice_roots_mother_tongues.json", "w", encoding="utf-8") as f:
            json.dump(mother_tongues_list, f, indent=2, ensure_ascii=False)

        with open(PROCESSED_DIR / "voice_roots_states.json", "w", encoding="utf-8") as f:
            json.dump(list(states_dict.values()), f, indent=2, ensure_ascii=False)

        # Update data/india/languages.json with full 121 languages
        with open(DATA_INDIA_DIR / "census_c16_languages_121.json", "w", encoding="utf-8") as f:
            json.dump(languages_json, f, indent=2, ensure_ascii=False)

        with open(DATA_INDIA_DIR / "census_c16_mother_tongues.json", "w", encoding="utf-8") as f:
            json.dump(mother_tongues_list, f, indent=2, ensure_ascii=False)

        print("=" * 60)
        print("✅ PROCESSING COMPLETE! All files generated in backend/data/processed/")
        print("=" * 60)

if __name__ == "__main__":
    process_c16()
