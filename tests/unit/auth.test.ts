import { ApiErrorCode } from "@/lib/response";
import { describe, expect, it, vi } from "vitest";

// Mock userService before importing authenticateRequest
vi.mock("@/domain/user-domain/user-service", () => ({
  default: {
    server: {
      getSession: vi.fn(),
    },
  },
}));

// Mock auth export (needed by auth.ts import)
vi.mock("../../../../auth", () => ({
  auth: {
    $Infer: { Session: { user: {} } },
  },
}));

import { authenticateRequest } from "@/app/api/v1/auth";
import userService from "@/domain/user-domain/user-service";

function makeRequest(apiKey?: string): Request {
  const headers = new Headers();
  if (apiKey) headers.set("X-API-Key", apiKey);
  return new Request("http://localhost/api/v1/test", { headers });
}

describe("authenticateRequest", () => {
  it("should return UNAUTHORIZED when no API key is provided", async () => {
    const result = await authenticateRequest(makeRequest());

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().code).toBe(ApiErrorCode.UNAUTHORIZED);
  });

  it("should return UNAUTHORIZED when getSession returns null", async () => {
    vi.mocked(userService.server.getSession).mockResolvedValue(null);

    const result = await authenticateRequest(makeRequest("valid-key"));

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().code).toBe(ApiErrorCode.UNAUTHORIZED);
  });

  it("should return RATE_LIMIT_EXCEEDED when Better Auth throws RATE_LIMITED", async () => {
    const rateLimitError = Object.assign(new Error("Rate limited"), {
      status: "TOO_MANY_REQUESTS",
      statusCode: 429,
      body: { code: "RATE_LIMITED", message: "Rate limited" },
    });
    vi.mocked(userService.server.getSession).mockRejectedValue(rateLimitError);

    const result = await authenticateRequest(makeRequest("valid-key"));

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().code).toBe(ApiErrorCode.RATE_LIMIT_EXCEEDED);
    expect(result._unsafeUnwrapErr().message).toBe("Rate limited");
  });

  it("should return RATE_LIMIT_EXCEEDED when Better Auth throws USAGE_EXCEEDED", async () => {
    const usageError = Object.assign(new Error("API key usage exceeded"), {
      status: "TOO_MANY_REQUESTS",
      statusCode: 429,
      body: { code: "USAGE_EXCEEDED", message: "API key usage exceeded" },
    });
    vi.mocked(userService.server.getSession).mockRejectedValue(usageError);

    const result = await authenticateRequest(makeRequest("valid-key"));

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().code).toBe(ApiErrorCode.RATE_LIMIT_EXCEEDED);
  });

  it("should return UNAUTHORIZED for unrecognized Better Auth errors (invalid key)", async () => {
    const invalidKeyError = Object.assign(new Error("Invalid API key"), {
      status: "UNAUTHORIZED",
      statusCode: 401,
      body: { code: "SOME_UNKNOWN_AUTH_ERROR", message: "Invalid API key" },
    });
    vi.mocked(userService.server.getSession).mockRejectedValue(invalidKeyError);

    const result = await authenticateRequest(makeRequest("invalid-key"));

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().code).toBe(ApiErrorCode.UNAUTHORIZED);
  });

  it("should return UNAUTHORIZED for plain Error thrown by getSession", async () => {
    vi.mocked(userService.server.getSession).mockRejectedValue(new Error("Connection failed"));

    const result = await authenticateRequest(makeRequest("some-key"));

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().code).toBe(ApiErrorCode.UNAUTHORIZED);
  });

  it("should return the user on successful authentication", async () => {
    const mockUser = { id: "user-1", name: "Test", email: "test@test.com", role: "user" };
    vi.mocked(userService.server.getSession).mockResolvedValue({
      user: mockUser,
      session: {} as any,
    });

    const result = await authenticateRequest(makeRequest("valid-key"));

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual(mockUser);
  });
});
