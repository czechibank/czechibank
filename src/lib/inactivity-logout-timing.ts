/** Time in ms after which user is logged out. Must match server SESSION.EXPIRES_IN. */
export const INACTIVITY_LOGOUT_MS = 30 * 60 * 1000; // 30 minutes
/** Show warning dialog this many ms before logout (countdown duration). */
export const INACTIVITY_WARNING_BEFORE_MS = 5 * 60 * 1000; // 5 minutes

const INACTIVITY_TESTING_STORAGE_KEY = "inactivityTestingShort";
const SHORT_LOGOUT_MS = 2 * 60 * 1000; // 2 min
const SHORT_WARNING_MS = 30 * 1000; // 30 sec

/** Used by console helpers; exported for tests. */
export const INACTIVITY_TESTING_KEY = INACTIVITY_TESTING_STORAGE_KEY;

/**
 * Returns effective inactivity timing. When QA enables "short" mode via console (see Swagger docs),
 * returns 2 min / 30 sec for faster testing; otherwise returns production 30 min / 5 min.
 * Client-only; on server returns production values.
 */
export function getInactivityConfig(): { logoutMs: number; warningBeforeMs: number } {
  if (typeof window === "undefined") {
    return { logoutMs: INACTIVITY_LOGOUT_MS, warningBeforeMs: INACTIVITY_WARNING_BEFORE_MS };
  }
  try {
    if (localStorage.getItem(INACTIVITY_TESTING_STORAGE_KEY)) {
      return { logoutMs: SHORT_LOGOUT_MS, warningBeforeMs: SHORT_WARNING_MS };
    }
  } catch {
    // ignore
  }
  return { logoutMs: INACTIVITY_LOGOUT_MS, warningBeforeMs: INACTIVITY_WARNING_BEFORE_MS };
}
