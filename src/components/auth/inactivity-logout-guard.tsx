"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { getInactivityConfig, INACTIVITY_TESTING_KEY } from "@/lib/inactivity-logout-timing";
import {
  broadcastSessionChanged,
  inactivityDialogOpenRef,
  skipRedirectForStaySignedIn,
  useSessionWithRefresh,
} from "@/lib/useSessionWithRefresh";
import { useCallback, useEffect, useRef, useState } from "react";

/** Persisted on window so "Stay signed in" and pending timeout survive Fast Refresh / HMR. */
declare global {
  interface Window {
    __inactivity_skip_until__?: number;
    __inactivity_last_activity__?: number;
    __inactivity_pending_timeout_id__?: ReturnType<typeof setTimeout>;
    __inactivity_stay_signed_in_at__?: number;
    /** Enable short inactivity (2 min / 30 sec) for QA testing. See Swagger docs. */
    enableInactivityTesting?: () => "enabled" | "error";
    /** Disable short inactivity; use production 30 min / 5 min. */
    disableInactivityTesting?: () => "disabled" | "error";
    /** Returns "enabled" or "disabled" for current short-timing state. */
    getInactivityTestingStatus?: () => "enabled" | "disabled";
  }
}

/** Shared refs for skip/last-activity; also written to window so state survives HMR. */
const sharedLastActivityRef = { current: Date.now() };
const sharedSkipLogoutUntilRef = { current: 0 };
const sharedPendingMaybeLogoutIdRef = { current: null as ReturnType<typeof setTimeout> | null };
/** Current interval id so the deferred logout callback can clear it only when logout is confirmed. */
const sharedInactivityIntervalIdRef = { current: null as ReturnType<typeof setInterval> | null };

/** Returns the timestamp (ms) until which we skip inactivity logout (e.g. after "Stay signed in"). */
function getSkipUntil(): number {
  if (typeof window === "undefined") return sharedSkipLogoutUntilRef.current;
  return window.__inactivity_skip_until__ ?? sharedSkipLogoutUntilRef.current;
}

/** Returns the last activity timestamp (ms) used for inactivity elapsed time. */
function getLastActivity(): number {
  if (typeof window === "undefined") return sharedLastActivityRef.current;
  return window.__inactivity_last_activity__ ?? sharedLastActivityRef.current;
}

/** How long (ms) we still consider "Stay signed in" as recent for re-check in deferred callbacks. */
const RECENT_STAY_SIGNED_IN_MS = 20000;

/** True if we are in the skip window or user just clicked "Stay signed in"; used to avoid re-opening dialog or logging out in deferred callbacks. */
function isInSkipOrRecentStaySignedIn(now: number = Date.now()): boolean {
  const skipUntil = getSkipUntil();
  const staySignedInAt = typeof window !== "undefined" ? window.__inactivity_stay_signed_in_at__ : undefined;
  const inSkipWindow = now < skipUntil;
  const recentStaySignedIn = staySignedInAt != null && now - staySignedInAt < RECENT_STAY_SIGNED_IN_MS;
  return inSkipWindow || recentStaySignedIn;
}

/** Format seconds as M:SS (e.g. 5:00, 0:01). */
function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Inactivity logout guard. When the user is signed in and idle for the configured period:
 * shows a warning dialog with countdown (e.g. 5 min), then logs out when countdown reaches 0.
 * "Stay signed in" resets the inactivity timer; other input resets it only when the dialog is closed.
 */
export function InactivityLogoutGuard() {
  const { data: session, refetch: refetchSession } = useSessionWithRefresh();
  const [showDialog, setShowDialog] = useState(false);
  const [countdownSec, setCountdownSec] = useState(0);
  const userId = session?.user != null && "id" in session.user ? (session.user as { id: string }).id : null;
  const SKIP_MS = 15000;

  /** Signs out and redirects to /logged-out?reason=inactivity. */
  const performLogout = useCallback(() => {
    const goToLoggedOut = () => {
      broadcastSessionChanged();
      window.location.replace("/logged-out?reason=inactivity");
    };
    authClient.signOut({
      fetchOptions: {
        redirect: "manual", // We redirect to /logged-out; do not follow server redirect to signin
        onSuccess: goToLoggedOut,
        onError: goToLoggedOut,
      },
    });
  }, []);

  /** Schedules a short delay then re-checks skip window and maybe calls performLogout; lets "Stay signed in" click run first. */
  const YIELD_MS = 100;
  const scheduleLogoutAfterYield = useCallback(() => {
    if (typeof window !== "undefined" && window.__inactivity_pending_timeout_id__ != null) {
      clearTimeout(window.__inactivity_pending_timeout_id__);
      window.__inactivity_pending_timeout_id__ = undefined;
    }
    if (sharedPendingMaybeLogoutIdRef.current) clearTimeout(sharedPendingMaybeLogoutIdRef.current);
    const id = setTimeout(() => {
      sharedPendingMaybeLogoutIdRef.current = null;
      if (typeof window !== "undefined") window.__inactivity_pending_timeout_id__ = undefined;
      const now = Date.now();
      const lastActivity = getLastActivity();
      const elapsed = now - lastActivity;
      const { logoutMs } = getInactivityConfig();
      if (isInSkipOrRecentStaySignedIn(now)) return;
      if (elapsed < logoutMs) return;
      if (sharedInactivityIntervalIdRef.current) {
        clearInterval(sharedInactivityIntervalIdRef.current);
        sharedInactivityIntervalIdRef.current = null;
      }
      performLogout();
    }, YIELD_MS);
    sharedPendingMaybeLogoutIdRef.current = id;
    if (typeof window !== "undefined") window.__inactivity_pending_timeout_id__ = id;
  }, [performLogout]);

  // Set last-activity when user appears (mount or after "Stay signed in"); avoid resetting on every poll
  const hadUserIdRef = useRef(false);
  useEffect(() => {
    if (userId && !hadUserIdRef.current) {
      hadUserIdRef.current = true;
      const t = Date.now();
      sharedLastActivityRef.current = t;
      if (typeof window !== "undefined") window.__inactivity_last_activity__ = t;
    }
    if (!userId) hadUserIdRef.current = false;
  }, [userId]);

  // One interval per userId; only clear it when logout is confirmed (in deferred callback), so "Stay signed in" keeps monitoring
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      const config = getInactivityConfig();
      const now = Date.now();
      const skipUntil = getSkipUntil();
      const lastActivity = getLastActivity();
      if (now < skipUntil) return;

      const elapsed = now - lastActivity;

      if (elapsed >= config.logoutMs) {
        if (now < getSkipUntil()) return;
        if (sharedPendingMaybeLogoutIdRef.current == null) scheduleLogoutAfterYield();
        return;
      }

      const warningStart = config.logoutMs - config.warningBeforeMs;
      if (elapsed >= warningStart) {
        const secondsLeft = Math.ceil((config.logoutMs - elapsed) / 1000);
        const shouldScheduleLogout =
          secondsLeft <= 0 && now >= getSkipUntil() && sharedPendingMaybeLogoutIdRef.current == null;
        setTimeout(() => {
          // Re-check: user may have clicked "Stay signed in" before this callback ran; avoid re-opening dialog
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

    sharedInactivityIntervalIdRef.current = interval;
    return () => {
      clearInterval(interval);
      sharedInactivityIntervalIdRef.current = null;
      if (typeof window !== "undefined" && window.__inactivity_pending_timeout_id__ != null) {
        clearTimeout(window.__inactivity_pending_timeout_id__);
        window.__inactivity_pending_timeout_id__ = undefined;
      }
      if (sharedPendingMaybeLogoutIdRef.current) {
        clearTimeout(sharedPendingMaybeLogoutIdRef.current);
        sharedPendingMaybeLogoutIdRef.current = null;
      }
    };
  }, [userId, scheduleLogoutAfterYield]);

  // Expose console helpers for QA (short inactivity for faster testing); works in any environment
  useEffect(() => {
    if (typeof window === "undefined") return;
    const RESET_SKIP_MS = 15000; // same as SKIP_MS; skip window when resetting timing
    window.enableInactivityTesting = () => {
      try {
        localStorage.setItem(INACTIVITY_TESTING_KEY, "1");
        const now = Date.now();
        sharedLastActivityRef.current = now;
        sharedSkipLogoutUntilRef.current = now + RESET_SKIP_MS;
        if (typeof window !== "undefined") {
          window.__inactivity_last_activity__ = now;
          window.__inactivity_skip_until__ = now + RESET_SKIP_MS;
          if (window.__inactivity_pending_timeout_id__ != null) {
            clearTimeout(window.__inactivity_pending_timeout_id__);
            window.__inactivity_pending_timeout_id__ = undefined;
          }
        }
        if (sharedPendingMaybeLogoutIdRef.current) {
          clearTimeout(sharedPendingMaybeLogoutIdRef.current);
          sharedPendingMaybeLogoutIdRef.current = null;
        }
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
        const now = Date.now();
        sharedLastActivityRef.current = now;
        sharedSkipLogoutUntilRef.current = now + RESET_SKIP_MS;
        if (typeof window !== "undefined") {
          window.__inactivity_last_activity__ = now;
          window.__inactivity_skip_until__ = now + RESET_SKIP_MS;
          if (window.__inactivity_pending_timeout_id__ != null) {
            clearTimeout(window.__inactivity_pending_timeout_id__);
            window.__inactivity_pending_timeout_id__ = undefined;
          }
        }
        if (sharedPendingMaybeLogoutIdRef.current) {
          clearTimeout(sharedPendingMaybeLogoutIdRef.current);
          sharedPendingMaybeLogoutIdRef.current = null;
        }
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

  // Reset last activity on user interaction (only when dialog is not open)
  useEffect(() => {
    if (!userId) return;

    const handleActivity = () => {
      if (!showDialog) {
        const t = Date.now();
        sharedLastActivityRef.current = t;
        if (typeof window !== "undefined") window.__inactivity_last_activity__ = t;
      }
    };

    const events = ["mousedown", "keydown", "touchstart", "scroll"] as const;
    events.forEach((e) => {
      window.addEventListener(e, handleActivity);
    });
    return () => {
      events.forEach((e) => {
        window.removeEventListener(e, handleActivity);
      });
    };
  }, [userId, showDialog]);

  /** Writes skip/activity to window and refs, clears pending logout timeout. Called on mousedown and in handleStaySignedIn. */
  const commitStaySignedInRefs = useCallback(() => {
    if (typeof window !== "undefined" && window.__inactivity_pending_timeout_id__ != null) {
      clearTimeout(window.__inactivity_pending_timeout_id__);
      window.__inactivity_pending_timeout_id__ = undefined;
    }
    if (sharedPendingMaybeLogoutIdRef.current) {
      clearTimeout(sharedPendingMaybeLogoutIdRef.current);
      sharedPendingMaybeLogoutIdRef.current = null;
    }
    const now = Date.now();
    sharedLastActivityRef.current = now;
    sharedSkipLogoutUntilRef.current = now + SKIP_MS;
    if (typeof window !== "undefined") {
      window.__inactivity_last_activity__ = now;
      window.__inactivity_skip_until__ = now + SKIP_MS;
      window.__inactivity_stay_signed_in_at__ = now;
    }
  }, []);

  /** Handles "Stay signed in" click: commits skip/activity, notifies session hook, refetches session, closes dialog. */
  const handleStaySignedIn = useCallback(() => {
    commitStaySignedInRefs();
    inactivityDialogOpenRef.current = false;
    skipRedirectForStaySignedIn(20000);
    refetchSession?.(); // Extend server session so next poll does not return null
    setShowDialog(false);
    setCountdownSec(0);
  }, [commitStaySignedInRefs, refetchSession]);

  if (!userId) {
    inactivityDialogOpenRef.current = false;
    return null;
  }

  return (
    <Dialog open={showDialog} onOpenChange={() => {}}>
      <DialogContent
        className="[&>button:last-child]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>You will be logged out soon</DialogTitle>
          <DialogDescription>
            You have been inactive. You will be logged out in {formatCountdown(countdownSec)}. Click the button below to
            stay signed in.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={handleStaySignedIn}
            onPointerDown={commitStaySignedInRefs}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.key === " " && e.preventDefault();
                commitStaySignedInRefs();
              }
            }}
          >
            Stay signed in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
