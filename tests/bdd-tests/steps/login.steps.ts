import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("I am on the login page", async ({ page }) => {
  await page.goto("/signin");
});

When("I fill username {string}", async ({ page }, username: string) => {
  await page.getByLabel("Email").fill(username);
});

When("I fill password {string}", async ({ page }, password: string) => {
  await page.getByLabel("Password").fill(password);
});

When("I click sign in button", async ({ page }) => {
  await page.locator("form").getByRole("button", { name: "Sign in" }).click();
});

Then("URL has changed", async ({ page }) => {
  // Wait for navigation after login - should redirect away from signin
  await page.waitForURL((url) => !url.pathname.includes("/signin"));
  // Verify URL is different from signin page
  await expect(page).not.toHaveURL(/\/signin/);
});

Then("I should see title {string}", async ({ page }, headingText: string) => {
  await expect(page.getByRole("heading", { name: headingText })).toBeVisible();
});

Then("I should see error message {string}", async ({ page }, errorText: string) => {
  await expect(page.getByRole("status")).toContainText(errorText);
});
