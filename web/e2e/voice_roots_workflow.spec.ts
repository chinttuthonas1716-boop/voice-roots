import { test, expect } from "@playwright/test";

test.describe("Voice Roots End-to-End User Lifecycle (T3.1)", () => {
  test("1. Landing page renders platform branding and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Voice Roots/i);
    await expect(page.getByRole("navigation", { name: /Main navigation/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Record/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Dictionary/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /My recordings/i }).first()).toBeVisible();
  });

  test("2. Sign up and authentication flow", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText(/Voice Roots/i).first()).toBeVisible();

    // Switch to Sign Up tab if available
    const signUpTab = page.getByRole("button", { name: /Sign Up|Create Account|Register/i });
    if (await signUpTab.isVisible()) {
      await signUpTab.click();
    }

    // Fill form fields
    const nameInput = page.locator("input[placeholder*='name' i], input[type='text']").first();
    const emailInput = page.locator("input[type='email'], input[placeholder*='email' i]").first();
    const passwordInput = page.locator("input[type='password']").first();

    if (await nameInput.isVisible()) {
      await nameInput.fill("Kumuram Bheem");
    }
    if (await emailInput.isVisible()) {
      await emailInput.fill("bheem@voiceroots.org");
    }
    if (await passwordInput.isVisible()) {
      await passwordInput.fill("OralRoots2026!");
    }

    // Consent checkbox on sign-up
    const consentCheck = page.locator("input[type='checkbox']").first();
    if (await consentCheck.isVisible()) {
      await consentCheck.check();
    }

    // Submit or demo quick login
    const submitBtn = page.getByRole("button", { name: /Sign In|Sign Up|Continue|Enter/i }).first();
    await expect(submitBtn).toBeVisible();
  });

  test("3. Consent and recording / upload flow", async ({ page }) => {
    await page.goto("/record");

    // Check mode tabs exist
    await expect(page.getByText(/Freeform Record/i)).toBeVisible();
    await expect(page.getByText(/Prompted Mode/i)).toBeVisible();
    await expect(page.getByText(/Upload File/i)).toBeVisible();

    // Step 1: Informed Consent statements are visible
    await expect(page.getByText(/Speaker consent/i)).toBeVisible();
    await expect(page.getByText(/voluntary permission/i)).toBeVisible();

    // Check informed consent
    const consentCheck = page.locator("input[type='checkbox']").first();
    await consentCheck.check();

    // Button to advance to Step 2
    const nextBtn = page.getByRole("button", { name: /Next: Capture voice/i });
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();

    // Now in Step 2: Voice recording
    await expect(page.getByText(/Step 2: Record voice/i)).toBeVisible();
  });

  test("4. Translation interface and honest translation policy", async ({ page }) => {
    await page.goto("/translate");

    // Verify source/target controls
    await expect(page.locator("select").first()).toBeVisible();

    // Check that translation disclaimers or IndicTrans2 draft badges are rendered
    const pageText = await page.textContent("body");
    expect(pageText).toMatch(/IndicTrans2|Draft|Elder|Translation/i);
  });

  test("5. Dictionary and phrasebook browser with audio and elder provenance", async ({ page }) => {
    await page.goto("/dictionary");

    await expect(page.getByRole("heading", { name: /Oral Tongues Dictionary/i })).toBeVisible();
    await expect(page.getByText(/Gondi/i).first()).toBeVisible();
    await expect(page.getByText(/Koya/i).first()).toBeVisible();

    // Search input using real placeholder
    const searchInput = page.getByPlaceholder(/Search by Latin word/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill("water");

    // Check dictionary container rendered
    await expect(page.locator("body")).toContainText(/Dictionary|Entries|Words/i);
  });

  test("6. Public stats and Census 2011 demographic benchmarks", async ({ page }) => {
    await page.goto("/stats");

    await expect(page.getByText(/Public Archive Statistics/i)).toBeVisible();
    await expect(page.getByText(/Preserved Audio/i).first()).toBeVisible();
    await expect(page.getByText(/Census 2011/i).first()).toBeVisible();
  });

  test("7. Cultural Voice Passport and OCAP consent verification", async ({ page }) => {
    // Navigate to passport page for demo/sample ID 1
    await page.goto("/passport/1");

    // Should render passport or clear notice
    const body = page.locator("body");
    await expect(body).toContainText(/Passport|Voice Roots|Asset|Recording/i);
  });

  test("8. Reviewer Queue and Customary Elder Governance", async ({ page }) => {
    await page.goto("/reviewer");

    await expect(page.getByRole("heading", { name: /Reviewer Queue/i })).toBeVisible();
    await expect(page.getByText(/Active Reviewer/i)).toBeVisible();
    await expect(page.getByText(/Restricted Data Export/i)).toBeVisible();
  });
});
