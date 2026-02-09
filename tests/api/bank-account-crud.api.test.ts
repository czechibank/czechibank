import { describe, expect, it } from "vitest";
import { apiKey, SEED_USERS } from "../../shared/fixtures";
import { config } from "./config/config";

describe("Bank Account CRUD API", () => {
  describe("POST /api/v1/bank-account/create", () => {
    it("should return 401 when no API key is provided", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: "CZECHITOKEN" }),
      });
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Unauthorized");
    });

    it("should return 201 and create account with CZECHITOKEN currency", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey.vojta,
        },
        body: JSON.stringify({ currency: "CZECHITOKEN" }),
      });
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.bankAccount).toBeDefined();
      expect(data.data.bankAccount.number).toMatch(/^\d{12}\/5555$/);
      expect(data.data.bankAccount.balance).toBe(0);
    });

    it("should return 201 and create account with custom name", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey.vojta,
        },
        body: JSON.stringify({ currency: "CZECHITOKEN", name: `Savings ${Date.now()}` }),
      });
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.bankAccount.name).toMatch(/^Savings \d+$/);
    });

    it("should return 422 when body is empty", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey.vojta,
        },
        body: JSON.stringify({}),
      });
      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it("should return 422 when currency is invalid", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey.vojta,
        },
        body: JSON.stringify({ currency: "INVALID" }),
      });
      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  describe("GET /api/v1/bank-account/[id]", () => {
    it("should return 401 when no API key is provided (with valid CUID)", async () => {
      // GET route validates CUID format first — use a real account ID to pass validation
      const listResponse = await fetch(`${config.BASE_URL}/api/v1/bank-account`, {
        headers: { "X-API-Key": apiKey.vojta },
      });
      const listData = await listResponse.json();
      const validId = listData.data.bankAccounts[0].id;

      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account/${validId}`);
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Unauthorized");
    });

    it("should return 200 and own account details", async () => {
      // First get list to find a valid account ID
      const listResponse = await fetch(`${config.BASE_URL}/api/v1/bank-account`, {
        headers: { "X-API-Key": apiKey.vojta },
      });
      const listData = await listResponse.json();
      const accountId = listData.data.bankAccounts[0].id;

      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account/${accountId}`, {
        headers: { "X-API-Key": apiKey.vojta },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.bankAccount).toBeDefined();
      expect(data.data.bankAccount.id).toBe(accountId);
    });

    it("should return 422 for invalid CUID format", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account/not-a-cuid`, {
        headers: { "X-API-Key": apiKey.vojta },
      });
      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it("should return 404 for another user's account", async () => {
      // Get standardUser's account ID using standardUser's key
      const listResponse = await fetch(`${config.BASE_URL}/api/v1/bank-account`, {
        headers: { "X-API-Key": apiKey.standardUser },
      });
      const listData = await listResponse.json();
      const otherAccountId = listData.data.bankAccounts[0].id;

      // Try to access it with vojta's key
      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account/${otherAccountId}`, {
        headers: { "X-API-Key": apiKey.vojta },
      });
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Bank account not found");
    });
  });

  describe("PATCH /api/v1/bank-account/[id]", () => {
    it("should return 401 when no API key is provided", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account/some-id`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Name" }),
      });
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Unauthorized");
    });

    it("should return 200 and rename account", async () => {
      // Get vojta's account ID
      const listResponse = await fetch(`${config.BASE_URL}/api/v1/bank-account`, {
        headers: { "X-API-Key": apiKey.vojta },
      });
      const listData = await listResponse.json();
      const accountId = listData.data.bankAccounts[0].id;

      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account/${accountId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey.vojta,
        },
        body: JSON.stringify({ name: "Renamed Account" }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it("should return 404 when renaming another user's account", async () => {
      // Get standardUser's account ID
      const listResponse = await fetch(`${config.BASE_URL}/api/v1/bank-account`, {
        headers: { "X-API-Key": apiKey.standardUser },
      });
      const listData = await listResponse.json();
      const otherAccountId = listData.data.bankAccounts[0].id;

      // Try to rename it with vojta's key
      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account/${otherAccountId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey.vojta,
        },
        body: JSON.stringify({ name: "Hijacked Name" }),
      });
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Bank account not found");
    });

    it("should return 422 for empty name", async () => {
      const listResponse = await fetch(`${config.BASE_URL}/api/v1/bank-account`, {
        headers: { "X-API-Key": apiKey.vojta },
      });
      const listData = await listResponse.json();
      const accountId = listData.data.bankAccounts[0].id;

      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account/${accountId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey.vojta,
        },
        body: JSON.stringify({ name: "" }),
      });
      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  describe("DELETE /api/v1/bank-account/[id]", () => {
    it("should return 401 when no API key is provided", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account/some-id`, {
        method: "DELETE",
      });
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Unauthorized");
    });

    it("should return 401 for invalid/incomplete API key", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account/some-id`, {
        method: "DELETE",
        headers: { "X-API-Key": "invalid-token" },
      });
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Unauthorized");
    });

    it("should return 401 for disabled/expired API key", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account/some-id`, {
        method: "DELETE",
        headers: { "X-API-Key": SEED_USERS.expiredKey.apiKeys[0].key },
      });
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Unauthorized");
    });

    it("should return 409 NON_ZERO_BALANCE when deleting account with balance", async () => {
      // highBalance has 2 accounts and 1M balance — passes min-account check, hits balance check
      const listResponse = await fetch(`${config.BASE_URL}/api/v1/bank-account`, {
        headers: { "X-API-Key": apiKey.highBalance },
      });
      const listData = await listResponse.json();
      // Pick the account that actually has balance (API order isn't guaranteed)
      const accountId =
        listData.data.bankAccounts.find((a: any) => a.balance > 0)?.id ?? listData.data.bankAccounts[0].id;

      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account/${accountId}`, {
        method: "DELETE",
        headers: { "X-API-Key": apiKey.highBalance },
      });
      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("NON_ZERO_BALANCE");
    });

    it("should return 200 when deleting zero-balance account (not the last one)", async () => {
      // Create a fresh account so the test is self-contained and repeatable
      const createResponse = await fetch(`${config.BASE_URL}/api/v1/bank-account/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey.zeroBalance,
        },
        body: JSON.stringify({ currency: "CZECHITOKEN" }),
      });
      expect(createResponse.status).toBe(201);
      const createData = await createResponse.json();
      const newAccountId = createData.data.bankAccount.id;

      // Delete the newly created account (0 balance, not the last one)
      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account/${newAccountId}`, {
        method: "DELETE",
        headers: { "X-API-Key": apiKey.zeroBalance },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it("should return 400 when deleting last active account", async () => {
      // standardUser has exactly 1 account — no dependency on prior tests
      const listResponse = await fetch(`${config.BASE_URL}/api/v1/bank-account`, {
        headers: { "X-API-Key": apiKey.standardUser },
      });
      const listData = await listResponse.json();
      const lastAccountId = listData.data.bankAccounts[0].id;

      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account/${lastAccountId}`, {
        method: "DELETE",
        headers: { "X-API-Key": apiKey.standardUser },
      });
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Cannot delete the last active bank account");
    });

    it("should return 404 when deleting another user's account", async () => {
      // Get standardUser's account, try to delete with vojta's key
      const listResponse = await fetch(`${config.BASE_URL}/api/v1/bank-account`, {
        headers: { "X-API-Key": apiKey.standardUser },
      });
      const listData = await listResponse.json();
      const otherAccountId = listData.data.bankAccounts[0].id;

      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account/${otherAccountId}`, {
        method: "DELETE",
        headers: { "X-API-Key": apiKey.vojta },
      });
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Bank account not found");
    });
  });
});
