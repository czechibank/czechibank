import { describe, expect, it } from "vitest";
import { apiKey, SEED_USERS } from "../../shared/fixtures";
import { config } from "./config/config";
import { fetchApi } from "./helpers/fetch-api";

describe("Bank Account Get All API", () => {
  describe("GET /api/v1/bank-account/get-all", () => {
    it("should return 401 when no API key is provided", async () => {
      const response = await fetchApi(`${config.BASE_URL}/api/v1/bank-account/get-all`);
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Unauthorized");
    });

    it("should return 401 when invalid API key is provided", async () => {
      const response = await fetchApi(`${config.BASE_URL}/api/v1/bank-account/get-all`, {
        headers: { "X-API-Key": "invalid-token" },
      });
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Unauthorized");
    });

    it("should return 401 for disabled/expired API key", async () => {
      const response = await fetchApi(`${config.BASE_URL}/api/v1/bank-account/get-all`, {
        headers: { "X-API-Key": SEED_USERS.expiredKey.apiKeys[0].key },
      });
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Unauthorized");
    });

    it("should return 200 and paginated list of all bank accounts", async () => {
      const response = await fetchApi(`${config.BASE_URL}/api/v1/bank-account/get-all`, {
        headers: { "X-API-Key": apiKey.standardUser },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.bankAccounts)).toBe(true);
      expect(data.meta.pagination).toBeDefined();
      expect(data.meta.pagination.total).toBeGreaterThan(0);
    });

    it("should respect page and limit parameters", async () => {
      const response = await fetchApi(`${config.BASE_URL}/api/v1/bank-account/get-all?page=1&limit=2`, {
        headers: { "X-API-Key": apiKey.standardUser },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.bankAccounts.length).toBeLessThanOrEqual(2);
      expect(data.meta.pagination.page).toBe(1);
      expect(data.meta.pagination.limit).toBe(2);
    });

    it("should return 422 for invalid pagination parameters", async () => {
      const response = await fetchApi(`${config.BASE_URL}/api/v1/bank-account/get-all?page=0&limit=0`, {
        headers: { "X-API-Key": apiKey.standardUser },
      });
      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it("should return empty array for page beyond total", async () => {
      const response = await fetchApi(`${config.BASE_URL}/api/v1/bank-account/get-all?page=999`, {
        headers: { "X-API-Key": apiKey.standardUser },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.bankAccounts).toHaveLength(0);
    });
  });
});
