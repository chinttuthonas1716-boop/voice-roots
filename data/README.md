# 📚 Voice Roots — Language Resource Dataset & Provenance

This directory contains verified, permitted language resource records across global indigenous, oral, scheduled, and reference world languages:
- **Indigenous & Oral Tongues**: Gondi (`gon`), Koya (`kff`), Santhali (`sat`), Lambadi (`lmn`), Quechua (`qu`), Guaraní (`gn`), Swahili (`sw`), Māori (`mi`), Yoruba (`yo`), Welsh (`cy`)
- **Scheduled & Regional Indian Languages**: Telugu (`te`), Hindi (`hi`), Tamil (`ta`), Kannada (`kn`), Malayalam (`ml`), Marathi (`mr`), Odia (`or`), Bengali (`bn`)
- **Reference World Tongues**: English (`en`), Spanish (`es`), Arabic (`ar`)

---

## 🛡️ Provenance, Consent & Licensing Standards (OCAP Compliant)

All records adhere strictly to open access, non-commercial research, or public domain licenses:
1. **AI4Bharat**: MIT / CC BY 4.0 (IIT Madras Indic NLP research & IndicTrans2 gold corpora)
2. **Mozilla Common Voice**: CC0 1.0 (Public Domain Dedication)
3. **PARADISEC**: CC BY-NC 4.0 / CC BY 4.0 (Pacific and Regional Archive for Digital Sources in Endangered Cultures)
4. **CIIL**: Central Institute of Indian Languages (Open Access Tribal Documentation Series)
5. **Yvy Marañe'ỹ Foundation**: CC BY 4.0 (Guaraní Oral Heritage Corpus)
6. **National Library of New Zealand**: CC BY 4.0 (Whakataukī & Māori Oral History Collection)
7. **University of Dar es Salaam**: CC BY 4.0 (Swahili Folklore & Oral Wisdom Archive)
8. **National Library of Wales**: CC0 1.0 (Welsh Folk Song & Oral Lore Collection)
9. **Biblioteca Virtual Miguel de Cervantes**: CC0 1.0 (Oral Literature Archive)

---

## 📊 Dataset Metrics & Language Distribution

- **Total Ingested Records**: 26
- **Embedding Model**: `voiceroots_multilingual_v1` (384-dimensional offline subword n-gram embedding function) + Lexical Exact Fallback
- **Indexed Document Types**: Oral epics, traditional ethnomedicine, festival chants, proverbs, work ballads, folk poetry, cultural prose.
- **Verification Breakdown**:
  - Human Verified (Linguistic Fieldwork & Elders): 20 records
  - Community Verified (Native Speakers): 6 records

### Record Breakdown by Language:
| Language | Code | Family / Region | License | Records |
| :--- | :---: | :--- | :--- | :---: |
| **Gondi** | `gon` | South-Central Dravidian / Central India | CC BY-NC 4.0, CC BY 4.0 | 2 |
| **Koya** | `kff` | South-Central Dravidian / Godavari Basin | CC BY-SA 4.0 | 2 |
| **Santhali** | `sat` | Austroasiatic (Munda) / Eastern India | CC0 1.0 | 2 |
| **Lambadi** | `lmn` | Indo-Aryan (Rajasthani/Banjara) | CC BY-NC 4.0, CC BY 4.0 | 2 |
| **Telugu** | `te` | South-Central Dravidian | CC BY 4.0 | 2 |
| **Hindi** | `hi` | Indo-Aryan (Central) | CC0 1.0 | 1 |
| **Tamil** | `ta` | Southern Dravidian | CC BY 4.0 | 1 |
| **Kannada** | `kn` | Southern Dravidian | CC BY 4.0 | 1 |
| **Malayalam** | `ml` | Southern Dravidian | CC0 1.0 | 1 |
| **Marathi** | `mr` | Indo-Aryan (Southern) | CC BY 4.0 | 1 |
| **Odia** | `or` | Indo-Aryan (Eastern) | CC BY 4.0 | 1 |
| **Bengali** | `bn` | Indo-Aryan (Eastern) | CC BY 4.0 | 1 |
| **Quechua** | `qu` | Quechuan / Andean South America | CC BY 4.0 | 1 |
| **Guaraní** | `gn` | Tupian / Paraguay & Gran Chaco | CC BY 4.0 | 1 |
| **Swahili** | `sw` | Niger-Congo (Bantu) / East Africa | CC BY 4.0 | 1 |
| **Māori** | `mi` | Austronesian (Polynesian) / Aotearoa | CC BY 4.0 | 1 |
| **Spanish** | `es` | Indo-European (Romance) | CC0 1.0 | 1 |
| **Arabic** | `ar` | Afroasiatic (Semitic) | CC BY 4.0 | 1 |
| **Yoruba** | `yo` | Niger-Congo (Defoid) / West Africa | CC BY 4.0 | 1 |
| **Welsh** | `cy` | Indo-European (Celtic) / Wales | CC0 1.0 | 1 |
| **English** | `en` | Indo-European (Germanic) | CC BY-SA 4.0 | 1 |
| **Total** | | | | **26** |

---

## 📁 Directory Structure

```
data/
├── manifest.jsonl                   # Audit trail and ingestion catalog with SHA-256 checksums
├── processed/
│   └── language_resources.jsonl   # Complete JSONL records with translations, sources & licenses
├── seed_data.py                    # Deterministic, reproducible offline seed generator
└── README.md                        # Dataset documentation & provenance reference
```

---

## ⚙️ Ingestion & ChromaDB Integration

To seed and re-index the dataset into persistent ChromaDB:
```bash
# 1. Regenerate JSONL records & manifest
python3 data/seed_data.py

# 2. Ingest into ChromaDB (offline vector collection: language_resources)
curl -X POST http://127.0.0.1:8000/api/v1/resources/ingest \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: ${VOICE_ROOTS_ADMIN_KEY:-}"
```
