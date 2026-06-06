import { withApiHandler, withPaginatedApiHandler } from "@/lib/api/with-api-handler";
import { badRequest, notFound } from "@/lib/errors";
import { createPaginationMeta } from "@/lib/response";
import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

const emptyContext = { params: Promise.resolve({}) };

describe("withApiHandler", () => {
  it("returns success envelope with configured status and message", async () => {
    const route = withApiHandler(() => okAsync({ id: "abc" }), {
      successMessage: "Created",
      successStatus: 201,
    });

    const response = await route(new Request("https://x.test/api"), emptyContext);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Created");
    expect(body.data).toEqual({ id: "abc" });
    expect(body.meta.timestamp).toBeTypeOf("string");
  });

  it("defaults to status 200 when not provided", async () => {
    const route = withApiHandler(() => okAsync({ ok: true }), { successMessage: "Done" });

    const response = await route(new Request("https://x.test/api"), emptyContext);
    expect(response.status).toBe(200);
  });

  it("maps AppError to the correct HTTP status and error envelope", async () => {
    const route = withApiHandler(() => errAsync(notFound("Nope")), { successMessage: "unused" });

    const response = await route(new Request("https://x.test/api"), emptyContext);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("NOT_FOUND");
    expect(body.error.message).toBe("Nope");
  });

  it("passes request and route context to the handler", async () => {
    const handler = vi.fn(() => okAsync({ ok: true }));
    const route = withApiHandler(handler, { successMessage: "Done" });
    const request = new Request("https://x.test/api");
    const context = { params: Promise.resolve({ id: "123" }) };

    await route(request, context);

    expect(handler).toHaveBeenCalledWith(request, context);
  });

  it("invokes onComplete with status and duration after building the response", async () => {
    const onComplete = vi.fn();
    const route = withApiHandler(() => errAsync(badRequest("bad")), {
      successMessage: "unused",
      onComplete,
    });

    await route(new Request("https://x.test/api"), emptyContext);

    expect(onComplete).toHaveBeenCalledTimes(1);
    const arg = onComplete.mock.calls[0][0];
    expect(arg.status).toBe(400);
    expect(arg.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("merges meta from the meta factory", async () => {
    const route = withApiHandler(() => okAsync({ ok: true }), {
      successMessage: "Done",
      meta: () => ({ requestId: "req-1" }),
    });

    const response = await route(new Request("https://x.test/api"), emptyContext);
    const body = await response.json();

    expect(body.meta.requestId).toBe("req-1");
  });
});

describe("withPaginatedApiHandler", () => {
  it("shapes a paginated success response from the result value", async () => {
    const route = withPaginatedApiHandler(() => okAsync({ items: [{ id: "1" }], page: 1, limit: 10, total: 1 }), {
      successMessage: "Listed",
      transform: (data) => ({
        body: { things: data.items },
        pagination: createPaginationMeta(data.page, data.limit, data.total),
      }),
    });

    const response = await route(new Request("https://x.test/api"), emptyContext);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.things).toEqual([{ id: "1" }]);
    expect(body.meta.pagination).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
  });

  it("maps AppError to the correct status", async () => {
    const route = withPaginatedApiHandler(() => errAsync(badRequest("bad params")), {
      successMessage: "unused",
      transform: () => ({ body: {}, pagination: createPaginationMeta(1, 10, 0) }),
    });

    const response = await route(new Request("https://x.test/api"), emptyContext);
    expect(response.status).toBe(400);
  });
});
