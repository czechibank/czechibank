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
  /** Poll interval in ms for useSessionWithRefresh. Only the focused window polls, so this is the total rate regardless of how many windows are open. */
  POLL_INTERVAL_MS: 10_000,
  /** Minimum gap in ms between focus/visibility triggered refreshes, so window switching does not burst requests */
  REFRESH_DEBOUNCE_MS: 2_000,
};
