import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { pageMap } from "../constants/pageMap";

const { Given, When, Then } = createBdd();

Given("I am on the login page", async ({ page }) => {
  await page.goto("/signin");
});

Given("I am logged in as {string} with password {string}", async ({ page }, email: string, password: string) => {
  await page.goto("/signin");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
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

Then("I am redirected to {string}", async ({ page }, pageName: string) => {
  const pagePath = pageMap[pageName];
  await page.waitForURL(pagePath);
});

Then("I should see title {string}", async ({ page }, headingText: string) => {
  await expect(page.getByRole("heading", { name: headingText })).toBeVisible();
});

Then("I should see error message {string}", async ({ page }, errorText: string) => {
  await expect(page.getByRole("status")).toContainText(errorText);
});

Then("I should see {string} validation text {string}", async ({ page }, fieldID: string, validationText: string) => {
  await expect(page.getByTestId(`${fieldID}-message`)).toBeVisible();
  await expect(page.getByTestId(`${fieldID}-message`)).toContainText(validationText);
});

Then("I click profile button", async ({ page }) => {
  await page.getByTestId("avatarCtxMenu").click();
});

Then("I click sign out button", async ({ page }) => {
  await page.getByRole("button", { name: "Sign Out" }).click();
});
