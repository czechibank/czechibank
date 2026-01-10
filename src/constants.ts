export const MIN_PASSWORD_LENGTH = 8;

export const RATE_LIMIT = {
  TIME_WINDOW: 1000 * 60 * 1, // 1 minute
  MAX_REQUESTS: 20, // 20 requests per minute
};

export const SESSION = {
  EXPIRES_IN: 60 * 30, // 1 minute
  UPDATE_AGE: 60 * 5, // 5 minutes (every 5 minutes the session expiration is updated)
};
