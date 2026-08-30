"use client";

import { SESSION } from "@/constants";
import { useSession as useBetterAuthSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

/**
 * Wraps better-auth useSession with cross-tab sync and safe redirects.
 * - Polling: only the focused, visible window refetches the session and calls router.refresh() on an interval. Other windows refresh when the user returns to them.
 * - Focus and visibility: refetches when the user comes back to a window, debounced by SESSION.REFRESH_DEBOUNCE_MS so rapid window switching does not send a burst of requests.
 * - BroadcastChannel: listens for SIGNED_OUT (sent after a successful sign-out) and redirects immediately without asking the server; listens for SESSION_CHANGED (sent after sign-in and register) and refetches.
 * - Redirect to /logged-out when the session user changes to a different user so we never show the wrong user's data.
 */
export function useSessionWithRefresh() {
  const sessionResult = useBetterAuthSession();
  const router = useRouter();
  const channelRef = useRef<BroadcastChannel | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastUserIdRef = useRef<string | null>(null);
  const hasRedirectedToLoggedOutRef = useRef(false);
  const refetchRef = useRef<(() => void) | undefined>(undefined);
  const lastRefreshAtRef = useRef(0);
  if (typeof sessionResult.refetch === "function") refetchRef.current = sessionResult.refetch;

  const triggerRefresh = useCallback(() => {
    lastRefreshAtRef.current = Date.now();
    refetchRef.current?.();
    router.refresh();
  }, [router]);

  /**
   * Refresh unless one just happened. Moving between windows fires focus repeatedly and
   * every refresh is a request, so without this a user switching back and forth sends a
   * burst of them.
   */
  const triggerRefreshDebounced = useCallback(() => {
    if (Date.now() - lastRefreshAtRef.current < SESSION.REFRESH_DEBOUNCE_MS) return;
    triggerRefresh();
  }, [triggerRefresh]);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(SESSION.CHANNEL_NAME);

    const handleMessage = (event: MessageEvent) => {
      // SIGNED_OUT carries the answer, so this window does not have to ask the server.
      // That keeps cross-tab sign-out working even while session checks are being
      // rate limited - which is when the old ask-the-server approach silently failed.
      if (event.data?.type === "SIGNED_OUT") {
        if (window.location.pathname !== "/signin") window.location.replace("/signin");
        return;
      }
      if (event.data?.type === "SESSION_CHANGED") {
        triggerRefresh();
      }
    };

    channelRef.current.onmessage = handleMessage;

    return () => {
      channelRef.current?.close();
    };
  }, [triggerRefresh]);

  // Poll periodically so we stay in sync with the server (e.g. cookie changed elsewhere).
  //
  // Only the focused window polls. better-auth resets its rate-limit counter only after a
  // gap with no requests, so windows polling together never let it reset and eventually
  // every session check is refused (CZBANK-82). An unfocused window loses nothing: the
  // focus handler below refreshes it when the user returns, and SIGNED_OUT reaches it
  // immediately.
  //
  // CZBANK-25 (inactivity logout) also gates polling, on user activity rather than on
  // focus. Both conditions belong in this single check; a second interval would restore
  // the request rate this one exists to prevent.
  useEffect(() => {
    pollIntervalRef.current = setInterval(() => {
      if (document.hidden || !document.hasFocus()) return;
      triggerRefresh();
    }, SESSION.POLL_INTERVAL_MS);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [triggerRefresh]);

  // Refresh when the user comes back to this tab (window focus or tab becoming visible)
  useEffect(() => {
    const onFocus = () => triggerRefreshDebounced();
    const onVisibilityChange = () => {
      if (!document.hidden) triggerRefreshDebounced();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [triggerRefreshDebounced]);

  // When session user changes to a different user (e.g. another tab signed in as User B), redirect so we never show wrong user
  useEffect(() => {
    const currentUserId = sessionResult.data?.user?.id ?? null;
    const previousUserId = lastUserIdRef.current;

    if (
      previousUserId != null &&
      currentUserId != null &&
      previousUserId !== currentUserId &&
      !hasRedirectedToLoggedOutRef.current
    ) {
      hasRedirectedToLoggedOutRef.current = true;
      window.location.replace("/logged-out");
    }

    lastUserIdRef.current = currentUserId;
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
/**
 * Tells other windows that the user signed out.
 *
 * Unlike {@link broadcastSessionChanged} this carries the answer instead of asking the
 * other windows to check with the server, so it cannot be refused by a rate limit.
 *
 * Only call this after a sign-out that actually succeeded. Announcing a failed sign-out
 * would sign the other windows out of a session that is still valid.
 */
export function broadcastSignedOut() {
  if (typeof window === "undefined") return;
  try {
    const channel = new BroadcastChannel(SESSION.CHANNEL_NAME);
    channel.postMessage({ type: "SIGNED_OUT", timestamp: Date.now() });
    channel.close();
  } catch (_) {}
}

export function broadcastSessionChanged() {
  if (typeof window === "undefined") return;
  try {
    const channel = new BroadcastChannel(SESSION.CHANNEL_NAME);
    channel.postMessage({ type: "SESSION_CHANGED", timestamp: Date.now() });
    channel.close();
  } catch (_) {}
}
