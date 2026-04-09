"use client";

import { SESSION } from "@/constants";
import { useSession as useBetterAuthSession } from "@/lib/auth-client";
import { INACTIVITY_TIMERS } from "@/lib/inactivity-logout-timing";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

/** Timestamp (ms) until which this hook will not redirect to /logged-out. Set when the user clicks "Stay signed in". */
const skipRedirectUntilRef = { current: 0 };

/** True while the inactivity warning dialog is open; redirect is not scheduled so the user can click "Stay signed in". */
export const inactivityDialogOpenRef = { current: false };

/** Pending redirect timeout id; module-level so skipRedirectForStaySignedIn can clear it from any hook instance. */
let sharedRedirectTimeoutId: ReturnType<typeof setTimeout> | null = null;

/** Call when the user clicks "Stay signed in": clear any pending redirect and do not redirect for the next msFromNow ms. */
export function skipRedirectForStaySignedIn(msFromNow = INACTIVITY_TIMERS.RECENT_STAY_SIGNED_IN_MS) {
  if (sharedRedirectTimeoutId) {
    clearTimeout(sharedRedirectTimeoutId);
    sharedRedirectTimeoutId = null;
  }
  skipRedirectUntilRef.current = Date.now() + msFromNow;
}

/**
 * Session hook with cross-tab sync and redirect handling.
 * - Refetches session on a poll interval and on tab focus; calls router.refresh() only when not in the "Stay signed in" skip window (so the server does not redirect to signin).
 * - Listens for SESSION_CHANGED on BroadcastChannel; other tabs refetch and refresh.
 * - When session is gone (inactivity) or user changed in another tab: redirects to /logged-out after a short delay (or immediately for different user).
 */
export function useSessionWithRefresh() {
  const sessionResult = useBetterAuthSession();
  const router = useRouter();
  const channelRef = useRef<BroadcastChannel | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastUserIdRef = useRef<string | null>(null);
  const hasRedirectedToLoggedOutRef = useRef(false);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refetchRef = useRef<(() => void) | undefined>(undefined);
  if (typeof sessionResult.refetch === "function") refetchRef.current = sessionResult.refetch;

  /** Sync session state only (refetch). Does not call router.refresh() so idle tab poll does not extend server session. */
  const syncSession = useCallback(() => {
    refetchRef.current?.();
  }, []);

  /** Refetches session and calls router.refresh() when not in skip window. Use for focus and broadcast only, not poll. */
  const triggerRefresh = useCallback(() => {
    refetchRef.current?.();
    if (Date.now() >= skipRedirectUntilRef.current) router.refresh();
  }, [router]);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(SESSION.CHANNEL_NAME);

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SESSION_CHANGED") triggerRefresh();
    };

    channelRef.current.onmessage = handleMessage;

    return () => {
      channelRef.current?.close();
    };
  }, [triggerRefresh]);

  // Poll only syncs session state (refetch); does not router.refresh() so idle tabs do not extend server session
  useEffect(() => {
    pollIntervalRef.current = setInterval(syncSession, SESSION.POLL_INTERVAL_MS);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [syncSession]);

  // Refetch when tab gains focus
  useEffect(() => {
    const onFocus = () => triggerRefresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [triggerRefresh]);

  // Redirect to /logged-out when session is gone or user changed. Coordination with InactivityLogoutGuard:
  // the guard's scheduleLogoutAfterYield checks getSkipUntil() before performLogout; we check
  // inactivityDialogOpenRef and skipRedirectUntilRef and hasRedirectedToLoggedOutRef so we don't double-redirect.
  // Do not remove these checks or sharedRedirectTimeoutId cleanup.
  useEffect(() => {
    const currentUserId = sessionResult.data?.user?.id ?? null;
    const previousUserId = lastUserIdRef.current;

    const scheduleRedirectCheck = (delayMs: number) => {
      const timeoutId = setTimeout(() => {
        sharedRedirectTimeoutId = null;
        redirectTimeoutRef.current = null;
        const now = Date.now();
        const skipUntil = skipRedirectUntilRef.current;
        const inSkipWindow = now < skipUntil;
        const dialogOpen = inactivityDialogOpenRef.current;
        if (hasRedirectedToLoggedOutRef.current) return;
        if (inSkipWindow || dialogOpen) {
          const retryMs = inSkipWindow ? Math.max(1000, skipUntil - now) : 1000;
          scheduleRedirectCheck(retryMs);
          return;
        }
        hasRedirectedToLoggedOutRef.current = true;
        window.location.replace("/logged-out?reason=inactivity");
      }, delayMs);
      sharedRedirectTimeoutId = timeoutId;
      redirectTimeoutRef.current = timeoutId;
    };

    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    if (sharedRedirectTimeoutId) {
      clearTimeout(sharedRedirectTimeoutId);
      sharedRedirectTimeoutId = null;
    }

    // Different user (another user signed in elsewhere): redirect immediately. Do not treat null session as "different user" — let it fall through to inactivity/defer logic.
    if (previousUserId != null && currentUserId != null && currentUserId !== previousUserId) {
      hasRedirectedToLoggedOutRef.current = true;
      window.location.replace("/logged-out");
      return;
    }

    // Skip window: only suppress inactivity redirect; if session became null, re-arm the deferred redirect
    if (Date.now() < skipRedirectUntilRef.current) {
      if (previousUserId != null && currentUserId == null && !hasRedirectedToLoggedOutRef.current)
        scheduleRedirectCheck(INACTIVITY_TIMERS.REDIRECT_CHECK_DELAY_MS);
      lastUserIdRef.current = currentUserId;
      return;
    }

    // Dialog open: same — re-arm if session became null
    if (inactivityDialogOpenRef.current) {
      if (previousUserId != null && currentUserId == null && !hasRedirectedToLoggedOutRef.current)
        scheduleRedirectCheck(INACTIVITY_TIMERS.REDIRECT_CHECK_DELAY_MS);
      lastUserIdRef.current = currentUserId;
      return;
    }

    if (previousUserId != null && !hasRedirectedToLoggedOutRef.current && currentUserId == null) {
      scheduleRedirectCheck(INACTIVITY_TIMERS.REDIRECT_CHECK_DELAY_MS);
      return;
    }

    lastUserIdRef.current = currentUserId;
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        if (sharedRedirectTimeoutId === redirectTimeoutRef.current) sharedRedirectTimeoutId = null;
        redirectTimeoutRef.current = null;
      }
    };
  }, [sessionResult.data?.user?.id]);

  return sessionResult;
}

/**
 * Options for {@link useRedirectToHomeWhenSignedIn}.
 */
export interface UseRedirectToHomeWhenSignedInOptions {
  /** When true, do not redirect (e.g. during sign-up so router.push("/register/success") is not overridden). */
  skipRedirect?: boolean;
}

/**
 * Redirects to home when the user has a session. Use on sign-in and register pages so signed-in users don't see the form.
 * Depends on a stable user id so it does not re-run on every session refetch.
 *
 * @param session - Session from useSessionWithRefresh (or useSession). Redirect runs when session has a user with an id.
 * @param options - Optional. Pass `{ skipRedirect: true }` during sign-up so the success redirect is not overridden.
 */
export function useRedirectToHomeWhenSignedIn(
  session: { user?: { id?: string } } | null | undefined,
  options?: UseRedirectToHomeWhenSignedInOptions,
) {
  const userId =
    session?.user != null && typeof session.user === "object" && "id" in session.user
      ? (session.user as { id: string }).id
      : null;

  useEffect(() => {
    if (options?.skipRedirect || userId == null) return;
    window.location.replace("/");
  }, [userId, options?.skipRedirect]);
}

/**
 * Notifies other tabs that the session changed. Call after sign-in, sign-out, or register so other tabs refetch
 * session and refresh (via BroadcastChannel). No-operation when run on the server.
 */
export function broadcastSessionChanged() {
  if (typeof window === "undefined") return;
  try {
    const channel = new BroadcastChannel(SESSION.CHANNEL_NAME);
    channel.postMessage({ type: "SESSION_CHANGED", timestamp: Date.now() });
    channel.close();
  } catch (_) {}
}
