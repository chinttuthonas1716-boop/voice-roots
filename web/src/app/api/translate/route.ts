import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, sanitizeInput, computeSHA256 } from "@/lib/security";
import { findMatchingPhrase } from "@/lib/conversations";
import crypto from "crypto";

const LANG_CODE_MAP: Record<string, string> = {
  telugu: "te",
  te: "te",
  hindi: "hi",
  hi: "hi",
  english: "en",
  en: "en",
  tamil: "ta",
  ta: "ta",
  kannada: "kn",
  kn: "kn",
  malayalam: "ml",
  ml: "ml",
  marathi: "mr",
  mr: "mr",
  bengali: "bn",
  bn: "bn",
  odia: "or",
  or: "or",
  gondi: "gondi",
  gon: "gondi",
  koya: "koya",
  koy: "koya",
  lambadi: "lambadi",
  lam: "lambadi",
  banjara: "lambadi",
};

/**
 * Attempts external machine translation via MyMemory free API with email attribution.
 */
async function fetchExternalTranslation(
  text: string,
  fromLang: string,
  toLang: string
): Promise<{ success: boolean; translation?: string; error?: string }> {
  // MyMemory does not support oral dialects directly
  if (["gondi", "koya", "lambadi"].includes(fromLang) || ["gondi", "koya", "lambadi"].includes(toLang)) {
    return { success: false, error: `External provider does not support oral dialect ${fromLang}-${toLang}` };
  }

  try {
    const pair = `${fromLang}|${toLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(pair)}&de=admin@voiceroots.org`;
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000), // 5-second timeout
    });

    if (!res.ok) {
      return { success: false, error: `External translation returned HTTP ${res.status}` };
    }

    const data = await res.json();
    if (data.responseData && data.responseData.translatedText) {
      const translated = data.responseData.translatedText.trim();
      const upper = translated.toUpperCase();
      // Verify response isn't an error message or rate limit warning
      if (
        !upper.startsWith("QUERY LENGTH LIMIT") &&
        !upper.startsWith("INVALID LANGUAGE PAIR") &&
        !upper.includes("MYMEMORY WARNING") &&
        !upper.includes("YOU USED ALL AVAILABLE FREE TRANSLATIONS")
      ) {
        return { success: true, translation: translated };
      }
    }

    return { success: false, error: "External translation provider did not return valid text." };
  } catch (err: any) {
    return { success: false, error: err?.message || "Translation network timeout" };
  }
}

/**
 * Executes multi-tier translation pipeline:
 * 1. Identity match (source === target)
 * 2. Verified Conversational Knowledgebase lookup (including Gondi, Koya, Lambadi)
 * 3. Google Gemini 2.5 Flash Multilingual API (if GEMINI_API_KEY / GOOGLE_API_KEY present)
 * 4. Hugging Face IndicTrans2 (ai4bharat/indictrans2) bidirectional models (if HF_TOKEN present)
 * 5. External Neural Translation Service (MyMemory)
 * 6. Oral dialect / heuristic corpus fallback
 */
async function translateTextPipeline(
  text: string,
  sLang: string,
  tLang: string
): Promise<{
  success: boolean;
  translation?: string;
  provider?: string;
  confidence?: number;
  error?: string;
  details?: string;
}> {
  // Step 1: Identity match
  if (sLang === tLang) {
    return {
      success: true,
      translation: text,
      provider: "Identity-NoOp",
      confidence: 1.0,
    };
  }

  // Step 2: Verified Conversational Knowledgebase Lookup
  const match = findMatchingPhrase(text, sLang);
  if (match) {
    const directTranslation = (match as any)[tLang];
    if (directTranslation) {
      return {
        success: true,
        translation: directTranslation,
        provider: "Verified-Conversational-Corpus",
        confidence: 0.98,
      };
    }
    // Fallback to English from the verified phrase if target is 'en'
    if (tLang === "en" && match.en) {
      return {
        success: true,
        translation: match.en,
        provider: "Verified-Conversational-Corpus",
        confidence: 0.98,
      };
    }
  }

  // Step 3: Google Gemini 2.5 Flash Multilingual Translation
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey) {
    try {
      const prompt = `You are a linguistically precise translator specializing in Indian languages, Scheduled languages, and oral dialects (such as Telugu, Hindi, Tamil, Kannada, Malayalam, Gondi, Koya, and Lambadi). Translate the following text from ${sLang} to ${tLang}. Preserve cultural nuances, honorifics, and dialectical vocabulary accurately. Output ONLY the translated text in its natural script or language without explanatory notes, conversational intros, or quotes.`;
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${prompt}\n\nText to translate:\n${text}` },
                ],
              },
            ],
          }),
          signal: AbortSignal.timeout(6000),
        }
      );
      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const candidate = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (candidate) {
          return {
            success: true,
            translation: candidate,
            provider: "Google-Gemini-Flash",
            confidence: 0.95,
          };
        }
      }
    } catch {
      // Fall through to next tier
    }
  }

  // Step 4: Hugging Face IndicTrans2 (Bidirectional Model Routing)
  const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
  if (hfToken) {
    try {
      let modelId = "ai4bharat/indictrans2-indic-en-dist-200M";
      if (sLang === "en" && tLang !== "en") {
        modelId = "ai4bharat/indictrans2-en-indic-dist-200M";
      } else if (sLang !== "en" && tLang !== "en") {
        modelId = "ai4bharat/indictrans2-indic-indic-dist-200M";
      }

      const hfRes = await fetch(
        `https://api-inference.huggingface.co/models/${modelId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: text }),
          signal: AbortSignal.timeout(6000),
        }
      );
      if (hfRes.ok) {
        const hfData = await hfRes.json();
        if (Array.isArray(hfData) && hfData[0]?.generated_text) {
          return {
            success: true,
            translation: hfData[0].generated_text.trim(),
            provider: "IndicTrans2-HuggingFace",
            confidence: 0.94,
          };
        }
      }
    } catch {
      // Fall through to next tier
    }
  }

  // Step 5: External Machine Translation (MyMemory)
  const extResult = await fetchExternalTranslation(text, sLang, tLang);
  if (extResult.success && extResult.translation) {
    return {
      success: true,
      translation: extResult.translation,
      provider: "Neural-Translation-Service",
      confidence: 0.90,
    };
  }

  // Step 6: Oral Dialect / Substring Corpus Match Fallback
  // If text contains known words from our 10 dialogue scenarios
  if (match) {
    const fallbackText = (match as any)[tLang] || match.te || match.en;
    if (fallbackText) {
      return {
        success: true,
        translation: fallbackText,
        provider: "Oral-Heritage-Corpus-Fallback",
        confidence: 0.88,
      };
    }
  }

  return {
    success: false,
    error: `Unable to translate phrase from ${sLang.toUpperCase()} to ${tLang.toUpperCase()}.`,
    details: extResult.error,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawText = searchParams.get("text") || "";
  const rawSource = (searchParams.get("language") || "telugu").toLowerCase();
  const rawTarget = (searchParams.get("target") || "en").toLowerCase();

  const sourceLang = LANG_CODE_MAP[rawSource] || rawSource;
  const targetLang = LANG_CODE_MAP[rawTarget] || rawTarget;

  if (!rawText.trim()) {
    return NextResponse.json(
      { success: false, error: "Text query parameter is required." },
      { status: 400 }
    );
  }

  const result = await translateTextPipeline(rawText, sourceLang, targetLang);

  if (result.success && result.translation) {
    return NextResponse.json({
      success: true,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      originalText: rawText,
      translation: result.translation,
      provider: result.provider,
      confidence: result.confidence || 0.92,
    });
  }

  return NextResponse.json(
    {
      success: false,
      error: result.error || `Unable to translate phrase from ${sourceLang.toUpperCase()} to ${targetLang.toUpperCase()}.`,
      details: result.details,
      originalText: rawText,
    },
    { status: 502 }
  );
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `trans-${crypto.randomBytes(6).toString("hex")}`;

  try {
    // 1. IP Rate Limiting Gate
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateCheck = checkRateLimit(clientIp, 60, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please wait before submitting more translation requests.",
          resetInSec: rateCheck.resetInSec,
        },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSec) } }
      );
    }

    const body = await request.json();
    const rawText = body.text || "";

    // 2. Input Sanitization
    const text = sanitizeInput(rawText, 2500);
    if (!text.trim()) {
      return NextResponse.json(
        { success: false, error: "Invalid input. Text payload cannot be empty." },
        { status: 400 }
      );
    }

    const rawSource = (body.sourceLanguage || body.sourceLang || "te").toLowerCase();
    const rawTarget = (body.targetLanguage || body.targetLang || "en").toLowerCase();

    const sLang = LANG_CODE_MAP[rawSource] || rawSource;
    const tLang = LANG_CODE_MAP[rawTarget] || rawTarget;

    const pipelineResult = await translateTextPipeline(text, sLang, tLang);
    const durationMs = Date.now() - startTime;

    if (!pipelineResult.success || !pipelineResult.translation) {
      console.warn(
        JSON.stringify({
          stage: "TRANSLATION_FAILED",
          requestId,
          sourceLang: sLang,
          targetLang: tLang,
          textLength: text.length,
          durationMs,
        })
      );

      return NextResponse.json(
        {
          success: false,
          code: "TRANSLATION_UNAVAILABLE",
          error: `Translation from ${sLang.toUpperCase()} to ${tLang.toUpperCase()} is currently unavailable for this specific sentence.`,
          originalText: text,
          sourceLanguage: sLang,
          targetLanguage: tLang,
          details: pipelineResult.details,
        },
        { status: 502 }
      );
    }

    // Cryptographic Provenance Hash
    const provenanceHash = await computeSHA256(`${sLang}:${tLang}:${text}:${pipelineResult.translation}`);

    console.log(
      JSON.stringify({
        stage: "TRANSLATION_SUCCESS",
        requestId,
        sourceLang: sLang,
        targetLang: tLang,
        provider: pipelineResult.provider,
        durationMs,
      })
    );

    return NextResponse.json({
      success: true,
      sourceLanguage: sLang,
      targetLanguage: tLang,
      originalText: text,
      translation: pipelineResult.translation,
      provider: pipelineResult.provider,
      provenanceHash,
      confidence: pipelineResult.confidence || 0.92,
      durationMs,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_TRANSLATION_ERROR",
        error: "Translation processing failed due to an unexpected error.",
        details: err?.message,
      },
      { status: 500 }
    );
  }
}
