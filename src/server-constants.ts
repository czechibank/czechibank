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
  EXPIRES_IN: 60 * 30, // 30 minutes
  UPDATE_AGE: 60 * 5, // 5 minutes (every 5 minutes the session expiration is updated)
};
