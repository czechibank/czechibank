export const MIN_PASSWORD_LENGTH = 8;

export const RATE_LIMIT = {
  TIME_WINDOW: 1000 * 60 * 1, // 1 minute
  MAX_REQUESTS: 60, // 60 requests per minute
};

/** Client session config. CHANNEL_NAME and POLL_INTERVAL_MS are used here. EXPIRES_IN and UPDATE_AGE are for reference only; server-side values in server-constants.ts are authoritative for better-auth. */
export const SESSION = {
  EXPIRES_IN: 60 * 30, // 30 minutes (reference; server-constants.ts is authoritative)
  UPDATE_AGE: 60, // 1 minute (reference; server-constants.ts is authoritative)
  /** BroadcastChannel name for cross-tab session sync (so all tabs show the same user after sign-in/sign-out) */
  CHANNEL_NAME: "czechibank-session-sync",
  /** Poll interval in ms for useSessionWithRefresh (keep client session in sync with server across tabs) */
  POLL_INTERVAL_MS: 10_000,
};
