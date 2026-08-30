import env from "./lib/env";

const rateLimit = {
  development: {
    TIME_WINDOW: 1000 * 60 * 1, // 1 minute
    MAX_REQUESTS: 2000, // 2000 requests per minute
  },
  CI: {
    TIME_WINDOW: 1000 * 60 * 1, // 1 minute
    MAX_REQUESTS: 2000, // 2000 requests per minute
  },
  PROD: {
    TIME_WINDOW: 1000 * 60 * 1, // 1 minute
    MAX_REQUESTS: 20, // 20 requests per minute
  },
};

/** Rate limit for API-key authenticated requests (better-auth apiKey plugin). */
export const RATE_LIMIT = rateLimit[env.ENV || "PROD"];

/**
 * Rate limit for better-auth's own endpoints (`/api/auth/*`).
 *
 * Set explicitly rather than relying on better-auth's built-in defaults, so the limits
 * are visible here and do not change silently when the library is upgraded. The values
 * match better-auth's own defaults: counted per IP and per path.
 *
 * `enabled` is deliberately not set: better-auth defaults it to production-only, which
 * keeps local development and CI unthrottled.
 */
export const AUTH_RATE_LIMIT = {
  WINDOW_SECONDS: 10,
  MAX_REQUESTS: 100,
  /**
   * Endpoints that must never be rate limited.
   *
   * The rate-limit check runs *before* the route handler, so a 429 on `/sign-out` means
   * the session row is never deleted and the session cookie is never cleared - the user
   * stays signed in on the server while the UI reports a successful sign-out (CZBANK-82).
   * Refusing a sign-out is a safety problem (shared computers), and it protects nothing:
   * an attacker gains nothing by ending someone's session.
   */
  CUSTOM_RULES: {
    "/sign-out": false,
  } as const satisfies Record<string, false>,
};

export const SESSION = {
  EXPIRES_IN: 60 * 30, // 30 minutes
  UPDATE_AGE: 60 * 5, // 5 minutes (every 5 minutes the session expiration is updated)
};
