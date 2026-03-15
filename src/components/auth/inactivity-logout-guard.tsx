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
import { INACTIVITY_LOGOUT_MS, INACTIVITY_WARNING_BEFORE_MS } from "@/constants";
import { authClient } from "@/lib/auth-client";
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
  }
}

/** Shared refs for skip/last-activity; also written to window so state survives HMR. */
const sharedLastActivityRef = { current: Date.now() };
const sharedSkipLogoutUntilRef = { current: 0 };
const sharedPendingMaybeLogoutIdRef = { current: null as ReturnType<typeof setTimeout> | null };

function getSkipUntil(): number {
  if (typeof window === "undefined") return sharedSkipLogoutUntilRef.current;
  return window.__inactivity_skip_until__ ?? sharedSkipLogoutUntilRef.current;
}
function getLastActivity(): number {
  if (typeof window === "undefined") return sharedLastActivityRef.current;
  return window.__inactivity_last_activity__ ?? sharedLastActivityRef.current;
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

  /** Delay (ms) before re-checking after deciding to logout; lets a "Stay signed in" click in the same tick run first. */
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
      const skipUntil = getSkipUntil();
      const lastActivity = getLastActivity();
      const staySignedInAt = typeof window !== "undefined" ? window.__inactivity_stay_signed_in_at__ : undefined;
      const inSkipWindow = now < skipUntil;
      const recentStaySignedIn = staySignedInAt != null && now - staySignedInAt < 20000;
      const elapsed = now - lastActivity;
      if (inSkipWindow || recentStaySignedIn) return;
      if (elapsed < INACTIVITY_LOGOUT_MS) return;
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

  // One interval per userId; effect cleanup clears it
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const skipUntil = getSkipUntil();
      const lastActivity = getLastActivity();
      if (now < skipUntil) return;

      const elapsed = now - lastActivity;

      if (elapsed >= INACTIVITY_LOGOUT_MS) {
        if (now < getSkipUntil()) return;
        clearInterval(interval);
        scheduleLogoutAfterYield();
        return;
      }

      const warningStart = INACTIVITY_LOGOUT_MS - INACTIVITY_WARNING_BEFORE_MS;
      if (elapsed >= warningStart) {
        const secondsLeft = Math.ceil((INACTIVITY_LOGOUT_MS - elapsed) / 1000);
        inactivityDialogOpenRef.current = true;
        setShowDialog(true);
        setCountdownSec(Math.max(0, secondsLeft));
        if (secondsLeft <= 0) {
          if (now < getSkipUntil()) return;
          clearInterval(interval);
          scheduleLogoutAfterYield();
        }
      } else {
        inactivityDialogOpenRef.current = false;
        setShowDialog(false);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
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
          <Button onClick={handleStaySignedIn} onMouseDown={commitStaySignedInRefs}>
            Stay signed in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
