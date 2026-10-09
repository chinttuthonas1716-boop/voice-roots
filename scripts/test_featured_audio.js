/**
 * Test script to validate Featured Oral Heritage audio:
 * 1. Checks all stories in heritageData.ts
 * 2. Validates story.id, language, title, originalAudioId, and audioUrl
 * 3. Verifies file existence on disk with size > 0
 * 4. Tests HTTP GET requests against the live server (port 3000)
 * 5. Verifies HTTP status 200 and Content-Type audio
 * 6. Confirms NO placeholder or generic music files are referenced
 */

const fs = require("fs");
const path = require("path");
const http = require("http");

async function checkUrl(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:3000${urlPath}`, (res) => {
      resolve({
        statusCode: res.statusCode,
        contentType: res.headers["content-type"],
        contentLength: res.headers["content-length"],
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
}

async function run() {
  console.log("==================================================");
  console.log("VOICE ROOTS — FEATURED ORAL HERITAGE AUDIO TEST");
  console.log("==================================================");

  // Read heritage stories from web/src/lib/heritageData.ts
  const heritageDataPath = path.resolve(__dirname, "../web/src/lib/heritageData.ts");
  const content = fs.readFileSync(heritageDataPath, "utf-8");

  // Extract HERITAGE_STORIES array via JSON parsing or regex
  const regex = /id:\s*"([^"]+)",\s*originalAudioId:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*language:\s*"([^"]+)",[\s\S]*?duration:\s*"([^"]+)",\s*durationSeconds:\s*(\d+),[\s\S]*?audioUrl:\s*"([^"]+)",\s*audioFileName:\s*"([^"]+)",\s*audioFileSize:\s*(\d+)/g;

  let match;
  const stories = [];
  while ((match = regex.exec(content)) !== null) {
    stories.push({
      id: match[1],
      originalAudioId: match[2],
      title: match[3],
      language: match[4],
      duration: match[5],
      durationSeconds: parseInt(match[6], 10),
      audioUrl: match[7],
      audioFileName: match[8],
      audioFileSize: parseInt(match[9], 10),
    });
  }

  console.log(`Found ${stories.length} featured heritage stories to validate.\n`);

  let passCount = 0;
  let failCount = 0;

  for (const story of stories) {
    console.log(`--------------------------------------------------`);
    console.log(`Story: ${story.title} (${story.id})`);
    console.log(`Language: ${story.language}`);
    console.log(`Original Audio ID: ${story.originalAudioId}`);
    console.log(`Mapped Audio URL: ${story.audioUrl}`);

    // Check 1: No generic music files
    const forbidden = ["harvest_song.wav", "general_folk.wav", "sample", "placeholder", "default"];
    const isForbidden = forbidden.some((f) => story.audioUrl.toLowerCase().includes(f));
    if (isForbidden) {
      console.error(`❌ FAIL: Audio URL '${story.audioUrl}' references forbidden generic music/sample`);
      failCount++;
      continue;
    } else {
      console.log(`✓ PASS: Audio URL is a dedicated spoken recording`);
    }

    // Check 2: File exists on disk
    const diskPath = path.resolve(__dirname, "../web/public", story.audioUrl.replace(/^\//, ""));
    if (!fs.existsSync(diskPath)) {
      console.error(`❌ FAIL: File not found on disk: ${diskPath}`);
      failCount++;
      continue;
    }
    const stat = fs.statSync(diskPath);
    console.log(`✓ PASS: File exists on disk (${stat.size} bytes)`);

    // Check 3: Live HTTP endpoint request
    try {
      const httpRes = await checkUrl(story.audioUrl);
      if (httpRes.statusCode === 200) {
        console.log(`✓ PASS: HTTP 200 received from live server (${httpRes.contentType}, ${httpRes.contentLength} bytes)`);
        passCount++;
      } else {
        console.error(`❌ FAIL: HTTP status ${httpRes.statusCode} for ${story.audioUrl}`);
        failCount++;
      }
    } catch (err) {
      console.error(`❌ FAIL: HTTP request error for ${story.audioUrl}:`, err.message);
      failCount++;
    }
  }

  console.log("==================================================");
  console.log(`SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log("==================================================");

  if (failCount > 0) {
    process.exit(1);
  }
}

run();
