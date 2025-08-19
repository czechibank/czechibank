export const MIN_PASSWORD_LENGTH = 8;

export const RATE_LIMIT = {
  TIME_WINDOW: 1000 * 60 * 1, // 1 minute
  MAX_REQUESTS: 20, // 20 requests per minute
};

export const SESSION = {
  EXPIRES_IN: 60 * 60, // 1 hour
  UPDATE_AGE: 60 * 30, // 30 minutes (every 30 minutes the session expiration is updated)
};
