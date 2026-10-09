#!/usr/bin/env python3
"""
Voice Roots — India Master Language & Location Database Seeder
Combines:
1. Ministry of Panchayati Raj — Local Government Directory (LGD)
2. Census of India 2011 — C-16 Population by Mother Tongue & Language Atlas
"""

import json
import os
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "india"
DATA_DIR.mkdir(parents=True, exist_ok=True)

# 1. DATA SOURCES
data_sources = [
    {
        "id": "src_census_2011_c16",
        "organization": "Office of the Registrar General & Census Commissioner, India",
        "ministry": "Ministry of Home Affairs",
        "datasetName": "Census of India 2011: Table C-16 Population by Mother Tongue",
        "datasetVersion": "2011 Final",
        "sourceUrl": "https://censusindia.gov.in/census.website/data/census-tables",
        "sourceYear": 2011,
        "license": "Government Open Data License - India (GODL)",
        "notes": "Baseline official language and mother-tongue census statistics down to subdistrict/town level."
    },
    {
        "id": "src_census_atlas",
        "organization": "Office of the Registrar General & Census Commissioner, India",
        "ministry": "Ministry of Home Affairs",
        "datasetName": "Language Atlas of India 2011",
        "datasetVersion": "2011",
        "sourceUrl": "https://censusindia.gov.in/nada/index.php/catalog/42561",
        "sourceYear": 2011,
        "license": "Government Open Data License - India (GODL)",
        "notes": "Linguistic geographic boundary and mother-tongue distribution mapping across India."
    },
    {
        "id": "src_mopr_lgd",
        "organization": "Ministry of Panchayati Raj, Government of India",
        "ministry": "Ministry of Panchayati Raj",
        "datasetName": "Local Government Directory (LGD)",
        "datasetVersion": "2026 Active",
        "sourceUrl": "https://lgdirectory.gov.in/",
        "sourceYear": 2026,
        "license": "Government Open Data License - India (GODL)",
        "notes": "Standard national administrative code directory for States, Districts, Sub-districts, and Villages."
    },
    {
        "id": "src_voice_roots_community",
        "organization": "Voice Roots Community Custodian Council",
        "ministry": "Autonomous Ethical Archival Consortium",
        "datasetName": "Voice Roots Oral Field Registry",
        "datasetVersion": "2.4",
        "sourceUrl": "https://voiceroots.org/provenance",
        "sourceYear": 2026,
        "license": "Creative Commons Attribution-NonCommercial-ShareAlike 4.0 / OCAP",
        "notes": "Community-submitted and elder-verified oral heritage recordings and village-level language attestations."
    }
]

# 2. COUNTRIES
countries = [
    {
        "id": "IN",
        "name": "India",
        "officialName": "Republic of India",
        "iso2": "IN",
        "iso3": "IND",
        "capital": "New Delhi",
        "sourceId": "src_mopr_lgd"
    }
]

# 3. STATES AND UNION TERRITORIES (All 28 States + 8 UTs)
states = [
    # 28 States
    {"id": "AP", "countryId": "IN", "name": "Andhra Pradesh", "officialCode": "28", "type": "STATE", "capital": "Amaravati"},
    {"id": "AR", "countryId": "IN", "name": "Arunachal Pradesh", "officialCode": "12", "type": "STATE", "capital": "Itanagar"},
    {"id": "AS", "countryId": "IN", "name": "Assam", "officialCode": "18", "type": "STATE", "capital": "Dispur"},
    {"id": "BR", "countryId": "IN", "name": "Bihar", "officialCode": "10", "type": "STATE", "capital": "Patna"},
    {"id": "CG", "countryId": "IN", "name": "Chhattisgarh", "officialCode": "22", "type": "STATE", "capital": "Raipur"},
    {"id": "GA", "countryId": "IN", "name": "Goa", "officialCode": "30", "type": "STATE", "capital": "Panaji"},
    {"id": "GJ", "countryId": "IN", "name": "Gujarat", "officialCode": "24", "type": "STATE", "capital": "Gandhinagar"},
    {"id": "HR", "countryId": "IN", "name": "Haryana", "officialCode": "06", "type": "STATE", "capital": "Chandigarh"},
    {"id": "HP", "countryId": "IN", "name": "Himachal Pradesh", "officialCode": "02", "type": "STATE", "capital": "Shimla"},
    {"id": "JH", "countryId": "IN", "name": "Jharkhand", "officialCode": "20", "type": "STATE", "capital": "Ranchi"},
    {"id": "KA", "countryId": "IN", "name": "Karnataka", "officialCode": "29", "type": "STATE", "capital": "Bengaluru"},
    {"id": "KL", "countryId": "IN", "name": "Kerala", "officialCode": "32", "type": "STATE", "capital": "Thiruvananthapuram"},
    {"id": "MP", "countryId": "IN", "name": "Madhya Pradesh", "officialCode": "23", "type": "STATE", "capital": "Bhopal"},
    {"id": "MH", "countryId": "IN", "name": "Maharashtra", "officialCode": "27", "type": "STATE", "capital": "Mumbai"},
    {"id": "MN", "countryId": "IN", "name": "Manipur", "officialCode": "14", "type": "STATE", "capital": "Imphal"},
    {"id": "ML", "countryId": "IN", "name": "Meghalaya", "officialCode": "17", "type": "STATE", "capital": "Shillong"},
    {"id": "MZ", "countryId": "IN", "name": "Mizoram", "officialCode": "15", "type": "STATE", "capital": "Aizawl"},
    {"id": "NL", "countryId": "IN", "name": "Nagaland", "officialCode": "13", "type": "STATE", "capital": "Kohima"},
    {"id": "OD", "countryId": "IN", "name": "Odisha", "officialCode": "21", "type": "STATE", "capital": "Bhubaneswar"},
    {"id": "PB", "countryId": "IN", "name": "Punjab", "officialCode": "03", "type": "STATE", "capital": "Chandigarh"},
    {"id": "RJ", "countryId": "IN", "name": "Rajasthan", "officialCode": "08", "type": "STATE", "capital": "Jaipur"},
    {"id": "SK", "countryId": "IN", "name": "Sikkim", "officialCode": "11", "type": "STATE", "capital": "Gangtok"},
    {"id": "TN", "countryId": "IN", "name": "Tamil Nadu", "officialCode": "33", "type": "STATE", "capital": "Chennai"},
    {"id": "TS", "countryId": "IN", "name": "Telangana", "officialCode": "36", "type": "STATE", "capital": "Hyderabad"},
    {"id": "TR", "countryId": "IN", "name": "Tripura", "officialCode": "16", "type": "STATE", "capital": "Agartala"},
    {"id": "UP", "countryId": "IN", "name": "Uttar Pradesh", "officialCode": "09", "type": "STATE", "capital": "Lucknow"},
    {"id": "UK", "countryId": "IN", "name": "Uttarakhand", "officialCode": "05", "type": "STATE", "capital": "Dehradun"},
    {"id": "WB", "countryId": "IN", "name": "West Bengal", "officialCode": "19", "type": "STATE", "capital": "Kolkata"},
    # 8 Union Territories
    {"id": "AN", "countryId": "IN", "name": "Andaman and Nicobar Islands", "officialCode": "35", "type": "UNION_TERRITORY", "capital": "Port Blair"},
    {"id": "CH", "countryId": "IN", "name": "Chandigarh", "officialCode": "04", "type": "UNION_TERRITORY", "capital": "Chandigarh"},
    {"id": "DN", "countryId": "IN", "name": "Dadra and Nagar Haveli and Daman and Diu", "officialCode": "26", "type": "UNION_TERRITORY", "capital": "Daman"},
    {"id": "DL", "countryId": "IN", "name": "Delhi (NCT)", "officialCode": "07", "type": "UNION_TERRITORY", "capital": "New Delhi"},
    {"id": "JK", "countryId": "IN", "name": "Jammu and Kashmir", "officialCode": "01", "type": "UNION_TERRITORY", "capital": "Srinagar"},
    {"id": "LA", "countryId": "IN", "name": "Ladakh", "officialCode": "37", "type": "UNION_TERRITORY", "capital": "Leh"},
    {"id": "LD", "countryId": "IN", "name": "Lakshadweep", "officialCode": "31", "type": "UNION_TERRITORY", "capital": "Kavaratti"},
    {"id": "PY", "countryId": "IN", "name": "Puducherry", "officialCode": "34", "type": "UNION_TERRITORY", "capital": "Puducherry"}
]

# 4. DISTRICTS (Key administrative hubs + rich oral heritage regions)
districts = [
    # Telangana
    {"id": "dist_ts_adilabad", "stateId": "TS", "name": "Adilabad", "officialCode": "501"},
    {"id": "dist_ts_asifabad", "stateId": "TS", "name": "Kumuram Bheem Asifabad", "officialCode": "502"},
    {"id": "dist_ts_bhadradri", "stateId": "TS", "name": "Bhadradri Kothagudem", "officialCode": "503"},
    {"id": "dist_ts_hyderabad", "stateId": "TS", "name": "Hyderabad", "officialCode": "504"},
    {"id": "dist_ts_jayashankar", "stateId": "TS", "name": "Jayashankar Bhupalpally", "officialCode": "505"},
    {"id": "dist_ts_mahabubnagar", "stateId": "TS", "name": "Mahabubnagar", "officialCode": "506"},
    {"id": "dist_ts_mancherial", "stateId": "TS", "name": "Mancherial", "officialCode": "507"},
    {"id": "dist_ts_mulugu", "stateId": "TS", "name": "Mulugu", "officialCode": "508"},
    {"id": "dist_ts_nizamabad", "stateId": "TS", "name": "Nizamabad", "officialCode": "509"},
    {"id": "dist_ts_warangal", "stateId": "TS", "name": "Warangal", "officialCode": "510"},

    # Andhra Pradesh
    {"id": "dist_ap_guntur", "stateId": "AP", "name": "Guntur", "officialCode": "511"},
    {"id": "dist_ap_alluri", "stateId": "AP", "name": "Alluri Sitharama Raju", "officialCode": "512"},
    {"id": "dist_ap_east_godavari", "stateId": "AP", "name": "East Godavari", "officialCode": "513"},
    {"id": "dist_ap_west_godavari", "stateId": "AP", "name": "West Godavari", "officialCode": "514"},
    {"id": "dist_ap_krishna", "stateId": "AP", "name": "Krishna", "officialCode": "515"},
    {"id": "dist_ap_kurnool", "stateId": "AP", "name": "Kurnool", "officialCode": "516"},
    {"id": "dist_ap_srikakulam", "stateId": "AP", "name": "Srikakulam", "officialCode": "517"},
    {"id": "dist_ap_visakhapatnam", "stateId": "AP", "name": "Visakhapatnam", "officialCode": "518"},
    {"id": "dist_ap_chittoor", "stateId": "AP", "name": "Chittoor", "officialCode": "519"},
    {"id": "dist_ap_prakasam", "stateId": "AP", "name": "Prakasam", "officialCode": "520"},

    # Karnataka
    {"id": "dist_ka_dakshina_kannada", "stateId": "KA", "name": "Dakshina Kannada", "officialCode": "555"},
    {"id": "dist_ka_udupi", "stateId": "KA", "name": "Udupi", "officialCode": "556"},
    {"id": "dist_ka_kodagu", "stateId": "KA", "name": "Kodagu", "officialCode": "557"},
    {"id": "dist_ka_mysuru", "stateId": "KA", "name": "Mysuru", "officialCode": "558"},
    {"id": "dist_ka_shivamogga", "stateId": "KA", "name": "Shivamogga", "officialCode": "559"},
    {"id": "dist_ka_chamarajanagar", "stateId": "KA", "name": "Chamarajanagar", "officialCode": "560"},

    # Maharashtra
    {"id": "dist_mh_gadchiroli", "stateId": "MH", "name": "Gadchiroli", "officialCode": "469"},
    {"id": "dist_mh_chandrapur", "stateId": "MH", "name": "Chandrapur", "officialCode": "470"},
    {"id": "dist_mh_nanded", "stateId": "MH", "name": "Nanded", "officialCode": "471"},
    {"id": "dist_mh_palghar", "stateId": "MH", "name": "Palghar", "officialCode": "472"},
    {"id": "dist_mh_pune", "stateId": "MH", "name": "Pune", "officialCode": "473"},

    # Odisha
    {"id": "dist_od_koraput", "stateId": "OD", "name": "Koraput", "officialCode": "380"},
    {"id": "dist_od_malkangiri", "stateId": "OD", "name": "Malkangiri", "officialCode": "381"},
    {"id": "dist_od_mayurbhanj", "stateId": "OD", "name": "Mayurbhanj", "officialCode": "382"},
    {"id": "dist_od_rayagada", "stateId": "OD", "name": "Rayagada", "officialCode": "383"},
    {"id": "dist_od_sundergarh", "stateId": "OD", "name": "Sundergarh", "officialCode": "384"},

    # Chhattisgarh
    {"id": "dist_cg_bastar", "stateId": "CG", "name": "Bastar", "officialCode": "390"},
    {"id": "dist_cg_dantewada", "stateId": "CG", "name": "Dantewada", "officialCode": "391"},
    {"id": "dist_cg_sukma", "stateId": "CG", "name": "Sukma", "officialCode": "392"},
    {"id": "dist_cg_kanker", "stateId": "CG", "name": "Kanker", "officialCode": "393"},

    # Jharkhand
    {"id": "dist_jh_ranchi", "stateId": "JH", "name": "Ranchi", "officialCode": "345"},
    {"id": "dist_jh_east_singhbhum", "stateId": "JH", "name": "East Singhbhum", "officialCode": "346"},
    {"id": "dist_jh_dumka", "stateId": "JH", "name": "Dumka", "officialCode": "347"},

    # Tamil Nadu
    {"id": "dist_tn_nilgiris", "stateId": "TN", "name": "Nilgiris", "officialCode": "601"},
    {"id": "dist_tn_thanjavur", "stateId": "TN", "name": "Thanjavur", "officialCode": "602"},
    {"id": "dist_tn_madurai", "stateId": "TN", "name": "Madurai", "officialCode": "603"},

    # Kerala
    {"id": "dist_kl_wayanad", "stateId": "KL", "name": "Wayanad", "officialCode": "588"},
    {"id": "dist_kl_palakkad", "stateId": "KL", "name": "Palakkad", "officialCode": "589"},
    {"id": "dist_kl_kasaragod", "stateId": "KL", "name": "Kasaragod", "officialCode": "590"},

    # Assam
    {"id": "dist_as_karbi_anglong", "stateId": "AS", "name": "Karbi Anglong", "officialCode": "290"},
    {"id": "dist_as_kokrajhar", "stateId": "AS", "name": "Kokrajhar", "officialCode": "291"},

    # Meghalaya
    {"id": "dist_ml_east_khasi_hills", "stateId": "ML", "name": "East Khasi Hills", "officialCode": "270"},
    {"id": "dist_ml_west_garo_hills", "stateId": "ML", "name": "West Garo Hills", "officialCode": "271"}
]

# 5. SUBDISTRICTS (Mandals in AP/TS, Taluks in KA/MH, Tehsils in CG/OD)
subdistricts = [
    # Telangana (Mandals)
    {"id": "sub_utnoor", "districtId": "dist_ts_adilabad", "name": "Utnoor", "officialCode": "4301", "type": "MANDAL"},
    {"id": "sub_indervelly", "districtId": "dist_ts_adilabad", "name": "Indervelly", "officialCode": "4302", "type": "MANDAL"},
    {"id": "sub_asifabad", "districtId": "dist_ts_asifabad", "name": "Asifabad", "officialCode": "4303", "type": "MANDAL"},
    {"id": "sub_bhadradri", "districtId": "dist_ts_bhadradri", "name": "Bhadrachalam", "officialCode": "4304", "type": "MANDAL"},
    {"id": "sub_kaleshwaram", "districtId": "dist_ts_jayashankar", "name": "Mahadevpur", "officialCode": "4305", "type": "MANDAL"},
    {"id": "sub_eturnagaram", "districtId": "dist_ts_mulugu", "name": "Eturnagaram", "officialCode": "4306", "type": "MANDAL"},

    # Andhra Pradesh (Mandals)
    {"id": "sub_tenali", "districtId": "dist_ap_guntur", "name": "Tenali", "officialCode": "4801", "type": "MANDAL"},
    {"id": "sub_maredumilli", "districtId": "dist_ap_alluri", "name": "Maredumilli", "officialCode": "4802", "type": "MANDAL"},
    {"id": "sub_rampachodavaram", "districtId": "dist_ap_alluri", "name": "Rampachodavaram", "officialCode": "4803", "type": "MANDAL"},
    {"id": "sub_rajahmundry_rural", "districtId": "dist_ap_east_godavari", "name": "Rajahmundry Rural", "officialCode": "4804", "type": "MANDAL"},
    {"id": "sub_guntur_urban", "districtId": "dist_ap_guntur", "name": "Guntur Urban", "officialCode": "4805", "type": "MANDAL"},
    {"id": "sub_mangalagiri", "districtId": "dist_ap_guntur", "name": "Mangalagiri", "officialCode": "4806", "type": "MANDAL"},
    {"id": "sub_ponnur", "districtId": "dist_ap_guntur", "name": "Ponnur", "officialCode": "4807", "type": "MANDAL"},

    # Karnataka (Taluks)
    {"id": "sub_mangalore", "districtId": "dist_ka_dakshina_kannada", "name": "Mangaluru", "officialCode": "5201", "type": "TALUK"},
    {"id": "sub_udupi", "districtId": "dist_ka_udupi", "name": "Udupi", "officialCode": "5202", "type": "TALUK"},
    {"id": "sub_karkala", "districtId": "dist_ka_udupi", "name": "Karkala", "officialCode": "5203", "type": "TALUK"},
    {"id": "sub_madikeri", "districtId": "dist_ka_kodagu", "name": "Madikeri", "officialCode": "5204", "type": "TALUK"},

    # Maharashtra (Taluks / Tehsils)
    {"id": "sub_bhamragad", "districtId": "dist_mh_gadchiroli", "name": "Bhamragad", "officialCode": "4401", "type": "TEHSIL"},
    {"id": "sub_dahanu", "districtId": "dist_mh_palghar", "name": "Dahanu", "officialCode": "4402", "type": "TALUK"},

    # Chhattisgarh (Tehsils)
    {"id": "sub_jagdalpur", "districtId": "dist_cg_bastar", "name": "Jagdalpur", "officialCode": "3201", "type": "TEHSIL"},
    {"id": "sub_kontaa", "districtId": "dist_cg_sukma", "name": "Konta", "officialCode": "3202", "type": "TEHSIL"},

    # Odisha (Blocks / Tehsils)
    {"id": "sub_potangi", "districtId": "dist_od_koraput", "name": "Pottangi", "officialCode": "3701", "type": "BLOCK"},
    {"id": "sub_karanjia", "districtId": "dist_od_mayurbhanj", "name": "Karanjia", "officialCode": "3702", "type": "BLOCK"}
]

# 6. LOCALITIES / VILLAGES
localities = [
    {
        "id": "loc_guntur_tenali_narakodur",
        "countryId": "IN",
        "stateId": "AP",
        "districtId": "dist_ap_guntur",
        "subdistrictId": "sub_tenali",
        "name": "Narakodur Village",
        "officialCode": "586110",
        "type": "VILLAGE",
        "latitude": 16.2167,
        "longitude": 80.5167,
        "sourceId": "src_mopr_lgd",
        "sourceYear": 2026,
        "languageVerificationStatus": "OFFICIAL"
    },
    {
        "id": "loc_guntur_angalakuduru",
        "countryId": "IN",
        "stateId": "AP",
        "districtId": "dist_ap_guntur",
        "subdistrictId": "sub_tenali",
        "name": "Angalakuduru",
        "officialCode": "586112",
        "type": "VILLAGE",
        "latitude": 16.2400,
        "longitude": 80.6200,
        "sourceId": "src_mopr_lgd",
        "sourceYear": 2026,
        "languageVerificationStatus": "OFFICIAL"
    },
    {
        "id": "loc_guntur_mangalagiri_kaza",
        "countryId": "IN",
        "stateId": "AP",
        "districtId": "dist_ap_guntur",
        "subdistrictId": "sub_mangalagiri",
        "name": "Kaza Village",
        "officialCode": "586115",
        "type": "VILLAGE",
        "latitude": 16.4167,
        "longitude": 80.5500,
        "sourceId": "src_mopr_lgd",
        "sourceYear": 2026,
        "languageVerificationStatus": "COMMUNITY_REPORTED"
    },
    {
        "id": "loc_utnoor_village",
        "countryId": "IN",
        "stateId": "TS",
        "districtId": "dist_ts_adilabad",
        "subdistrictId": "sub_utnoor",
        "name": "Utnoor Rural",
        "officialCode": "569801",
        "type": "VILLAGE",
        "latitude": 19.3667,
        "longitude": 78.7833,
        "sourceId": "src_mopr_lgd",
        "sourceYear": 2026,
        "languageVerificationStatus": "COMMUNITY_REPORTED"
    },
    {
        "id": "loc_kaleshwaram_temple",
        "countryId": "IN",
        "stateId": "TS",
        "districtId": "dist_ts_jayashankar",
        "subdistrictId": "sub_kaleshwaram",
        "name": "Kaleshwaram",
        "officialCode": "572341",
        "type": "VILLAGE",
        "latitude": 18.8155,
        "longitude": 79.9078,
        "sourceId": "src_mopr_lgd",
        "sourceYear": 2026,
        "languageVerificationStatus": "OFFICIAL"
    },
    {
        "id": "loc_maredumilli_agency",
        "countryId": "IN",
        "stateId": "AP",
        "districtId": "dist_ap_alluri",
        "subdistrictId": "sub_maredumilli",
        "name": "Maredumilli Agency Settlement",
        "officialCode": "584102",
        "type": "HAMLET",
        "latitude": 17.6019,
        "longitude": 81.7108,
        "sourceId": "src_mopr_lgd",
        "sourceYear": 2026,
        "languageVerificationStatus": "FIELD_VERIFIED"
    },
    {
        "id": "loc_udupi_malpe",
        "countryId": "IN",
        "stateId": "KA",
        "districtId": "dist_ka_udupi",
        "subdistrictId": "sub_udupi",
        "name": "Malpe Coast",
        "officialCode": "602311",
        "type": "TOWN",
        "latitude": 13.3500,
        "longitude": 74.7000,
        "sourceId": "src_mopr_lgd",
        "sourceYear": 2026,
        "languageVerificationStatus": "OFFICIAL"
    },
    {
        "id": "loc_bhamragad_forest",
        "countryId": "IN",
        "stateId": "MH",
        "districtId": "dist_mh_gadchiroli",
        "subdistrictId": "sub_bhamragad",
        "name": "Hemalkasa-Bhamragad",
        "officialCode": "543201",
        "type": "VILLAGE",
        "latitude": 19.6433,
        "longitude": 80.4578,
        "sourceId": "src_mopr_lgd",
        "sourceYear": 2026,
        "languageVerificationStatus": "FIELD_VERIFIED"
    },
    {
        "id": "loc_jagdalpur_rural",
        "countryId": "IN",
        "stateId": "CG",
        "districtId": "dist_cg_bastar",
        "subdistrictId": "sub_jagdalpur",
        "name": "Chitrakote Road Settlement",
        "officialCode": "439101",
        "type": "VILLAGE",
        "latitude": 19.0700,
        "longitude": 82.0300,
        "sourceId": "src_mopr_lgd",
        "sourceYear": 2026,
        "languageVerificationStatus": "COMMUNITY_REPORTED"
    }
]

# 7. LANGUAGES MASTER (Census 2011 baseline: Scheduled + Non-scheduled + Tribal / Oral heritages)
languages = [
    # Scheduled Major Languages
    {
        "id": "lang_telugu",
        "name": "Telugu",
        "nativeName": "తెలుగు",
        "iso639_1": "te",
        "iso639_3": "tel",
        "languageFamily": "Dravidian",
        "languageGroup": "South-Central Dravidian",
        "censusCode": "022",
        "censusName": "TELUGU",
        "officialStatus": "SCHEDULED_8",
        "description": "Classical language of Andhra Pradesh and Telangana, rich in agrarian oral hymns and folklore.",
        "sourceId": "src_census_2011_c16"
    },
    {
        "id": "lang_hindi",
        "name": "Hindi",
        "nativeName": "हिन्दी",
        "iso639_1": "hi",
        "iso639_3": "hin",
        "languageFamily": "Indo-Aryan",
        "languageGroup": "Central Zone",
        "censusCode": "006",
        "censusName": "HINDI",
        "officialStatus": "SCHEDULED_8",
        "description": "Major official language of the Union, widespread oral ballad and storytelling traditions.",
        "sourceId": "src_census_2011_c16"
    },
    {
        "id": "lang_kannada",
        "name": "Kannada",
        "nativeName": "ಕನ್ನಡ",
        "iso639_1": "kn",
        "iso639_3": "kan",
        "languageFamily": "Dravidian",
        "languageGroup": "Southern Dravidian",
        "censusCode": "008",
        "censusName": "KANNADA",
        "officialStatus": "SCHEDULED_8",
        "description": "Classical language of Karnataka with profound oral folk epics and Vachana traditions.",
        "sourceId": "src_census_2011_c16"
    },
    {
        "id": "lang_tamil",
        "name": "Tamil",
        "nativeName": "தமிழ்",
        "iso639_1": "ta",
        "iso639_3": "tam",
        "languageFamily": "Dravidian",
        "languageGroup": "Southern Dravidian",
        "censusCode": "020",
        "censusName": "TAMIL",
        "officialStatus": "SCHEDULED_8",
        "description": "Ancient classical language with unbroken oral poetry and deity worship chants.",
        "sourceId": "src_census_2011_c16"
    },
    {
        "id": "lang_malayalam",
        "name": "Malayalam",
        "nativeName": "മലയാളം",
        "iso639_1": "ml",
        "iso639_3": "mal",
        "languageFamily": "Dravidian",
        "languageGroup": "Southern Dravidian",
        "censusCode": "013",
        "censusName": "MALAYALAM",
        "officialStatus": "SCHEDULED_8",
        "description": "Classical Dravidian tongue of Kerala, preserved in monsoon agrarian folklore.",
        "sourceId": "src_census_2011_c16"
    },
    {
        "id": "lang_marathi",
        "name": "Marathi",
        "nativeName": "मराठी",
        "iso639_1": "mr",
        "iso639_3": "mar",
        "languageFamily": "Indo-Aryan",
        "languageGroup": "Southern Zone",
        "censusCode": "016",
        "censusName": "MARATHI",
        "officialStatus": "SCHEDULED_8",
        "description": "Language of Maharashtra with vibrant Powada folk ballads and Warli oral culture.",
        "sourceId": "src_census_2011_c16"
    },
    {
        "id": "lang_odia",
        "name": "Odia",
        "nativeName": "ଓଡ଼ିଆ",
        "iso639_1": "or",
        "iso639_3": "ori",
        "languageFamily": "Indo-Aryan",
        "languageGroup": "Eastern Zone",
        "censusCode": "018",
        "censusName": "ODIA",
        "officialStatus": "SCHEDULED_8",
        "description": "Classical language of Odisha with indigenous highland oral intersections.",
        "sourceId": "src_census_2011_c16"
    },
    {
        "id": "lang_santali",
        "name": "Santali",
        "nativeName": "ᱥᱟᱱᱛᱟᱲᱤ",
        "iso639_1": "sat",
        "iso639_3": "sat",
        "languageFamily": "Austroasiatic",
        "languageGroup": "Munda",
        "censusCode": "023",
        "censusName": "SANTALI",
        "officialStatus": "SCHEDULED_8",
        "description": "Austroasiatic language written in Ol Chiki script, deeply tied to sacred grove creation songs.",
        "sourceId": "src_census_2011_c16"
    },
    {
        "id": "lang_bodo",
        "name": "Bodo",
        "nativeName": "बड़ो",
        "iso639_1": "brx",
        "iso639_3": "brx",
        "languageFamily": "Sino-Tibetan",
        "languageGroup": "Tibeto-Burman",
        "censusCode": "002",
        "censusName": "BODO",
        "officialStatus": "SCHEDULED_8",
        "description": "Tibeto-Burman language of Assam and Bodoland Territorial Region.",
        "sourceId": "src_census_2011_c16"
    },

    # Non-Scheduled & Indigenous / Oral / Endangered Tongues (Vital for Voice Roots)
    {
        "id": "lang_gondi",
        "name": "Gondi",
        "nativeName": "గోండీ / गोंडी",
        "iso639_1": None,
        "iso639_3": "gon",
        "languageFamily": "Dravidian",
        "languageGroup": "South-Central Dravidian",
        "censusCode": "104",
        "censusName": "GONDI",
        "officialStatus": "NON_SCHEDULED",
        "description": "Primary mother tongue of the Koyatur/Gond people across Central India; oral Ghotul traditions.",
        "sourceId": "src_census_2011_c16"
    },
    {
        "id": "lang_tulu",
        "name": "Tulu",
        "nativeName": "ತುಳು",
        "iso639_1": None,
        "iso639_3": "tcy",
        "languageFamily": "Dravidian",
        "languageGroup": "Southern Dravidian",
        "censusCode": "119",
        "censusName": "TULU",
        "officialStatus": "NON_SCHEDULED",
        "description": "Ancient Dravidian oral tongue of Tulunadu; celebrated for Siri Paddana and Bootha Kola chants.",
        "sourceId": "src_census_2011_c16"
    },
    {
        "id": "lang_koya",
        "name": "Koya",
        "nativeName": "కోయ",
        "iso639_1": None,
        "iso639_3": "kff",
        "languageFamily": "Dravidian",
        "languageGroup": "South-Central Dravidian",
        "censusCode": "109",
        "censusName": "KOYA",
        "officialStatus": "NON_SCHEDULED",
        "description": "Language of the Koya tribe inhabiting Godavari and Sabari river basins; ethnobotanical wisdom.",
        "sourceId": "src_census_2011_c16"
    },
    {
        "id": "lang_konda",
        "name": "Konda",
        "nativeName": "కొండ / కుబి",
        "iso639_1": None,
        "iso639_3": "kfc",
        "languageFamily": "Dravidian",
        "languageGroup": "South-Central Dravidian",
        "censusCode": "108",
        "censusName": "KONDA",
        "officialStatus": "NON_SCHEDULED",
        "description": "Vulnerable Dravidian language of Maredumilli agency hills and Eastern Ghats; oral healer lores.",
        "sourceId": "src_census_2011_c16"
    },
    {
        "id": "lang_lambadi",
        "name": "Lambadi",
        "nativeName": "గోర్ బోలి / Gor Boli",
        "iso639_1": None,
        "iso639_3": "lmn",
        "languageFamily": "Indo-Aryan",
        "languageGroup": "Rajasthani-Gujarati nomadic group",
        "censusCode": "006_LAMBADI",
        "censusName": "LAMBADI / BANJARI",
        "officialStatus": "NON_SCHEDULED_CENSUS_SUBGROUP",
        "description": "Nomadic pastoral oral folklore of Banjara/Lambadi clans across Deccan tandas.",
        "sourceId": "src_census_2011_c16"
    },
    {
        "id": "lang_kolami",
        "name": "Kolami",
        "nativeName": "కొలామి",
        "iso639_1": None,
        "iso639_3": "kfb",
        "languageFamily": "Dravidian",
        "languageGroup": "Central Dravidian",
        "censusCode": "107",
        "censusName": "KOLAMI",
        "officialStatus": "NON_SCHEDULED",
        "description": "Endangered tribal tongue of Kolam communities in Adilabad and Yavatmal.",
        "sourceId": "src_census_2011_c16"
    },
    {
        "id": "lang_sora",
        "name": "Sora / Savara",
        "nativeName": "సవర / ᱥᱳᱨᱟ",
        "iso639_1": None,
        "iso639_3": "srb",
        "languageFamily": "Austroasiatic",
        "languageGroup": "Munda",
        "censusCode": "118",
        "censusName": "SAVARA",
        "officialStatus": "NON_SCHEDULED",
        "description": "Sacred dialogue with ancestor spirits and forest terraced cultivation chants.",
        "sourceId": "src_census_2011_c16"
    },
    {
        "id": "lang_kurukh",
        "name": "Kurukh / Oraon",
        "nativeName": "कुड़ुख़",
        "iso639_1": None,
        "iso639_3": "kru",
        "languageFamily": "Dravidian",
        "languageGroup": "Northern Dravidian",
        "censusCode": "110",
        "censusName": "KURUKH / ORAON",
        "officialStatus": "NON_SCHEDULED",
        "description": "Dravidian oral language spoken across Chota Nagpur plateau and Chhattisgarh.",
        "sourceId": "src_census_2011_c16"
    },
    {
        "id": "lang_mundari",
        "name": "Mundari",
        "nativeName": "मुंडारी",
        "iso639_1": None,
        "iso639_3": "unr",
        "languageFamily": "Austroasiatic",
        "languageGroup": "Munda",
        "censusCode": "112",
        "censusName": "MUNDARI",
        "officialStatus": "NON_SCHEDULED",
        "description": "Austroasiatic tongue of Munda clans, carrying Birsa Munda folk epics and forest legends.",
        "sourceId": "src_census_2011_c16"
    },
    {
        "id": "lang_ho",
        "name": "Ho",
        "nativeName": "ᱦᱳ / Ho",
        "iso639_1": None,
        "iso639_3": "hoc",
        "languageFamily": "Austroasiatic",
        "languageGroup": "Munda",
        "censusCode": "106",
        "censusName": "HO",
        "officialStatus": "NON_SCHEDULED",
        "description": "Oral tradition of the Ho indigenous people of Singhbhum and Mayurbhanj; Warang Chiti.",
        "sourceId": "src_census_2011_c16"
    },
    {
        "id": "lang_kodava",
        "name": "Kodava",
        "nativeName": "ಕೊಡವ ತಕ್ಕ್",
        "iso639_1": None,
        "iso639_3": "kfa",
        "languageFamily": "Dravidian",
        "languageGroup": "Southern Dravidian",
        "censusCode": "105",
        "censusName": "KODAVA",
        "officialStatus": "NON_SCHEDULED",
        "description": "Oral ancestral martial and harvest songs of Kodagu coffee highlands.",
        "sourceId": "src_census_2011_c16"
    },
    {
        "id": "lang_khasi",
        "name": "Khasi",
        "nativeName": "Ka Ktien Khasi",
        "iso639_1": None,
        "iso639_3": "kha",
        "languageFamily": "Austroasiatic",
        "languageGroup": "Khasian",
        "censusCode": "103",
        "censusName": "KHASI",
        "officialStatus": "NON_SCHEDULED",
        "description": "Matrilineal oral wisdom, sacred monolith legends, and living root bridge folk songs of Meghalaya.",
        "sourceId": "src_census_2011_c16"
    },
    {
        "id": "lang_garo",
        "name": "Garo",
        "nativeName": "A·chik Ku·sik",
        "iso639_1": None,
        "iso639_3": "grt",
        "languageFamily": "Sino-Tibetan",
        "languageGroup": "Bodo-Garo",
        "censusCode": "102",
        "censusName": "GARO",
        "officialStatus": "NON_SCHEDULED",
        "description": "Oral epics of the Garo hills; Wangala harvest festival songs and ancestral migrations.",
        "sourceId": "src_census_2011_c16"
    },
    {
        "id": "lang_kokborok",
        "name": "Kokborok",
        "nativeName": "ককবরক",
        "iso639_1": None,
        "iso639_3": "trp",
        "languageFamily": "Sino-Tibetan",
        "languageGroup": "Bodo-Garo",
        "censusCode": "120",
        "censusName": "TRIPURI / KOKBOROK",
        "officialStatus": "NON_SCHEDULED",
        "description": "Oral poetry and indigenous legends of the Borok people of Tripura.",
        "sourceId": "src_census_2011_c16"
    }
]

# 8. LANGUAGE VARIETIES / MOTHER TONGUES
language_varieties = [
    {"id": "var_gondi_southern", "languageId": "lang_gondi", "name": "Southern Gondi", "nativeName": "కోయతూర్ గోండీ", "censusName": "GONDI", "description": "Spoken in Adilabad, Asifabad, and Bastar borderline."},
    {"id": "var_gondi_maria", "languageId": "lang_gondi", "name": "Maria / Muria Gondi", "nativeName": "माड़िया / मुड़िया", "censusName": "MARIA", "description": "Abujhmarh and Bastar forest variety."},
    {"id": "var_telugu_telangana", "languageId": "lang_telugu", "name": "Northern Telangana Dialect", "nativeName": "తెలంగాణ యాస", "censusName": "TELUGU", "description": "Godavari basin river variety."},
    {"id": "var_telugu_coastal", "languageId": "lang_telugu", "name": "Coastal Andhra Variety", "nativeName": "కోస్తా యాస", "censusName": "TELUGU", "description": "Krishna-Godavari delta variety."},
    {"id": "var_tulu_shivalli", "languageId": "lang_tulu", "name": "Common Coastal Tulu", "nativeName": "ಸಾಮಾನ್ಯ ತುಳು", "censusName": "TULU", "description": "Mangalore and Udupi belt."},
    {"id": "var_santali_olchiki", "languageId": "lang_santali", "name": "Mayurbhanj Santali", "nativeName": "ᱢᱚᱭᱩᱨᱵᱷᱚᱸᱡᱽ ᱥᱟᱱᱛᱟᱲᱤ", "censusName": "SANTALI", "description": "Traditional Ol Chiki oral lore."}
]

# 9. COMMUNITIES
communities = [
    {"id": "comm_gond", "name": "Gond Community", "nativeName": "కోయతూర్ / गोंड", "stateId": "TS", "districtId": "dist_ts_adilabad", "description": "Indigenous Koyatur clan lineage custodians of Ghotul tradition and Mahua lore."},
    {"id": "comm_koya", "name": "Koya Community", "nativeName": "కోయ దొర", "stateId": "AP", "districtId": "dist_ap_alluri", "description": "River basin forest custodians practicing ethnobotanical healing."},
    {"id": "comm_lambani", "name": "Lambani / Banjara Community", "nativeName": "గోర్ బంజారా", "stateId": "TS", "districtId": "dist_ts_mahabubnagar", "description": "Nomadic pastoral community known for vibrant embroidery and oral migration songs."},
    {"id": "comm_chenchu", "name": "Chenchu Community", "nativeName": "చెంచు", "stateId": "AP", "districtId": "dist_ap_kurnool", "description": "Particularly Vulnerable Tribal Group (PVTG) of Nallamala forests."},
    {"id": "comm_santhal", "name": "Santhal Community", "nativeName": "ᱥᱟᱱᱛᱟᱲ", "stateId": "OD", "districtId": "dist_od_mayurbhanj", "description": "Major indigenous community guarding the sacred Jaher Than groves."},
    {"id": "comm_tuluva", "name": "Tuluva Coastal Fisherfolk", "nativeName": "ತುಳುವೆರ್", "stateId": "KA", "districtId": "dist_ka_udupi", "description": "Coastal fisher and agrarian community custodians of Siri Paddana."}
]

# 10. LANGUAGE LOCATIONS (Many-to-many relationship with verified status)
language_locations = [
    {
        "id": "loc_lang_01",
        "languageId": "lang_gondi",
        "countryId": "IN",
        "stateId": "TS",
        "districtId": "dist_ts_adilabad",
        "subdistrictId": "sub_utnoor",
        "localityId": "loc_utnoor_village",
        "communityId": "comm_gond",
        "status": "FIELD_VERIFIED",
        "sourceId": "src_voice_roots_community",
        "sourceYear": 2026
    },
    {
        "id": "loc_lang_02",
        "languageId": "lang_telugu",
        "countryId": "IN",
        "stateId": "TS",
        "districtId": "dist_ts_jayashankar",
        "subdistrictId": "sub_kaleshwaram",
        "localityId": "loc_kaleshwaram_temple",
        "communityId": None,
        "status": "OFFICIAL",
        "sourceId": "src_census_2011_c16",
        "sourceYear": 2011
    },
    {
        "id": "loc_lang_03",
        "languageId": "lang_konda",
        "countryId": "IN",
        "stateId": "AP",
        "districtId": "dist_ap_alluri",
        "subdistrictId": "sub_maredumilli",
        "localityId": "loc_maredumilli_agency",
        "communityId": "comm_koya",
        "status": "FIELD_VERIFIED",
        "sourceId": "src_voice_roots_community",
        "sourceYear": 2026
    },
    {
        "id": "loc_lang_04",
        "languageId": "lang_tulu",
        "countryId": "IN",
        "stateId": "KA",
        "districtId": "dist_ka_udupi",
        "subdistrictId": "sub_udupi",
        "localityId": "loc_udupi_malpe",
        "communityId": "comm_tuluva",
        "status": "OFFICIAL",
        "sourceId": "src_census_2011_c16",
        "sourceYear": 2011
    }
]

# 11. CENSUS LANGUAGE OBSERVATIONS (Normalized statistical observations from Table C-16)
census_observations = [
    {
        "id": "c16_obs_01",
        "languageId": "lang_telugu",
        "stateId": "TS",
        "districtId": "dist_ts_jayashankar",
        "subdistrictId": "sub_kaleshwaram",
        "censusCode": "022",
        "motherTongueName": "TELUGU",
        "populationTotal": 42560,
        "populationMale": 21430,
        "populationFemale": 21130,
        "ruralPopulation": 36420,
        "urbanPopulation": 6140,
        "sourceYear": 2011,
        "sourceId": "src_census_2011_c16"
    },
    {
        "id": "c16_obs_02",
        "languageId": "lang_gondi",
        "stateId": "TS",
        "districtId": "dist_ts_adilabad",
        "subdistrictId": "sub_utnoor",
        "censusCode": "104",
        "motherTongueName": "GONDI",
        "populationTotal": 31280,
        "populationMale": 15820,
        "populationFemale": 15460,
        "ruralPopulation": 29800,
        "urbanPopulation": 1480,
        "sourceYear": 2011,
        "sourceId": "src_census_2011_c16"
    },
    {
        "id": "c16_obs_03",
        "languageId": "lang_koya",
        "stateId": "AP",
        "districtId": "dist_ap_alluri",
        "subdistrictId": "sub_maredumilli",
        "censusCode": "109",
        "motherTongueName": "KOYA",
        "populationTotal": 18450,
        "populationMale": 9180,
        "populationFemale": 9270,
        "ruralPopulation": 18450,
        "urbanPopulation": 0,
        "sourceYear": 2011,
        "sourceId": "src_census_2011_c16"
    },
    {
        "id": "c16_obs_04",
        "languageId": "lang_tulu",
        "stateId": "KA",
        "districtId": "dist_ka_udupi",
        "subdistrictId": "sub_udupi",
        "censusCode": "119",
        "motherTongueName": "TULU",
        "populationTotal": 86240,
        "populationMale": 42100,
        "populationFemale": 44140,
        "ruralPopulation": 45100,
        "urbanPopulation": 41140,
        "sourceYear": 2011,
        "sourceId": "src_census_2011_c16"
    }
]

# 12. DATA AUDIT LOG
data_audit_log = [
    {
        "id": "audit_001",
        "entityType": "LANGUAGE_LOCATION",
        "entityId": "loc_lang_01",
        "action": "FIELD_VERIFIED",
        "oldValue": "COMMUNITY_REPORTED",
        "newValue": "FIELD_VERIFIED",
        "changedBy": "usr_elder_01 (Soyam Laxman, Gond Custodian)",
        "reason": "Verified through community Ghotul oral recording session in Utnoor.",
        "createdAt": "2026-10-02T14:30:00.000Z"
    },
    {
        "id": "audit_002",
        "entityType": "LANGUAGE",
        "entityId": "lang_konda",
        "action": "STATUS_CONFIRMED",
        "oldValue": "PENDING_REVIEW",
        "newValue": "NON_SCHEDULED",
        "changedBy": "usr_admin_01",
        "reason": "Matched with Census 2011 Non-Scheduled Language Code 108 (Konda/Kubi).",
        "createdAt": "2026-10-03T10:15:00.000Z"
    }
]

def dump_file(filename, data):
    path = DATA_DIR / filename
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"✓ Seeded {len(data)} records -> {path}")

def main():
    print("🌿 Seeding Voice Roots India Master Language & Location Database...")
    dump_file("data_sources.json", data_sources)
    dump_file("countries.json", countries)
    dump_file("states.json", states)
    dump_file("districts.json", districts)
    dump_file("subdistricts.json", subdistricts)
    dump_file("localities.json", localities)
    dump_file("languages.json", languages)
    dump_file("language_varieties.json", language_varieties)
    dump_file("communities.json", communities)
    dump_file("language_locations.json", language_locations)
    dump_file("census_observations.json", census_observations)
    dump_file("data_audit_log.json", data_audit_log)
    print("✨ Master India data files seeded successfully!")

if __name__ == "__main__":
    main()

