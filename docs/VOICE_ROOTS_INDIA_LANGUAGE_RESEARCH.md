# VOICE ROOTS — INDIA LANGUAGE & LOCATION MASTER DATA
## OBJECTIVE
Build an India-wide language and location master database for
Voice Roots.
The hierarchy must be:
India
→ State / Union Territory
→ District
→ Subdistrict / Mandal / Taluk / Tehsil
→ Village / Locality
→ Community
→ Language
→ Language Variety / Dialect
→ Oral Heritage Story
→ Original Audio
The system must use authoritative source data wherever available
and must never invent villages, languages, communities, dialects,
or language-location relationships.
---
# OFFICIAL RESEARCH SOURCES
## 1. Census of India — C-16
C-16: Population by Mother Tongue, India - 2011
Reference:
PC11_C16-00
Official source:
https://censusindia.gov.in/nada/index.php/catalog/10191
Use this as the national mother-tongue/language statistical baseline.
The C-16 dataset provides mother-tongue information at levels
including:
- India
- State
- District
- Tahsil
- Town
It contains population information associated with mother tongue
and sex, including total/rural/urban information.
IMPORTANT:
C-16 is NOT a village-by-village language directory.
Do not claim that a specific village officially speaks a language
unless the source actually supports that relationship.
---
# 2. ANDHRA PRADESH C-16
C-16: Population by Mother Tongue, Andhra Pradesh - 2011
Reference:
PC11_C16-28
Official source:
https://censusindia.gov.in/nada/index.php/catalog/10193
Use this for Andhra Pradesh language/mother-tongue research.
IMPORTANT:
Census 2011 Andhra Pradesh represents historical 2011 geography.
It predates the Andhra Pradesh/Telangana bifurcation.
Therefore:
DO NOT overwrite current administrative geography using
Census 2011 geography.
Store historical Census geography separately.
Example:
geographyVersion = "CENSUS_2011"
sourceYear = 2011
---
# 3. ANDHRA PRADESH TOWN-LEVEL DATA
C-16 City: Population by Mother Tongue,
Andhra Pradesh - 2011
Official source:
https://censusindia.gov.in/nada/index.php/catalog/10254
Use this when town-level language observations are required.
---
# 4. LANGUAGE ATLAS
Census of India 2011 — Language Atlas of India
Official source:
https://censusindia.gov.in/nada/index.php/catalog/42561/study-description
Use the Language Atlas for:
- language distribution research
- geographic language context
- Census language classification
- reference maps
Do not use the atlas as a replacement for the normalized
database.
---
# DATABASE ARCHITECTURE
Create these master tables:
countries
states
districts
subdistricts
localities
languages
language_varieties
dialects
communities
language_locations
census_language_observations
data_sources
data_audit_log
Voice Roots application tables:
stories
audio_tracks
transcripts
translations
translation_audio
consents
verifications
heritage_records
heritage_passports
---
# COUNTRY
countries
Fields:
id
name
iso2
iso3
Initial country:
India
IN
IND
---
# STATES
states
Fields:
id
countryId
name
officialCode
type
type:
STATE
UNION_TERRITORY
Import the complete current Indian State/UT list from an
authoritative current administrative source.
Do not hard-code only Andhra Pradesh, Telangana, Karnataka, etc.
---
# DISTRICTS
districts
Fields:
id
stateId
name
officialCode
Import the complete available current district hierarchy.
---
# SUBDISTRICTS
subdistricts
Fields:
id
districtId
name
officialCode
type
Possible type:
MANDAL
TALUK
TEHSIL
BLOCK
SUBDIVISION
OTHER
Preserve the terminology used by the source.
Do not rename official administrative units simply for UI consistency.
---
# VILLAGES / LOCALITIES
localities
Fields:
id
countryId
stateId
districtId
subdistrictId
name
officialCode
type
latitude
longitude
sourceId
sourceYear
Possible types:
VILLAGE
HAMLET
TOWN
CITY
LOCALITY
OTHER
Do not invent village names.
---
# LANGUAGE MASTER
languages
Fields:
id
name
nativeName
iso639_1
iso639_3
languageFamily
languageGroup
censusCode
censusName
description
sourceId
sourceYear
status
Possible status:
OFFICIAL
COMMUNITY_ADDED
PENDING_REVIEW
Use official Census language/mother-tongue information as the
initial baseline.
Do NOT restrict Voice Roots to only India's Scheduled Languages.
Voice Roots must support:
- scheduled languages
- non-scheduled languages
- minority languages
- tribal languages
- regional languages
- oral varieties where appropriately documented
---
# LANGUAGE VARIETIES
language_varieties
Fields:
id
languageId
name
nativeName
censusName
censusCode
description
sourceId
sourceYear
status
Do not automatically turn every mother-tongue entry into a
separate language.
Preserve the source classification.
---
# DIALECTS
dialects
Fields:
id
languageId
name
nativeName
region
description
verificationStatus
Never invent dialects.
---
# COMMUNITIES
communities
Fields:
id
name
nativeName
description
countryId
stateId
districtId
localityId
verificationStatus
sourceId
A community is NOT automatically the same as a language.
One community may use multiple languages.
One language may be used by multiple communities.
---
# LANGUAGE ↔ LOCATION
Create:
language_locations
Fields:
id
languageId
countryId
stateId
districtId
subdistrictId
localityId
communityId
status
sourceId
sourceYear
sourceReference
verificationStatus
Possible status:
OFFICIAL
CENSUS_REPORTED
COMMUNITY_REPORTED
FIELD_VERIFIED
AI_SUGGESTED
UNVERIFIED
CRITICAL:
AI_SUGGESTED must never automatically become OFFICIAL.
---
# CENSUS OBSERVATIONS
Create:
census_language_observations
Fields:
id
languageId
censusLanguageCode
motherTongueName
stateCode
districtCode
subdistrictCode
townCode
areaName
areaType
totalPersons
totalMale
totalFemale
ruralPersons
ruralMale
ruralFemale
urbanPersons
urbanMale
urbanFemale
censusYear
sourceId
Keep Census statistical observations separate from the
canonical language identity table.
---
# DATA SOURCES
Create:
data_sources
Fields:
id
organization
datasetName
datasetVersion
sourceUrl
sourceYear
retrievedAt
license
notes
Example:
organization:
Office of the Registrar General &
Census Commissioner, India
datasetName:
C-16 Population by Mother Tongue
datasetVersion:
Census 2011
sourceYear:
2011
---
# STORY DATA
Every story must reference normalized IDs.
stories:
id
title
description
countryId
stateId
districtId
subdistrictId
localityId
communityId
sourceLanguageId
languageVarietyId
dialectId
originalAudioId
verificationStatus
accessLevel
createdAt
updatedAt
---
# CRITICAL LANGUAGE RULE
sourceLanguageId ALWAYS means:
LANGUAGE OF THE ORIGINAL RECORDING
Example:
Uploaded audio = Telugu
sourceLanguageId = Telugu
If the user selects:
English
the story source language remains:
Telugu
Never change:
sourceLanguageId = English
because the user selected English translation.
---
# AUDIO DATA
audio_tracks:
id
storyId
type
languageId
sourceLanguageId
targetLanguageId
audioUrl
duration
provider
voiceId
status
Types:
ORIGINAL
TRANSLATED
Example:
Original Telugu:
type = ORIGINAL
languageId = Telugu
English translated audio:
type = TRANSLATED
languageId = English
sourceLanguageId = Telugu
targetLanguageId = English
---
# TRANSLATIONS
translations:
id
storyId
sourceLanguageId
targetLanguageId
translatedText
status
createdAt
updatedAt
Example:
Telugu → English
sourceLanguageId = Telugu
targetLanguageId = English
---
# TRANSLATED AUDIO
translation_audio:
id
translationId
storyId
sourceLanguageId
targetLanguageId
audioUrl
ttsProvider
voiceId
status
createdAt
The translated audio language must always equal
targetLanguageId.
---
# STORY CARD
Archive and Explore cards represent the ORIGINAL recording.
Example:
TELUGU · GUNTUR, ANDHRA PRADESH, INDIA
Another:
GONDI · ADILABAD, TELANGANA, INDIA
Another:
TULU · UDUPI, KARNATAKA, INDIA
The language label must come from:
story.sourceLanguageId
The location must come from:
stateId
districtId
localityId
NEVER use:
selectedTranslationLanguage
for the story card language.
---
# UPLOAD FORM
Use cascading selectors:
Country
↓
State / Union Territory
↓
District
↓
Mandal / Taluk / Tehsil / Subdistrict
↓
Village / Locality
↓
Community
↓
Original Language
↓
Language Variety
↓
Dialect
↓
Upload / Record Audio
Do not load thousands of villages into browser memory.
Use server-side search and pagination.
---
# LANGUAGE DETECTION
After uploading audio:
Audio
↓
Language Detection
↓
Suggested Language
↓
User Confirmation
Example:
Detected language:
Gondi
Confidence:
94%
Show:
[ Accept ]
[ Change Language ]
AI detection is only a suggestion until the user/community confirms it.
---
# VILLAGE LANGUAGE DATA
Do NOT assume that every village has an official Census
language relationship.
If no verified relationship exists:
Display:
"Language information for this locality has not yet been verified."
Allow:
[ Community Contribution ]
---
# COMMUNITY LANGUAGE CONTRIBUTION
If a language/location relationship is missing, allow users to submit:
Language name
Native name
Community
State
District
Village
Evidence/source
Optional recording
Initial status:
PENDING_REVIEW
After review:
COMMUNITY_REPORTED
After field/community verification:
FIELD_VERIFIED
Never call community data government-official unless an official
source supports it.
---
# SEARCH
The website must support:
Search language
Search state
Search district
Search village
Search community
Language search should support:
official name
native name
Census name
aliases
ISO code
Census code
Examples:
Tel
→ Telugu
Gon
→ Gondi
Tul
→ Tulu
---
# EXPLORE BY LANGUAGE
Route:
/explore/language/:languageId
Show:
Language
Native name
Language family
Regions
States
Districts
Communities
Oral heritage records
---
# EXPLORE BY LOCATION
Route:
/explore/location/:localityId
Show:
Village/locality
Subdistrict
District
State
Languages
Communities
Oral heritage
---
# EXPLORE BY STATE
Route:
/explore/state/:stateId
Show:
State
Languages
Districts
Communities
Stories
Songs
Legends
Oral histories
---
# ARCHIVE FILTERS
Language
State
District
Subdistrict
Village
Community
Heritage Type
Verification
Access
Use database IDs internally.
---
# DATA IMPORT
Create scripts:
scripts/india-data/import-census-c16.js
scripts/india-data/import-ap-c16.js
scripts/india-data/normalize-languages.js
scripts/india-data/normalize-locations.js
scripts/india-data/validate-import.js
scripts/india-data/seed-database.js
Imports must be:
IDEMPOTENT
Running an import twice must not create duplicate records.
Use stable official source IDs/codes for upserts.
---
# HISTORICAL GEOGRAPHY
Census 2011 geography is historical.
Store:
sourceYear = 2011
geographyVersion = "CENSUS_2011"
Do NOT overwrite current geography.
Create a geography crosswalk when mapping:
Census 2011 geography
→
Current geography
---
# DATA QUALITY
NEVER INVENT:
villages
languages
communities
dialects
speaker statistics
language-location relationships
Census statistics
If unavailable:
UNVERIFIED
is better than fabricated data.
---
# ADMIN DATA MANAGEMENT
Create an admin-only area:
/admin/data
Admin can:
View states
View districts
View villages
View languages
View language-location mappings
Approve community submissions
Merge duplicates
Correct metadata
View sources
View audit history
Do not place this in normal user navigation.
---
# AUDIT LOG
Create:
data_audit_log
Fields:
id
entityType
entityId
action
oldValue
newValue
changedBy
reason
createdAt
Actions:
CREATE
UPDATE
MERGE
VERIFY
REJECT
---
# VOICE ROOTS FINAL DATA FLOW
Official Administrative Data
+
Census Language Data
+
Community Data
+
Field Verification
+
Voice Roots Recordings
↓
INDIA ORAL HERITAGE MASTER DATABASE
↓
Explore
Search
Record
Upload
Transcribe
Translate
Cultural Context
Consent
Human Review
Verification
Heritage Record
Heritage Passport
---
# FINAL RULE
The original cultural identity must remain permanently attached
to:
Original Language
+
Original Location
+
Original Community
+
Original Audio
Translation language and translated audio are separate derivatives.
They must NEVER overwrite the original language or original audio.
