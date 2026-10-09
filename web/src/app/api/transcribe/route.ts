import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Allowed standard and mobile audio MIME types & extensions
const ALLOWED_MIME_TYPES = new Set([
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/webm",
  "audio/ogg",
  "audio/flac",
  "audio/aac",
  "video/mp4",
  "video/webm",
]);

const ALLOWED_EXTENSIONS = /\.(wav|mp3|m4a|aac|webm|ogg|flac|mp4)$/i;
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB limit for API transcription

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `asr-${crypto.randomBytes(6).toString("hex")}`;

  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_CONTENT_TYPE",
          error: "Request must be multipart/form-data containing the audio file.",
        },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const requestedLang = ((formData.get("language") as string) || "auto").toLowerCase();

    // 1. Validation: File presence & non-empty check
    if (!file || file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          code: "EMPTY_AUDIO_FILE",
          error: "No audio file provided or file is empty (0 bytes). Please select a valid recording.",
        },
        { status: 400 }
      );
    }

    // 2. Validation: File format & MIME check
    const mimeMatch = file.type && ALLOWED_MIME_TYPES.has(file.type.toLowerCase());
    const extMatch = ALLOWED_EXTENSIONS.test(file.name);
    if (!mimeMatch && !extMatch) {
      return NextResponse.json(
        {
          success: false,
          code: "UNSUPPORTED_AUDIO_FORMAT",
          error: `Unsupported audio format '${file.type || "unknown"}'. Supported formats: WAV, MP3, M4A, WebM, OGG, FLAC.`,
        },
        { status: 400 }
      );
    }

    // 3. Validation: File size threshold
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          code: "FILE_TOO_LARGE",
          error: `Audio file (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds the 25 MB limit for speech recognition.`,
        },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Check Configured AI Providers
    const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    // --- Provider A: Hugging Face Inference API ---
    if (hfToken) {
      // Select appropriate model based on requested language
      let modelId = "openai/whisper-large-v3-turbo";
      if (requestedLang === "te" || requestedLang === "telugu") {
        modelId = "vasista22/whisper-telugu-base";
      }

      const hfResponse = await fetch(
        `https://api-inference.huggingface.co/models/${modelId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfToken}`,
            "Content-Type": file.type || "audio/wav",
          },
          body: buffer,
        }
      );

      const durationMs = Date.now() - startTime;

      if (hfResponse.ok) {
        const result = await hfResponse.json();
        const transcriptText = (result.text || "").trim();

        // Privacy-safe server log
        console.log(
          JSON.stringify({
            stage: "ASR_SUCCESS",
            requestId,
            provider: "HuggingFace",
            model: modelId,
            durationMs,
            fileSize: file.size,
            charsProduced: transcriptText.length,
          })
        );

        return NextResponse.json({
          success: true,
          transcript: transcriptText,
          language: requestedLang,
          provider: "HuggingFace-Whisper",
          model: modelId,
          durationMs,
          fileName: file.name,
        });
      }

      if (hfResponse.status === 503) {
        const hfError = await hfResponse.json();
        return NextResponse.json(
          {
            success: false,
            code: "MODEL_LOADING",
            error: "Hugging Face model is currently warming up. Please try again in 20 seconds.",
            estimatedTimeSeconds: hfError.estimated_time || 20,
          },
          { status: 503 }
        );
      }

      const errorText = await hfResponse.text();
      console.warn(
        JSON.stringify({
          stage: "ASR_PROVIDER_ERROR",
          requestId,
          status: hfResponse.status,
          errorSummary: errorText.slice(0, 200),
        })
      );

      return NextResponse.json(
        {
          success: false,
          code: "PROVIDER_FAILURE",
          error: `Hugging Face transcription service failed with status ${hfResponse.status}.`,
        },
        { status: 502 }
      );
    }

    // --- Provider B: OpenAI Whisper API ---
    if (openAiKey) {
      const openAiFormData = new FormData();
      const audioBlob = new Blob([buffer], { type: file.type || "audio/wav" });
      openAiFormData.append("file", audioBlob, file.name);
      openAiFormData.append("model", "whisper-1");
      if (requestedLang && requestedLang !== "auto") {
        openAiFormData.append("language", requestedLang);
      }

      const openAiRes = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openAiKey}`,
          },
          body: openAiFormData,
        }
      );

      const durationMs = Date.now() - startTime;

      if (openAiRes.ok) {
        const data = await openAiRes.json();
        return NextResponse.json({
          success: true,
          transcript: data.text || "",
          language: requestedLang,
          provider: "OpenAI-Whisper",
          model: "whisper-1",
          durationMs,
          fileName: file.name,
        });
      }

      return NextResponse.json(
        {
          success: false,
          code: "PROVIDER_FAILURE",
          error: `OpenAI Whisper transcription failed with status ${openAiRes.status}.`,
        },
        { status: 502 }
      );
    }

    // --- Provider C: Transparent Diagnostic Response when credentials are not configured ---
    // We NEVER return fake transcripts or pretended success.
    console.log(
      JSON.stringify({
        stage: "ASR_UNCONFIGURED_CREDENTIALS",
        requestId,
        fileSize: file.size,
        fileName: file.name,
        language: requestedLang,
      })
    );

    return NextResponse.json(
      {
        success: false,
        code: "PROVIDER_NOT_CONFIGURED",
        error: "Server-side Speech-to-Text provider is not configured. Please set HF_TOKEN in your Render environment variables, or use browser speech recognition (Microphone) on the client.",
        details: {
          audioAccepted: true,
          fileName: file.name,
          fileSizeBytes: file.size,
          detectedFormat: file.type || "audio/wav",
          sourceLanguage: requestedLang,
        },
        instructions: "To enable server Whisper transcription: In Render Dashboard -> voice-roots service -> Environment -> Add Environment Variable -> Key: HF_TOKEN, Value: your Hugging Face Token.",
      },
      { status: 503 }
    );
  } catch (err: any) {
    console.error(
      JSON.stringify({
        stage: "ASR_SERVER_EXCEPTION",
        requestId,
        error: err?.message,
      })
    );

    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_ERROR",
        error: "Failed to process audio transcription request.",
        details: err?.message,
      },
      { status: 500 }
    );
  }
}

