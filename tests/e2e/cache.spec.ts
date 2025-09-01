import { expect, Page, test } from "@playwright/test";

/**
 * FIRST, CHECK THIS URL ADDRESS AND TIMEOUT IN playwright.config.ts
 */

const URL = "http://localhost:3001/";
// const URL = "http://localhost:3000/";

test.describe("Czechibank cache update", () => {
  async function loopLoginLogout(page: Page) {
    const timeout = 100;
    const firstUserName = "[BRNO] Pejsek a Kočička 🐶&🐱";
    await expect(page).toHaveTitle(/CzechiBank/);

    // LOGIN FIRST USER
    await page.getByLabel("Email").fill("zachranNas+brno@pejsekAKocicka.cz");
    await page.getByLabel("Password").fill("PejsekAKocicka123");
    await page.locator("form").getByRole("button", { name: "Sign in" }).click();
    await page.waitForTimeout(timeout);
    await expect(page.getByRole("heading", { name: firstUserName })).toBeVisible();

    // SEE PROFILE PAGE OF FIRST USER
    await page.getByTestId("avatarCtxMenu").click();
    await page.getByRole("button", { name: "Profile" }).click();
    const actualName = page.getByTestId("userName");
    console.log("actualName first: ", await actualName.textContent());
    console.log("firstUserName first: ", firstUserName);
    await page.waitForTimeout(timeout);
    await expect(actualName).toHaveText(firstUserName);

    // LOGOUT THE FIRST USER
    await page.getByTestId("avatarCtxMenu").click();
    await page.getByRole("button", { name: "Sign Out" }).click();

    // LOGIN SECOND USER
    const secondUserName = "Simona Humpolová";
    await page.getByLabel("Email").fill("simona@czechibank.ostrava.digital");
    await page.getByLabel("Password").fill("hello123456");
    await page.locator("form").getByRole("button", { name: "Sign in" }).click();
    await page.waitForTimeout(timeout);
    await expect(page.getByRole("heading", { name: secondUserName })).toBeVisible();

    // SEE PROFILE PAGE OF SECOND USER
    await page.getByTestId("avatarCtxMenu").click();
    await page.getByRole("button", { name: "Profile" }).click();
    const actualNameSecond = page.getByTestId("userName");
    console.log("actualName first: ", await actualNameSecond.textContent());
    console.log("firstUserName first: ", secondUserName);
    await page.waitForTimeout(timeout);
    await expect(actualName).toHaveText(secondUserName);

    // LOGOUT THE SECOND USER
    await page.getByTestId("avatarCtxMenu").click();
    await page.getByRole("button", { name: "Sign Out" }).click();
  }

  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test("Check cache update", async ({ page }) => {
    for (let i = 0; i < 30; i++) {
      await loopLoginLogout(page);
    }

    await page.pause();
  });
});
