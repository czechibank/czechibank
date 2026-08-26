import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

const BASE = process.env.PW_BASE_URL || "http://localhost:3000";

// Victim is a seeded, funded user; we only read its balance via its API key.
const VICTIM = {
  key: "key__0_high.balance@example.com000000000000000000000000000000000",
  account: "100000000003/5555",
};

// One scenario, workers=1 on CI: a module bag carries state between steps.
const bag: {
  victimBefore?: number;
  victimId?: string;
  attacker?: { email: string; password: string; key: string; id: string; account: { id: string; number: string } };
} = {};

async function api(path: string, init: RequestInit = {}) {
  const r = await fetch(`${BASE}/api/v1${path}`, init);
  return { status: r.status, body: await r.json() };
}
function accounts(data: any) {
  return data.bankAccounts ?? data.items ?? data;
}
async function balanceOf(account: string, key: string) {
  const { body } = await api("/bank-account?limit=100", { headers: { "X-API-Key": key } });
  return accounts(body.data).find((a: any) => a.number === account)?.balance as number;
}

Given("the victim {string} balance is recorded", async ({}, _email: string) => {
  const me = await api("/user", { headers: { "X-API-Key": VICTIM.key } });
  bag.victimId = me.body.data.id;
  bag.victimBefore = await balanceOf(VICTIM.account, VICTIM.key);
  expect(bag.victimBefore, "victim should have a balance to steal").toBeGreaterThan(0);
});

Given("I am logged in as a fresh attacker", async ({ page }) => {
  const email = `attacker-${Date.now()}@example.com`;
  const password = "AttackerPass123";
  const created = await api("/user/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Attacker", email, password, sex: "FEMALE" }),
  });
  const key = created.body.data.apiKey as string;
  const acct = await api("/bank-account/create", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": key },
    body: JSON.stringify({ currency: "CZECHITOKEN", name: "attacker" }),
  });
  const ba = acct.body.data.bankAccount;
  bag.attacker = { email, password, key, id: created.body.data.id, account: { id: ba.id, number: ba.number } };

  await page.goto("/signin");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.locator("form").getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/dashboard|\/$/);
});

When("I submit a transfer but rewrite the sender to the victim", async ({ page, context }) => {
  const a = bag.attacker!;
  await context.route("**/*", async (route) => {
    const req = route.request();
    const body = req.postData() ?? "";
    if (req.method() === "POST" && body.includes(a.id)) {
      const spoofed = body.split(a.id).join(bag.victimId!).split(a.account.number).join(VICTIM.account);
      return route.continue({ postData: spoofed });
    }
    return route.continue();
  });

  await page.goto(`/bankAccount/${a.account.id}`);
  await page.getByRole("combobox").click();
  await page.getByRole("option").first().click();
  await page.getByPlaceholder("Amount").fill("1");
  await page.getByRole("button", { name: "Transfer" }).click();
  await page.waitForTimeout(2500);
});

Then("the victim balance is unchanged", async () => {
  const after = await balanceOf(VICTIM.account, VICTIM.key);
  expect(after, "the signed-in attacker must not be able to move the victim's money").toBe(bag.victimBefore);
});
