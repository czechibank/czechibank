import { expect, test } from "@playwright/test";

const URL = "https://develop.czechibank.ostrava.digital/";
// const URL = "http://localhost:3000/";

// Co testuju
test.describe("Czechibank login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  // jak testuju (co ocekavam)
  test("has title", async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/CzechiBank/);
  });

  test("redirects me to /signin", async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveURL(URL + "signin");
  });

  // happy path
  test("logs user with valid credentials and shows main page", async ({ page }) => {
    await page.getByLabel("Email").fill("zachranNas+brno@pejsekAKocicka.cz");
    await page.getByLabel("Password").fill("PejsekAKocicka123");
    // I need to add locator('form') because there are another buttons with same name "Sign in" so you need to be more specific. And parent locator is form. 🎉
    await page.locator("form").getByRole("button", { name: "Sign in" }).click();

    // I have 2 assertions here. One for URL and one for heading. And it is OK to use both. Both controls same things but from different perspectives.
    // URL is always good - we know that we are on the right page. And heading is good for knowing, that next page is rendered and it works.
    await expect(page).toHaveURL(URL);
    await expect(page.getByRole("heading", { name: "[BRNO] Pejsek a Kočička 🐶&🐱" })).toBeVisible();
  });

  test("throws error in UI if we use invalid credentials", async ({ page }) => {
    await page.getByLabel("Email").fill("czechitas+automation@czechitas.cz");
    await page.getByLabel("Password").fill("Invalid password");
    await page.locator("form").getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(URL + "signin");
    await expect(page.getByText("Oops!Something went wrong!")).toBeVisible();
  });

  test.describe("login form validation", () => {
    test("shows alert if email is blank", async ({ page }) => {
      await page.getByLabel("Email").fill("");
      await page.getByLabel("Password").fill("Password123456");
      await page.locator("form").getByRole("button", { name: "Sign in" }).click();
      await expect(page.getByText("Required")).toBeVisible();
    });

    test("shows alert if email is invalid", async ({ page }) => {
      await page.getByLabel("Email").fill("invalid-email");
      await page.getByLabel("Password").fill("Password123456");
      await page.locator("form").getByRole("button", { name: "Sign in" }).click();
      await expect(page.getByText("Invalid email")).toBeVisible();
    });

    test("shows alert if password is blank", async ({ page }) => {
      await page.getByLabel("Email").fill("czechitas+automation@czechitas.cz");
      await page.getByLabel("Password").fill("");
      await page.locator("form").getByRole("button", { name: "Sign in" }).click();
      await expect(page.getByText("Required")).toBeVisible();
    });

    test("shows alert if password is too short", async ({ page }) => {
      await page.getByLabel("Email").fill("czechitas+automation@czechitas.cz");
      await page.getByLabel("Password").fill("12345");
      await page.locator("form").getByRole("button", { name: "Sign in" }).click();
      await expect(page.getByText("String must contain at least 6 character(s)")).toBeVisible();
    });
  });
});
