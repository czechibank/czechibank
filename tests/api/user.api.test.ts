import { describe, expect, it } from "vitest";
import { apiKey, SEED_USERS } from "../../shared/fixtures";
import { config } from "./config/config";

describe("User API", () => {
  describe("GET /api/v1/user", () => {
    it("should return 401 when no API key is provided", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/user`);
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Unauthorized");
    });

    it("should return 401 when invalid API key is provided", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/user`, {
        headers: { "X-API-Key": "invalid-token" },
      });
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Unauthorized");
    });

    it("should return 200 and user profile for valid API key", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/user`, {
        headers: { "X-API-Key": apiKey.standardUser },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.name).toBe("Standard User");
      expect(data.data.email).toBe(SEED_USERS.standardUser.email);
    });

    it("should return 401 for disabled API key", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/user`, {
        headers: { "X-API-Key": SEED_USERS.expiredKey.apiKeys[0].key },
      });
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Unauthorized");
    });
  });

  describe("POST /api/v1/user/create", () => {
    it("should return 201 and create a new user", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/user/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `test.${Date.now()}@example.com`,
          password: "password123",
          name: "Test User",
        }),
      });
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(typeof data.data.apiKey).toBe("string");
      expect(data.data.apiKey.length).toBeGreaterThan(0);
    });

    it("should return 422 for short password", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/user/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `short.pass.${Date.now()}@example.com`,
          password: "short",
          name: "Short Pass User",
        }),
      });
      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.details[0].message).toMatch(/Password must be at least 8 characters long/);
    });

    it("should return 422 for missing name", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/user/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `no.name.${Date.now()}@example.com`,
          password: "password123",
        }),
      });
      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it("should return 422 for missing email", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/user/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: "password123",
          name: "No Email User",
        }),
      });
      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it("should return 422 for missing password", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/user/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `no.pass.${Date.now()}@example.com`,
          name: "No Pass User",
        }),
      });
      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it("should return 422 for invalid email format", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/user/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "not-an-email",
          password: "password123",
          name: "Bad Email User",
        }),
      });
      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it("should return 409 for duplicate email", async () => {
      const response = await fetch(`${config.BASE_URL}/api/v1/user/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: SEED_USERS.standardUser.email,
          password: "password123",
          name: "Duplicate User",
        }),
      });
      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("EMAIL_ALREADY_EXISTS");
    });
  });
});
