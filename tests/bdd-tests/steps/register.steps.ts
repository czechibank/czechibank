import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { pageMap } from "../constants/pageMap";

const { Given, When, Then } = createBdd();

let generatedName = "";
let generatedEmail = "";

Given("I am on the registration page", async ({ page }) => {
  await page.goto(pageMap.RegisterPage);
});

When("I generate unique user data", async () => {
  const timestamp = Date.now();
  generatedName = `Test User${timestamp}`;
  generatedEmail = `testuser${timestamp}@example.com`;
});

When("I fill name with generated value", async ({ page }) => {
  await page.getByLabel("Name").fill(generatedName);
});

When("I fill email with generated value", async ({ page }) => {
  await page.getByLabel("Email").fill(generatedEmail);
});

When("I fill name {string}", async ({ page }, name: string) => {
  await page.getByLabel("Name").fill(name);
});

When("I fill email {string}", async ({ page }, email: string) => {
  await page.getByLabel("Email").fill(email);
});

When("I fill registration password {string}", async ({ page }, registrationPassword: string) => {
  await page.getByRole("textbox", { name: "Password *", exact: true }).fill(registrationPassword);
});

When("I fill confirm password {string}", async ({ page }, confirmPassword: string) => {
  await page.getByLabel("Confirm Password").fill(confirmPassword);
});

When("I click register button", async ({ page }) => {
  await page.locator("form").getByRole("button", { name: "Register" }).click();
});

Then("I should see a message {string}", async ({ page }, message: string) => {
  await expect(page.getByText(message)).toBeVisible();
});

Then("I should see welcome message for generated user", async ({ page }) => {
  const welcomeMessage = `Hello ${generatedName}!`;
  await expect(page.getByText(welcomeMessage)).toBeVisible();
});

Then("I click Continue to the app button", async ({ page }) => {
  await page.getByRole("button", { name: "Continue to the app" }).click();
});
