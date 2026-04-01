import { apiErrorStatusMap, mapErrorCodeToStatus } from "@/lib/api-error-status-map";
import { ApiErrorCode } from "@/lib/response";
import { describe, expect, it } from "vitest";

describe("apiErrorStatusMap", () => {
  it("should map EMAIL_ALREADY_EXISTS to 409", () => {
    expect(apiErrorStatusMap[ApiErrorCode.EMAIL_ALREADY_EXISTS]).toBe(409);
  });

  it("should map RATE_LIMIT_EXCEEDED to 429", () => {
    expect(apiErrorStatusMap[ApiErrorCode.RATE_LIMIT_EXCEEDED]).toBe(429);
  });

  it("should map UNAUTHORIZED to 401", () => {
    expect(apiErrorStatusMap[ApiErrorCode.UNAUTHORIZED]).toBe(401);
  });

  it("should map FORBIDDEN to 403", () => {
    expect(apiErrorStatusMap[ApiErrorCode.FORBIDDEN]).toBe(403);
  });

  it("should map NOT_FOUND to 404", () => {
    expect(apiErrorStatusMap[ApiErrorCode.NOT_FOUND]).toBe(404);
  });

  it("should map VALIDATION_ERROR to 422", () => {
    expect(apiErrorStatusMap[ApiErrorCode.VALIDATION_ERROR]).toBe(422);
  });

  it("should map INTERNAL_ERROR to 500", () => {
    expect(apiErrorStatusMap[ApiErrorCode.INTERNAL_ERROR]).toBe(500);
  });
});

describe("mapErrorCodeToStatus", () => {
  it("should return correct status for ApiErrorCode enum values", () => {
    expect(mapErrorCodeToStatus(ApiErrorCode.EMAIL_ALREADY_EXISTS)).toBe(409);
    expect(mapErrorCodeToStatus(ApiErrorCode.RATE_LIMIT_EXCEEDED)).toBe(429);
    expect(mapErrorCodeToStatus(ApiErrorCode.UNAUTHORIZED)).toBe(401);
  });

  it("should return 500 for unknown string codes", () => {
    expect(mapErrorCodeToStatus("TOTALLY_UNKNOWN")).toBe(500);
  });
});
