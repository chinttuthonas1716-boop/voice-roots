import { NextRequest, NextResponse } from "next/server";
import { getAllLanguages, getLanguageById } from "@/lib/indiaGeoData";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      audioDuration = 12.0,
      audioScores = {},
      asrConfidence = 0.85,
      transcriptText = "",
      speakerSelfId,
      communitySelfId,
      stateContext,
      snrDb = 22.0,
      silencePct = 14.0,
      recordingId = "rec-live-01",
    } = body;

    // Stage 1: Audio Quality & Minimum Duration Check
    if (audioDuration < 5.0) {
      return NextResponse.json({
        success: true,
        status: "INSUFFICIENT_SPEECH",
        confidenceLevel: "UNKNOWN",
        confidenceScore: 0.0,
        primaryLanguage: null,
        message: `Insufficient speech for reliable identification (${audioDuration.toFixed(1)}s). Target 20–60 seconds of natural speech.`,
        temporaryName: `Unidentified Oral Language Recording #${recordingId}`,
        verificationStatus: "PENDING_LANGUAGE_IDENTIFICATION",
        candidates: [],
      });
    }

    if (snrDb < 8.0 || silencePct > 80.0) {
      return NextResponse.json({
        success: true,
        status: "POOR_AUDIO_QUALITY",
        confidenceLevel: "UNKNOWN",
        confidenceScore: 0.0,
        primaryLanguage: null,
        message: "Audio quality insufficient for reliable identification. Background noise or silence exceeds acceptable threshold.",
        temporaryName: `Unidentified Oral Language Recording #${recordingId}`,
        verificationStatus: "PENDING_LANGUAGE_IDENTIFICATION",
        candidates: [],
      });
    }

    // Stage 2: Multi-Signal Scoring Ensemble
    const weights = {
      audio: 0.35,
      asr: 0.20,
      transcript: 0.20,
      script: 0.10,
      selfId: 0.15,
      geoBonus: 0.05,
    };

    const combinedScores: Record<string, number> = {};

    // 1. Audio LID Scores
    for (const [lang, score] of Object.entries(audioScores)) {
      combinedScores[lang] = (score as number) * weights.audio;
    }

    // 2. ASR confidence addition
    const topAudioLang = Object.keys(audioScores).length > 0
      ? Object.entries(audioScores).sort((a, b) => (b[1] as number) - (a[1] as number))[0][0]
      : null;

    if (topAudioLang && combinedScores[topAudioLang]) {
      combinedScores[topAudioLang] += asrConfidence * weights.asr;
    }

    // 3. Script Detection
    let detectedScript = "Latin";
    if (/[\u0C00-\u0C7F]/.test(transcriptText)) detectedScript = "Telugu";
    else if (/[\u0900-\u097F]/.test(transcriptText)) detectedScript = "Devanagari";
    else if (/[\u0C80-\u0CFF]/.test(transcriptText)) detectedScript = "Kannada";
    else if (/[\u0B80-\u0BFF]/.test(transcriptText)) detectedScript = "Tamil";

    if (topAudioLang) {
      if (
        (detectedScript === "Telugu" && topAudioLang.toLowerCase() === "telugu") ||
        (detectedScript === "Devanagari" && ["hindi", "gondi", "lambadi"].includes(topAudioLang.toLowerCase()))
      ) {
        combinedScores[topAudioLang] += 1.0 * weights.script;
      }
    }

    // 4. Speaker / Community Self-Identification Priority
    const selfId = (communitySelfId || speakerSelfId || "").trim();
    if (selfId) {
      const matchKey = Object.keys(combinedScores).find(
        (k) => k.toLowerCase() === selfId.toLowerCase()
      );
      if (matchKey) {
        combinedScores[matchKey] += 1.0 * weights.selfId;
      } else {
        combinedScores[selfId] = 0.85 * weights.selfId;
      }
    }

    // 5. Geographic context (support prior only)
    if (stateContext && topAudioLang) {
      const scLower = stateContext.toLowerCase();
      if ((scLower.includes("andhra") || scLower.includes("telangana")) &&
          ["telugu", "gondi", "koya", "lambadi"].includes(topAudioLang.toLowerCase())) {
        combinedScores[topAudioLang] += weights.geoBonus;
      }
    }

    // Rank Candidates
    const allLangs = getAllLanguages();
    const sorted = Object.entries(combinedScores).sort((a, b) => b[1] - a[1]);

    const candidates = sorted.slice(0, 5).map(([langName, rawScore], index) => {
      const cat = allLangs.find((l) => l.name.toLowerCase() === langName.toLowerCase());
      const calibratedScore = Math.min(0.98, Math.max(0.15, rawScore));
      return {
        rank: index + 1,
        language: langName,
        censusCode: cat?.censusCode || null,
        confidence: Math.round(calibratedScore * 100) / 100,
        isScheduled: cat?.isScheduled || false,
        evidenceSource: "multi_signal_ensemble",
      };
    });

    const topCandidate = candidates[0];
    const topScore = topCandidate ? topCandidate.confidence : 0.0;

    let status = "UNKNOWN";
    let confidenceLevel = "UNKNOWN";

    if (candidates.length > 1 && topScore - candidates[1].confidence < 0.12 && topScore < 0.85) {
      status = "UNCERTAIN";
      confidenceLevel = "UNCERTAIN";
    } else if (topScore >= 0.90) {
      status = "HIGH_CONFIDENCE";
      confidenceLevel = "HIGH_CONFIDENCE";
    } else if (topScore >= 0.75) {
      status = "PROBABLE";
      confidenceLevel = "PROBABLE";
    } else if (topScore >= 0.50) {
      status = "UNCERTAIN";
      confidenceLevel = "UNCERTAIN";
    } else {
      status = "UNKNOWN";
      confidenceLevel = "UNKNOWN";
    }

    let isVerified = false;
    let finalLang = topCandidate?.language || null;

    if (selfId && topCandidate) {
      if (selfId.toLowerCase() === topCandidate.language.toLowerCase()) {
        isVerified = true;
        status = "COMMUNITY_VERIFIED";
        confidenceLevel = "HIGH_CONFIDENCE";
      } else {
        status = "PENDING_VERIFICATION";
        confidenceLevel = "UNCERTAIN";
      }
    }

    if (topScore < 0.50 && !selfId) {
      finalLang = null;
      status = "UNKNOWN";
      confidenceLevel = "UNKNOWN";
    }

    return NextResponse.json({
      success: true,
      status,
      confidenceLevel,
      confidenceScore: topScore,
      primaryLanguage: finalLang,
      aiDetectedLanguage: topCandidate?.language || null,
      speakerSelfIdentification: speakerSelfId || null,
      communitySelfIdentification: communitySelfId || null,
      isCommunityVerified: isVerified,
      verificationStatus: isVerified ? "COMMUNITY_VERIFIED" : "PENDING_VERIFICATION",
      candidates,
      scriptDetected: detectedScript,
      modelInfo: {
        audioLID: "Meta-MMS-LID-1024",
        asr: "Whisper-Indic-Ensemble",
        version: "v2.1-mms-indic",
      },
      temporaryName: !finalLang ? `Unidentified Oral Language Recording #${recordingId}` : null,
      evidenceSummary: {
        hasAudioModel: Object.keys(audioScores).length > 0,
        hasTranscriptDetection: Boolean(transcriptText),
        hasSelfIdentification: Boolean(selfId),
        geographicPriorApplied: Boolean(stateContext),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Language identification error" },
      { status: 500 }
    );
  }
}
