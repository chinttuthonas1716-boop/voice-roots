# VOICE ROOTS — INDIA MASTER LANGUAGE & LOCATION DATABASE SPECIFICATION
## IMPLEMENTATION MASTER DIRECTIVE

This document contains the definitive architecture, schema, data sources, and acceptance criteria for the Voice Roots India Language & Location Master Database.

---

### Core Principles
1. **Original Cultural Artifact**: The original audio recording and source language are permanent and immutable.
2. **Four Language Concepts**:
   - `sourceLanguageId`: Language of the original recording (e.g., Telugu, Gondi, Tulu).
   - `translations[targetLang]`: Translated text.
   - `translation_audio`: Target-language speech track.
   - UI Language: Website interface chrome.
3. **Official Baseline Data**:
   - Administrative Hierarchy: Local Government Directory (LGD), Ministry of Panchayati Raj.
   - Mother Tongues: Census of India 2011 Table C-16 (`PC11_C16-00` All-India, `PC11_C16-28` Andhra Pradesh, `PC11_C16-City` Town level) & Language Atlas of India 2011.
4. **Historical Geography Isolation**:
   - 2011 Andhra Pradesh geography predates the 2014 Telangana bifurcation. Historical Census data carries `geographyVersion = "CENSUS_2011"` and `sourceYear = 2011`.
   - Modern administrative hierarchy is maintained with current LGD codes (AP: 28, Telangana: 36).
5. **No Fabricated Data**:
   - The Census does NOT publish individual village language surveys.
   - Village language relations without official backing must be flagged `UNVERIFIED`, `COMMUNITY_REPORTED`, or `FIELD_VERIFIED`, never fabricated as official.

---

### Table of Contents
1. Research Sources
2. Master Database Schema (DDL & JSON Schema)
3. Geographic Hierarchy (Country -> State -> District -> Subdistrict -> Locality)
4. Linguistic Hierarchy (Language -> Variety -> Dialect -> Community)
5. Statistical Census Observations
6. Story & Audio Track Integration
7. Cascading Selectors & UI Integration
8. Dual-Track Audio Playback Engine
9. Automated Test Suite (10 Acceptance Tests)
