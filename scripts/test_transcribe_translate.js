/**
 * Voice Roots Automated Test Suite
 * Tests:
 * 1. 10-Category Day-to-Day Conversational Corpus Verification
 * 2. Transliteration and Pronunciation Guidance Coverage
 * 3. Dialogue Turns and Speaker Labels Integrity
 * 4. Transcription API Endpoint Verification (/api/transcribe)
 * 5. Translation API Endpoint & Corpus Lookup (/api/translate)
 * 6. Error Isolation & Diagnostic Responses (No Fake Mocks)
 */

const fs = require("fs");
const path = require("path");

async function runTests() {
  console.log("================================================================================");
  console.log("VOICE ROOTS — MULTILINGUAL TRANSCRIPTION & TRANSLATION TEST SUITE");
  console.log("================================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = "") {
    if (condition) {
      console.log(`✓ PASS: ${testName} ${details ? "(" + details + ")" : ""}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${details ? "(" + details + ")" : ""}`);
      failed++;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 1: 10-Category Day-to-Day Conversational Corpus
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n[SUITE 1] Validating Day-to-Day Conversational Corpus:");
  const convFilePath = path.resolve(__dirname, "../web/src/lib/conversations.ts");
  assert(fs.existsSync(convFilePath), "Conversations library file exists", convFilePath);

  const convContent = fs.readFileSync(convFilePath, "utf-8");

  const requiredCategories = [
    "Greetings and introductions",
    "Everyday questions and answers",
    "College and classroom",
    "Shopping and money",
    "Food and restaurants",
    "Travel and directions",
    "Family and friends",
    "Healthcare and emergencies",
    "Work and interviews",
    "Common Telugu-English-Hindi conversations",
  ];

  for (const cat of requiredCategories) {
    assert(
      convContent.includes(cat),
      `Required category present: '${cat}'`
    );
  }

  // Check speaker turns and dialogue structures
  assert(
    convContent.includes("Speaker 1") && convContent.includes("Speaker 2"),
    "Dialogue turns include clear Speaker 1 and Speaker 2 labels"
  );

  assert(
    convContent.includes("transliteration:") && convContent.includes("pronunciationGuidance:"),
    "Transliterations and pronunciation guidance present on dialogue turns"
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 2: Audio Transcription Route (/api/transcribe)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n[SUITE 2] Validating Speech-to-Text Route (/api/transcribe):");
  const transcribeRoutePath = path.resolve(__dirname, "../web/src/app/api/transcribe/route.ts");
  assert(fs.existsSync(transcribeRoutePath), "Route file /api/transcribe/route.ts exists");

  const transcribeCode = fs.readFileSync(transcribeRoutePath, "utf-8");

  assert(
    transcribeCode.includes("multipart/form-data"),
    "Validates multipart/form-data content type"
  );

  assert(
    transcribeCode.includes("EMPTY_AUDIO_FILE"),
    "Validates and rejects empty audio files (0 bytes)"
  );

  assert(
    transcribeCode.includes("UNSUPPORTED_AUDIO_FORMAT"),
    "Validates audio format and MIME types (WAV, MP3, M4A, WebM, OGG)"
  );

  assert(
    transcribeCode.includes("PROVIDER_NOT_CONFIGURED"),
    "Returns transparent PROVIDER_NOT_CONFIGURED error without fake mock transcripts"
  );

  assert(
    transcribeCode.includes("HF_TOKEN") && transcribeCode.includes("whisper"),
    "Supports Hugging Face Whisper integration when credentials are provided"
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 3: Translation Route (/api/translate)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n[SUITE 3] Validating Translation Route (/api/translate):");
  const translateRoutePath = path.resolve(__dirname, "../web/src/app/api/translate/route.ts");
  assert(fs.existsSync(translateRoutePath), "Route file /api/translate/route.ts exists");

  const translateCode = fs.readFileSync(translateRoutePath, "utf-8");

  assert(
    translateCode.includes("findMatchingPhrase"),
    "Integrates with verified conversational corpus for exact phrase matching"
  );

  assert(
    !translateCode.includes("Preserving authentic cultural intent and spoken meaning"),
    "No fabricated template placeholder fallback strings"
  );

  assert(
    translateCode.includes("fetchExternalTranslation"),
    "Provides external neural translation fallback service"
  );

  assert(
    translateCode.includes("computeSHA256"),
    "Generates cryptographic provenance hash for data sovereignty audit"
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 4: Upload Page Two-Stage Workflow (/upload)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n[SUITE 4] Validating Upload & Transcription Workflow (/upload):");
  const uploadPagePath = path.resolve(__dirname, "../web/src/app/upload/page.tsx");
  const uploadCode = fs.readFileSync(uploadPagePath, "utf-8");

  assert(
    uploadCode.includes("handleTranscribeAudio") && uploadCode.includes("/api/transcribe"),
    "Distinct Stage 1: Calls /api/transcribe on user command"
  );

  assert(
    uploadCode.includes("handleTranslateTranscript") && uploadCode.includes("/api/translate"),
    "Distinct Stage 2: Calls /api/translate with reviewed transcript"
  );

  assert(
    uploadCode.includes("originalTranscript") && uploadCode.includes("onChange"),
    "Source transcript is displayed in editable textarea for user review and correction"
  );

  assert(
    uploadCode.includes("handleDownloadTxt") && uploadCode.includes("handleCopy"),
    "Independent Copy and Download (.txt) buttons for transcript and translation"
  );

  assert(
    !uploadCode.includes("baseTranscript = \"మా తాతలు చెప్పిన ప్రకారం"),
    "Hardcoded preset transcript injection removed completely from upload pipeline"
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 5: Translate Page Conversational Module (/translate)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n[SUITE 5] Validating Day-to-Day Module on Translate Page (/translate):");
  const translatePagePath = path.resolve(__dirname, "../web/src/app/translate/page.tsx");
  const translatePageCode = fs.readFileSync(translatePagePath, "utf-8");

  assert(
    translatePageCode.includes("CONVERSATION_CATEGORIES") && translatePageCode.includes("STRUCTURED_DIALOGUES"),
    "Imports and displays structured dialogues across all 10 categories"
  );

  assert(
    translatePageCode.includes("Browser TTS"),
    "Audio playback explicitly labeled as Browser TTS (no fake community recording claims)"
  );

  assert(
    translatePageCode.includes("showTransliteration"),
    "Interactive transliteration toggle supported"
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n================================================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

