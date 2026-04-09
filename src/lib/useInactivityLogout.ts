"use client";

import { authClient } from "@/lib/auth-client";
import {
  getInactivityConfig,
  INACTIVITY_LS_KEYS,
  INACTIVITY_TESTING_KEY,
  INACTIVITY_TIMERS,
} from "@/lib/inactivity-logout-timing";
import {
  broadcastSessionChanged,
  inactivityDialogOpenRef,
  skipRedirectForStaySignedIn,
} from "@/lib/useSessionWithRefresh";
import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    /** Enable short inactivity (2 min / 30 sec) for QA testing. See Swagger docs. */
    enableInactivityTesting?: () => "enabled" | "error";
    /** Disable short inactivity; use production 30 min / 5 min. */
    disableInactivityTesting?: () => "disabled" | "error";
    /** Returns "enabled" or "disabled" for current short-timing state. */
    getInactivityTestingStatus?: () => "enabled" | "disabled";
  }
}

// --- localStorage helpers (read imperatively in intervals; avoids React re-renders) ---

function lsGet(key: string, fallback = 0): number {
  try {
    const v = localStorage.getItem(key);
    return v != null ? Number(v) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: number): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {}
}

function getSkipUntil(): number {
  return lsGet(INACTIVITY_LS_KEYS.SKIP_UNTIL);
}

function getLastActivity(): number {
  return lsGet(INACTIVITY_LS_KEYS.LAST_ACTIVITY, Date.now());
}

function isInSkipOrRecentStaySignedIn(now: number = Date.now()): boolean {
  const skipUntil = getSkipUntil();
  const staySignedInAt = lsGet(INACTIVITY_LS_KEYS.STAY_SIGNED_IN_AT);
  return now < skipUntil || (staySignedInAt > 0 && now - staySignedInAt < INACTIVITY_TIMERS.RECENT_STAY_SIGNED_IN_MS);
}

// --- Module-level runtime refs (timeout / interval IDs cannot be serialised to localStorage) ---

let pendingLogoutId: ReturnType<typeof setTimeout> | null = null;
let inactivityIntervalId: ReturnType<typeof setInterval> | null = null;

function clearPendingLogout(): void {
  if (pendingLogoutId != null) {
    clearTimeout(pendingLogoutId);
    pendingLogoutId = null;
  }
}

/** Resets last-activity and skip-until in localStorage and clears any pending logout timeout. */
function resetInactivityTimers(): void {
  const now = Date.now();
  lsSet(INACTIVITY_LS_KEYS.LAST_ACTIVITY, now);
  lsSet(INACTIVITY_LS_KEYS.SKIP_UNTIL, now + INACTIVITY_TIMERS.SKIP_MS);
  clearPendingLogout();
}

export interface UseInactivityLogoutReturn {
  showDialog: boolean;
  countdownSec: number;
  handleStaySignedIn: () => void;
  /** Eagerly writes skip/activity state; attach to onPointerDown / onKeyDown so the state is committed before onClick. */
  commitStaySignedInRefs: () => void;
}

/**
 * Manages inactivity auto-logout with cross-tab awareness via localStorage:
 * - Tracks user activity (mousedown, keydown, touchstart, scroll).
 * - Shows a warning dialog with countdown when the user has been idle.
 * - Logs out when the countdown reaches 0.
 * - Provides "Stay signed in" handlers that reset the timer.
 * - Exposes console helpers (enableInactivityTesting / disableInactivityTesting) for QA.
 */
export function useInactivityLogout(params: {
  userId: string | null;
  refetchSession?: () => void;
}): UseInactivityLogoutReturn {
  const { userId, refetchSession } = params;
  const [showDialog, setShowDialog] = useState(false);
  const [countdownSec, setCountdownSec] = useState(0);

  const performLogout = useCallback(() => {
    const goToLoggedOut = () => {
      broadcastSessionChanged();
      window.location.replace("/logged-out?reason=inactivity");
    };
    authClient.signOut({
      fetchOptions: {
        redirect: "manual",
        onSuccess: goToLoggedOut,
        onError: goToLoggedOut,
      },
    });
  }, []);

  const scheduleLogoutAfterYield = useCallback(() => {
    clearPendingLogout();
    pendingLogoutId = setTimeout(() => {
      pendingLogoutId = null;
      const now = Date.now();
      if (isInSkipOrRecentStaySignedIn(now)) return;
      const elapsed = now - getLastActivity();
      const { logoutMs } = getInactivityConfig();
      if (elapsed < logoutMs) return;
      if (inactivityIntervalId) {
        clearInterval(inactivityIntervalId);
        inactivityIntervalId = null;
      }
      performLogout();
    }, INACTIVITY_TIMERS.YIELD_MS);
  }, [performLogout]);

  // Initialise last-activity when user appears; clear dialog ref when user disappears
  const hadUserIdRef = useRef(false);
  useEffect(() => {
    if (userId && !hadUserIdRef.current) {
      hadUserIdRef.current = true;
      lsSet(INACTIVITY_LS_KEYS.LAST_ACTIVITY, Date.now());
    }
    if (!userId) {
      hadUserIdRef.current = false;
      inactivityDialogOpenRef.current = false;
    }
  }, [userId]);

  // Main inactivity polling interval
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      const config = getInactivityConfig();
      const now = Date.now();
      if (now < getSkipUntil()) return;

      const elapsed = now - getLastActivity();

      if (elapsed >= config.logoutMs) {
        if (now < getSkipUntil()) return;
        if (pendingLogoutId == null) scheduleLogoutAfterYield();
        return;
      }

      const warningStart = config.logoutMs - config.warningBeforeMs;
      if (elapsed >= warningStart) {
        const secondsLeft = Math.ceil((config.logoutMs - elapsed) / 1000);
        const shouldScheduleLogout = secondsLeft <= 0 && now >= getSkipUntil() && pendingLogoutId == null;
        setTimeout(() => {
          if (isInSkipOrRecentStaySignedIn()) {
            inactivityDialogOpenRef.current = false;
            setShowDialog(false);
            return;
          }
          inactivityDialogOpenRef.current = true;
          setShowDialog(true);
          setCountdownSec(Math.max(0, secondsLeft));
          if (shouldScheduleLogout) scheduleLogoutAfterYield();
        }, 0);
      } else {
        setTimeout(() => {
          inactivityDialogOpenRef.current = false;
          setShowDialog(false);
        }, 0);
      }
    }, 1000);

    inactivityIntervalId = interval;
    return () => {
      clearInterval(interval);
      inactivityIntervalId = null;
      clearPendingLogout();
    };
  }, [userId, scheduleLogoutAfterYield]);

  // Expose console helpers for QA (short inactivity for faster testing)
  useEffect(() => {
    window.enableInactivityTesting = () => {
      try {
        localStorage.setItem(INACTIVITY_TESTING_KEY, "1");
        resetInactivityTimers();
        console.info("[inactivity] Enabled. Timer reset. Logout after 2 min of inactivity.");
        return "enabled";
      } catch {
        console.warn("[inactivity] Could not enable short timing (localStorage not available).");
        return "error";
      }
    };

    window.disableInactivityTesting = () => {
      try {
        localStorage.removeItem(INACTIVITY_TESTING_KEY);
        resetInactivityTimers();
        console.info("[inactivity] Disabled. Timer reset. Logout after 30 min of inactivity.");
        return "disabled";
      } catch {
        return "error";
      }
    };

    window.getInactivityTestingStatus = () => {
      try {
        return localStorage.getItem(INACTIVITY_TESTING_KEY) ? "enabled" : "disabled";
      } catch {
        return "disabled";
      }
    };

    return () => {
      delete window.enableInactivityTesting;
      delete window.disableInactivityTesting;
      delete window.getInactivityTestingStatus;
    };
  }, []);

  // Reset last-activity on user interaction (only when dialog is not open)
  useEffect(() => {
    if (!userId) return;

    const handleActivity = () => {
      if (!showDialog) {
        lsSet(INACTIVITY_LS_KEYS.LAST_ACTIVITY, Date.now());
      }
    };

    const events = ["mousedown", "keydown", "touchstart", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, handleActivity));
    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
    };
  }, [userId, showDialog]);

  const commitStaySignedInRefs = useCallback(() => {
    clearPendingLogout();
    const now = Date.now();
    lsSet(INACTIVITY_LS_KEYS.LAST_ACTIVITY, now);
    lsSet(INACTIVITY_LS_KEYS.SKIP_UNTIL, now + INACTIVITY_TIMERS.SKIP_MS);
    lsSet(INACTIVITY_LS_KEYS.STAY_SIGNED_IN_AT, now);
  }, []);

  const handleStaySignedIn = useCallback(() => {
    commitStaySignedInRefs();
    inactivityDialogOpenRef.current = false;
    skipRedirectForStaySignedIn(INACTIVITY_TIMERS.RECENT_STAY_SIGNED_IN_MS);
    refetchSession?.();
    setShowDialog(false);
    setCountdownSec(0);
  }, [commitStaySignedInRefs, refetchSession]);

  return { showDialog, countdownSec, handleStaySignedIn, commitStaySignedInRefs };
}
