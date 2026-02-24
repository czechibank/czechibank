export const MIN_PASSWORD_LENGTH = 8;

export const RATE_LIMIT = {
  TIME_WINDOW: 1000 * 60 * 1, // 1 minute
  MAX_REQUESTS: 60, // 60 requests per minute
};

export const SESSION = {
  EXPIRES_IN: 60 * 30, // 30 minutes
  UPDATE_AGE: 60 * 5, // 5 minutes (every 5 minutes the session expiration is updated)
  /** BroadcastChannel name for cross-tab session sync (so all tabs show the same user after sign-in/sign-out) */
  CHANNEL_NAME: "czechibank-session-sync",
  /** Poll interval in ms for useSessionWithRefresh (keep client session in sync with server across tabs) */
  POLL_INTERVAL_MS: 10_000,
};
