<USER_REQUEST>
Absolutely. Below is the single master prompt that consolidates the Voice Roots project from the earliest concept through the latest completed/stable version.

You can copy-paste this entire prompt into VS Code / your coding AI as the master project specification.

============================================================
VOICE ROOTS — MASTER PROJECT PROMPT
============================================================
PROJECT NAME:
Voice Roots
PROJECT TYPE:
AI-powered oral heritage preservation website.
IMPORTANT:
BUILD ONLY THE RESPONSIVE WEBSITE.
DO NOT BUILD:
- Flutter app
- React Native app
- Native iOS app
- Native Android app
- Separate mobile application
Mobile experience must be the responsive version of the same website.
============================================================
1. PROJECT VISION
============================================================
Voice Roots is an AI-assisted, consent-aware, human-verified oral heritage preservation platform.
Core idea:
VOICE
  ↓
TRANSCRIBE
  ↓
TRANSLATE
  ↓
UNDERSTAND
  ↓
PRESERVE
The platform allows people and communities to preserve:
- Oral stories
- Folk stories
- Folk songs
- Traditional knowledge
- Community memories
- Regional languages
- Endangered languages
- Dialects
- Cultural traditions
- Personal/community recordings
- Indigenous/oral heritage
The original recording is always the PRIMARY CULTURAL ARTIFACT.
AI is used to assist with:
- Speech-to-text
- Language detection
- Translation
- Translated audio
- Cultural-context assistance
- Search
- Summaries
- Discovery
- AI assistance
AI must NEVER replace the original recording.
Voice Roots should feel:
- Premium
- Calm
- Cultural
- Human
- Trustworthy
- Intelligent
- Archival
- Modern
- iOS-inspired
- Minimal
- Professional
Core positioning:
"Voice Roots is an AI-assisted, consent-aware, human-verified oral heritage preservation platform."
============================================================
2. CORE PRODUCT PRINCIPLE
============================================================
ALWAYS preserve the original cultural source.
Original:
- Audio
- Language
- Transcript
- Contributor information
- Community information
- Cultural information
must remain distinguishable from AI-generated information.
Every AI-generated artifact must clearly indicate its status.
Examples:
ORIGINAL RECORDING
AI-GENERATED TRANSCRIPT
AI TRANSLATION
AI-ASSISTED CULTURAL CONTEXT
HUMAN EDITED
HUMAN VERIFIED
COMMUNITY VERIFIED
Never present AI-generated cultural information as established fact unless it has been appropriately verified.
============================================================
3. STRICT PRODUCT FLOW
============================================================
The complete user flow is:
LOGIN / REGISTER
        ↓
HOME
        ↓
EXPLORE / ARCHIVE / SEARCH
        ↓
STORY DETAILS
        ↓
ORIGINAL AUDIO
        ↓
PRESERVE A VOICE
        ↓
RECORD OR UPLOAD
        ↓
AUDIO PROCESSING
        ↓
LANGUAGE DETECTION
        ↓
TRANSCRIPTION
        ↓
TRANSCRIPT REVIEW
        ↓
TRANSLATION
        ↓
CULTURAL CONTEXT
        ↓
CONSENT
        ↓
HUMAN REVIEW
        ↓
VERIFICATION
        ↓
HERITAGE RECORD
        ↓
HERITAGE PASSPORT
        ↓
QR / PUBLIC STORY
The website must enforce this flow.
Users must NOT be able to randomly open future workflow pages.
============================================================
4. WORKFLOW STATE MACHINE
============================================================
Use explicit workflow states:
const WORKFLOW_STATES = {
  DRAFT: "DRAFT",
  RECORDED: "RECORDED",
  UPLOADED: "UPLOADED",
  PROCESSING: "PROCESSING",
  LANGUAGE_DETECTED: "LANGUAGE_DETECTED",
  TRANSCRIBED: "TRANSCRIBED",
  TRANSCRIPT_REVIEW: "TRANSCRIPT_REVIEW",
  TRANSLATED: "TRANSLATED",
  CULTURAL_CONTEXT: "CULTURAL_CONTEXT",
  CONSENT_PENDING: "CONSENT_PENDING",
  HUMAN_REVIEW: "HUMAN_REVIEW",
  VERIFIED: "VERIFIED",
  HERITAGE_RECORD: "HERITAGE_RECORD",
  PASSPORT_CREATED: "PASSPORT_CREATED",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED"
};
State order:
const STATE_ORDER = [
  "DRAFT",
  "RECORDED",
  "UPLOADED",
  "PROCESSING",
  "LANGUAGE_DETECTED",
  "TRANSCRIBED",
  "TRANSCRIPT_REVIEW",
  "TRANSLATED",
  "CULTURAL_CONTEXT",
  "CONSENT_PENDING",
  "HUMAN_REVIEW",
  "VERIFIED",
  "HERITAGE_RECORD",
  "PASSPORT_CREATED",
  "PUBLISHED"
];
Never use alphabetical comparison.
Never skip states.
Allowed transition:
DRAFT
→ RECORDED / UPLOADED
→ PROCESSING
→ LANGUAGE_DETECTED
→ TRANSCRIBED
→ TRANSCRIPT_REVIEW
→ TRANSLATED
→ CULTURAL_CONTEXT
→ CONSENT_PENDING
→ HUMAN_REVIEW
→ VERIFIED
→ HERITAGE_RECORD
→ PASSPORT_CREATED
→ PUBLISHED
Backend must enforce transitions.
Never mark VERIFIED simply because a user clicked a button.
Human review must actually update verification status.
============================================================
5. ROUTES
============================================================
Create:
/
 /login
 /register
 /home
 /explore
 /archive
 /search
 /story/:id
 /record
 /upload
 /process/:id
 /transcript/:id
 /translate/:id
 /cultural-context/:id
 /consent/:id
 /verification/:id
 /heritage/:id
 /passport/:id
 /profile
 /settings
 /about
Admin:
/admin/data
============================================================
6. ROUTE ACCESS RULES
============================================================
Public:
/
 /login
 /register
 /explore
 /search
 /about
Authenticated:
/home
 /archive
 /record
 /upload
 /profile
 /settings
Workflow:
/process/:id
requires RECORDED or UPLOADED
/transcript/:id
requires TRANSCRIBED or later
/translate/:id
requires TRANSCRIPT_REVIEW or later
/cultural-context/:id
requires TRANSLATED or approved equivalent
/consent/:id
requires CULTURAL_CONTEXT
/verification/:id
requires consent submitted
/heritage/:id
requires HERITAGE_RECORD or PUBLISHED
/passport/:id
requires PASSPORT_CREATED
Every workflow route must pass through one central workflow guard.
Example:
function canAccessRoute(route, workflow) {
  const requiredState = ROUTE_REQUIREMENTS[route];
  if (!requiredState) return true;
  return isStateReached(
    workflow.status,
    requiredState
  );
}
Backend must also enforce this.
Frontend guards alone are NOT sufficient.
============================================================
7. INVALID ROUTE BEHAVIOR
============================================================
Example:
User opens:
/passport/VR-106
but story is not verified.
Do NOT show Passport.
Show:
"You’re not ready for this step yet."
"Complete the remaining preservation steps first."
Button:
"Continue where I left off"
Redirect user to the next valid workflow step.
============================================================
8. BROWSER / WORKFLOW PERSISTENCE
============================================================
Refreshing the browser must NOT destroy progress.
Browser back button must NOT destroy workflow data.
Store:
storyId
status
lastCompletedStep
nextStep
updatedAt
Home should show:
"Continue Preserving"
with:
Current step
Progress
Next action
Do not create duplicate:
- Recordings
- Transcriptions
- Translations
- Heritage Records
Use idempotency where necessary.
============================================================
9. MAIN NAVIGATION
============================================================
Main navigation MUST ONLY contain:
Home
Explore
Archive
Preserve
Profile
Do NOT put workflow stages in main navigation.
Do NOT add:
Transcript
Translation
Cultural Context
Consent
Verification
Heritage Record
Passport
These belong inside the preservation workflow.
============================================================
10. VISUAL DESIGN SYSTEM
============================================================
Use the provided UI references as DESIGN INSPIRATION.
Do NOT copy:
- Logos
- Text
- Exact layouts
- Copyrighted assets
- Brand identity
Translate the design principles into Voice Roots.
Visual style:
- Premium dark indigo
- Soft glassmorphism
- iOS-inspired
- Floating navigation
- Rounded cards
- Editorial typography
- Premium archive aesthetic
- Calm cultural presentation
- Subtle animations
- Minimal UI
============================================================
11. APPROVED COLOR PALETTE
============================================================
Primary background:
#2D3250
Deep background:
#242942
Indigo surface:
#42476C
Muted periwinkle:
#6F76A0
Primary peach:
#F9B17A
Soft peach:
#F6A875
White:
#FFFFFF
Secondary text:
#D9D9E2
Muted text:
#A9AEC5
Light background:
#F5F5F2
Dark text:
#242942
Glass:
rgba(255,255,255,0.08)
Strong glass:
rgba(255,255,255,0.14)
Border:
rgba(255,255,255,0.12)
Peach must be an accent.
Do not make the entire interface orange/peach.
============================================================
12. TYPOGRAPHY
============================================================
Use:
Inter
or
SF Pro-style modern sans-serif.
Typography must be:
- Clean
- Modern
- Editorial
- Highly readable
Use:
Large hero headings
Strong page titles
Clean body text
Small metadata labels
Generous line height
"VOICE ROOTS" should remain on one line where reasonably possible.
Avoid decorative fonts.
============================================================
13. COMPONENT STYLE
============================================================
Cards:
22–28px radius
Buttons:
14–16px radius
Pills:
999px
Use:
- Glass cards
- Backdrop blur
- Soft borders
- Subtle shadows
- Outline icons
- Floating controls
- Large editorial spacing
Animations:
Buttons:
150–200ms
Cards:
200–300ms
Pages:
350–500ms
Hero:
450–650ms
Bottom sheet:
350–450ms
Use:
cubic-bezier(0.22,1,0.36,1)
Respect:
prefers-reduced-motion
Minimum touch target:
44px
============================================================
14. RESPONSIVE BREAKPOINTS
============================================================
Test:
320
375
390
430
768
820
1024
1280
1440
1600
1920
Requirements:
- No horizontal scrolling
- No clipping
- No overlap
- No tiny controls
- No broken cards
- No navigation covering content
============================================================
15. MOBILE WEB DESIGN
============================================================
Mobile is NOT a separate app.
It is the responsive website.
Use a floating iOS-inspired bottom navigation:
Home
Explore
Preserve
Archive
Profile
Preserve must be the emphasized center action.
Navigation style:
- White translucent surface
- Backdrop blur
- Rounded 24px
- Peach active state
- Dark indigo icons/text
Navigation must never cover page content.
============================================================
16. DESKTOP DESIGN
============================================================
Desktop should feel like a premium cultural archive.
Use:
- Large editorial hero
- Multi-column layouts
- Side panels where useful
- Floating/glass header
- Large story cards
- Audio player
- AI assistant panel
- Generous spacing
Do not stretch everything across the entire screen.
Use max-width containers.
Large desktop layouts must remain elegant.
============================================================
17. HOME PAGE
============================================================
Hero:
Eyebrow:
ORAL HERITAGE · AI · AUDIO
Title:
VOICE ROOTS
Main heading:
"Preserve the voices that carry our heritage."
Supporting text:
"Record oral stories, traditional songs, endangered languages and community memories with AI-assisted transcription and translation."
Primary CTA:
Explore Heritage
Secondary CTA:
Preserve a Voice
Sections:
Featured Oral Heritage
Recently Preserved
Explore Languages
Explore Regions
How Voice Roots Works
Avoid too many competing buttons.
============================================================
18. EXPLORE PAGE
============================================================
Include:
Search
Languages
Regions
Communities
Themes
Story cards.
Story card:
Image
Title
Language
Region
Duration
Description
Verification
Play button
============================================================
19. ARCHIVE PAGE
============================================================
Premium cultural library.
Filters:
Language
State
District
Subdistrict
Village
Community
Theme
Heritage Type
Verification
Access
Support:
Grid view
List view
============================================================
20. SEARCH
============================================================
Search placeholder:
"Search stories, languages, people, traditions..."
Search:
- Story title
- Transcript
- Language
- Region
- Community
- Cultural topics
============================================================
21. STORY DETAILS
============================================================
Show:
Title
Language
Region
Community
Contributor
Verification
Primary action:
"Listen to Original Recording"
Audio player:
Play/Pause
Progress
Waveform
Current time
Duration
Volume
Sections:
Original Transcript
Translation
Cultural Context
Metadata
Clearly label:
ORIGINAL RECORDING
AI-GENERATED TRANSCRIPT
AI TRANSLATION
AI-ASSISTED CULTURAL CONTEXT
HUMAN VERIFIED
============================================================
22. RECORDING PAGE
============================================================
Create a professional recording studio.
States:
Permission
Ready
Recording
Paused
Stopped
Processing
Complete
Show:
Microphone
Timer
Waveform
Pause
Stop
Cancel
Save
Original audio must be preserved exactly.
Never overwrite original audio.
============================================================
23. UPLOAD PAGE
============================================================
Desktop:
Drag and drop.
Mobile:
File picker.
Supported:
WAV
MP3
M4A
AAC
Show:
Filename
Duration
Size
Upload progress
Button:
Process Recording
Never show fake upload success.
============================================================
24. AI PROCESSING PAGE
============================================================
Show actual processing state.
Example:
✓ Audio received
✓ Detecting language
● Creating transcript
○ Generating translation
○ Preparing cultural context
Never fake AI completion.
If a job fails:
Show:
- What failed
- Retry option
- Error state
- Preserve already completed work
============================================================
25. LANGUAGE DETECTION
============================================================
Audio:
↓
AI language detection
Then:
Detected language
Confidence
User confirms.
AI detection is a suggestion.
Confirmed source language must be stored separately.
Never silently trust AI detection.
============================================================
26. TRANSCRIPT PAGE
============================================================
Show:
Original audio
Synchronized transcript
Timestamps
Speaker labels where available
Editable transcript
Clicking a transcript segment should seek the audio.
Statuses:
AI GENERATED
HUMAN EDITED
HUMAN VERIFIED
Original audio remains primary.
============================================================
27. TRANSLATION PAGE
============================================================
Target languages:
English
Telugu
Hindi
Tamil
Kannada
Malayalam
Desktop:
Side-by-side
Original | Translation
Mobile:
Tabs.
NEVER replace the original transcript.
Translation is a separate artifact.
============================================================
28. TRANSLATED AUDIO
============================================================
Correct pipeline:
Original Audio
↓
Source Language Detection
↓
Speech-to-Text
↓
Transcript Review
↓
Translate Transcript
↓
Target Language TTS
↓
Translated Audio
Example:
Original recording:
Telugu
User chooses:
English
Result:
Original audio:
Telugu
Translation text:
English
Translated audio:
English
Never play Telugu audio while labeling it as English.
If TTS fails:
Show retry.
Keep translated text available.
Never fake TTS success.
============================================================
29. AUDIO DATA MODEL
============================================================
Use separate audio tracks.
audio_tracks:
ORIGINAL
language = source language
TRANSLATED
language = target language
Original audio must never be replaced.
============================================================
30. TRANSLATION DATA
============================================================
translations:
storyId
sourceLanguageId
targetLanguageId
translatedText
status
translation_audio:
translationId
storyId
sourceLanguageId
targetLanguageId
audioUrl
ttsProvider
voiceId
status
Cache generated target audio.
============================================================
31. CULTURAL CONTEXT
============================================================
Show:
Story Background
Cultural Meaning
Tradition
Community
Region
Important Terms
Related Stories
Clearly label:
AI-ASSISTED
Never present uncertain AI cultural claims as verified facts.
============================================================
32. CONSENT
============================================================
Consent options:
Preserve recording
Generate transcript
Generate translation
AI analysis
Access:
PUBLIC
COMMUNITY ONLY
PRIVATE
RESTRICTED
Show clear consent summary.
Consent must be stored and auditable.
============================================================
33. HUMAN VERIFICATION
============================================================
Verification flow:
AI PROCESSED
↓
HUMAN REVIEW
↓
COMMUNITY VERIFIED
↓
VERIFIED
↓
PUBLISHED
Reviewer sees:
Original audio
Transcript
Translation
Cultural context
Actions:
Approve
Request Changes
Reject
Never display:
VERIFIED
unless actual verification happened.
============================================================
34. HERITAGE RECORD
============================================================
Create a permanent structured heritage record after verification.
Include:
Story
Original recording
Original language
Transcript
Translation
Community
Location
Contributor
Verification
Provenance
Preservation metadata
============================================================
35. HERITAGE PASSPORT
============================================================
Premium digital heritage document.
Include:
VOICE ROOTS
HERITAGE PASSPORT
Record ID
Story title
Original language
Region
Community
Contributor alias
Original recording
Transcript
Translations
Topics
Preservation date
Verification status
AI GENERATED
HUMAN REVIEWED
COMMUNITY VERIFIED
QR CODE
Buttons:
Share Passport
Download Passport
Passport must only become available after appropriate verification.
============================================================
36. PROFILE
============================================================
Show:
Name
Preferred language
Region
Contributions
Preserved stories
Verified stories
Saved stories
============================================================
37. SETTINGS
============================================================
Sections:
Language
Privacy
Consent
Notifications
Account
Data
Delete Account
============================================================
38. MULTILINGUAL UI
============================================================
Supported UI languages:
English
Telugu
Hindi
Tamil
Kannada
Malayalam
Use proper i18n.
Do NOT hardcode translations into components.
Keep these separate:
App Language
Story Language
Translation Language
============================================================
39. INDIA LANGUAGE / LOCATION SYSTEM
============================================================
Voice Roots must support India-wide language and location data.
Hierarchy:
India
↓
State / Union Territory
↓
District
↓
Subdistrict
(Mandal / Taluk / Tehsil / Block etc.)
↓
Village / Locality
↓
Community
↓
Language
↓
Variety / Dialect
↓
Story
Use normalized IDs.
Do NOT use uncontrolled free text for core geography.
============================================================
40. OFFICIAL / COMMUNITY DATA STATUS
============================================================
Data must distinguish:
OFFICIAL
CENSUS_REPORTED
COMMUNITY_REPORTED
FIELD_VERIFIED
AI_SUGGESTED
UNVERIFIED
Never fabricate:
Village → Language
relationships.
If data is unknown:
show unknown/unverified.
Do not invent data.
============================================================
41. CENSUS DATA
============================================================
Use official sources where available.
Baseline:
Census of India C-16 Population by Mother Tongue, India 2011
PC11_C16-00
Andhra Pradesh:
PC11_C16-28
Also use:
Census Language Atlas 2011
Current administrative data:
LGD or equivalent current official geography source.
IMPORTANT:
C-16 is NOT a village-by-village language directory.
Never fabricate village-level language mappings.
============================================================
42. HISTORICAL GEOGRAPHY
============================================================
Andhra Pradesh Census 2011 geography may represent historical/pre-bifurcation boundaries.
Never overwrite historical geography with current geography.
Store:
sourceYear = 2011
geographyVersion = CENSUS_2011
Use crosswalks to current geography.
============================================================
43. DATABASE TABLES
============================================================
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
stories
audio_tracks
transcripts
translations
translation_audio
workflow_records
consents
verification_records
heritage_records
heritage_passports
ai_jobs
ai_artifacts
audit_events
============================================================
44. CORE LOCATION MODELS
============================================================
countries:
id
name
iso2
iso3
Seed:
India
IN
IND
states:
id
countryId
name
officialCode
type
districts:
id
stateId
name
officialCode
subdistricts:
id
districtId
name
officialCode
type
types:
MANDAL
TALUK
TEHSIL
BLOCK
SUBDIVISION
OTHER
localities:
id
countryId
stateId
districtId
subdistrictId
name
officialCode
type
lat
lon
sourceId
sourceYear
============================================================
45. LANGUAGE MODELS
============================================================
languages:
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
language_varieties:
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
dialects:
id
languageId
name
nativeName
region
description
verificationStatus
communities:
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
============================================================
46. LANGUAGE LOCATION MODEL
============================================================
language_locations:
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
============================================================
47. CENSUS OBSERVATION MODEL
============================================================
census_language_observations:
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
============================================================
48. DATA SOURCES
============================================================
data_sources:
id
organization
datasetName
datasetVersion
sourceUrl
sourceYear
retrievedAt
license
notes
============================================================
49. AUDIT LOG
============================================================
data_audit_log:
id
entityType
entityId
action
oldValue
newValue
changedBy
reason
createdAt
============================================================
50. STORY LOCATION MODEL
============================================================
Every story should support:
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
============================================================
51. CASCADING LOCATION SELECTORS
============================================================
Preservation form:
Country
↓
State / UT
↓
District
↓
Subdistrict
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
Record / Upload
Use server-side search and pagination.
Do NOT load the entire India village database into the browser.
============================================================
52. LANGUAGE CARD RULE
============================================================
Story card language must ALWAYS represent the language of the ORIGINAL recording.
Examples:
TELUGU · TELANGANA, INDIA
ENGLISH · TELANGANA, INDIA
TELUGU · KALESHWARAM, TELANGANA
KONDA · MAREDUMILLI AGENCY, EAST GODAVARI
TULU · UDUPI & MANGALORE COASTLINE, KARNATAKA
Never set:
story.language = selectedTranslationLanguage
Never set:
card.language = current UI language
============================================================
53. LANGUAGE SEPARATION
============================================================
Keep these separate:
Original/source language
Translation language
Translated audio language
UI language
Original source language is immutable unless corrected through a controlled workflow.
============================================================
54. EXPLORE LANGUAGE PAGES
============================================================
Routes:
/explore/language/:languageId
/explore/location/:localityId
/explore/state/:stateId
Language page:
Language
Native name
Language family
Regions
States
Districts
Communities
Stories
Location page:
Locality
Subdistrict
District
State
Languages
Communities
Stories
State page:
State
Districts
Languages
Communities
Stories
============================================================
55. COMMUNITY SUBMISSIONS
============================================================
Allow users/community members to submit:
Language
Native name
Community
State
District
Village
Evidence/source
Optional recording
Initial status:
PENDING_REVIEW
Then:
COMMUNITY_REPORTED
Then, where appropriately reviewed:
FIELD_VERIFIED
Never automatically mark user-submitted data as official.
============================================================
56. ADMIN DATA
============================================================
Admin-only:
/admin/data
Functions:
Language review
Location review
Community submission review
Duplicate merging
Corrections
Source management
Audit history
Verification
Admin page must NOT appear in normal user navigation.
============================================================
57. AI ARCHITECTURE
============================================================
Every AI operation is a job.
Operations:
Speech-to-Text
Language Detection
Translation
TTS
Cultural Context
AI Assistant
AI job states:
QUEUED
RUNNING
SUCCEEDED
FAILED
RETRYING
CANCELLED
============================================================
58. AI JOB MODEL
============================================================
ai_jobs:
jobId
storyId
operationType
status
provider
model
modelVersion
attemptCount
createdAt
startedAt
completedAt
error
inputReference
outputReference
============================================================
59. AI SAFETY / RETRY
============================================================
Only retry recoverable failures.
Use bounded retries.
Use idempotency keys.
Retries must NOT create duplicate outputs.
TTS must reuse valid existing audio when possible.
Original audio must NEVER be modified.
Recover stale RUNNING jobs.
Prevent concurrent duplicate workers.
Validate outputs before accepting them.
============================================================
60. AI PROVENANCE
============================================================
Every AI artifact must store:
Provider
Model
Model version
Operation
Job
Timestamp
Where appropriate:
Prompt version
Configuration
Confidence
Source artifact
Target language
Track source transcript version.
Example:
Transcript v2
must NOT incorrectly reuse
Translation v1
without validation.
============================================================
61. AI PROVIDER ABSTRACTION
============================================================
Use interfaces/abstractions:
STTProvider
LanguageDetectionProvider
TranslationProvider
TTSProvider
CulturalContextProvider
AI Assistant provider
Do not tightly couple the entire application to one AI vendor.
============================================================
62. AI AUDIT EVENTS
============================================================
Track:
JOB_CREATED
JOB_STARTED
JOB_RETRIED
JOB_SUCCEEDED
JOB_FAILED
OUTPUT_CREATED
OUTPUT_REPLACED
OUTPUT_INVALIDATED
============================================================
63. AI ASSISTANT
============================================================
Desktop:
Right-side panel.
Mobile:
Bottom sheet.
Actions:
Explain Story
Summarize
Translate
Explain Transcript
Ask Question
Explain Cultural Context
AI assistant must respect:
- Permissions
- Consent
- Access level
- Story status
- Verification status
Do not expose private/restricted content.
============================================================
64. OFFLINE-FIRST DRAFT SUPPORT
============================================================
Where practical, preserve locally:
Recording draft
Upload state
Transcript edits
Translation state
Consent state
Display:
OFFLINE — SAVED LOCALLY
SYNCING...
SYNCED
Never claim cloud AI completed offline.
============================================================
65. SECURITY
============================================================
Implement:
Authentication
Authorization
RBAC
Input validation
File validation
Upload limits
Secure storage
Signed URLs where appropriate
Rate limiting
Audit logging
CSRF protection where applicable
Secure session/token handling
Server-side permission checks
HTTPS in production
Secure environment variables
Private recordings must never become public accidentally.
============================================================
66. BACKEND SOURCE OF TRUTH
============================================================
The backend is the source of truth for:
Authentication
Authorization
Workflow state
Consent
Verification
Access control
AI job status
Heritage Passport availability
Published state
Never rely solely on frontend state.
============================================================
67. PASSPORT SECURITY
============================================================
/api/passports
must only succeed when:
workflow.status === VERIFIED
and
heritage record exists.
Do NOT create a passport merely because frontend says:
verified = true
============================================================
68. DATABASE MIGRATION SAFETY
============================================================
Before modifying schema:
1. Inspect current schema.
2. Inspect migrations.
3. Inspect existing models.
4. Inspect relationships.
5. Inspect production assumptions.
Never directly modify production database.
Use migrations.
Preferred strategy:
EXPAND
↓
MIGRATE / BACKFILL
↓
SWITCH APPLICATION
↓
CONTRACT
Never drop data without explicit approval.
Never destroy IDs.
Never destroy historical relationships.
Never destroy timestamps.
Never destroy provenance.
Do not edit already-applied migrations.
Create a new migration.
Validate:
Foreign keys
Orphans
Nullability
Indexes
Enums
Status values
Test:
Empty database
Realistic database
Migration path
Rollback/recovery for risky migrations
============================================================
69. DATA IMPORT
============================================================
Suggested scripts:
scripts/india-data/import-census-c16.js
scripts/india-data/import-ap-c16.js
scripts/india-data/normalize-languages.js
scripts/india-data/normalize-locations.js
scripts/india-data/validate-import.js
scripts/india-data/seed-database.js
Imports must be:
Idempotent
Repeatable
Stable
Based on official IDs/source IDs where possible.
============================================================
70. FRONTEND DATA PERFORMANCE
============================================================
Do not load:
all villages
all languages
all districts
all stories
into the browser at once.
Use:
Pagination
Search
Server-side filtering
Indexed database queries
Caching where appropriate
Lazy loading
============================================================
71. ERROR HANDLING
============================================================
Never hide errors.
Every important operation needs:
Loading state
Success state
Error state
Retry state
Empty state
Examples:
Upload failed
Translation failed
TTS failed
Transcript failed
Verification pending
No stories found
No translation available
No community information available
============================================================
72. TRUST / TRANSPARENCY
============================================================
Users should always understand:
What is original?
What was generated by AI?
What was edited?
What was verified?
Who verified it?
What consent was given?
Who can access the recording?
Do not hide this information.
============================================================
73. ACCESS LEVELS
============================================================
Support:
PUBLIC
COMMUNITY_ONLY
PRIVATE
RESTRICTED
Access must be enforced server-side.
============================================================
74. UI CONTENT RULE
============================================================
Do not create fake cultural facts.
Do not invent:
Languages
Villages
Communities
Traditions
Historical facts
Cultural meanings
Language relationships
If data is unknown:
Say:
"Information not yet verified."
============================================================
75. PROJECT QUALITY
============================================================
The website must feel like a real production product.
Not:
- Student demo
- Generic dashboard
- Template website
- AI-generated prototype
It should feel like:
A premium cultural preservation platform.
============================================================
76. CODE QUALITY
============================================================
Use:
Reusable components
Reusable services
Clear folder structure
Typed data where applicable
Central API layer
Central workflow state
Central authorization
Central i18n
Central design tokens
Central error handling
Avoid:
Duplicate logic
Hardcoded workflow checks everywhere
Hardcoded translations
Hardcoded location lists
Hardcoded fake AI responses
Huge components
Uncontrolled global state
============================================================
77. DAILY DEVELOPMENT GUARD
============================================================
Before changing code:
INSPECT FIRST.
Understand:
Existing files
Existing components
Existing API
Existing database
Existing routes
Existing workflow
Existing tests
Then make the smallest necessary change.
Never break working features to add something new.
Never perform destructive changes without approval.
Never fabricate data.
Never bypass workflow.
Never bypass consent.
Never bypass verification.
Never change original audio.
Never change original transcript silently.
Never claim something is complete without testing it.
============================================================
78. TESTING
============================================================
Before declaring success:
Run:
Lint
Typecheck
Unit tests
Integration tests
Build
Migration checks
Workflow tests
Authorization tests
Responsive tests
Smoke tests
AI job tests
Audio tests
Translation tests
Passport access tests
Consent tests
============================================================
79. CRITICAL TEST CASES
============================================================
Test:
New story
Record audio
Upload audio
Language detection
Confirm language
Generate transcript
Edit transcript
Translate
Generate translated audio
Cultural context
Consent
Human review
Verification
Heritage record
Passport
Publish
Also test:
Refresh browser
Back button
Invalid route
Unauthorized user
Private story
Restricted story
Failed upload
Failed transcript
Failed translation
Failed TTS
Retry
Duplicate request
Concurrent AI job
Stale job recovery
Database migration
============================================================
80. RESPONSIVE TESTING
============================================================
Test mobile:
320px
375px
390px
430px
Tablet:
768px
820px
Desktop:
1024px
1280px
1440px
1600px
1920px
Check:
No horizontal overflow
No overlapping elements
No hidden content
No navigation collision
No tiny controls
No broken audio player
No broken cards
No broken modals
No broken bottom sheet
============================================================
81. PRODUCTION AUDIT
============================================================
Before launch, perform a production audit.
Check:
Production build
Environment variables
Secrets
Database
Audio storage
Private audio
Restricted audio
Authentication
Authorization
CORS
Domain
HTTPS
AI credentials
STT
Translation
TTS
AI retry
AI provenance
Workflow backend
Consent
Verification
Passport access
Archive
Search
Responsive design
Error handling
Logging
Backups
Recovery
============================================================
82. PRODUCTION AUDIT OUTPUT
============================================================
Report:
PASS
FAIL
BLOCKER
WARNING
For every failure:
File
Location
Problem
Impact
Recommended fix
Do NOT hide problems.
============================================================
83. RELEASE PROCESS
============================================================
Current project should be treated as:
FEATURE COMPLETE / STABLE
Release sequence:
Stable Build
↓
v1.0.0-rc1
↓
Production Audit
↓
Deploy
↓
5–10 User Tests
↓
Collect Feedback
↓
Fix Confirmed Problems
↓
v1.0.0 PUBLIC RELEASE
Do NOT introduce major new features before first user feedback.
Protect the known-good baseline.
============================================================
84. FIRST USER TEST
============================================================
Use 5–10 testers.
Task:
"Preserve one real oral story or community memory from beginning to end."
Observe:
Can the user understand the product?
Can they record/upload?
Can they understand the language flow?
Can they review transcript?
Can they understand translation?
Can they understand consent?
Can they understand verification?
Can they find the Heritage Passport?
Can they understand what AI did?
Can they trust the preservation process?
Primary metric:
"Can a first-time user preserve one real voice without someone explaining the workflow?"
============================================================
85. PROJECT SUCCESS CRITERIA
============================================================
Voice Roots is successful when:
A first-time user can:
1. Enter the website.
2. Explore heritage.
3. Discover a story.
4. Listen to the original recording.
5. Start preserving a voice.
6. Record or upload.
7. Detect/confirm language.
8. Generate transcript.
9. Review transcript.
10. Translate transcript.
11. Generate translated audio.
12. Add cultural context.
13. Give consent.
14. Submit for human review.
15. Get verified.
16. Create a Heritage Record.
17. Generate a Heritage Passport.
18. Share the preserved story.
All without breaking workflow rules.
============================================================
86. FINAL PRODUCT PRINCIPLE
============================================================
The platform must always prioritize:
CULTURE OVER AI
ORIGINAL OVER GENERATED
CONSENT OVER CONVENIENCE
COMMUNITY OVER ASSUMPTION
VERIFICATION OVER CLAIMS
PRESERVATION OVER AUTOMATION
TRUST OVER SPEED
The AI is an assistant.
The human/community voice is the source.
The original recording is the heritage artifact.
============================================================
87. FINAL DEVELOPMENT INSTRUCTION
============================================================
Build Voice Roots as a production-quality responsive website.
Do not simplify the preservation workflow.
Do not remove verification.
Do not remove consent.
Do not bypass workflow states.
Do not fabricate language/location/community data.
Do not replace original recordings.
Do not mix source language with translation language.
Do not create a separate mobile application.
Do not add unnecessary features.
Preserve existing working functionality.
Use the approved Voice Roots design system.
Use the provided visual references as inspiration only.
Build clean, scalable, secure, accessible, responsive code.
Test before claiming completion.
When making changes, report:
1. Files changed
2. Features changed
3. Database changes
4. API changes
5. Workflow changes
6. Tests executed
7. Test results
8. Any warnings
9. Any blockers
If something is uncertain or potentially destructive:
STOP and ask for approval.
============================================================
FINAL COMMAND
============================================================
Now inspect the existing Voice Roots VS Code workspace first.
Do NOT blindly rewrite the project.
Determine what has already been implemented.
Compare the existing implementation against this master specification.
Preserve everything that is already working.
Fix only confirmed gaps, bugs, security issues, workflow violations, data integrity problems, or responsive UI problems.
Do not introduce unnecessary architecture changes.
Do not create a new project.
Do not replace the existing application.
The objective is to bring the existing Voice Roots website to a stable, production-ready v1.0.0 release while preserving the approved design and the complete Voice → Transcribe → Translate → Understand → Preserve workflow.
============================================================
END OF VOICE ROOTS MASTER PROMPT
============================================================

✅ Current target

Based on everything we’ve built and reviewed, I would treat Voice Roots as feature-complete/stable rather than starting another major development cycle.

Next official path:

Stable build → v1.0.0-rc1 → production audit → deploy → 5–10 real-user test → fix confirmed issues → v1.0.0 launch. 🚀

This prompt is intentionally written as a master specification, so if you give it to another coding AI later, it has the full product context rather than only a small feature request.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-10-09T02:20:36+05:30.

The user's current state is as follows:
Active Document: /Users/harsha/Desktop/project 2/voice-roots/flutter_app/lib/app/theme.dart (LANGUAGE_UNSPECIFIED)
Cursor is on line: 75
Other open documents:
- /Users/harsha/Desktop/project 2/voice-roots/MASTER_SPECIFICATION.md (LANGUAGE_UNSPECIFIED)
- /Users/harsha/Desktop/project 2/voice-roots/web/src/app/explore/page.tsx (LANGUAGE_UNSPECIFIED)
- /Users/harsha/Desktop/project 2/voice-roots/web/src/app/api/public/heritage/[id]/route.ts (LANGUAGE_UNSPECIFIED)
- /Users/harsha/Desktop/project 2/voice-roots/web/src/components/ui/ResumeDraftBanner.tsx (LANGUAGE_UNSPECIFIED)
- /Users/harsha/Desktop/project 2/voice-roots/VOICE_ROOTS_152_POINT_QA_REPORT.md (LANGUAGE_UNSPECIFIED)
</ADDITIONAL_METADATA>