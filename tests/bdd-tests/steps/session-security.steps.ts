import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

const BASE = process.env.PW_BASE_URL || "http://localhost:3000";

// Seed users (see shared/fixtures). Keys are read-only API keys used here only
// to read balances and ids, never to perform the transfer.
const ATTACKER = { key: "key__0_zachrannas+brno@pejsekakocicka.cz00000000000000000000000" };
const VICTIM = {
  key: "key__0_high.balance@example.com000000000000000000000000000000000",
  account: "100000000003/5555",
};

// One scenario, workers=1 on CI: a module-scoped bag is enough to carry state.
const bag: {
  victimBefore?: number;
  attackerId?: string;
  victimId?: string;
  attackerAccount?: { id: string; number: string };
} = {};

async function api(path: string, key: string) {
  const r = await fetch(`${BASE}/api/v1${path}`, { headers: { "X-API-Key": key } });
  return r.json();
}
function accounts(data: any) {
  return data.bankAccounts ?? data.items ?? data;
}
async function balanceOf(account: string, key: string) {
  const list = accounts((await api("/bank-account", key)).data);
  return list.find((a: any) => a.number === account)?.balance as number;
}

Given("the victim {string} balance is recorded", async (_ignored, _email: string) => {
  bag.victimId = (await api("/user", VICTIM.key)).data.id;
  bag.victimBefore = await balanceOf(VICTIM.account, VICTIM.key);
  expect(bag.victimBefore, "victim should have a balance to steal").toBeGreaterThan(0);
});

Given(
  "I am logged in as attacker {string} with password {string}",
  async ({ page }, email: string, password: string) => {
    bag.attackerId = (await api("/user", ATTACKER.key)).data.id;
    const list = accounts((await api("/bank-account", ATTACKER.key)).data);
    bag.attackerAccount = { id: list[0].id, number: list[0].number };

    await page.goto("/signin");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.locator("form").getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL(/dashboard|\/$/);
  },
);

When("I submit a transfer but rewrite the sender to the victim", async ({ page, context }) => {
  const { attackerId, victimId, attackerAccount } = bag;
  // Rewrite the outgoing server-action payload so the sender becomes the victim.
  await context.route("**/*", async (route) => {
    const req = route.request();
    const body = req.postData() ?? "";
    if (req.method() === "POST" && attackerId && body.includes(attackerId)) {
      const spoofed = body.split(attackerId).join(victimId!).split(attackerAccount!.number).join(VICTIM.account);
      return route.continue({ postData: spoofed });
    }
    return route.continue();
  });

  await page.goto(`/bankAccount/${attackerAccount!.id}`);
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
