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

export const RATE_LIMIT = rateLimit[env.ENV || "PROD"];

export const SESSION = {
  /** Session duration in seconds. Must match client INACTIVITY_LOGOUT_MS. */
  EXPIRES_IN: 60 * 30, // 30 minutes
  /** Seconds after which getSession will refresh the session cookie. 0 = every getSession (so "Stay signed in" refetch always extends the session, including at the last second). */
  UPDATE_AGE: 0,
};
