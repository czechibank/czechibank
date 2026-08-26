import { describe, expect, it } from "vitest";
import { apiKey, SEED_USERS } from "../../shared/fixtures";
import { config } from "./config/config";

// #89 — the public REST API must not let an authenticated caller move money
// out of an account they do not own. Over the API, userId is taken from the
// API key (authenticateRequest), so the attack cannot even be expressed; this
// test locks that in. It is GREEN today and must stay green.
describe("Security: cross-account transfer over the API (#89)", () => {
  const victimAccount = SEED_USERS.highBalance.bankAccounts[0].number; // not the caller's

  it("rejects sending FROM an account the caller does not own", async () => {
    const response = await fetch(`${config.BASE_URL}/api/v1/transactions/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": apiKey.standardUser },
      body: JSON.stringify({
        amount: 1,
        fromBankNumber: victimAccount, // someone else's account
        toBankNumber: "555555555555/5555", // donation account
      }),
    });
    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("FORBIDDEN");
  });

  it("ignores a userId smuggled into the request body", async () => {
    // The API schema has no userId field, so this is belt-and-suspenders:
    // even if a caller sends one, it must not be honoured.
    const response = await fetch(`${config.BASE_URL}/api/v1/transactions/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": apiKey.standardUser },
      body: JSON.stringify({
        amount: 1,
        fromBankNumber: victimAccount,
        toBankNumber: "555555555555/5555",
        userId: "some-other-user-id",
      }),
    });
    expect(response.status).toBe(403);
  });
});
