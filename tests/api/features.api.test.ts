import { afterAll, describe, expect, it } from "vitest";
import { apiKey } from "../../shared/fixtures";
import { config } from "./config/config";

describe("Features API", () => {
  // Store original features state for cleanup
  let originalFeatures: any[] | null = null;

  afterAll(async () => {
    // Restore original feature state if we modified it
    if (originalFeatures) {
      await fetch(`${config.BASE_URL}/api/v1/features/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey.appAdmin,
        },
        body: JSON.stringify({ features: originalFeatures }),
      });
    }
  });

  describe("GET /api/v1/features/get-all", () => {
    it("should return 401 when no API key is provided", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/features/get-all`);
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Unauthorized");
    });

    it("should return 200 and list of features", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/features/get-all`, {
        headers: { "X-API-Key": apiKey.standardUser },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.features)).toBe(true);
      expect(data.data.features.length).toBeGreaterThanOrEqual(5);
    });

    it("should return features with expected fields", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/features/get-all`, {
        headers: { "X-API-Key": apiKey.standardUser },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      const feature = data.data.features[0];
      expect(feature).toHaveProperty("id");
      expect(feature).toHaveProperty("key");
      expect(feature).toHaveProperty("name");
      expect(feature).toHaveProperty("toggle");
      expect(feature).toHaveProperty("category");
    });

    it("should contain SEND_MONEY_WITHOUT_ACCOUNT_BALANCE feature key", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/features/get-all`, {
        headers: { "X-API-Key": apiKey.standardUser },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      const keys = data.data.features.map((f: any) => f.key);
      expect(keys).toContain("SEND_MONEY_WITHOUT_ACCOUNT_BALANCE");
    });
  });

  describe("POST /api/v1/features/update", () => {
    it("should return 401 when no API key is provided", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/features/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: [] }),
      });
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Unauthorized");
    });

    it("should return 200 and update a feature toggle", async () => {
      // First, get all features to save original state
      const getResponse = await fetch(`${config.BASE_URL}/api/v1/features/get-all`, {
        headers: { "X-API-Key": apiKey.appAdmin },
      });
      const getData = await getResponse.json();
      originalFeatures = getData.data.features;

      // Toggle the first feature
      const featureToToggle = { ...getData.data.features[0] };
      featureToToggle.toggle = !featureToToggle.toggle;

      const response = await fetch(`${config.BASE_URL}/api/v1/features/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey.appAdmin,
        },
        body: JSON.stringify({ features: [featureToToggle] }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it("should return 403 when user is not admin", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/features/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey.standardUser,
        },
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Forbidden");
    });

    it("should return 422 for empty body", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/features/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey.appAdmin,
        },
        body: JSON.stringify({}),
      });
      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });
});
