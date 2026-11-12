import { test, expect } from "@playwright/test";
import path from "path";

const ROUTES = [
  { name: "landing", path: "/" },
  { name: "record", path: "/record" },
  { name: "translate", path: "/translate" },
  { name: "dictionary", path: "/dictionary" },
  { name: "stats", path: "/stats" },
  { name: "reviewer", path: "/reviewer" },
  { name: "about_governance", path: "/about" },
  { name: "passport", path: "/passport/1" },
];

const SCREENSHOT_DIR = path.resolve(__dirname, "../../docs/screenshots");

test.describe("Responsive Layout & Screenshot Verification (Step 5 & 6)", () => {
  for (const route of ROUTES) {
    test(`Desktop (1280px): ${route.name}`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(route.path, { waitUntil: "networkidle" });

      // Verify no horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      // Capture desktop screenshot
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `${route.name}_desktop.png`),
        fullPage: false,
      });
    });

    test(`Mobile (390px): ${route.name}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(route.path, { waitUntil: "networkidle" });

      // Verify no horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      // Capture mobile screenshot
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `${route.name}_mobile.png`),
        fullPage: false,
      });
    });
  }
});
