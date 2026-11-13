/**
 * Voice Roots — National Language & Speech Dataset Registry
 * 
 * Implements a dual-linked registry architecture:
 * 1. National Language Registry: Census of India 2011 (C-16) & SPPEL Official Baseline
 * 2. Speech & AI Resource Status: Tracks Speech-to-Text (ASR), Text-to-Speech (TTS),
 *    Verified Transcripts, Translation Data, and Community Preservation status separately.
 * 
 * Official Classification Statuses:
 * - OFFICIALLY_DOCUMENTED: Listed in a verified government or research source.
 * - DIGITAL_RESOURCES_AVAILABLE: A real dataset or model has been identified and tested.
 * - LIMITED_DIGITAL_RESOURCES: Available resources have gaps in dialect or task coverage.
 * - NEEDS_ASSESSMENT: Coverage has not yet been audited.
 * - COMMUNITY_PRESERVATION_NEEDED: More consented recordings or verified transcripts are needed.
 */

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
  languageCode: string;
  languageName: string;
  nativeName: string;
  languageFamily: string;
  statesOrRegions: string[];
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
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PUBLIC & COMMUNITY DATASETS REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const SPEECH_DATASET_REGISTRY: DatasetEntry[] = [
  {
    id: "indicvoices",
    name: "AI4Bharat IndicVoices",
    source: "AI4Bharat, IIT Madras & Bhashini",
    sourceUrl: "https://ai4bharat.iitm.ac.in/datasets/indicvoices",
    license: "CC BY 4.0 / Open Access with Attribution",
    task: "MULTIMODAL_SPEECH",
    languagesCovered: ["Telugu", "Hindi", "Tamil", "Kannada", "Malayalam", "Marathi", "Bengali", "Odia", "14 other scheduled languages"],
    totalHoursEstimate: "12,000+ hours (Extempore, read, spontaneous)",
    transcriptAvailability: "VERIFIED_VERBATIM",
    accessConditions: "Academic & research use permitted with attribution.",
    attributionRequirement: "Cite IndicVoices: Towards 10,000+ Hours of Indian Speech (AI4Bharat).",
    description: "Extensive natural and spontaneous speech collection across 22 scheduled Indian languages, serving as our ASR transfer learning baseline.",
  },
  {
    id: "kathbath",
    name: "AI4Bharat Kathbath",
    source: "AI4Bharat, Hugging Face",
    sourceUrl: "https://huggingface.co/datasets/ai4bharat/Kathbath",
    license: "Research & Non-commercial / CC BY-NC-SA 4.0",
    task: "ASR",
    languagesCovered: ["Telugu", "Hindi", "Tamil", "Kannada", "Malayalam", "Marathi", "Bengali", "Gujarati", "Odia", "Punjabi", "Sanskrit", "Urdu"],
    totalHoursEstimate: "1,684 hours",
    transcriptAvailability: "VERIFIED_VERBATIM",
    accessConditions: "Check Hugging Face dataset card terms before redistribution.",
    attributionRequirement: "Cite Kathbath: Evaluating Speech Recognition for Indian Languages.",
    description: "Carefully segmented and labeled speech-recognition benchmark across 12 Indian languages; used for testing Voice Roots Telugu speech pipeline.",
  },
  {
    id: "vistaar",
    name: "AI4Bharat Vistaar",
    source: "AI4Bharat GitHub & Models",
    sourceUrl: "https://github.com/AI4Bharat/vistaar",
    license: "MIT License (Models) / Underlying datasets subject to original licenses",
    task: "ASR",
    languagesCovered: ["Telugu", "Hindi", "Tamil", "Kannada", "Malayalam", "Marathi", "Bengali", "Odia", "4 other languages"],
    totalHoursEstimate: "Benchmarked across Kathbath, FLEURS, Common Voice, MUCS",
    transcriptAvailability: "VERIFIED_VERBATIM",
    accessConditions: "Pre-trained models MIT licensed; verify each underlying corpus separately.",
    attributionRequirement: "AI4Bharat Vistaar Project.",
    description: "Benchmark suites and pre-trained acoustic models across 12 Indian languages; provides the foundation for low-resource transfer learning.",
  },
  {
    id: "commonvoice",
    name: "Mozilla Common Voice",
    source: "Mozilla Foundation",
    sourceUrl: "https://commonvoice.mozilla.org/",
    license: "CC0 (Public Domain Dedication)",
    task: "MULTIMODAL_SPEECH",
    languagesCovered: ["Telugu", "Tamil", "Hindi", "Malayalam", "Marathi", "Bengali", "Global Community Languages"],
    totalHoursEstimate: "30,000+ hours globally (varies per language)",
    transcriptAvailability: "CROWDSOURCED",
    accessConditions: "Public domain data. Community contribution model with upvote/downvote validation.",
    attributionRequirement: "Mozilla Common Voice contributors.",
    description: "Open community crowdsourcing blueprint for recording native speakers and verifying sentence pronunciation.",
  },
  {
    id: "fleurs",
    name: "Google FLEURS",
    source: "Google Research, Hugging Face",
    sourceUrl: "https://huggingface.co/datasets/google/fleurs",
    license: "CC BY 4.0",
    task: "ASR",
    languagesCovered: ["Telugu", "Hindi", "Tamil", "Kannada", "Malayalam", "Marathi", "Bengali", "Odia", "94 global languages"],
    totalHoursEstimate: "~10-12 hours per language (read parallel sentences)",
    transcriptAvailability: "READ_SPEECH",
    accessConditions: "Open evaluation benchmark. Attribution required.",
    attributionRequirement: "Conneau et al., FLEURS: Few-shot Learning Evaluation of Universal Representations of Speech.",
    description: "Parallel multi-lingual read speech evaluation set across 102 languages; used to benchmark cross-lingual word error rates.",
  },
  {
    id: "indictts",
    name: "AI4Bharat Indic-TTS",
    source: "AI4Bharat, IIT Madras",
    sourceUrl: "https://github.com/AI4Bharat/Indic-TTS",
    license: "MIT License / Research Use",
    task: "TTS",
    languagesCovered: ["Telugu", "Hindi", "Tamil", "Kannada", "Malayalam", "Marathi", "Bengali", "Gujarati", "Odia", "Assamese", "Bodo", "Manipuri", "Rajasthani"],
    totalHoursEstimate: "~30-40 hours per language of studio-quality speech",
    transcriptAvailability: "VERIFIED_VERBATIM",
    accessConditions: "Check license terms for synthetic speech distribution.",
    attributionRequirement: "AI4Bharat Indic-TTS Consortium.",
    description: "Text-to-speech synthetic voice models covering 13 Indian languages; baseline for Telugu and regional dialect speech synthesis.",
  },
  {
    id: "voiceroots-community",
    name: "Voice Roots Indigenous Community Corpus",
    source: "Voice Roots Community Custodians & Native Elders",
    sourceUrl: "https://voice-roots.onrender.com/archive",
    license: "Community Custodianship & Indigenous OCAP Protocols",
    task: "COMMUNITY_PRESERVATION",
    languagesCovered: ["Gondi", "Koya", "Lambadi / Banjara", "Tulu", "Telugu Oral Dialects"],
    totalHoursEstimate: "Pilot Corpus (Elder recordings, uncompressed 16kHz/48kHz WAV)",
    transcriptAvailability: "VERIFIED_VERBATIM",
    accessConditions: "Requires explicit speaker consent. Sacred, clan-restricted, and private audio restricted by custodians.",
    attributionRequirement: "Elder Clan Custodians of Telangana, Andhra Pradesh & Deccan Plateau.",
    description: "Authentic oral-first heritage recordings, songs, harvest lore, and medicinal botany chants preserving unwritten or low-resource dialects missing from public datasets.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. EVIDENCE-BASED LANGUAGE RESOURCE STATUSES
// ─────────────────────────────────────────────────────────────────────────────

export const LANGUAGE_RESOURCE_STATUS: LanguageResourceStatus[] = [
  // 1. TELUGU
  {
    languageCode: "te",
    languageName: "Telugu",
    nativeName: "తెలుగు",
    languageFamily: "Dravidian (South-Central)",
    statesOrRegions: ["Andhra Pradesh", "Telangana", "Yanam (Puducherry)"],
    isScheduled8: true,
    isSppelListed: false,
    census2011Speakers: 81127740,
    censusCitation: "Census of India 2011: Table C-16 (81,127,740 speakers, 4th most spoken language in India)",
    classificationStatus: "DIGITAL_RESOURCES_AVAILABLE",
    classificationLabel: "Digital resources available",
    classificationReason: "Extensive labeled speech datasets and verified ASR/TTS/translation models benchmarked across public Indian repositories.",
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

  // 2. GONDI (Flagship Oral Language)
  {
    languageCode: "gon",
    languageName: "Gondi",
    nativeName: "గోండీ (Gondi)",
    languageFamily: "Dravidian (Central / South-Central)",
    statesOrRegions: ["Madhya Pradesh", "Chhattisgarh", "Maharashtra", "Telangana", "Andhra Pradesh"],
    isScheduled8: false,
    isSppelListed: true,
    census2011Speakers: 2984453,
    censusCitation: "Census of India 2011: Table C-16 Non-Scheduled (2,984,453 speakers across central Indian tribal belt)",
    classificationStatus: "COMMUNITY_PRESERVATION_NEEDED",
    classificationLabel: "Community preservation needed",
    classificationReason: "Predominantly oral language; high language-shift risk. Missing from mainstream speech datasets. Requires consented elder recordings and human verification.",
    asrStatus: "limited",
    ttsStatus: "not_available",
    translationStatus: "limited",
    speechRecordingsStatus: "limited",
    verifiedTranscriptsStatus: "limited",
    recordedHoursEstimate: "5-10 hours pilot corpus in progress (Elder oral lore, Ghotul songs)",
    verifiedTranscriptsCount: 48,
    testedModels: ["Google Gemini 2.5 Flash (Dialect Translation Mode)", "Voice Roots Verified Oral Corpus"],
    datasetLinks: [
      { name: "Voice Roots Community Archive (VR-107)", url: "https://voice-roots.onrender.com/archive", license: "Community OCAP Protocols", verifiedDate: "2026-10", task: "COMMUNITY_CORPUS" },
      { name: "SPPEL Phase I Documentation Index", url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2198869", license: "Government SPPEL Programme", verifiedDate: "2026-01", task: "COMMUNITY_CORPUS" },
    ],
    lastAuditedDate: "2026-10-09",
    communityPilotLead: "Adilabad & Bastar Border Elder Custodians",
  },

  // 3. KOYA (Co-Primary Oral Language)
  {
    languageCode: "koy",
    languageName: "Koya",
    nativeName: "కోయ (Koya)",
    languageFamily: "Dravidian (South-Central)",
    statesOrRegions: ["Telangana", "Andhra Pradesh (Godavari Basin)", "Odisha", "Chhattisgarh"],
    isScheduled8: false,
    isSppelListed: true,
    census2011Speakers: 407423,
    censusCitation: "Census of India 2011: Table C-16 Non-Scheduled (407,423 speakers, primarily Godavari River Basin)",
    classificationStatus: "COMMUNITY_PRESERVATION_NEEDED",
    classificationLabel: "Community preservation needed",
    classificationReason: "No public speech-to-text benchmark exists. Preserved through direct elder field recordings of river folklore and ethnobotanical healing chants.",
    asrStatus: "limited",
    ttsStatus: "not_available",
    translationStatus: "limited",
    speechRecordingsStatus: "limited",
    verifiedTranscriptsStatus: "limited",
    recordedHoursEstimate: "3-5 hours pilot corpus in progress",
    verifiedTranscriptsCount: 32,
    testedModels: ["Google Gemini 2.5 Flash (Dialect Mode)", "Voice Roots Verified Oral Corpus"],
    datasetLinks: [
      { name: "Voice Roots Community Archive (VR-108)", url: "https://voice-roots.onrender.com/archive", license: "Community OCAP Protocols", verifiedDate: "2026-10", task: "COMMUNITY_CORPUS" },
    ],
    lastAuditedDate: "2026-10-09",
    communityPilotLead: "Maredumilli & Bhadradri Kothagudem Clan Elders",
  },

  // 4. LAMBADI / BANJARA
  {
    languageCode: "lam",
    languageName: "Lambadi / Banjara",
    nativeName: "లంబాడీ (Banjara / Gor Boli)",
    languageFamily: "Indo-Aryan (Rajasthani Subgroup)",
    statesOrRegions: ["Telangana", "Andhra Pradesh", "Karnataka", "Maharashtra"],
    isScheduled8: false,
    isSppelListed: false,
    census2011Speakers: 3777405,
    censusCitation: "Census of India 2011: Grouped under Hindi C-16 mother tongues (3,777,405 speakers across Deccan Plateau)",
    classificationStatus: "LIMITED_DIGITAL_RESOURCES",
    classificationLabel: "Limited digital resources",
    classificationReason: "Millions of speakers, but digital speech recognition coverage is minimal. Nomadic oral folklore and Thanda caravan songs documented in regional scripts.",
    asrStatus: "limited",
    ttsStatus: "not_available",
    translationStatus: "limited",
    speechRecordingsStatus: "limited",
    verifiedTranscriptsStatus: "limited",
    recordedHoursEstimate: "4-6 hours pilot corpus in progress",
    verifiedTranscriptsCount: 36,
    testedModels: ["Google Gemini 2.5 Flash", "Voice Roots Verified Oral Corpus"],
    datasetLinks: [
      { name: "Voice Roots Community Archive (VR-110)", url: "https://voice-roots.onrender.com/archive", license: "Community OCAP Protocols", verifiedDate: "2026-10", task: "COMMUNITY_CORPUS" },
    ],
    lastAuditedDate: "2026-10-09",
    communityPilotLead: "Deccan Plateau Thanda Community Elders",
  },

  // 5. TULU
  {
    languageCode: "tcy",
    languageName: "Tulu",
    nativeName: "ತುಳು (Tulu)",
    languageFamily: "Dravidian (South)",
    statesOrRegions: ["Karnataka (Dakshina Kannada, Udupi)", "Kerala (Kasaragod)"],
    isScheduled8: false,
    isSppelListed: false,
    census2011Speakers: 1846427,
    censusCitation: "Census of India 2011: Table C-16 Non-Scheduled (1,846,427 speakers in Coastal Tulunadu)",
    classificationStatus: "LIMITED_DIGITAL_RESOURCES",
    classificationLabel: "Limited digital resources",
    classificationReason: "Rich oral Paddana epics recorded. Few open ASR benchmarks; community recording registration underway.",
    asrStatus: "limited",
    ttsStatus: "not_available",
    translationStatus: "limited",
    speechRecordingsStatus: "limited",
    verifiedTranscriptsStatus: "limited",
    recordedHoursEstimate: "4 hours community audio",
    verifiedTranscriptsCount: 22,
    testedModels: ["Voice Roots Verified Oral Corpus"],
    datasetLinks: [
      { name: "Voice Roots Community Archive (VR-109)", url: "https://voice-roots.onrender.com/archive", license: "Community OCAP Protocols", verifiedDate: "2026-10", task: "COMMUNITY_CORPUS" },
    ],
    lastAuditedDate: "2026-10-09",
  },

  // 6. KUI
  {
    languageCode: "kxu",
    languageName: "Kui",
    nativeName: "କୁଇ / కుయి (Kui)",
    languageFamily: "Dravidian (South-Central)",
    statesOrRegions: ["Odisha", "Andhra Pradesh (Eastern Ghats)"],
    isScheduled8: false,
    isSppelListed: true,
    census2011Speakers: 941488,
    censusCitation: "Census of India 2011: Table C-16 Non-Scheduled (941,488 speakers, Kandha tribe)",
    classificationStatus: "NEEDS_ASSESSMENT",
    classificationLabel: "Needs assessment",
    classificationReason: "Listed in Census 2011 and SPPEL endangered-language documentation, but digital speech/ASR coverage has not yet been audited or benchmarked.",
    asrStatus: "not_audited",
    ttsStatus: "not_audited",
    translationStatus: "not_audited",
    speechRecordingsStatus: "not_available",
    verifiedTranscriptsStatus: "not_available",
    recordedHoursEstimate: "0 hours (Intake open)",
    verifiedTranscriptsCount: 0,
    testedModels: [],
    datasetLinks: [
      { name: "SPPEL Phase I List", url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2198869", license: "Government Documentation", verifiedDate: "2026-01", task: "COMMUNITY_CORPUS" },
    ],
    lastAuditedDate: "2026-10-09",
  },

  // 7. HINDI
  {
    languageCode: "hi",
    languageName: "Hindi",
    nativeName: "हिन्दी",
    languageFamily: "Indo-Aryan",
    statesOrRegions: ["Uttar Pradesh", "Bihar", "Madhya Pradesh", "Rajasthan", "Delhi", "Pan-India"],
    isScheduled8: true,
    isSppelListed: false,
    census2011Speakers: 528347193,
    censusCitation: "Census of India 2011: Table C-16 (528,347,193 speakers)",
    classificationStatus: "DIGITAL_RESOURCES_AVAILABLE",
    classificationLabel: "Digital resources available",
    classificationReason: "Thousands of public speech hours, multiple robust STT/TTS architectures and neural translation datasets operational.",
    asrStatus: "available",
    ttsStatus: "available",
    translationStatus: "available",
    speechRecordingsStatus: "available",
    verifiedTranscriptsStatus: "available",
    recordedHoursEstimate: "5,000+ public hours",
    verifiedTranscriptsCount: 10000,
    testedModels: ["OpenAI Whisper-1", "Google Gemini 2.5 Flash", "IndicTrans2-200M", "Indic-TTS"],
    datasetLinks: [
      { name: "AI4Bharat IndicVoices (Hindi)", url: "https://ai4bharat.iitm.ac.in/datasets/indicvoices", license: "CC BY 4.0", verifiedDate: "2026-03", task: "MULTIMODAL" },
      { name: "AI4Bharat Kathbath (Hindi)", url: "https://huggingface.co/datasets/ai4bharat/Kathbath", license: "CC BY-NC-SA 4.0", verifiedDate: "2026-03", task: "ASR" },
    ],
    lastAuditedDate: "2026-10-09",
  },

  // 8. TAMIL
  {
    languageCode: "ta",
    languageName: "Tamil",
    nativeName: "தமிழ்",
    languageFamily: "Dravidian (South)",
    statesOrRegions: ["Tamil Nadu", "Puducherry"],
    isScheduled8: true,
    isSppelListed: false,
    census2011Speakers: 69026881,
    censusCitation: "Census of India 2011: Table C-16 (69,026,881 speakers)",
    classificationStatus: "DIGITAL_RESOURCES_AVAILABLE",
    classificationLabel: "Digital resources available",
    classificationReason: "Classical Dravidian language with mature speech recognition, speech synthesis, and benchmark datasets.",
    asrStatus: "available",
    ttsStatus: "available",
    translationStatus: "available",
    speechRecordingsStatus: "available",
    verifiedTranscriptsStatus: "available",
    recordedHoursEstimate: "2,000+ public hours",
    verifiedTranscriptsCount: 5000,
    testedModels: ["OpenAI Whisper-1", "Google Gemini 2.5 Flash", "IndicTrans2-200M", "Indic-TTS"],
    datasetLinks: [
      { name: "AI4Bharat Kathbath (Tamil)", url: "https://huggingface.co/datasets/ai4bharat/Kathbath", license: "CC BY-NC-SA 4.0", verifiedDate: "2026-03", task: "ASR" },
    ],
    lastAuditedDate: "2026-10-09",
  },

  // 9. KANNADA
  {
    languageCode: "kn",
    languageName: "Kannada",
    nativeName: "ಕನ್ನಡ",
    languageFamily: "Dravidian (South)",
    statesOrRegions: ["Karnataka"],
    isScheduled8: true,
    isSppelListed: false,
    census2011Speakers: 43706512,
    censusCitation: "Census of India 2011: Table C-16 (43,706,512 speakers)",
    classificationStatus: "DIGITAL_RESOURCES_AVAILABLE",
    classificationLabel: "Digital resources available",
    classificationReason: "Benchmarked speech recognition and synthesis pipelines available across Kathbath, Vistaar, and IndicVoices.",
    asrStatus: "available",
    ttsStatus: "available",
    translationStatus: "available",
    speechRecordingsStatus: "available",
    verifiedTranscriptsStatus: "available",
    recordedHoursEstimate: "1,500+ public hours",
    verifiedTranscriptsCount: 3500,
    testedModels: ["OpenAI Whisper-1", "Google Gemini 2.5 Flash", "IndicTrans2-200M", "Indic-TTS"],
    datasetLinks: [
      { name: "AI4Bharat Kathbath (Kannada)", url: "https://huggingface.co/datasets/ai4bharat/Kathbath", license: "CC BY-NC-SA 4.0", verifiedDate: "2026-03", task: "ASR" },
    ],
    lastAuditedDate: "2026-10-09",
  },

  // 10. MALAYALAM
  {
    languageCode: "ml",
    languageName: "Malayalam",
    nativeName: "മലയാളം",
    languageFamily: "Dravidian (South)",
    statesOrRegions: ["Kerala", "Lakshadweep"],
    isScheduled8: true,
    isSppelListed: false,
    census2011Speakers: 34838819,
    censusCitation: "Census of India 2011: Table C-16 (34,838,819 speakers)",
    classificationStatus: "DIGITAL_RESOURCES_AVAILABLE",
    classificationLabel: "Digital resources available",
    classificationReason: "Validated ASR and TTS models operational across public Dravidian speech benchmarks.",
    asrStatus: "available",
    ttsStatus: "available",
    translationStatus: "available",
    speechRecordingsStatus: "available",
    verifiedTranscriptsStatus: "available",
    recordedHoursEstimate: "1,200+ public hours",
    verifiedTranscriptsCount: 2800,
    testedModels: ["OpenAI Whisper-1", "Google Gemini 2.5 Flash", "IndicTrans2-200M", "Indic-TTS"],
    datasetLinks: [
      { name: "AI4Bharat Kathbath (Malayalam)", url: "https://huggingface.co/datasets/ai4bharat/Kathbath", license: "CC BY-NC-SA 4.0", verifiedDate: "2026-03", task: "ASR" },
    ],
    lastAuditedDate: "2026-10-09",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. QUERY & FILTER HELPERS
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

export function filterRegistryByClassification(status: LanguageClassificationStatus): LanguageResourceStatus[] {
  return LANGUAGE_RESOURCE_STATUS.filter((l) => l.classificationStatus === status);
}

export function filterRegistryByTask(task: "asr" | "tts" | "translation"): LanguageResourceStatus[] {
  return LANGUAGE_RESOURCE_STATUS.filter((l) => {
    if (task === "asr") return l.asrStatus === "available";
    if (task === "tts") return l.ttsStatus === "available";
    if (task === "translation") return l.translationStatus === "available";
    return false;
  });
}
