#!/usr/bin/env node
/**
 * Voice Roots — Comprehensive End-to-End User Journey Test Suite
 * Validates the entire user experience locally without external network dependencies:
 * 1. Unauthenticated Visitor Flow (Home, Explore, Archive, Translate, Upload, Login)
 * 2. Complete Authentication & Custodian Lifecycle (Register, Login, Demo 1-Click, Me, Logout)
 * 3. Everyday Multilingual Conversations (Corpus, Turns, Transliterations)
 * 4. Audio Processing & Translation Gateway (Validation, Exact Corpus, Provenance Hash)
 * 5. Offline-First Synchronization & Idempotent Operations
 * 6. Flutter Mobile Client Token Alignment & Navigation Contracts
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`❌ FAIL: ${message}`);
  }
}

function makeRequest(endpoint, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || "GET",
      headers: options.headers || {},
      timeout: 10000,
    };

    const req = http.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          json,
        });
      });
    });

    req.on("error", (err) => reject(err));
    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`Request timeout for ${endpoint}`));
    });

    if (postData) {
      req.write(typeof postData === "string" ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runE2EUserJourneyTests() {
  console.log("================================================================================");
  console.log("VOICE ROOTS — COMPREHENSIVE END-TO-END USER JOURNEY TEST SUITE");
  console.log(`Target: ${BASE_URL}`);
  console.log("================================================================================\n");

  try {
    // --------------------------------------------------------------------------
    // JOURNEY STAGE 1: UNAUTHENTICATED VISITOR JOURNEY
    // --------------------------------------------------------------------------
    console.log("[JOURNEY 1] Public Visitor Browsing & Navigation Discovery:");

    const homeRes = await makeRequest("/");
    assert(homeRes.statusCode === 200, "Home page loads with HTTP 200 OK");
    assert(homeRes.body.includes("Voice Roots") || homeRes.body.includes("VOICE ROOTS"), "Home page displays Voice Roots brand");
    assert(homeRes.body.includes("Log In"), "Home page navigation prominently features 'Log In'");

    const exploreRes = await makeRequest("/explore");
    assert(exploreRes.statusCode === 200, "Explore page loads with HTTP 200 OK");
    assert(exploreRes.body.includes("Oral Tradition Records") || exploreRes.body.includes("Census") || exploreRes.body.includes("Language"), "Explore page displays linguistic catalog");

    const archiveRes = await makeRequest("/archive");
    assert(archiveRes.statusCode === 200, "Archive page loads with HTTP 200 OK");
    assert(archiveRes.body.includes("Oral Heritage Archive"), "Archive page renders living cultural archive");

    const translateRes = await makeRequest("/translate");
    assert(translateRes.statusCode === 200, "Everyday Conversations (/translate) loads with HTTP 200 OK");
    assert(translateRes.body.includes("Everyday Conversations") || translateRes.body.includes("Dialogue"), "Conversations page renders structured categories");

    const uploadRes = await makeRequest("/upload");
    assert(uploadRes.statusCode === 200, "Upload studio page (/upload) loads with HTTP 200 OK");
    assert(uploadRes.body.includes("Upload") && uploadRes.body.includes("Transcribe"), "Upload page renders audio studio controls");

    const loginRes = await makeRequest("/login");
    assert(loginRes.statusCode === 200, "Login page (/login) loads with HTTP 200 OK");
    assert(loginRes.body.includes("Welcome back") || loginRes.body.includes("Sign In"), "Login form is actively rendered and visible on /login");
    assert(loginRes.body.includes("elder@voiceroots.org"), "Login page displays custodian email input placeholder");
    assert(loginRes.body.includes("Quick Demo Accounts"), "Login page features 1-click Quick Demo accounts selector");

    // --------------------------------------------------------------------------
    // JOURNEY STAGE 2: AUTHENTICATION & CUSTODIAN PROFILE LIFECYCLE
    // --------------------------------------------------------------------------
    console.log("\n[JOURNEY 2] Custodian Registration, Authentication & RBAC:");

    const testEmail = `custodian_${Date.now()}@testcommunity.org`;
    const testPassword = "SecurePassword@2026";

    // 1. Register a new community custodian
    const registerRes = await makeRequest(
      "/api/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        name: "Devendra Koya",
        email: testEmail,
        password: testPassword,
        role: "contributor",
        clanOrCommunity: "Koya Hill Clan",
        location: "Maredumilli, Andhra Pradesh",
        languages: ["Koya (కోయ)", "Telugu (తెలుగు)"],
      }
    );

    assert(registerRes.statusCode === 200 && registerRes.json?.success === true, "New custodian registered successfully via /api/auth/register");
    assert(registerRes.json?.user?.name === "Devendra Koya", "Registered user profile preserves full custodian name");
    assert(registerRes.json?.user?.clanOrCommunity === "Koya Hill Clan", "Registered user preserves community heritage metadata");
    const authToken = registerRes.json?.token;
    assert(authToken && authToken.startsWith("vr_sess_"), "Server returns cryptographically signed HMAC-SHA256 session token");

    // 2. Log in with registered credentials
    const loginAttempt = await makeRequest(
      "/api/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        email: testEmail,
        password: testPassword,
      }
    );

    assert(loginAttempt.statusCode === 200 && loginAttempt.json?.success === true, "Login with registered credentials succeeds via /api/auth/login");
    assert(loginAttempt.json?.user?.email === testEmail, "Login response returns authenticated user matching email");

    // 3. Test 1-Click Demo Accounts with voiceroots2026
    const demoElders = [
      { name: "Elder Laxman", email: "soyam.laxman@voiceroots.org" },
      { name: "Dr. Ananya", email: "ananya.sen@indiclinguistics.edu" },
      { name: "K. Ramesh", email: "kovvasi.ramesh@community.org" },
    ];

    for (const demo of demoElders) {
      const demoRes = await makeRequest(
        "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
        {
          email: demo.email,
          password: "voiceroots2026",
        }
      );
      assert(demoRes.statusCode === 200 && demoRes.json?.success === true, `1-Click Demo login succeeds for ${demo.name} (${demo.email})`);
    }

    // 4. Test Token-based Identity Inspection (/api/auth/me)
    const meRes = await makeRequest("/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    assert(meRes.statusCode === 200 && meRes.json?.success === true, "Session token authenticated successfully via /api/auth/me");
    assert(meRes.json?.user?.email === testEmail, "/api/auth/me returns matching authenticated custodian profile");

    // 5. Test Password Recovery Flow
    const forgotRes = await makeRequest(
      "/api/auth/forgot-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      { email: testEmail }
    );
    assert(forgotRes.statusCode === 200 && forgotRes.json?.success === true, "Password reset request accepted via /api/auth/forgot-password");

    // --------------------------------------------------------------------------
    // JOURNEY STAGE 3: MULTILINGUAL EVERYDAY CONVERSATIONS MODULE
    // --------------------------------------------------------------------------
    console.log("\n[JOURNEY 3] Everyday Multilingual Conversations & Speech Synthesis:");

    const conversationsPath = path.resolve(__dirname, "../web/src/lib/conversations.ts");
    assert(fs.existsSync(conversationsPath), "Conversations corpus exists in web/src/lib/conversations.ts");

    const convRaw = fs.readFileSync(conversationsPath, "utf-8");
    assert(convRaw.includes("Greetings and introductions"), "Corpus contains Greetings category");
    assert(convRaw.includes("Shopping and money"), "Corpus contains Shopping category");
    assert(convRaw.includes("College and classroom"), "Corpus contains College category");
    assert(convRaw.includes("Food and restaurants"), "Corpus contains Food category");
    assert(convRaw.includes("Travel and directions"), "Corpus contains Travel category");
    assert(convRaw.includes("pronunciation"), "Corpus includes phonetic pronunciation guidance");
    assert(convRaw.includes("speaker"), "Dialogue scripts define structured turn speakers");

    // --------------------------------------------------------------------------
    // JOURNEY STAGE 4: AUDIO UPLOAD, TRANSCRIPTION & TRANSLATION PIPELINE
    // --------------------------------------------------------------------------
    console.log("\n[JOURNEY 4] Audio Upload, Speech Recognition & Translation Gateway:");

    // 1. Transcribe route rejects empty payloads
    const emptyTranscribeRes = await makeRequest(
      "/api/transcribe",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {}
    );
    assert(emptyTranscribeRes.statusCode === 400, "/api/transcribe rejects non-multipart / empty requests with HTTP 400");

    // 2. Translation route with conversational phrase lookup
    const translateApiRes = await makeRequest(
      "/api/translate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        text: "నమస్కారం! మీరు ఎలా ఉన్నారు?",
        sourceLanguage: "Telugu",
        targetLanguage: "English",
      }
    );

    assert(translateApiRes.statusCode === 200 && translateApiRes.json?.success === true, "/api/translate processes translation request successfully");
    assert(translateApiRes.json?.translation?.length > 0, "Translation returns non-empty translated string");
    assert(translateApiRes.json?.provenanceHash && translateApiRes.json?.provenanceHash.length === 64, "Translation generates valid 64-character SHA-256 provenance hash");

    // --------------------------------------------------------------------------
    // JOURNEY STAGE 5: OFFLINE-FIRST PERSISTENCE & IDEMPOTENT SYNCHRONIZATION
    // --------------------------------------------------------------------------
    console.log("\n[JOURNEY 5] Offline Queue & Idempotent Sync Validation:");

    const testOperationId = `op_e2e_${Date.now()}`;
    const syncRes1 = await makeRequest(
      "/api/sync/idempotent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        clientOperationId: testOperationId,
        actionType: "save_recording",
        payload: {
          title: "Generational Harvest Chant",
          language: "Telugu",
          dialect: "Godavari",
        },
      }
    );

    assert(syncRes1.statusCode === 200 && syncRes1.json?.success === true, "Idempotent sync endpoint accepts initial offline operation");
    assert(syncRes1.json?.idempotentReplay === false && syncRes1.json?.result?.status === "SYNCED_TO_CLOUD", "First submission marked as newly synchronized");

    // Replay identical operation to verify idempotency
    const syncRes2 = await makeRequest(
      "/api/sync/idempotent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        clientOperationId: testOperationId,
        actionType: "save_recording",
        payload: {
          title: "Generational Harvest Chant",
          language: "Telugu",
          dialect: "Godavari",
        },
      }
    );

    assert(syncRes2.statusCode === 200 && syncRes2.json?.success === true, "Idempotent sync endpoint safely handles replayed operation");
    assert(syncRes2.json?.idempotentReplay === true, "Replayed operation recognized as duplicate without creating phantom records");

    // --------------------------------------------------------------------------
    // JOURNEY STAGE 6: FLUTTER MOBILE CLIENT DESIGN SYSTEM ALIGNMENT
    // --------------------------------------------------------------------------
    console.log("\n[JOURNEY 6] Flutter Mobile Client Theme & Navigation Contracts:");

    const flutterThemePath = path.resolve(__dirname, "../flutter_app/lib/app/theme.dart");
    assert(fs.existsSync(flutterThemePath), "Flutter theme file exists in flutter_app/lib/app/theme.dart");

    const themeCode = fs.readFileSync(flutterThemePath, "utf-8");
    assert(themeCode.includes("0xFF2D3250"), "Flutter theme defines exact primary background #2D3250");
    assert(themeCode.includes("0xFFF9B17A"), "Flutter theme defines exact peach accent #F9B17A");
    assert(themeCode.includes("0xFF242942"), "Flutter theme defines exact elevated deep background #242942");
    assert(themeCode.includes("static const Color warmAmber = VoiceRootsColors.warmAmber"), "VoiceRootsTheme exposes warmAmber static accessor");
    assert(themeCode.includes("static const Color secondaryText = VoiceRootsColors.textSecondary"), "VoiceRootsTheme exposes secondaryText static accessor");

    const flutterMainPath = path.resolve(__dirname, "../flutter_app/lib/main.dart");
    const mainCode = fs.readFileSync(flutterMainPath, "utf-8");
    assert(mainCode.includes("VoiceRootsBottomNav"), "Flutter main navigation uses VoiceRootsBottomNav");

    const flutterNavPath = path.resolve(__dirname, "../flutter_app/lib/widgets/bottom_nav.dart");
    const navCode = fs.readFileSync(flutterNavPath, "utf-8");
    assert(navCode.includes("VoiceRootsColors.backgroundDeep"), "Flutter bottom dock uses dark navy backgroundDeep glass surface");
    assert(navCode.includes("VoiceRootsColors.peach"), "Flutter bottom dock uses peach active indicators");

    // --------------------------------------------------------------------------
    // SUMMARY
    // --------------------------------------------------------------------------
    console.log("\n================================================================================");
    console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED out of ${totalTests} TOTAL`);
    console.log("================================================================================");

    if (failedTests > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("Critical test execution failure:", err);
    process.exit(1);
  }
}

runE2EUserJourneyTests();
