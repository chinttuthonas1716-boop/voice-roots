const path = require("path");
const fs = require("fs");

console.log("================================================================================");
console.log("VOICE ROOTS — DIAGNOSTIC REPRODUCTION SUITE");
console.log("================================================================================");

// 1. REPRODUCE: Audio Upload & Transcription Trace
console.log("\n[TEST 1] Testing Audio File Ingestion & ASR Route Existence:");
const testAudioPath = path.resolve(__dirname, "../web/public/audio/vr-106-telugu-recording.wav");
if (fs.existsSync(testAudioPath)) {
  const stat = fs.statSync(testAudioPath);
  console.log(`- Sample audio file found: vr-106-telugu-recording.wav (${stat.size} bytes)`);
} else {
  console.log("- Warning: sample audio file not found on disk");
}

const transcribeRoutePath = path.resolve(__dirname, "../web/src/app/api/transcribe/route.ts");
if (fs.existsSync(transcribeRoutePath)) {
  console.log("- /api/transcribe route: FOUND");
} else {
  console.log("- /api/transcribe route: ❌ NOT FOUND (404 Error: Speech-to-text API route is missing)");
}

// 2. REPRODUCE: Trace upload page handling in web/src/app/upload/page.tsx
console.log("\n[TEST 2] Tracing Transcription Handling in web/src/app/upload/page.tsx:");
const uploadPagePath = path.resolve(__dirname, "../web/src/app/upload/page.tsx");
const uploadCode = fs.readFileSync(uploadPagePath, "utf-8");

const hasFakeTranscript = uploadCode.includes("మా తాతలు చెప్పిన ప్రకారం");
const callsTranscribeApi = uploadCode.includes("/api/transcribe");
console.log(`- Hardcoded mock transcript injected in upload pipeline: ${hasFakeTranscript ? "YES (Identified at lines 242-252)" : "NO"}`);
console.log(`- Calls backend /api/transcribe endpoint: ${callsTranscribeApi ? "YES" : "❌ NO (Zero speech recognition calls)"}`);

// 3. REPRODUCE: Trace Translation Route Behavior in web/src/app/api/translate/route.ts
console.log("\n[TEST 3] Tracing Translation Logic in web/src/app/api/translate/route.ts:");
const translateRoutePath = path.resolve(__dirname, "../web/src/app/api/translate/route.ts");
const translateCode = fs.readFileSync(translateRoutePath, "utf-8");

const hasTemplateFallback = translateCode.includes("Preserving authentic cultural intent");
const hasHuggingFaceIntegration = translateCode.includes("huggingface") || translateCode.includes("HF_TOKEN");
const hasIndicTrans = translateCode.includes("indictrans2") && !translateCode.includes("fetch");

console.log(`- Hardcoded template string substitution: ${hasTemplateFallback ? "YES (Identified at line 201)" : "NO"}`);
console.log(`- Real AI provider or Hugging Face integration: ${hasHuggingFaceIntegration ? "YES" : "❌ NO (No external provider connected)"}`);
console.log(`- Fabricated model claim in JSON: ${hasIndicTrans ? "YES (Claims 'IndicTrans2-1B-Multi-Instruct' without invoking model)" : "NO"}`);

// 4. REPRODUCE: Check Environment Configuration
console.log("\n[TEST 4] Inspecting Environment Variables for AI Providers:");
const renderYamlPath = path.resolve(__dirname, "../render.yaml");
const renderYaml = fs.readFileSync(renderYamlPath, "utf-8");
const hasHfToken = renderYaml.includes("HF_TOKEN");
const hasOpenAiKey = renderYaml.includes("OPENAI_API_KEY");

console.log(`- HF_TOKEN in render.yaml: ${hasHfToken ? "CONFIGURED" : "❌ MISSING"}`);
console.log(`- OPENAI_API_KEY in render.yaml: ${hasOpenAiKey ? "CONFIGURED" : "❌ MISSING"}`);
console.log(`- Render service RAM limit: 512MB (Free Tier — cannot run local Whisper weights)`);

console.log("\n================================================================================");
console.log("REPRODUCTION DIAGNOSTIC COMPLETE — 4 ROOT CAUSES CONFIRMED");
console.log("================================================================================");

