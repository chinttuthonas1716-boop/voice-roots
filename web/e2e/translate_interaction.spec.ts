import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Voice Roots Multilingual Translation End-to-End Workflow", () => {
  test("Translates English to Gondi and performs Community Elder Verification", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/translate", { waitUntil: "networkidle" });

    // 1. Select Source: English (en), Target: Gondi (gon)
    await page.selectOption("#source-lang", "en");
    await page.selectOption("#target-lang", "gon");

    // 2. Type "Hello, how are you?"
    const textarea = page.locator("#input-text");
    await textarea.fill("Hello, how are you?");

    // 3. Click Translate Directly
    const translateBtn = page.getByRole("button", { name: /Translate Directly/i });
    await translateBtn.click();

    // 4. Verify Translated Text displays genuine Gondi phrase
    const resultBox = page.locator("#result-text");
    await expect(resultBox).toContainText("సేవా జోహార్! నిమ్మ భాలో ఉనంది?", { timeout: 10000 });

    // 5. Verify Badge and Dialect Attribution
    await expect(page.locator("text=Muria / Betul Gondi")).toBeVisible();
    await expect(page.locator("text=Elder Approved")).toBeVisible();

    // 6. Capture Screenshot of verified result
    const screenshotPath = path.resolve(__dirname, "../../docs/screenshots/translate_gondi_verified.png");
    await page.screenshot({ path: screenshotPath, fullPage: false });

    // 7. Click Community Verify
    const verifyBtn = page.getByRole("button", { name: /Community Verify/i });
    await verifyBtn.click();

    // 8. Fill Elder Review Form
    await expect(page.locator("text=Community Elder Verification")).toBeVisible();
    const reviewerInput = page.getByPlaceholder(/Kotnak Jangu/i);
    await reviewerInput.fill("Kotnak Jangu Elder (Muria Council)");

    // 9. Submit Approval
    const approveBtn = page.getByRole("button", { name: /Approve as Verified/i });
    await approveBtn.click();

    // 10. Verify badge upgrades to Community Verified
    await expect(page.locator("text=Community Verified").first()).toBeVisible({ timeout: 10000 });
  });
});
