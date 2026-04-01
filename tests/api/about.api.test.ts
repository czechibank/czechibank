import { describe, expect, it } from "vitest";
import { config } from "./config/config";
import { fetchApi } from "./helpers/fetch-api";

describe("About API", () => {
  describe("GET /api/v1/about", () => {
    it("should return 200 with app info", async () => {
      const response = await fetchApi(`${config.BASE_URL}/api/v1/about`);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe("This is the best bank ever!");
      expect(data.data.name).toBe("czechibank");
    });

    it("should include version as a string", async () => {
      const response = await fetchApi(`${config.BASE_URL}/api/v1/about`);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(typeof data.data.version).toBe("string");
      expect(data.data.version.length).toBeGreaterThan(0);
    });

    it("should include date as a valid ISO timestamp", async () => {
      const response = await fetchApi(`${config.BASE_URL}/api/v1/about`);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(typeof data.data.date).toBe("string");
      const parsed = new Date(data.data.date);
      expect(parsed.getTime()).not.toBeNaN();
    });
  });
});
