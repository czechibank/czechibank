import { ApiErrorCode } from "@/lib/response";
import { toApiResponse, toPaginatedApiResponse, toServiceResponse } from "@/lib/result-helpers";
import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it } from "vitest";

describe("toApiResponse", () => {
  it("returns success status and envelope for ok ResultAsync", async () => {
    const res = await toApiResponse(okAsync({ id: "a" }), "Created", 201);

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toBe("Created");
    expect(json.data).toEqual({ id: "a" });
    expect(json.meta?.timestamp).toBeDefined();
  });

  it("returns HTTP status from mapErrorCodeToStatus for Err", async () => {
    const res = await toApiResponse(
      errAsync({ code: ApiErrorCode.EMAIL_ALREADY_EXISTS, message: "User exists" }),
      "ignored",
      200,
    );

    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.message).toBe("User exists");
    expect(json.error.code).toBe(ApiErrorCode.EMAIL_ALREADY_EXISTS);
    expect(json.error.message).toBe("User exists");
    expect(json.meta?.timestamp).toBeDefined();
  });

  it("maps RATE_LIMIT_EXCEEDED to 429", async () => {
    const res = await toApiResponse(errAsync({ code: ApiErrorCode.RATE_LIMIT_EXCEEDED, message: "Slow down" }), "ok");
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.error.code).toBe(ApiErrorCode.RATE_LIMIT_EXCEEDED);
  });

  it("includes validation details when present on AppError", async () => {
    const res = await toApiResponse(
      errAsync({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: "Validation error",
        details: [{ code: ApiErrorCode.VALIDATION_ERROR, field: "email", message: "Invalid" }],
      }),
      "ok",
    );
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error.details).toHaveLength(1);
    expect(json.error.details[0].field).toBe("email");
  });
});

describe("toPaginatedApiResponse", () => {
  it("puts pagination on success meta and returns 200", async () => {
    const pagination = { page: 1, limit: 10, total: 2, totalPages: 1 };
    const res = await toPaginatedApiResponse(okAsync({ rows: [1, 2] }), "Listed", () => ({
      body: { rows: [1, 2] },
      pagination,
    }));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual({ rows: [1, 2] });
    expect(json.meta.pagination).toEqual(pagination);
  });

  it("uses same error status mapping as toApiResponse on Err", async () => {
    const res = await toPaginatedApiResponse(
      errAsync({ code: ApiErrorCode.NOT_FOUND, message: "Missing" }),
      "Listed",
      () => ({ body: {}, pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } }),
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe(ApiErrorCode.NOT_FOUND);
  });
});

describe("toServiceResponse", () => {
  it("returns SuccessResponse shape for ok", async () => {
    const out = await toServiceResponse(okAsync({ x: 1 }), "Done");
    expect(out.success).toBe(true);
    if (out.success) {
      expect(out.data).toEqual({ x: 1 });
      expect(out.message).toBe("Done");
    }
  });

  it("returns ErrorResponse shape for err", async () => {
    const out = await toServiceResponse(errAsync({ code: ApiErrorCode.UNAUTHORIZED, message: "Nope" }), "Done");
    expect(out.success).toBe(false);
    if (!out.success) {
      expect(out.error.code).toBe(ApiErrorCode.UNAUTHORIZED);
      expect(out.error.message).toBe("Nope");
    }
  });
});
