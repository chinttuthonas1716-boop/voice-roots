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
};

/**
 * Attempts real external machine translation via MyMemory free API.
 */
async function fetchExternalTranslation(
  text: string,
  fromLang: string,
  toLang: string
): Promise<{ success: boolean; translation?: string; error?: string }> {
  try {
    const pair = `${fromLang}|${toLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(pair)}`;
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000), // 6-second timeout
    });

    if (!res.ok) {
      return { success: false, error: `External translation returned HTTP ${res.status}` };
    }

    const data = await res.json();
    if (data.responseData && data.responseData.translatedText) {
      const translated = data.responseData.translatedText.trim();
      // Verify response isn't an error message from the provider
      if (!translated.toUpperCase().startsWith("QUERY LENGTH LIMIT") &&
          !translated.toUpperCase().startsWith("INVALID LANGUAGE PAIR")) {
        return { success: true, translation: translated };
      }
    }

    return { success: false, error: "External translation provider did not return valid text." };
  } catch (err: any) {
    return { success: false, error: err?.message || "Translation network timeout" };
  }
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

  // 1. Check verified conversational corpus
  const match = findMatchingPhrase(rawText, sourceLang);
  if (match) {
    const translation = (match as any)[targetLang] || match.en;
    return NextResponse.json({
      success: true,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      originalText: rawText,
      translation,
      provider: "Verified-Conversational-Corpus",
      confidence: 0.98,
    });
  }

  // 2. Real external translation fallback
  const external = await fetchExternalTranslation(rawText, sourceLang, targetLang);
  if (external.success && external.translation) {
    return NextResponse.json({
      success: true,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      originalText: rawText,
      translation: external.translation,
      provider: "Neural-Translation-Service",
      confidence: 0.92,
    });
  }

  return NextResponse.json({
    success: false,
    error: `Unable to translate phrase from ${sourceLang.toUpperCase()} to ${targetLang.toUpperCase()}.`,
    details: external.error,
    originalText: rawText,
  }, { status: 502 });
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

    // Check if source and target are identical
    if (sLang === tLang) {
      return NextResponse.json({
        success: true,
        sourceLanguage: sLang,
        targetLanguage: tLang,
        originalText: text,
        translation: text,
        provider: "Identity-NoOp",
        confidence: 1.0,
      });
    }

    let translation = "";
    let providerUsed = "";

    // 3. Stage 1: Verified Conversational Knowledgebase Lookup
    const match = findMatchingPhrase(text, sLang);
    if (match) {
      translation = (match as any)[tLang] || match.en;
      providerUsed = "Verified-Conversational-Corpus";
    }

    // 4. Stage 2: Hugging Face IndicTrans2 if HF_TOKEN is configured
    if (!translation && process.env.HF_TOKEN) {
      try {
        const hfRes = await fetch(
          "https://api-inference.huggingface.co/models/ai4bharat/indictrans2-indic-en-dist-200M",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.HF_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: text }),
            signal: AbortSignal.timeout(5000),
          }
        );
        if (hfRes.ok) {
          const hfData = await hfRes.json();
          if (Array.isArray(hfData) && hfData[0]?.generated_text) {
            translation = hfData[0].generated_text.trim();
            providerUsed = "IndicTrans2-HuggingFace";
          }
        }
      } catch {
        // Fall through to external translation
      }
    }

    // 5. Stage 3: Live External Machine Translation
    if (!translation) {
      const extResult = await fetchExternalTranslation(text, sLang, tLang);
      if (extResult.success && extResult.translation) {
        translation = extResult.translation;
        providerUsed = "Neural-Translation-Service";
      }
    }

    const durationMs = Date.now() - startTime;

    // 6. Distinct Error Response if translation could not be performed
    if (!translation) {
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
        },
        { status: 502 }
      );
    }

    // 7. Cryptographic Provenance Hash
    const provenanceHash = await computeSHA256(`${sLang}:${tLang}:${text}:${translation}`);

    console.log(
      JSON.stringify({
        stage: "TRANSLATION_SUCCESS",
        requestId,
        sourceLang: sLang,
        targetLang: tLang,
        provider: providerUsed,
        durationMs,
      })
    );

    return NextResponse.json({
      success: true,
      sourceLanguage: sLang,
      targetLanguage: tLang,
      originalText: text,
      translation,
      provider: providerUsed,
      provenanceHash,
      confidence: providerUsed.includes("Corpus") ? 0.98 : 0.91,
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
