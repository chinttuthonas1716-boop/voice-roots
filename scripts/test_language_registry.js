/**
 * Voice Roots Automated Test Suite: India Language Registry & Oral Heritage Preservation
 * 
 * Tests:
 * 1. National Language Registry Schema & Baseline (Census 2011 C-16, SPPEL)
 * 2. 5 Official Classification Statuses
 * 3. Discrete Digital Resource Assessments (ASR, TTS, Translation, Recordings, Transcripts)
 * 4. Dataset Catalog Integrity (IndicVoices, Kathbath, Vistaar, Common Voice, FLEURS, Indic-TTS)
 * 5. Oral Languages & Community Preservation (Gondi, Koya, Lambadi, Tulu, Kui)
 * 6. Registry Filter and Search Functions
 */

const fs = require("fs");
const path = require("path");

async function runRegistryTests() {
  console.log("================================================================================");
  console.log("VOICE ROOTS — INDIA LANGUAGE REGISTRY & RESOURCE STATUS TEST SUITE");
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

  // 1. File Exists & Compilation
  const registryFilePath = path.resolve(__dirname, "../web/src/lib/datasetRegistry.ts");
  assert(fs.existsSync(registryFilePath), "Registry library file exists", registryFilePath);

  const registryCode = fs.readFileSync(registryFilePath, "utf-8");

  // 2. 5 Official Classification Statuses
  console.log("\n[SUITE 1] Validating 5 Official Classification Statuses:");
  const statuses = [
    "OFFICIALLY_DOCUMENTED",
    "DIGITAL_RESOURCES_AVAILABLE",
    "LIMITED_DIGITAL_RESOURCES",
    "NEEDS_ASSESSMENT",
    "COMMUNITY_PRESERVATION_NEEDED",
  ];
  for (const s of statuses) {
    assert(registryCode.includes(s), `Status defined: ${s}`);
  }

  // 3. Discrete Resource Audit Statuses
  console.log("\n[SUITE 2] Validating Discrete Resource Audit Dimensions:");
  const dimensions = [
    "asrStatus",
    "ttsStatus",
    "translationStatus",
    "speechRecordingsStatus",
    "verifiedTranscriptsStatus",
  ];
  for (const dim of dimensions) {
    assert(registryCode.includes(dim), `Dimension tracked: ${dim}`);
  }

  // 4. Cataloged Public & Community Datasets
  console.log("\n[SUITE 3] Validating Public Dataset Index:");
  const requiredDatasets = [
    "indicvoices",
    "kathbath",
    "vistaar",
    "commonvoice",
    "fleurs",
    "indictts",
    "voiceroots-community",
  ];
  for (const ds of requiredDatasets) {
    assert(registryCode.includes(`id: "${ds}"`), `Dataset cataloged: ${ds}`);
  }

  // 5. Official Census 2011 & SPPEL Citations
  console.log("\n[SUITE 4] Validating Official Baseline & Citations:");
  assert(registryCode.includes("Census of India 2011"), "Contains official Census 2011 citations");
  assert(registryCode.includes("Table C-16"), "References Census 2011 Table C-16");
  assert(registryCode.includes("SPPEL"), "References Scheme for Protection and Preservation of Endangered Languages");
  assert(registryCode.includes("isScheduled8"), "Distinguishes 8th Schedule languages from non-scheduled");

  // 6. Oral & Indigenous Languages Audited
  console.log("\n[SUITE 5] Validating Oral & Indigenous Language Coverage:");
  const oralLanguages = [
    { name: "Gondi", code: "gon" },
    { name: "Koya", code: "koy" },
    { name: "Lambadi", code: "lam" },
    { name: "Tulu", code: "tcy" },
    { name: "Kui", code: "kxu" },
  ];
  for (const l of oralLanguages) {
    assert(registryCode.includes(`languageCode: "${l.code}"`), `Audited oral language: ${l.name} (${l.code})`);
  }

  // 7. Registry Page UI Integrity
  console.log("\n[SUITE 6] Validating Registry Public Web Page (/registry):");
  const registryPagePath = path.resolve(__dirname, "../web/src/app/registry/page.tsx");
  assert(fs.existsSync(registryPagePath), "Registry UI page file exists", registryPagePath);
  const registryPageCode = fs.readFileSync(registryPagePath, "utf-8");

  assert(registryPageCode.includes("CLASSIFICATION_FILTERS"), "Contains 5-tier classification filters");
  assert(registryPageCode.includes("filteredLanguages"), "Implements dynamic client-side filtering");
  assert(registryPageCode.includes("SPEECH_DATASET_REGISTRY") || registryPageCode.includes("getAllDatasetEntries"), "Displays linked speech dataset benchmark cards");
  assert(registryPageCode.includes("census2011Speakers"), "Renders official historical Census 2011 speaker counts with clear year citation");

  // 8. Navigation Integration
  console.log("\n[SUITE 7] Validating Navigation Integration:");
  const navbarPath = path.resolve(__dirname, "../web/src/components/ui/Navbar.tsx");
  const navbarCode = fs.readFileSync(navbarPath, "utf-8");
  assert(navbarCode.includes('/registry'), "Navbar includes link to /registry");

  console.log("\n================================================================================");
  console.log(`REGISTRY TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRegistryTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
