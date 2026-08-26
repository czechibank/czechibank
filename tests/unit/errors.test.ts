import { fromUnknown } from "@/lib/errors";
import { ApiErrorCode } from "@/lib/response";
import { describe, expect, it } from "vitest";

describe("fromUnknown", () => {
  describe("better-auth APIError with body.code (real structure)", () => {
    it("should map USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL to EMAIL_ALREADY_EXISTS", () => {
      // Real APIError: extends Error, has body.code and body.message
      const error = Object.assign(new Error("User already exists. Use another email"), {
        status: "UNPROCESSABLE_ENTITY",
        statusCode: 422,
        body: { code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL", message: "User already exists. Use another email" },
      });

      const result = fromUnknown(error);

      expect(result.code).toBe(ApiErrorCode.EMAIL_ALREADY_EXISTS);
      expect(result.message).toBe("User already exists. Use another email");
    });

    it("should map RATE_LIMITED in body to RATE_LIMIT_EXCEEDED", () => {
      const error = Object.assign(new Error("Rate limited"), {
        status: "UNAUTHORIZED",
        statusCode: 401,
        body: { code: "RATE_LIMITED", message: "Rate limited" },
      });

      const result = fromUnknown(error);

      expect(result.code).toBe(ApiErrorCode.RATE_LIMIT_EXCEEDED);
    });

    it("should map USAGE_EXCEEDED in body to RATE_LIMIT_EXCEEDED", () => {
      const error = Object.assign(new Error("API key usage exceeded"), {
        status: "TOO_MANY_REQUESTS",
        statusCode: 429,
        body: { code: "USAGE_EXCEEDED", message: "API key usage exceeded" },
      });

      const result = fromUnknown(error);

      expect(result.code).toBe(ApiErrorCode.RATE_LIMIT_EXCEEDED);
    });

    it("should fall back to INTERNAL_ERROR for unknown body.code", () => {
      const error = Object.assign(new Error("Unknown"), {
        status: "INTERNAL_SERVER_ERROR",
        statusCode: 500,
        body: { code: "SOME_UNKNOWN_CODE", message: "Unknown" },
      });

      const result = fromUnknown(error);

      expect(result.code).toBe(ApiErrorCode.INTERNAL_ERROR);
      expect(result.message).toBe("Unknown");
    });
  });

  describe("plain { code, message } objects (e.g. from ba-helpers)", () => {
    it("should map USER_ALREADY_EXISTS to EMAIL_ALREADY_EXISTS", () => {
      const error = { code: "USER_ALREADY_EXISTS", message: "User already exists" };

      const result = fromUnknown(error);

      expect(result.code).toBe(ApiErrorCode.EMAIL_ALREADY_EXISTS);
      expect(result.message).toBe("User already exists");
    });

    it("should map RATE_LIMITED to RATE_LIMIT_EXCEEDED", () => {
      const error = { code: "RATE_LIMITED", message: "Rate limited" };

      const result = fromUnknown(error);

      expect(result.code).toBe(ApiErrorCode.RATE_LIMIT_EXCEEDED);
    });

    it("should map INVALID_EMAIL_OR_PASSWORD to UNAUTHORIZED", () => {
      const error = { code: "INVALID_EMAIL_OR_PASSWORD", message: "Invalid email or password" };

      const result = fromUnknown(error);

      expect(result.code).toBe(ApiErrorCode.UNAUTHORIZED);
    });

    it("should map SESSION_EXPIRED to UNAUTHORIZED", () => {
      const error = { code: "SESSION_EXPIRED", message: "Session expired" };

      const result = fromUnknown(error);

      expect(result.code).toBe(ApiErrorCode.UNAUTHORIZED);
    });

    it("should map EMAIL_NOT_VERIFIED to FORBIDDEN", () => {
      const error = { code: "EMAIL_NOT_VERIFIED", message: "Email not verified" };

      const result = fromUnknown(error);

      expect(result.code).toBe(ApiErrorCode.FORBIDDEN);
    });

    it("should map USER_NOT_FOUND to NOT_FOUND", () => {
      const error = { code: "USER_NOT_FOUND", message: "User not found" };

      const result = fromUnknown(error);

      expect(result.code).toBe(ApiErrorCode.NOT_FOUND);
    });

    it("should map PASSWORD_TOO_SHORT to BAD_REQUEST", () => {
      const error = { code: "PASSWORD_TOO_SHORT", message: "Password too short" };

      const result = fromUnknown(error);

      expect(result.code).toBe(ApiErrorCode.BAD_REQUEST);
    });

    it("should pass through valid ApiErrorCode", () => {
      const error = { code: "NOT_FOUND", message: "Resource not found" };

      const result = fromUnknown(error);

      expect(result.code).toBe(ApiErrorCode.NOT_FOUND);
      expect(result.message).toBe("Resource not found");
    });

    it("should map unknown code to INTERNAL_ERROR", () => {
      const error = { code: "TOTALLY_UNKNOWN", message: "Weird error" };

      const result = fromUnknown(error);

      expect(result.code).toBe(ApiErrorCode.INTERNAL_ERROR);
      expect(result.message).toBe("Weird error");
    });
  });

  describe("plain Error instances", () => {
    it("should map a plain Error to INTERNAL_ERROR", () => {
      const error = new Error("Something broke");

      const result = fromUnknown(error);

      expect(result.code).toBe(ApiErrorCode.INTERNAL_ERROR);
      expect(result.message).toBe("Something broke");
    });
  });

  describe("plain { code, message } objects", () => {
    it("should pass through valid ApiErrorCode", () => {
      const error = { code: "NOT_FOUND", message: "Resource not found" };

      const result = fromUnknown(error);

      expect(result.code).toBe(ApiErrorCode.NOT_FOUND);
      expect(result.message).toBe("Resource not found");
    });

    it("should map unknown code to INTERNAL_ERROR", () => {
      const error = { code: "TOTALLY_UNKNOWN", message: "Weird error" };

      const result = fromUnknown(error);

      expect(result.code).toBe(ApiErrorCode.INTERNAL_ERROR);
      expect(result.message).toBe("Weird error");
    });
  });

  describe("additional better-auth code mappings (body.code)", () => {
    it("should map INVALID_TOKEN to UNAUTHORIZED", () => {
      const error = Object.assign(new Error("Bad token"), {
        body: { code: "INVALID_TOKEN", message: "Bad token" },
      });
      expect(fromUnknown(error).code).toBe(ApiErrorCode.UNAUTHORIZED);
    });

    it("should map SESSION_NOT_FRESH to UNAUTHORIZED", () => {
      const error = Object.assign(new Error("Stale session"), {
        body: { code: "SESSION_NOT_FRESH", message: "Stale session" },
      });
      expect(fromUnknown(error).code).toBe(ApiErrorCode.UNAUTHORIZED);
    });

    it("should map INVALID_PASSWORD to INVALID_PASSWORD", () => {
      const error = Object.assign(new Error("Wrong password"), {
        body: { code: "INVALID_PASSWORD", message: "Wrong password" },
      });
      expect(fromUnknown(error).code).toBe(ApiErrorCode.INVALID_PASSWORD);
    });

    it("should map TOO_MANY_ATTEMPTS to RATE_LIMIT_EXCEEDED", () => {
      const error = Object.assign(new Error("Too many tries"), {
        body: { code: "TOO_MANY_ATTEMPTS", message: "Too many tries" },
      });
      expect(fromUnknown(error).code).toBe(ApiErrorCode.RATE_LIMIT_EXCEEDED);
    });

    it("should map PROVIDER_NOT_FOUND to NOT_FOUND", () => {
      const error = Object.assign(new Error("No provider"), {
        body: { code: "PROVIDER_NOT_FOUND", message: "No provider" },
      });
      expect(fromUnknown(error).code).toBe(ApiErrorCode.NOT_FOUND);
    });

    it("should map VALIDATION_ERROR in body to VALIDATION_ERROR", () => {
      const error = Object.assign(new Error("Invalid"), {
        body: { code: "VALIDATION_ERROR", message: "Invalid" },
      });
      expect(fromUnknown(error).code).toBe(ApiErrorCode.VALIDATION_ERROR);
    });
  });

  describe("non-object errors", () => {
    it("should use fallback message for string errors", () => {
      const result = fromUnknown("oops");

      expect(result.code).toBe(ApiErrorCode.INTERNAL_ERROR);
      expect(result.message).toBe("An unexpected error occurred");
    });

    it("should use custom fallback message", () => {
      const result = fromUnknown(null, "Custom fallback");

      expect(result.code).toBe(ApiErrorCode.INTERNAL_ERROR);
      expect(result.message).toBe("Custom fallback");
    });
  });
});
