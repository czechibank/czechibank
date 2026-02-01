import { expect, test } from "@playwright/test";

// Co testuju
test.describe("Czechibank login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://develop.czechibank.ostrava.digital/");
  });

  // jak testuju (co ocekavam)
  test("has title", async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/CzechiBank/);
  });

  test("redirects me to /signin", async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveURL("https://develop.czechibank.ostrava.digital/signin");
  });

  test("can login with correct credentials", async ({ page }) => {
    const EMAIL = "zachranNas+brno@pejsekAKocicka.cz";
    const PASSWORD = "PejsekAKocicka123";
    const NAME = "[BRNO] Pejsek a Kočička 🐶&🐱";

    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[name="password"]', PASSWORD);

    await page.click('button[type="submit"]');
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL("https://develop.czechibank.ostrava.digital/");
    await expect(page.getByRole("heading", { name: `Hello ${NAME}!` })).toBeVisible();
  });
});
