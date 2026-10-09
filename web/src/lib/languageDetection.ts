/**
 * Language and Script Detection Utilities for Voice Roots
 * Detects Unicode scripts, regional Indian languages, and indigenous dialects
 * (Gondi, Koya, Lambadi) written in Telugu or Devanagari script.
 */

export interface ScriptDetectionResult {
  code: string;
  name: string;
  native: string;
  script: string;
  confidence: number;
}

export interface MismatchCheckResult {
  isMismatch: boolean;
  detectedCode: string;
  detectedName: string;
  selectedCode: string;
  selectedName: string;
  message?: string;
}

// Dialect signature tokens commonly found in oral heritage transcripts
const DIALECT_MARKERS: Record<string, { code: string; name: string; native: string; keywords: string[] }> = {
  gondi: {
    code: "gon",
    name: "Gondi",
    native: "గోండీ (Gondi)",
    keywords: ["సేవా జోహార్", "పెన్", "సగా", "మహువా", "మారా పెన్", "గోండు", "పుట్టినోర్", "జోహార్", "సేవజోహార్"],
  },
  koya: {
    code: "koy",
    name: "Koya",
    native: "కోయ (Koya)",
    keywords: ["కోయ", "గోదావరి", "వనమూలిక", "గిరిజన", "నాటువైద్యం", "జోహార్", "కొండ దేవత"],
  },
  lambadi: {
    code: "lam",
    name: "Lambadi / Banjara",
    native: "లంబాడీ (Banjara)",
    keywords: ["రామ్ రామ్", "కైసో ఛే", "బంజారా", "గోర్ బోలి", "తాండా", "నాయక్"],
  },
};

/**
 * Detect the predominant script and probable language of a given text.
 */
export function detectScriptAndLanguage(text: string): ScriptDetectionResult {
  if (!text || !text.trim()) {
    return { code: "unknown", name: "Unknown", native: "Unknown", script: "Unknown", confidence: 0 };
  }

  const clean = text.trim();

  // 1. Check for specific indigenous dialect markers first
  for (const [, dialect] of Object.entries(DIALECT_MARKERS)) {
    const matched = dialect.keywords.some((kw) => clean.includes(kw));
    if (matched) {
      return {
        code: dialect.code,
        name: dialect.name,
        native: dialect.native,
        script: /[\u0C00-\u0C7F]/.test(clean) ? "Telugu" : /[\u0900-\u097F]/.test(clean) ? "Devanagari" : "Latin",
        confidence: 0.95,
      };
    }
  }

  // 2. Count Unicode script characters
  let teluguCount = 0;
  let devanagariCount = 0;
  let tamilCount = 0;
  let kannadaCount = 0;
  let malayalamCount = 0;
  let bengaliCount = 0;
  let latinCount = 0;

  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    if (code >= 0x0c00 && code <= 0x0c7f) teluguCount++;
    else if (code >= 0x0900 && code <= 0x097f) devanagariCount++;
    else if (code >= 0x0b80 && code <= 0x0bff) tamilCount++;
    else if (code >= 0x0c80 && code <= 0x0cff) kannadaCount++;
    else if (code >= 0x0d00 && code <= 0x0d7f) malayalamCount++;
    else if (code >= 0x0980 && code <= 0x09ff) bengaliCount++;
    else if ((code >= 0x0041 && code <= 0x005a) || (code >= 0x0061 && code <= 0x007a)) latinCount++;
  }

  const total = teluguCount + devanagariCount + tamilCount + kannadaCount + malayalamCount + bengaliCount + latinCount;
  if (total === 0) {
    return { code: "unknown", name: "Unknown", native: "Unknown", script: "Unknown", confidence: 0 };
  }

  if (teluguCount >= 2 && teluguCount >= total * 0.3) {
    return { code: "te", name: "Telugu", native: "తెలుగు", script: "Telugu", confidence: Math.min(1, teluguCount / total + 0.2) };
  }
  if (devanagariCount >= 2 && devanagariCount >= total * 0.3) {
    return { code: "hi", name: "Hindi", native: "हिन्दी", script: "Devanagari", confidence: Math.min(1, devanagariCount / total + 0.2) };
  }
  if (tamilCount >= 2 && tamilCount >= total * 0.3) {
    return { code: "ta", name: "Tamil", native: "தமிழ்", script: "Tamil", confidence: Math.min(1, tamilCount / total + 0.2) };
  }
  if (kannadaCount >= 2 && kannadaCount >= total * 0.3) {
    return { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", script: "Kannada", confidence: Math.min(1, kannadaCount / total + 0.2) };
  }
  if (malayalamCount >= 2 && malayalamCount >= total * 0.3) {
    return { code: "ml", name: "Malayalam", native: "മലയാളം", script: "Malayalam", confidence: Math.min(1, malayalamCount / total + 0.2) };
  }
  if (bengaliCount >= 2 && bengaliCount >= total * 0.3) {
    return { code: "bn", name: "Bengali", native: "বাংলা", script: "Bengali", confidence: Math.min(1, bengaliCount / total + 0.2) };
  }
  if (latinCount >= 2) {
    return { code: "en", name: "English", native: "English", script: "Latin", confidence: Math.min(1, latinCount / total + 0.1) };
  }

  return { code: "unknown", name: "Unknown", native: "Unknown", script: "Unknown", confidence: 0 };
}

const NORMALIZE_MAP: Record<string, string> = {
  te: "te",
  telugu: "te",
  en: "en",
  english: "en",
  hi: "hi",
  hindi: "hi",
  ta: "ta",
  tamil: "ta",
  kn: "kn",
  kannada: "kn",
  ml: "ml",
  malayalam: "ml",
  gon: "gon",
  gondi: "gon",
  koy: "koy",
  koya: "koy",
  lam: "lam",
  lambadi: "lam",
};

const LANG_NAME_LOOKUP: Record<string, string> = {
  te: "Telugu",
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  kn: "Kannada",
  ml: "Malayalam",
  gon: "Gondi",
  koy: "Koya",
  lam: "Lambadi",
};

/**
 * Check if the text script mismatches the user's selected language.
 * Example: User selected "English", but text is written in Telugu script.
 */
export function checkLanguageMismatch(text: string, selectedLanguage: string): MismatchCheckResult {
  if (!text || !text.trim() || !selectedLanguage || selectedLanguage === "auto") {
    return { isMismatch: false, detectedCode: "", detectedName: "", selectedCode: "", selectedName: "" };
  }

  const detected = detectScriptAndLanguage(text);
  if (detected.code === "unknown") {
    return { isMismatch: false, detectedCode: "", detectedName: "", selectedCode: "", selectedName: "" };
  }

  const normSelected = NORMALIZE_MAP[selectedLanguage.toLowerCase()] || selectedLanguage.toLowerCase();
  const selectedName = LANG_NAME_LOOKUP[normSelected] || selectedLanguage;

  // Indigenous languages written in Telugu script (Gondi/Koya/Lambadi) are compatible with Telugu script
  const isIndigenousInTeluguScript =
    detected.script === "Telugu" && (normSelected === "gon" || normSelected === "koy" || normSelected === "lam");

  if (detected.code !== normSelected && !isIndigenousInTeluguScript) {
    return {
      isMismatch: true,
      detectedCode: detected.code,
      detectedName: detected.name,
      selectedCode: normSelected,
      selectedName,
      message: `The text is written in ${detected.name} (${detected.script} script), but the language is currently set to ${selectedName}.`,
    };
  }

  return {
    isMismatch: false,
    detectedCode: detected.code,
    detectedName: detected.name,
    selectedCode: normSelected,
    selectedName,
  };
}
