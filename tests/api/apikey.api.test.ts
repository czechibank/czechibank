import { describe, expect, it } from "vitest";
import { apiKey, SEED_USERS } from "../../shared/fixtures";
import { config } from "./config/config";

const BASE = `${config.BASE_URL}/api/v1`;

describe("API Key API", () => {
  describe("Rate limiting", () => {
    it("should return 429 when rate limit is exceeded", async () => {
      const key = apiKey.rateLimited; // rateLimitMax: 2

      // Make requests until we hit 429 (counter may not be at 0 from other test runs)
      let lastStatus = 0;
      for (let i = 0; i < 10; i++) {
        const res = await fetch(`${BASE}/apikey`, {
          headers: { "X-API-Key": key },
        });
        lastStatus = res.status;
        if (res.status === 429) {
          const data = await res.json();
          expect(data.success).toBe(false);
          expect(data.error.code).toBe("RATE_LIMIT_EXCEEDED");
          break;
        }
        expect(res.status).toBe(200);
      }

      expect(lastStatus, "Expected 429 after exhausting rate limit").toBe(429);
    });
  });

  describe("GET /api/v1/apikey", () => {
    it("should return 401 when no API key is provided", async () => {
      const response = await fetch(`${BASE}/apikey`);
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Unauthorized");
    });

    it("should return 401 when invalid API key is provided", async () => {
      const response = await fetch(`${BASE}/apikey`, {
        headers: { "X-API-Key": "invalid-token" },
      });
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Unauthorized");
    });

    it("should return 200 and API key metadata for authenticated user", async () => {
      const response = await fetch(`${BASE}/apikey`, {
        headers: { "X-API-Key": apiKey.standardUser },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThanOrEqual(1);
    });

    it("should return multiple keys for multipleKeys user", async () => {
      const response = await fetch(`${BASE}/apikey`, {
        headers: { "X-API-Key": apiKey.multipleKeys },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.length).toBeGreaterThanOrEqual(5);
    });

    it("should not expose full key values in the response", async () => {
      const response = await fetch(`${BASE}/apikey`, {
        headers: { "X-API-Key": apiKey.standardUser },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      // Verify no item has a "key" field matching the full auth key
      for (const item of data.data) {
        expect(item.key).not.toBe(apiKey.standardUser);
      }
    });

    it("should return 401 for disabled/expired API key", async () => {
      const response = await fetch(`${BASE}/apikey`, {
        headers: { "X-API-Key": SEED_USERS.expiredKey.apiKeys[0].key },
      });
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Unauthorized");
    });
  });
});
