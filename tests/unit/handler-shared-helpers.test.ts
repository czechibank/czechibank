import { parseJsonBody } from "@/app/api/v1/handlers/shared/parse-json-body";
import { parsePathParams } from "@/app/api/v1/handlers/shared/parse-path-params";
import { requireAdmin } from "@/app/api/v1/handlers/shared/require-admin";
import { ApiErrorCode } from "@/lib/response";
import { describe, expect, it } from "vitest";
import { z } from "zod";

describe("parseJsonBody", () => {
  it("parses a valid JSON body", async () => {
    const request = new Request("https://x.test", { method: "POST", body: JSON.stringify({ a: 1 }) });
    const result = await parseJsonBody(request);
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual({ a: 1 });
  });

  it("returns BAD_REQUEST for invalid JSON", async () => {
    const request = new Request("https://x.test", { method: "POST", body: "not json" });
    const result = await parseJsonBody(request);
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().code).toBe(ApiErrorCode.BAD_REQUEST);
  });
});

describe("requireAdmin", () => {
  it("passes the user through when role is admin", async () => {
    const user = { id: "1", role: "admin" };
    const result = await requireAdmin(user);
    expect(result._unsafeUnwrap()).toBe(user);
  });

  it("returns FORBIDDEN for non-admins", async () => {
    const result = await requireAdmin({ id: "1", role: "user" });
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().code).toBe(ApiErrorCode.FORBIDDEN);
  });
});

describe("parsePathParams", () => {
  const schema = z.object({ id: z.string().min(1) });

  it("validates resolved params", async () => {
    const result = await parsePathParams(Promise.resolve({ id: "abc" }), schema);
    expect(result._unsafeUnwrap()).toEqual({ id: "abc" });
  });

  it("returns VALIDATION_ERROR for invalid params", async () => {
    const result = await parsePathParams(Promise.resolve({ id: "" }), schema);
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().code).toBe(ApiErrorCode.VALIDATION_ERROR);
  });
});
