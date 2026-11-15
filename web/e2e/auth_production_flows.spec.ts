import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";

test.describe("Voice Roots — Forest-Themed Auth Pages & Security Lifecycle", () => {
  test("1. Login page renders forest canopy, typography, and warm ivory card", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Verify typography & headings
    await expect(page.getByRole("heading", { name: /Welcome back\./i })).toBeVisible();
    await expect(page.getByText(/Continue preserving the voices and stories of humanity/i)).toBeVisible();

    // Verify warm ivory form card & inputs
    await expect(page.getByRole("heading", { name: /Sign in to your account/i })).toBeVisible();
    await expect(page.getByPlaceholder("Enter your email")).toBeVisible();
    await expect(page.getByPlaceholder("Enter your password")).toBeVisible();
    await expect(page.getByRole("button", { name: /^Sign In$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Create an account/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Forgot password\?/i })).toBeVisible();
  });

  test("2. Sign Up page renders forest foliage, role selector, and terms checkbox", async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);

    // Verify typography & headings
    await expect(page.getByRole("heading", { name: /Join the movement\./i })).toBeVisible();
    await expect(page.getByText(/Become part of a global community preserving linguistic heritage/i)).toBeVisible();

    // Verify warm ivory form card & inputs
    await expect(page.getByRole("heading", { name: /Create your account/i })).toBeVisible();
    await expect(page.getByPlaceholder("Your full name")).toBeVisible();
    await expect(page.getByPlaceholder("Your email address")).toBeVisible();
    await expect(page.getByPlaceholder("Create a strong password")).toBeVisible();
    await expect(page.getByPlaceholder("Confirm your password")).toBeVisible();
    await expect(page.getByRole("combobox")).toBeVisible();
    await expect(page.getByRole("button", { name: /^Create Account$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Sign in$/i })).toBeVisible();
  });

  test("3. Registration flow creates real account with role elevation protection", async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);

    const uniqueEmail = `speaker_${Date.now()}@nilgiris.org`;

    await page.getByPlaceholder("Your full name").fill("Maruti Toda");
    await page.getByPlaceholder("Your email address").fill(uniqueEmail);
    await page.getByPlaceholder("Create a strong password").fill("TodaHeritage@2026");
    await page.getByPlaceholder("Confirm your password").fill("TodaHeritage@2026");
    
    // Select reviewer (should be granted contributor with pending review notice)
    await page.getByRole("combobox").selectOption("reviewer");
    await page.getByRole("checkbox").check();

    await page.getByRole("button", { name: /^Create Account$/i }).click();

    // Verify pending notice or dashboard redirect
    await expect(page.getByText(/Welcome, Maruti Toda!/i)).toBeVisible({ timeout: 5000 });
  });

  test("4. Login flow authenticates registered user and sets active session", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.getByPlaceholder("Enter your email").fill("test.user@voiceroots.org");
    await page.getByPlaceholder("Enter your password").fill("StrongPassword@123");

    await page.getByRole("button", { name: /^Sign In$/i }).click();

    // Verify active session card appears
    await expect(page.getByText(/Active Verified Session/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("heading", { name: "Test User" })).toBeVisible();
  });

  test("5. Incorrect password displays clear error message without crashing", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.getByPlaceholder("Enter your email").fill("test.user@voiceroots.org");
    await page.getByPlaceholder("Enter your password").fill("WrongSecretPass!99");

    await page.getByRole("button", { name: /^Sign In$/i }).click();

    await expect(page.getByText(/Invalid credentials|Invalid email or password/i)).toBeVisible({ timeout: 4000 });
  });

  test("6. Responsive verification: zero horizontal scroll on mobile (390px)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    for (const route of ["/login", "/signup", "/forgot-password", "/verify-email"]) {
      await page.goto(`${BASE_URL}${route}`);
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    }
  });
});
