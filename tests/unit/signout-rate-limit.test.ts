import { describeSignOutFailure } from "@/lib/signout-error-message";
import { AUTH_RATE_LIMIT } from "@/server-constants";
import type { ErrorContext } from "better-auth/react";
import { describe, expect, it } from "vitest";

/** Minimal ErrorContext stand-in; only response and error are read. */
function errorContext(response: Response | undefined, message?: string) {
  return { response, error: message ? { message } : undefined } as unknown as Pick<ErrorContext, "response" | "error">;
}

describe("sign-out rate limiting (CZBANK-82)", () => {
  it("exempts /sign-out from the auth rate limit", () => {
    // better-auth skips rate limiting only when the custom rule resolves to exactly false.
    // Any object here would apply a limit instead, so the strict check is the point.
    expect(AUTH_RATE_LIMIT.CUSTOM_RULES["/sign-out"]).toBe(false);
  });

  it("uses the path shape better-auth matches on", () => {
    // The limiter strips the basePath (/api/auth) and trailing slashes before matching,
    // so the rule key has to be "/sign-out", not "/api/auth/sign-out".
    for (const path of Object.keys(AUTH_RATE_LIMIT.CUSTOM_RULES)) {
      expect(path.startsWith("/")).toBe(true);
      expect(path.startsWith("/api/")).toBe(false);
      expect(path.endsWith("/")).toBe(false);
    }
  });

  it("keeps a positive window and request budget for the remaining auth routes", () => {
    expect(AUTH_RATE_LIMIT.WINDOW_SECONDS).toBeGreaterThan(0);
    expect(AUTH_RATE_LIMIT.MAX_REQUESTS).toBeGreaterThan(0);
  });
});

describe("describeSignOutFailure", () => {
  it("reports the retry delay from better-auth's X-Retry-After header on 429", () => {
    // better-auth sends X-Retry-After; reading only the standard Retry-After finds nothing.
    const response = new Response(null, { status: 429, headers: { "X-Retry-After": "7" } });

    expect(describeSignOutFailure(errorContext(response))).toBe(
      "Too many requests. You are still signed in. Please wait 7 seconds and try again.",
    );
  });

  it("also accepts a standard Retry-After header, as a proxy would send", () => {
    const response = new Response(null, { status: 429, headers: { "Retry-After": "3" } });

    expect(describeSignOutFailure(errorContext(response))).toBe(
      "Too many requests. You are still signed in. Please wait 3 seconds and try again.",
    );
  });

  it("falls back to a vague delay when Retry-After is missing or unusable", () => {
    const noHeader = new Response(null, { status: 429 });
    const badHeader = new Response(null, { status: 429, headers: { "X-Retry-After": "later" } });

    for (const response of [noHeader, badHeader]) {
      expect(describeSignOutFailure(errorContext(response))).toBe(
        "Too many requests. You are still signed in. Please wait a moment and try again.",
      );
    }
  });

  it("passes through other server errors", () => {
    const response = new Response(null, { status: 500 });

    expect(describeSignOutFailure(errorContext(response, "Internal server error"))).toBe(
      "Internal server error You are still signed in.",
    );
  });

  it("still says the user is signed in when there is no response or message", () => {
    expect(describeSignOutFailure(errorContext(undefined))).toBe("You are still signed in. Please try again.");
  });

  it("never claims the user was signed out", () => {
    const cases = [
      errorContext(new Response(null, { status: 429, headers: { "X-Retry-After": "3" } })),
      errorContext(new Response(null, { status: 500 }), "boom"),
      errorContext(undefined),
    ];

    for (const context of cases) {
      expect(describeSignOutFailure(context)).toContain("still signed in");
    }
  });
});
