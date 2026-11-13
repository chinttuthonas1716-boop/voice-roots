import playwrightPkg from "../web/node_modules/@playwright/test/index.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const { chromium } = playwrightPkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.resolve(__dirname, "../docs/screenshots");

async function main() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  console.log("Navigating to frontend at http://localhost:4173/ ...");
  await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // 1. Natural Earth Mode - Home
  console.log("Capturing Natural Earth Home...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "frontend_natural_earth_home.png"),
    fullPage: false,
  });

  // 2. Toggle to Deep Forest Dark Mode
  console.log("Toggling to Deep Forest Dark Mode...");
  const themeBtn = await page.locator("button:has-text('Natural Earth')");
  if (await themeBtn.count() > 0) {
    await themeBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "frontend_deep_forest_home.png"),
      fullPage: false,
    });
    // Toggle back to Natural Earth
    const darkBtn = await page.locator("button:has-text('Deep Forest')");
    if (await darkBtn.count() > 0) {
      await darkBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 3. Record Tab
  console.log("Capturing Record Tab...");
  const recordTab = await page.locator("button[role='tab']:has-text('Record')").first();
  if (await recordTab.count() > 0) {
    await recordTab.click();
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "frontend_record_waveform.png"),
      fullPage: false,
    });
  }

  // 4. Cultural Archives Tab
  console.log("Capturing Cultural Archives Tab...");
  const culturalTab = await page.locator("button[role='tab']:has-text('Cultural Archives')").first();
  if (await culturalTab.count() > 0) {
    await culturalTab.click();
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "frontend_cultural_archives.png"),
      fullPage: false,
    });
  }

  // 5. Dictionary Tab
  console.log("Capturing Dictionary Tab...");
  const dictTab = await page.locator("button[role='tab']:has-text('Dictionary')").first();
  if (await dictTab.count() > 0) {
    await dictTab.click();
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "frontend_dictionary_browser.png"),
      fullPage: false,
    });
  }

  await browser.close();
  console.log("All frontend screenshots captured successfully!");
}

main().catch(err => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
