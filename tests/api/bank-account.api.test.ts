import { describe, expect, it, test } from "vitest";
import { apiKeys, config } from "./config/config";

test.skip("should create a bank account", async () => {
  const response = await fetch(`${config.BASE_URL}/api/v1/bank-account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bankNumber: "1234567890",
      accountNumber: "1234567890",
    }),
  });

  expect(response.status).toBe(200);
});

describe("Bank Account API", () => {
  describe("GET /api/v1/bank-account", () => {
    it("should return 401 when no API key is provided", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account`);
      expect(response.status).toBe(401);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Unauthorized");
    });

    it("should return 401 when invalid API key is provided", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account`, {
        headers: {
          "X-API-Key": "invalid-token",
        },
      });
      expect(response.status).toBe(401);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Unauthorized");
    });

    it("should return bank accounts with valid API key", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account`, {
        headers: {
          "X-API-Key": apiKeys.standardUser,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.bankAccounts)).toBe(true);
      expect(data.meta.pagination).toBeDefined();
    });

    it("should handle pagination parameters", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account?page=1&limit=5`, {
        headers: {
          "X-API-Key": apiKeys.highBalanceUser,
        },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.meta.pagination.page).toBe(1);
      expect(data.meta.pagination.limit).toBe(5);
    });

    it("should return 400 for invalid pagination parameters", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/bank-account?page=0&limit=0`, {
        headers: {
          "X-API-Key": apiKeys.highBalanceUser,
        },
      });
      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error.details[0].message).toBe("Page and limit must be positive numbers");
    });
  });
});
