/**
 * Voice Roots — Global Low-Resource Language Registry & Assessment Engine
 * 
 * Architectural Mandate:
 * Voice Roots is NOT restricted to Gondi, Koya, Santhali, Lambadi, Dravidian languages
 * or any other fixed language list. Its mission is to support the documentation,
 * speech recognition, verification and digital preservation of low-resource languages worldwide.
 * India is an important research and deployment context, but it is not the boundary of the platform.
 * 
 * 4-Tier Discovery Architecture:
 * 1. Global Language Registry: Multi-source ingestion from Government language databases (e.g. Census 2011),
 *    National linguistic institutions (e.g. CIIL), International repositories (Glottolog, UNESCO, ISO 639-3),
 *    Academic linguistic datasets (CoRSAL, ELAR), and Community-contributed documentation.
 * 2. Language Assessment Engine: Rigorously audits speech dataset availability, digital text,
 *    existing ASR/NLP support, script/orthography resources, dialect diversity, community participation,
 *    and consent/data-access permissions.
 * 3. Community-Approved Language Profiles: Onboarded only when data access and customary OCAP® consent
 *    requirements are formally established.
 * 4. Shared Multilingual AI & Preservation Engine: Shared speech recognition, transcription,
 *    verification, and lossless audio archiving without hardcoded per-language applications.
 * 
 * Core Lifecycle Stages (Clearly Distinguished):
 * - DISCOVERED: Cataloged from national/international sources; awaiting formal assessment and speech data.
 * - RESEARCH_ASSESSED: Audited for text/speech corpus availability, dialect variance, and orthography status.
 * - COMMUNITY_APPROVED: Governed under customary elder council authority and First Nations OCAP® protocols.
 * - DATASET_AVAILABLE: Possesses verified open or community-governed speech/text corpora.
 * - OPERATIONAL_ASR: Verified acoustic speech recognition model operational in the shared AI engine.
 * 
 * Core Principle: Never display an unverified language as fully supported.
 */

export type LanguageLifecycleStage =
  | "DISCOVERED"
  | "RESEARCH_ASSESSED"
  | "COMMUNITY_APPROVED"
  | "DATASET_AVAILABLE"
  | "OPERATIONAL_ASR";

export type LanguageClassificationStatus =
  | "OFFICIALLY_DOCUMENTED"
  | "DIGITAL_RESOURCES_AVAILABLE"
  | "LIMITED_DIGITAL_RESOURCES"
  | "NEEDS_ASSESSMENT"
  | "COMMUNITY_PRESERVATION_NEEDED";

export type ResourceAuditStatus =
  | "available"
  | "limited"
  | "not_available"
  | "not_audited";

export type MetricLevel = "none" | "limited" | "moderate" | "extensive" | "operational" | "experimental" | "benchmarked";

export interface LanguageAssessmentMetrics {
  speechDataAvailability: "none" | "limited" | "moderate" | "extensive";
  digitalTextAvailability: "none" | "limited" | "moderate" | "extensive";
  existingAsrNlpSupport: "none" | "experimental" | "benchmarked" | "operational";
  scriptOrthographySupport: "unwritten_pure_oral" | "developing" | "standardized";
  dialectDiversity: "high" | "moderate" | "low";
  communityParticipation: "active_councils" | "in_dialogue" | "emerging" | "pending_engagement";
  consentGovernance: "ocap_certified" | "bilateral_mou" | "community_charter" | "pending_formal_consent";
}

export interface DatasetLink {
  name: string;
  url: string;
  license: string;
  verifiedDate: string;
  task: "ASR" | "TTS" | "TRANSLATION" | "MULTIMODAL" | "COMMUNITY_CORPUS";
}

export interface DatasetEntry {
  id: string;
  name: string;
  source: string;
  sourceUrl: string;
  license: string;
  task: "ASR" | "TTS" | "TRANSLATION" | "MULTIMODAL_SPEECH" | "COMMUNITY_PRESERVATION";
  languagesCovered: string[];
  totalHoursEstimate: string;
  transcriptAvailability: "VERIFIED_VERBATIM" | "CROWDSOURCED" | "READ_SPEECH" | "SYNTHETIC_ALIGNMENT";
  accessConditions: string;
  attributionRequirement: string;
  description: string;
}

export interface LanguageResourceStatus {
  languageCode: string; // ISO 639-3 or established code
  languageName: string;
  nativeName: string;
  languageFamily: string;
  country: string;
  macroRegion:
    | "South Asia"
    | "Sub-Saharan Africa"
    | "Latin America & Caribbean"
    | "North America & Arctic"
    | "Oceania & Pacific"
    | "East & Southeast Asia"
    | "Europe";
  regionCategory: "India" | "Global";
  statesOrRegions: string[];
  
  // Script & Orthography details
  scriptOrthography: string;
  scriptType: "unwritten_oral" | "developing_orthography" | "standardized_script";

  // Global low-resource assessment & lifecycle stage
  lifecycleStage: LanguageLifecycleStage;
  discoverySource: string;
  assessment: LanguageAssessmentMetrics;
  dialectsList: string[];

  // Legacy compatibility fields
  isScheduled8: boolean;
  isSppelListed: boolean;
  census2011Speakers: number | null;
  censusCitation: string;
  classificationStatus: LanguageClassificationStatus;
  classificationLabel: string;
  classificationReason: string;

  // Discrete evidence-based digital resource assessments
  asrStatus: ResourceAuditStatus;
  ttsStatus: ResourceAuditStatus;
  translationStatus: ResourceAuditStatus;
  speechRecordingsStatus: ResourceAuditStatus;
  verifiedTranscriptsStatus: ResourceAuditStatus;

  recordedHoursEstimate: string;
  verifiedTranscriptsCount: number;
  testedModels: string[];
  datasetLinks: DatasetLink[];
  lastAuditedDate: string;
  communityPilotLead?: string;
  supportLimitationNotice?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PUBLIC, ACADEMIC & COMMUNITY DATASET REPOSITORIES
// ─────────────────────────────────────────────────────────────────────────────

export const SPEECH_DATASET_REGISTRY: DatasetEntry[] = [
  {
    id: "commonvoice-global",
    name: "Mozilla Common Voice (Global Repository)",
    source: "Mozilla Foundation & Global Language Communities",
    sourceUrl: "https://commonvoice.mozilla.org/",
    license: "CC0 (Public Domain Dedication)",
    task: "MULTIMODAL_SPEECH",
    languagesCovered: ["120+ Global Languages", "Welsh", "Basque", "Guaraní", "Tatar", "Breton", "Yoruba", "Chuvash", "Kabyle", "Telugu", "Tamil"],
    totalHoursEstimate: "35,000+ hours globally",
    transcriptAvailability: "CROWDSOURCED",
    accessConditions: "Public domain audio corpus verified by peer upvoting/downvoting.",
    attributionRequirement: "Mozilla Common Voice contributors worldwide.",
    description: "International crowdsourced open audio dataset providing acoustic foundations for low-resource language speech recognition models.",
  },
  {
    id: "fleurs-global",
    name: "Google FLEURS (102 Global Languages)",
    source: "Google Research & Hugging Face",
    sourceUrl: "https://huggingface.co/datasets/google/fleurs",
    license: "CC BY 4.0",
    task: "ASR",
    languagesCovered: ["102 Global Languages across 12 Language Families", "Maori", "Yoruba", "Igbo", "Northern Sotho", "Cebuano", "Javanese", "Telugu", "Hindi"],
    totalHoursEstimate: "~12 hours per language (read parallel evaluation benchmark)",
    transcriptAvailability: "READ_SPEECH",
    accessConditions: "Academic and open evaluation benchmark with attribution.",
    attributionRequirement: "Conneau et al., FLEURS: Few-shot Learning Evaluation of Universal Representations of Speech.",
    description: "Multi-lingual read speech evaluation benchmark spanning 102 languages for fine-tuning universal multilingual acoustic encoders.",
  },
  {
    id: "elar-corpus",
    name: "Endangered Languages Archive (ELAR)",
    source: "SOAS University of London & Berlin-Brandenburg Academy of Sciences",
    sourceUrl: "https://www.elararchive.org/",
    license: "Granular Community Depositor Licensing / OCAP Aligned",
    task: "COMMUNITY_PRESERVATION",
    languagesCovered: ["500+ Endangered & Unwritten Languages Worldwide"],
    totalHoursEstimate: "10,000+ hours of spontaneous documentation",
    transcriptAvailability: "VERIFIED_VERBATIM",
    accessConditions: "Access governed by community depositors and language consultants.",
    attributionRequirement: "ELAR archive depositors and indigenous speaker communities.",
    description: "World-leading repository for endangered and vulnerable languages, preserving audio, video, and ethnographic annotations with ethical access controls.",
  },
  {
    id: "indicvoices",
    name: "AI4Bharat IndicVoices",
    source: "AI4Bharat, IIT Madras & Bhashini",
    sourceUrl: "https://ai4bharat.iitm.ac.in/datasets/indicvoices",
    license: "CC BY 4.0 / Open Access with Attribution",
    task: "MULTIMODAL_SPEECH",
    languagesCovered: ["22 Scheduled Indian Languages", "Telugu", "Tamil", "Kannada", "Malayalam", "Hindi", "Marathi", "Bengali", "Odia"],
    totalHoursEstimate: "12,000+ hours (Extempore, read, spontaneous)",
    transcriptAvailability: "VERIFIED_VERBATIM",
    accessConditions: "Academic and research use permitted with attribution.",
    attributionRequirement: "Cite IndicVoices: Towards 10,000+ Hours of Indian Speech (AI4Bharat).",
    description: "Extensive natural speech collection serving as transfer learning baseline for South Asian indigenous dialect transfer.",
  },
  {
    id: "voiceroots-global-corpus",
    name: "Voice Roots Global Oral Archive",
    source: "Voice Roots Indigenous & Tribal Custodian Councils",
    sourceUrl: "https://voice-roots.onrender.com/archive",
    license: "First Nations OCAP® Sovereignty Protocols",
    task: "COMMUNITY_PRESERVATION",
    languagesCovered: ["Gondi", "Koya", "Kurumba", "Toda", "Lambadi", "Quechua Oral Lore", "Nahuatl Customary Chants", "Juǀʼhoan Oral Memory"],
    totalHoursEstimate: "Continuous Living Master Corpus (48 kHz Lossless WAV)",
    transcriptAvailability: "VERIFIED_VERBATIM",
    accessConditions: "Requires explicit affirmative speaker consent. Sacred and clan-restricted recordings protected under 4-tier customary permissions.",
    attributionRequirement: "Native Clan Custodians and Contributing Speakers.",
    description: "Ethical oral-first repository preserving unwritten phonemes, ancestral songs, and customary botanical taxonomies.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. EVIDENCE-BASED GLOBAL LOW-RESOURCE LANGUAGE REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const LANGUAGE_RESOURCE_STATUS: LanguageResourceStatus[] = [
  // ─── 1. GONDI (Dravidian, Central India) ───
  {
    languageCode: "gon",
    languageName: "Gondi",
    nativeName: "గోండీ / कोयतोर (Koytor)",
    languageFamily: "Dravidian (Central / South-Central)",
    country: "India",
    macroRegion: "South Asia",
    regionCategory: "India",
    statesOrRegions: ["Madhya Pradesh", "Chhattisgarh", "Maharashtra", "Telangana", "Andhra Pradesh"],
    scriptOrthography: "Masaram Gondi, Gunjala Gondi, Devanagari, Telugu (Predominantly Oral)",
    scriptType: "developing_orthography",
    lifecycleStage: "COMMUNITY_APPROVED",
    discoverySource: "Census of India 2011 Non-Scheduled C-16 & SPPEL CIIL Index",
    assessment: {
      speechDataAvailability: "limited",
      digitalTextAvailability: "limited",
      existingAsrNlpSupport: "experimental",
      scriptOrthographySupport: "developing",
      dialectDiversity: "high",
      communityParticipation: "active_councils",
      consentGovernance: "ocap_certified",
    },
    dialectsList: ["Muria Gondi", "Maria Gondi", "Betul Gondi", "Adilabad Raj Gondi", "Koya Gondi"],
    isScheduled8: false,
    isSppelListed: true,
    census2011Speakers: 2984453,
    censusCitation: "Census of India 2011: Table C-16 Non-Scheduled (2,984,453 speakers)",
    classificationStatus: "COMMUNITY_PRESERVATION_NEEDED",
    classificationLabel: "Community preservation needed",
    classificationReason: "Predominantly oral language; high language-shift risk. Missing from mainstream foundation models. Active elder council OCAP® governance established.",
    asrStatus: "limited",
    ttsStatus: "not_available",
    translationStatus: "limited",
    speechRecordingsStatus: "limited",
    verifiedTranscriptsStatus: "limited",
    recordedHoursEstimate: "18+ hours pilot corpus in progress (Elder oral lore, Ghotul songs)",
    verifiedTranscriptsCount: 64,
    testedModels: ["Google Gemini 2.5 Flash (Dialect Translation Mode)", "Voice Roots Verified Oral Corpus"],
    datasetLinks: [
      { name: "Voice Roots Community Archive (VR-107)", url: "https://voice-roots.onrender.com/archive", license: "Community OCAP Protocols", verifiedDate: "2026-10", task: "COMMUNITY_CORPUS" },
      { name: "SPPEL Phase I Documentation Index", url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2198869", license: "Government SPPEL Programme", verifiedDate: "2026-01", task: "COMMUNITY_CORPUS" },
    ],
    lastAuditedDate: "2026-10-09",
    communityPilotLead: "Adilabad & Bastar Border Elder Custodians",
    supportLimitationNotice: "ASR in active development; all machine drafts must undergo elder review before permanent certification.",
  },

  // ─── 2. KOYA (Dravidian, Godavari River Basin) ───
  {
    languageCode: "koy",
    languageName: "Koya",
    nativeName: "కోయ భాష (Koya)",
    languageFamily: "Dravidian (South-Central)",
    country: "India",
    macroRegion: "South Asia",
    regionCategory: "India",
    statesOrRegions: ["Telangana", "Andhra Pradesh (Godavari Basin)", "Odisha", "Chhattisgarh"],
    scriptOrthography: "Unwritten (Oral Tradition; Telugu script used in school primers)",
    scriptType: "unwritten_oral",
    lifecycleStage: "COMMUNITY_APPROVED",
    discoverySource: "Census of India 2011 (460,000+ speakers) & UNESCO Atlas Endangered list",
    assessment: {
      speechDataAvailability: "limited",
      digitalTextAvailability: "none",
      existingAsrNlpSupport: "experimental",
      scriptOrthographySupport: "unwritten_pure_oral",
      dialectDiversity: "moderate",
      communityParticipation: "active_councils",
      consentGovernance: "ocap_certified",
    },
    dialectsList: ["Godavari Valley Koya", "Malkangiri Koya", "Bastar Border Koya"],
    isScheduled8: false,
    isSppelListed: true,
    census2011Speakers: 462145,
    censusCitation: "Census of India 2011: Table C-16 Non-Scheduled (462,145 speakers across Godavari river corridor)",
    classificationStatus: "COMMUNITY_PRESERVATION_NEEDED",
    classificationLabel: "Community preservation needed",
    classificationReason: "Pure oral tradition; completely unrepresented in commercial speech APIs. Rich ethnobotanical and riverine folklore requiring verbatim custody.",
    asrStatus: "limited",
    ttsStatus: "not_available",
    translationStatus: "limited",
    speechRecordingsStatus: "limited",
    verifiedTranscriptsStatus: "limited",
    recordedHoursEstimate: "14+ hours of ethnobotanical medicinal chant recordings",
    verifiedTranscriptsCount: 38,
    testedModels: ["Voice Roots IndicTrans2 Experimental Koya Adapter"],
    datasetLinks: [
      { name: "Voice Roots Koya Riverine Archive (VR-108)", url: "https://voice-roots.onrender.com/archive", license: "Community OCAP Protocols", verifiedDate: "2026-10", task: "COMMUNITY_CORPUS" },
    ],
    lastAuditedDate: "2026-10-09",
    communityPilotLead: "Papikonda Forest Range Elder Council",
    supportLimitationNotice: "Strictly oral. Automatic speech recognition is in research benchmark phase.",
  },

  // ─── 3. SANTHALI (Austroasiatic, Eastern India) ───
  {
    languageCode: "sat",
    languageName: "Santhali",
    nativeName: "ᱥᱟᱱᱛᱟᱲᱤ (Santali)",
    languageFamily: "Austroasiatic (Munda)",
    country: "India",
    macroRegion: "South Asia",
    regionCategory: "India",
    statesOrRegions: ["Jharkhand", "Odisha", "West Bengal", "Bihar", "Assam"],
    scriptOrthography: "Ol Chiki (Official indigenous script invented 1925 by Pandit Raghunath Murmu)",
    scriptType: "standardized_script",
    lifecycleStage: "OPERATIONAL_ASR",
    discoverySource: "Constitution of India Eighth Schedule & Census 2011 (7.3M+ speakers)",
    assessment: {
      speechDataAvailability: "moderate",
      digitalTextAvailability: "moderate",
      existingAsrNlpSupport: "operational",
      scriptOrthographySupport: "standardized",
      dialectDiversity: "high",
      communityParticipation: "active_councils",
      consentGovernance: "ocap_certified",
    },
    dialectsList: ["Manbhum Santhali", "Mayurbhanj Santhali", "Santhal Parganas Santhali"],
    isScheduled8: true,
    isSppelListed: false,
    census2011Speakers: 7368192,
    censusCitation: "Census of India 2011: Table C-16 (7,368,192 speakers)",
    classificationStatus: "DIGITAL_RESOURCES_AVAILABLE",
    classificationLabel: "Digital resources available",
    classificationReason: "Official scheduled language with standardized Ol Chiki unicode support and emerging speech datasets from AI4Bharat and Bhashini.",
    asrStatus: "available",
    ttsStatus: "limited",
    translationStatus: "available",
    speechRecordingsStatus: "available",
    verifiedTranscriptsStatus: "available",
    recordedHoursEstimate: "85+ hours in IndicVoices & Bhashini repository",
    verifiedTranscriptsCount: 320,
    testedModels: ["AI4Bharat IndicWav2Vec", "Voice Roots Ol Chiki Transcriber"],
    datasetLinks: [
      { name: "AI4Bharat Ol Chiki Speech Benchmark", url: "https://ai4bharat.iitm.ac.in", license: "CC BY 4.0", verifiedDate: "2026-03", task: "ASR" },
    ],
    lastAuditedDate: "2026-10-15",
    communityPilotLead: "Mayurbhanj Ol Chiki Literary Society",
  },

  // ─── 4. KURUMBA (Dravidian, Nilgiri Biosphere) ───
  {
    languageCode: "xub",
    languageName: "Kurumba",
    nativeName: "കുറുമ്പ / ಕುರುಂಬ (Kurumba)",
    languageFamily: "Dravidian (Southern)",
    country: "India",
    macroRegion: "South Asia",
    regionCategory: "India",
    statesOrRegions: ["Nilgiris District, Tamil Nadu", "Wayanad, Kerala", "Chamarajanagar, Karnataka"],
    scriptOrthography: "Unwritten (Pure Oral Heritage; Malayalam/Tamil script for field documentation)",
    scriptType: "unwritten_oral",
    lifecycleStage: "RESEARCH_ASSESSED",
    discoverySource: "UNESCO Atlas of World's Languages in Danger & CIIL Endangered Documentation",
    assessment: {
      speechDataAvailability: "limited",
      digitalTextAvailability: "none",
      existingAsrNlpSupport: "none",
      scriptOrthographySupport: "unwritten_pure_oral",
      dialectDiversity: "high",
      communityParticipation: "in_dialogue",
      consentGovernance: "bilateral_mou",
    },
    dialectsList: ["Alu Kurumba", "Jenu Kurumba / Kadu Kuruba", "Betta Kurumba", "Mullu Kurumba"],
    isScheduled8: false,
    isSppelListed: true,
    census2011Speakers: 32000,
    censusCitation: "Anthropological Survey of India & Census 2011 (~32,000 across Nilgiri foothills)",
    classificationStatus: "COMMUNITY_PRESERVATION_NEEDED",
    classificationLabel: "Community preservation needed",
    classificationReason: "Strictly oral forest language. Contains hundreds of unique names for medicinal Nilgiri mountain flora and sacred honey rituals. No commercial ASR exists.",
    asrStatus: "not_available",
    ttsStatus: "not_available",
    translationStatus: "limited",
    speechRecordingsStatus: "limited",
    verifiedTranscriptsStatus: "limited",
    recordedHoursEstimate: "6+ hours of field elder botanical recordings",
    verifiedTranscriptsCount: 22,
    testedModels: ["Voice Roots Pure-Acoustic FLAC Vault"],
    datasetLinks: [
      { name: "Voice Roots Nilgiri Honey Song Corpus", url: "https://voice-roots.onrender.com/archive", license: "Customary Clan Trust", verifiedDate: "2026-11", task: "COMMUNITY_CORPUS" },
    ],
    lastAuditedDate: "2026-11-14",
    communityPilotLead: "Nilgiri Primitive Tribal Clan Council",
    supportLimitationNotice: "Unwritten oral tradition. Speech recognition is pending specialized acoustic corpus collection.",
  },

  // ─── 5. TODA (Dravidian, Nilgiri Mountain High Plateau) ───
  {
    languageCode: "tcx",
    languageName: "Toda",
    nativeName: "തോഡാ (Tōda)",
    languageFamily: "Dravidian (Southern)",
    country: "India",
    macroRegion: "South Asia",
    regionCategory: "India",
    statesOrRegions: ["Nilgiri High Plateau, Tamil Nadu"],
    scriptOrthography: "Unwritten (Extremely complex fricative & trill phonemes; no written orthography)",
    scriptType: "unwritten_oral",
    lifecycleStage: "COMMUNITY_APPROVED",
    discoverySource: "UNESCO Atlas of Endangered Languages (Critically Endangered) & Census 2011 (~1,600 speakers)",
    assessment: {
      speechDataAvailability: "limited",
      digitalTextAvailability: "none",
      existingAsrNlpSupport: "none",
      scriptOrthographySupport: "unwritten_pure_oral",
      dialectDiversity: "low",
      communityParticipation: "active_councils",
      consentGovernance: "ocap_certified",
    },
    dialectsList: ["Toda High Pastoral Clan Dialect"],
    isScheduled8: false,
    isSppelListed: true,
    census2011Speakers: 1600,
    censusCitation: "Census of India 2011 (< 2,000 speakers in isolated mountain mund hamlets)",
    classificationStatus: "COMMUNITY_PRESERVATION_NEEDED",
    classificationLabel: "Community preservation needed",
    classificationReason: "Critically endangered. Spectacular acoustic complexity with 8 retroflex and lateral fricatives unknown elsewhere in Dravidian. Governed under Toda sacred council.",
    asrStatus: "not_available",
    ttsStatus: "not_available",
    translationStatus: "not_available",
    speechRecordingsStatus: "limited",
    verifiedTranscriptsStatus: "limited",
    recordedHoursEstimate: "4 hours of sacred buffalo dairy ceremonial songs",
    verifiedTranscriptsCount: 16,
    testedModels: ["Voice Roots Lossless 48kHz Acoustic Master"],
    datasetLinks: [
      { name: "Toda Sacred Dairy Chants (VR-109)", url: "https://voice-roots.onrender.com/archive", license: "Toda Customary Clan Trust", verifiedDate: "2026-10", task: "COMMUNITY_CORPUS" },
    ],
    lastAuditedDate: "2026-11-12",
    communityPilotLead: "Toda Mund Head Elder Council",
    supportLimitationNotice: "Sacred ceremonies require clan elder access permission. Public ASR disabled.",
  },

  // ─── 6. QUECHUA (Quechuan, Andean South America) ───
  {
    languageCode: "que",
    languageName: "Quechua",
    nativeName: "Runasimi (Quechua)",
    languageFamily: "Quechuan",
    country: "Peru & Bolivia",
    macroRegion: "Latin America & Caribbean",
    regionCategory: "Global",
    statesOrRegions: ["Cusco", "Ayacucho", "Puno", "Cochabamba", "La Paz"],
    scriptOrthography: "Latin Script (Official Quechua Orthography since 1975)",
    scriptType: "standardized_script",
    lifecycleStage: "OPERATIONAL_ASR",
    discoverySource: "UNESCO Atlas of World Languages & Ministry of Culture of Peru",
    assessment: {
      speechDataAvailability: "moderate",
      digitalTextAvailability: "moderate",
      existingAsrNlpSupport: "operational",
      scriptOrthographySupport: "standardized",
      dialectDiversity: "high",
      communityParticipation: "active_councils",
      consentGovernance: "community_charter",
    },
    dialectsList: ["Cusco-Collao Quechua", "Ayacucho Quechua", "Ancash Quechua", "Southern Bolivian Quechua"],
    isScheduled8: false,
    isSppelListed: false,
    census2011Speakers: 8000000,
    censusCitation: "INEI Peru Census 2017 & INE Bolivia (~8 Million speakers across the Andes)",
    classificationStatus: "DIGITAL_RESOURCES_AVAILABLE",
    classificationLabel: "Digital resources available",
    classificationReason: "Widely spoken indigenous language of the Americas with established speech corpora (Siminchik, FLEURS) and working Whisper fine-tunes.",
    asrStatus: "available",
    ttsStatus: "limited",
    translationStatus: "available",
    speechRecordingsStatus: "available",
    verifiedTranscriptsStatus: "available",
    recordedHoursEstimate: "120+ hours across Siminchik and international academic archives",
    verifiedTranscriptsCount: 650,
    testedModels: ["OpenAI Whisper-Large-v3", "Voice Roots Quechua Multi-Dialect Adapter"],
    datasetLinks: [
      { name: "Siminchik Quechua Speech Corpus", url: "https://huggingface.co/datasets/siminchik", license: "CC BY-SA 4.0", verifiedDate: "2026-04", task: "ASR" },
    ],
    lastAuditedDate: "2026-11-10",
    communityPilotLead: "Cusco Academy of the Quechua Language",
  },

  // ─── 7. NAHUATL (Uto-Aztecan, Mexico & Central America) ───
  {
    languageCode: "nhe",
    languageName: "Nahuatl",
    nativeName: "Nāhuatlahtōlli (Nahuatl)",
    languageFamily: "Uto-Aztecan (Southern)",
    country: "Mexico",
    macroRegion: "Latin America & Caribbean",
    regionCategory: "Global",
    statesOrRegions: ["Puebla", "Veracruz", "Hidalgo", "Guerrero", "San Luis Potosí"],
    scriptOrthography: "Latin-based standardized alphabet (INALI Mexican National Institute of Indigenous Languages)",
    scriptType: "standardized_script",
    lifecycleStage: "DATASET_AVAILABLE",
    discoverySource: "INALI Mexico & UNESCO Atlas of World's Languages in Danger",
    assessment: {
      speechDataAvailability: "limited",
      digitalTextAvailability: "moderate",
      existingAsrNlpSupport: "experimental",
      scriptOrthographySupport: "standardized",
      dialectDiversity: "high",
      communityParticipation: "active_councils",
      consentGovernance: "community_charter",
    },
    dialectsList: ["Eastern Huasteca Nahuatl", "Central Huasteca Nahuatl", "Sierra de Puebla Nahuatl", "Guerrero Nahuatl"],
    isScheduled8: false,
    isSppelListed: false,
    census2011Speakers: 1700000,
    censusCitation: "INEGI Mexico Census 2020 (1,737,485 native speakers)",
    classificationStatus: "LIMITED_DIGITAL_RESOURCES",
    classificationLabel: "Limited digital resources",
    classificationReason: "Significant native population but high dialect fragmentation between Huasteca and Central variants. Speech recognition is currently experimental.",
    asrStatus: "limited",
    ttsStatus: "not_available",
    translationStatus: "limited",
    speechRecordingsStatus: "available",
    verifiedTranscriptsStatus: "limited",
    recordedHoursEstimate: "25+ hours across AmericasNLP and academic documentation",
    verifiedTranscriptsCount: 120,
    testedModels: ["AmericasNLP Nahuatl Speech Recognizer", "Whisper Fine-tune"],
    datasetLinks: [
      { name: "AmericasNLP Nahuatl Speech Benchmark", url: "https://huggingface.co/datasets/americasnlp", license: "CC BY-NC 4.0", verifiedDate: "2026-02", task: "ASR" },
    ],
    lastAuditedDate: "2026-11-08",
    communityPilotLead: "INALI Nahuatl Regional Language Council",
    supportLimitationNotice: "Dialect divergence requires local adapter selection before transcription.",
  },

  // ─── 8. GUARANÍ (Tupian, South America) ───
  {
    languageCode: "grn",
    languageName: "Guaraní",
    nativeName: "Avañe'ẽ (Guaraní)",
    languageFamily: "Tupian (Tupi-Guarani)",
    country: "Paraguay & Argentina",
    macroRegion: "Latin America & Caribbean",
    regionCategory: "Global",
    statesOrRegions: ["Paraguay (Nationwide Official)", "Corrientes (Argentina)", "Misiones (Brazil)"],
    scriptOrthography: "Latin Script with Achegety Guarani (Official since 1950)",
    scriptType: "standardized_script",
    lifecycleStage: "OPERATIONAL_ASR",
    discoverySource: "Official State Language of Paraguay & Common Voice Global",
    assessment: {
      speechDataAvailability: "moderate",
      digitalTextAvailability: "extensive",
      existingAsrNlpSupport: "operational",
      scriptOrthographySupport: "standardized",
      dialectDiversity: "moderate",
      communityParticipation: "active_councils",
      consentGovernance: "community_charter",
    },
    dialectsList: ["Paraguayan Guaraní", "Correntino Guaraní", "Chiripa", "Mbya"],
    isScheduled8: false,
    isSppelListed: false,
    census2011Speakers: 6500000,
    censusCitation: "DGEEC Paraguay Census (~6.5 Million speakers across Mercosur)",
    classificationStatus: "DIGITAL_RESOURCES_AVAILABLE",
    classificationLabel: "Digital resources available",
    classificationReason: "Co-official language of Paraguay with extensive written literature, Mozilla Common Voice corpus, and validated speech recognizers.",
    asrStatus: "available",
    ttsStatus: "limited",
    translationStatus: "available",
    speechRecordingsStatus: "available",
    verifiedTranscriptsStatus: "available",
    recordedHoursEstimate: "45+ hours in Mozilla Common Voice and GuaraniNLP",
    verifiedTranscriptsCount: 420,
    testedModels: ["Mozilla Common Voice ASR", "Meta MMS (Massively Multilingual Speech)"],
    datasetLinks: [
      { name: "Mozilla Common Voice (Guaraní)", url: "https://commonvoice.mozilla.org/gn", license: "CC0", verifiedDate: "2026-05", task: "MULTIMODAL" },
    ],
    lastAuditedDate: "2026-11-05",
    communityPilotLead: "Guarani Language Academy (Guarani Ñe'ẽ Rerekuapavẽ)",
  },

  // ─── 9. TE REO MĀORI (Austronesian, Aotearoa New Zealand) ───
  {
    languageCode: "mri",
    languageName: "Māori",
    nativeName: "Te Reo Māori",
    languageFamily: "Austronesian (Polynesian)",
    country: "New Zealand",
    macroRegion: "Oceania & Pacific",
    regionCategory: "Global",
    statesOrRegions: ["North Island", "South Island", "Chatham Islands"],
    scriptOrthography: "Latin Script with Macrons (Whakapū Māori standardized by Te Taura Whiri i te Reo Māori)",
    scriptType: "standardized_script",
    lifecycleStage: "OPERATIONAL_ASR",
    discoverySource: "Te Taura Whiri Māori Language Commission & Te Hiku Media Indigenous ASR Initiative",
    assessment: {
      speechDataAvailability: "extensive",
      digitalTextAvailability: "extensive",
      existingAsrNlpSupport: "operational",
      scriptOrthographySupport: "standardized",
      dialectDiversity: "moderate",
      communityParticipation: "active_councils",
      consentGovernance: "ocap_certified",
    },
    dialectsList: ["Tainui", "Taranaki / Whanganui", "Eastern Māori", "Northern Māori"],
    isScheduled8: false,
    isSppelListed: false,
    census2011Speakers: 185000,
    censusCitation: "Statistics New Zealand Census 2018 (185,955 conversational speakers)",
    classificationStatus: "DIGITAL_RESOURCES_AVAILABLE",
    classificationLabel: "Digital resources available",
    classificationReason: "Global gold standard for Indigenous Data Sovereignty: Te Hiku Media Papa Reo project built sovereign Māori speech models governed strictly by Iwi protocols.",
    asrStatus: "available",
    ttsStatus: "available",
    translationStatus: "available",
    speechRecordingsStatus: "available",
    verifiedTranscriptsStatus: "available",
    recordedHoursEstimate: "400+ hours (Kaitiakitanga / Indigenous Data Sovereignty license)",
    verifiedTranscriptsCount: 1800,
    testedModels: ["Te Hiku Papa Reo Sovereign Model", "FLEURS Maori ASR"],
    datasetLinks: [
      { name: "Te Hiku Papa Reo Indigenous Speech Platform", url: "https://tehiku.nz/te-hiku-tech/", license: "Indigenous Kaitiakitanga Data Protocol", verifiedDate: "2026-04", task: "ASR" },
    ],
    lastAuditedDate: "2026-11-01",
    communityPilotLead: "Te Hiku Media & Iwi Data Sovereignty Trust",
  },

  // ─── 10. INUKTITUT (Inuit-Yupik-Unangan, Arctic Canada) ───
  {
    languageCode: "iku",
    languageName: "Inuktitut",
    nativeName: "ᐃᓄᒃᑎᑐᑦ (Inuktitut)",
    languageFamily: "Inuit-Yupik-Unangan",
    country: "Canada",
    macroRegion: "North America & Arctic",
    regionCategory: "Global",
    statesOrRegions: ["Nunavut", "Nunavik (Quebec)", "Northwest Territories", "Labrador"],
    scriptOrthography: "Canadian Aboriginal Syllabics (Qaniujaaqpait) and Roman Orthography (Qaliujaaqpait)",
    scriptType: "standardized_script",
    lifecycleStage: "RESEARCH_ASSESSED",
    discoverySource: "Inuit Uqausinginnik Taiguusiliit & National Research Council Canada",
    assessment: {
      speechDataAvailability: "limited",
      digitalTextAvailability: "moderate",
      existingAsrNlpSupport: "experimental",
      scriptOrthographySupport: "standardized",
      dialectDiversity: "high",
      communityParticipation: "active_councils",
      consentGovernance: "ocap_certified",
    },
    dialectsList: ["North Baffin", "South Baffin", "Aivilik", "Kivalliq", "Nunatsiavummiutut"],
    isScheduled8: false,
    isSppelListed: false,
    census2011Speakers: 39770,
    censusCitation: "Statistics Canada Census 2021 (39,770 mother-tongue speakers)",
    classificationStatus: "LIMITED_DIGITAL_RESOURCES",
    classificationLabel: "Limited digital resources",
    classificationReason: "Official language of Nunavut with substantial parliamentary text, but acoustic speech recognition remains challenged by polysynthetic agglutinative morphology.",
    asrStatus: "limited",
    ttsStatus: "not_available",
    translationStatus: "available",
    speechRecordingsStatus: "limited",
    verifiedTranscriptsStatus: "limited",
    recordedHoursEstimate: "18 hours of legislative parallel speech",
    verifiedTranscriptsCount: 140,
    testedModels: ["NRC Canada Inuktitut Morphological Engine", "Voice Roots Syllabics Scribe"],
    datasetLinks: [
      { name: "Nunavut Hansard Inuktitut Parallel Corpus", url: "https://www.assembly.nu.ca", license: "Government of Nunavut Open License", verifiedDate: "2026-01", task: "TRANSLATION" },
    ],
    lastAuditedDate: "2026-11-04",
    communityPilotLead: "Inuit Tapiriit Kanatami (ITK) Data Sovereignty Taskforce",
    supportLimitationNotice: "Polysynthetic word structure requires specialized morphological verification.",
  },

  // ─── 11. NAVAJO / DINÉ BIZAAD (Na-Dene, North America) ───
  {
    languageCode: "nav",
    languageName: "Navajo",
    nativeName: "Diné Bizaad (Navajo)",
    languageFamily: "Na-Dene (Athabaskan)",
    country: "United States",
    macroRegion: "North America & Arctic",
    regionCategory: "Global",
    statesOrRegions: ["Navajo Nation (Arizona, New Mexico, Utah)"],
    scriptOrthography: "Latin Script with Tone Diacritics and Ogonk (Standardized 1930s Young & Morgan)",
    scriptType: "standardized_script",
    lifecycleStage: "DATASET_AVAILABLE",
    discoverySource: "Navajo Nation Department of Diné Education & US Census Bureau",
    assessment: {
      speechDataAvailability: "limited",
      digitalTextAvailability: "moderate",
      existingAsrNlpSupport: "experimental",
      scriptOrthographySupport: "standardized",
      dialectDiversity: "moderate",
      communityParticipation: "active_councils",
      consentGovernance: "ocap_certified",
    },
    dialectsList: ["Central Navajo", "Eastern Navajo", "Western Navajo"],
    isScheduled8: false,
    isSppelListed: false,
    census2011Speakers: 170000,
    censusCitation: "US Census Bureau American Community Survey (~170,000 tribal members)",
    classificationStatus: "LIMITED_DIGITAL_RESOURCES",
    classificationLabel: "Limited digital resources",
    classificationReason: "Tone-sensitive Athabaskan language with complex verb morphology. Preserved by the historic WWII Code Talkers. Speech datasets exist in academic archives.",
    asrStatus: "limited",
    ttsStatus: "not_available",
    translationStatus: "limited",
    speechRecordingsStatus: "available",
    verifiedTranscriptsStatus: "limited",
    recordedHoursEstimate: "22 hours of conversational field documentation",
    verifiedTranscriptsCount: 95,
    testedModels: ["CoRSAL Diné Bizaad Corpus", "Voice Roots Navajo ASR Adapter"],
    datasetLinks: [
      { name: "CoRSAL Navajo Sound Archive", url: "https://digital.library.unt.edu/explore/collections/CORSAL/", license: "Academic & Tribal Research Access", verifiedDate: "2026-03", task: "COMMUNITY_CORPUS" },
    ],
    lastAuditedDate: "2026-10-28",
    communityPilotLead: "Navajo Nation Tribal Historic Preservation Department",
    supportLimitationNotice: "Tones and glottal stops require careful manual transcription verification.",
  },

  // ─── 12. JUǀʼHOAN / KHOISAN (Kx'a, Southern Africa) ───
  {
    languageCode: "ktz",
    languageName: "Juǀʼhoan",
    nativeName: "Juǀʼhoansi (Juǀʼhoan)",
    languageFamily: "Kx'a (Northern Khoisan)",
    country: "Namibia & Botswana",
    macroRegion: "Sub-Saharan Africa",
    regionCategory: "Global",
    statesOrRegions: ["Otjozondjupa Region (Namibia)", "North-West District (Botswana)", "Kalahari Desert"],
    scriptOrthography: "Unwritten (Pure Oral Tradition; Latin click orthography with 4 click symbols: ǀ ǁ ǂ ǃ)",
    scriptType: "unwritten_oral",
    lifecycleStage: "DISCOVERED",
    discoverySource: "UNESCO Atlas of World's Languages in Danger & Kalahari Peoples Fund",
    assessment: {
      speechDataAvailability: "limited",
      digitalTextAvailability: "none",
      existingAsrNlpSupport: "none",
      scriptOrthographySupport: "unwritten_pure_oral",
      dialectDiversity: "high",
      communityParticipation: "in_dialogue",
      consentGovernance: "pending_formal_consent",
    },
    dialectsList: ["Tsumkwe Juǀʼhoan", "Dobe Juǀʼhoan"],
    isScheduled8: false,
    isSppelListed: false,
    census2011Speakers: 33000,
    censusCitation: "Namibia Central Bureau of Statistics (~33,000 speakers in Kalahari savanna)",
    classificationStatus: "COMMUNITY_PRESERVATION_NEEDED",
    classificationLabel: "Community preservation needed",
    classificationReason: "Acoustically extraordinary language possessing 48 distinct click phonemes and 4 click influxes. Zero commercial ASR support. Unwritten oral lineage.",
    asrStatus: "not_available",
    ttsStatus: "not_available",
    translationStatus: "not_available",
    speechRecordingsStatus: "limited",
    verifiedTranscriptsStatus: "not_available",
    recordedHoursEstimate: "Under 5 hours in academic linguistic phonetic archives",
    verifiedTranscriptsCount: 8,
    testedModels: ["Voice Roots Lossless Acoustic Vault"],
    datasetLinks: [
      { name: "Kalahari Peoples Ethnobotanical Audio Vault", url: "https://www.elararchive.org", license: "Customary Consent / Restricted", verifiedDate: "2026-05", task: "COMMUNITY_CORPUS" },
    ],
    lastAuditedDate: "2026-10-18",
    communityPilotLead: "Nyae Nyae Conservancy Village Elder Council",
    supportLimitationNotice: "Unverified language. Click consonants require custom phonetic acoustic modeling before speech recognition can be initiated.",
  },

  // ─── 13. YORUBA (Niger-Congo, West Africa) ───
  {
    languageCode: "yor",
    languageName: "Yoruba",
    nativeName: "Èdè Yorùbá",
    languageFamily: "Niger-Congo (Volta-Niger)",
    country: "Nigeria & Benin",
    macroRegion: "Sub-Saharan Africa",
    regionCategory: "Global",
    statesOrRegions: ["Southwestern Nigeria", "Ouémé (Benin)", "Togo"],
    scriptOrthography: "Latin Alphabet with Sub-dots and Tone Diacritics (ẹ, ọ, ṣ, à, á, a)",
    scriptType: "standardized_script",
    lifecycleStage: "OPERATIONAL_ASR",
    discoverySource: "National Policy on Education Nigeria & Masakhane NLP Consortium",
    assessment: {
      speechDataAvailability: "moderate",
      digitalTextAvailability: "extensive",
      existingAsrNlpSupport: "operational",
      scriptOrthographySupport: "standardized",
      dialectDiversity: "high",
      communityParticipation: "active_councils",
      consentGovernance: "community_charter",
    },
    dialectsList: ["Oyo Yoruba (Standard)", "Ijebu", "Ekiti", "Ondo", "Ibadan"],
    isScheduled8: false,
    isSppelListed: false,
    census2011Speakers: 45000000,
    censusCitation: "National Bureau of Statistics Nigeria (~45 Million speakers)",
    classificationStatus: "DIGITAL_RESOURCES_AVAILABLE",
    classificationLabel: "Digital resources available",
    classificationReason: "Extensive West African language with pioneering community-driven NLP development led by the Masakhane research collective.",
    asrStatus: "available",
    ttsStatus: "available",
    translationStatus: "available",
    speechRecordingsStatus: "available",
    verifiedTranscriptsStatus: "available",
    recordedHoursEstimate: "150+ hours in Mozilla Common Voice and FLEURS",
    verifiedTranscriptsCount: 950,
    testedModels: ["Masakhane ASR", "Meta MMS Yoruba Model"],
    datasetLinks: [
      { name: "Masakhane African NLP Repository", url: "https://www.masakhane.io", license: "CC BY 4.0", verifiedDate: "2026-02", task: "ASR" },
    ],
    lastAuditedDate: "2026-10-22",
    communityPilotLead: "Yoruba Language and Culture Association",
  },

  // ─── 14. AINU (Language Isolate, Northern Japan) ───
  {
    languageCode: "ain",
    languageName: "Ainu",
    nativeName: "アイヌ・イタㇰ (Aynu itak)",
    languageFamily: "Language Isolate",
    country: "Japan",
    macroRegion: "East & Southeast Asia",
    regionCategory: "Global",
    statesOrRegions: ["Hokkaido", "Kuril Islands (Historic)", "Sakhalin (Historic)"],
    scriptOrthography: "Modified Katakana (with small extension characters) and Latin transcription",
    scriptType: "developing_orthography",
    lifecycleStage: "RESEARCH_ASSESSED",
    discoverySource: "UNESCO Atlas of World's Languages in Danger (Critically Endangered) & Ainu Association of Hokkaido",
    assessment: {
      speechDataAvailability: "limited",
      digitalTextAvailability: "limited",
      existingAsrNlpSupport: "none",
      scriptOrthographySupport: "developing",
      dialectDiversity: "high",
      communityParticipation: "active_councils",
      consentGovernance: "ocap_certified",
    },
    dialectsList: ["Saru Ainu", "Chitose Ainu", "Ishikari Ainu", "Shizunai Ainu"],
    isScheduled8: false,
    isSppelListed: false,
    census2011Speakers: 300,
    censusCitation: "National Institute for Japanese Language and Linguistics (< 300 active speakers)",
    classificationStatus: "COMMUNITY_PRESERVATION_NEEDED",
    classificationLabel: "Community preservation needed",
    classificationReason: "Critically endangered linguistic isolate with extraordinary oral Yukar epics recited over multiple hours. No commercial ASR support.",
    asrStatus: "not_available",
    ttsStatus: "not_available",
    translationStatus: "limited",
    speechRecordingsStatus: "limited",
    verifiedTranscriptsStatus: "limited",
    recordedHoursEstimate: "35 hours of historical wax cylinder and field reel recordings",
    verifiedTranscriptsCount: 45,
    testedModels: ["NINJAL Ainu Archive Alignment Scribe"],
    datasetLinks: [
      { name: "Chiba University Ainu Yukar Archive", url: "http://www.let.chiba-u.jp/ainu/", license: "Academic Custodianship with Tribal Consent", verifiedDate: "2026-02", task: "COMMUNITY_CORPUS" },
    ],
    lastAuditedDate: "2026-10-30",
    communityPilotLead: "Hokkaido Ainu Association Elder Scribe Circle",
    supportLimitationNotice: "Oral epic recordings are culturally sacred; speech models operate only with local community verification.",
  },

  // ─── 15. HIRI MOTU (Austronesian Contact Tongue, Papua New Guinea) ───
  {
    languageCode: "hmo",
    languageName: "Hiri Motu",
    nativeName: "Hiri Motu",
    languageFamily: "Austronesian (Motu-based Contact Language)",
    country: "Papua New Guinea",
    macroRegion: "Oceania & Pacific",
    regionCategory: "Global",
    statesOrRegions: ["Central Province", "Gulf Province", "National Capital District"],
    scriptOrthography: "Latin Script",
    scriptType: "standardized_script",
    lifecycleStage: "DISCOVERED",
    discoverySource: "Constitution of Papua New Guinea & SIL Ethnologue",
    assessment: {
      speechDataAvailability: "none",
      digitalTextAvailability: "limited",
      existingAsrNlpSupport: "none",
      scriptOrthographySupport: "standardized",
      dialectDiversity: "moderate",
      communityParticipation: "pending_engagement",
      consentGovernance: "pending_formal_consent",
    },
    dialectsList: ["Central Hiri Motu", "Non-Central Regional Dialects"],
    isScheduled8: false,
    isSppelListed: false,
    census2011Speakers: 120000,
    censusCitation: "National Statistics Office Papua New Guinea (~120,000 second-language speakers)",
    classificationStatus: "NEEDS_ASSESSMENT",
    classificationLabel: "Needs assessment",
    classificationReason: "Official national language of Papua New Guinea undergoing severe language shift toward Tok Pisin and English. Zero digital speech recognition models available.",
    asrStatus: "not_available",
    ttsStatus: "not_available",
    translationStatus: "not_available",
    speechRecordingsStatus: "not_audited",
    verifiedTranscriptsStatus: "not_available",
    recordedHoursEstimate: "Pending field survey",
    verifiedTranscriptsCount: 0,
    testedModels: [],
    datasetLinks: [],
    lastAuditedDate: "2026-11-01",
    supportLimitationNotice: "Unverified language. Discovered via official state catalog; awaiting speech corpus audit and community outreach.",
  },

  // ─── 16. TELUGU (Dravidian, South India — Transfer Learning Anchor) ───
  {
    languageCode: "te",
    languageName: "Telugu",
    nativeName: "తెలుగు",
    languageFamily: "Dravidian (South-Central)",
    country: "India",
    macroRegion: "South Asia",
    regionCategory: "India",
    statesOrRegions: ["Andhra Pradesh", "Telangana", "Yanam (Puducherry)"],
    scriptOrthography: "Telugu Script (Standardized Brahmi-derived script)",
    scriptType: "standardized_script",
    lifecycleStage: "OPERATIONAL_ASR",
    discoverySource: "Census of India 2011 C-16 Official Baseline",
    assessment: {
      speechDataAvailability: "extensive",
      digitalTextAvailability: "extensive",
      existingAsrNlpSupport: "operational",
      scriptOrthographySupport: "standardized",
      dialectDiversity: "high",
      communityParticipation: "active_councils",
      consentGovernance: "community_charter",
    },
    dialectsList: ["Telangana Dialect", "Rayalaseema Dialect", "Coastal Andhra Dialect", "Uttara Andhra Dialect"],
    isScheduled8: true,
    isSppelListed: false,
    census2011Speakers: 81127740,
    censusCitation: "Census of India 2011: Table C-16 (81,127,740 speakers, 4th most spoken language in India)",
    classificationStatus: "DIGITAL_RESOURCES_AVAILABLE",
    classificationLabel: "Digital resources available",
    classificationReason: "Extensive labeled speech datasets and verified ASR/TTS/translation models benchmarked across public Indian repositories. Serves as transfer learning anchor.",
    asrStatus: "available",
    ttsStatus: "available",
    translationStatus: "available",
    speechRecordingsStatus: "available",
    verifiedTranscriptsStatus: "available",
    recordedHoursEstimate: "1,200+ public hours / 24+ living community recordings",
    verifiedTranscriptsCount: 1500,
    testedModels: ["OpenAI Whisper-1", "Google Gemini 2.5 Flash", "IndicTrans2-200M", "Browser SpeechSynthesis"],
    datasetLinks: [
      { name: "AI4Bharat Kathbath (Telugu)", url: "https://huggingface.co/datasets/ai4bharat/Kathbath", license: "CC BY-NC-SA 4.0", verifiedDate: "2026-03", task: "ASR" },
      { name: "Mozilla Common Voice (Telugu)", url: "https://commonvoice.mozilla.org/te", license: "CC0", verifiedDate: "2026-03", task: "MULTIMODAL" },
      { name: "AI4Bharat Indic-TTS (Telugu)", url: "https://github.com/AI4Bharat/Indic-TTS", license: "MIT", verifiedDate: "2026-02", task: "TTS" },
    ],
    lastAuditedDate: "2026-10-09",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. REGISTRY QUERY & FILTER HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function getAllDatasetEntries(): DatasetEntry[] {
  return SPEECH_DATASET_REGISTRY;
}

export function getAllLanguageResourceStatuses(): LanguageResourceStatus[] {
  return LANGUAGE_RESOURCE_STATUS;
}

export function getLanguageResourceStatus(code: string): LanguageResourceStatus | undefined {
  const norm = code.toLowerCase();
  return LANGUAGE_RESOURCE_STATUS.find(
    (l) => l.languageCode.toLowerCase() === norm || l.languageName.toLowerCase() === norm
  );
}

export function getDatasetsByLanguage(languageName: string): DatasetEntry[] {
  const norm = languageName.toLowerCase();
  return SPEECH_DATASET_REGISTRY.filter((d) =>
    d.languagesCovered.some((l) => l.toLowerCase().includes(norm) || norm.includes(l.toLowerCase()))
  );
}

export function filterRegistryByLifecycleStage(stage: LanguageLifecycleStage | "ALL"): LanguageResourceStatus[] {
  if (stage === "ALL") return LANGUAGE_RESOURCE_STATUS;
  return LANGUAGE_RESOURCE_STATUS.filter((l) => l.lifecycleStage === stage);
}

export function filterRegistryByRegionCategory(category: "India" | "Global" | "ALL"): LanguageResourceStatus[] {
  if (category === "ALL") return LANGUAGE_RESOURCE_STATUS;
  return LANGUAGE_RESOURCE_STATUS.filter((l) => l.regionCategory === category);
}

export function filterRegistryByFamily(family: string): LanguageResourceStatus[] {
  if (family === "ALL") return LANGUAGE_RESOURCE_STATUS;
  const norm = family.toLowerCase();
  return LANGUAGE_RESOURCE_STATUS.filter((l) => l.languageFamily.toLowerCase().includes(norm));
}

export function filterRegistryByScriptType(type: "unwritten_oral" | "developing_orthography" | "standardized_script" | "ALL"): LanguageResourceStatus[] {
  if (type === "ALL") return LANGUAGE_RESOURCE_STATUS;
  return LANGUAGE_RESOURCE_STATUS.filter((l) => l.scriptType === type);
}
