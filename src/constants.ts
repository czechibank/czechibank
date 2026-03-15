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

/** Inactivity auto-logout: time in ms after which user is logged out. Must match server SESSION.EXPIRES_IN. */
export const INACTIVITY_LOGOUT_MS = 30 * 60 * 1000; // 30 minutes
/** Inactivity warning: show dialog this many ms before logout (countdown duration, e.g. 5 min). */
export const INACTIVITY_WARNING_BEFORE_MS = 5 * 60 * 1000; // 5 minutes
