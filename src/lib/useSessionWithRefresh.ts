"use client";

import { SESSION } from "@/constants";
import { useSession as useBetterAuthSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

/**
 * Wraps better-auth useSession with cross-tab sync and safe redirects.
 * - Polling and focus: refetches session and calls router.refresh() on an interval and when the tab gains focus so all tabs stay in sync with the server.
 * - BroadcastChannel: listens for SESSION_CHANGED (sent after sign-in, sign-out, register); other tabs refetch and refresh so they show the same user.
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
  if (typeof sessionResult.refetch === "function") refetchRef.current = sessionResult.refetch;

  const triggerRefresh = useCallback(() => {
    refetchRef.current?.();
    router.refresh();
  }, [router]);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(SESSION.CHANNEL_NAME);

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SESSION_CHANGED") {
        triggerRefresh();
      }
    };

    channelRef.current.onmessage = handleMessage;

    return () => {
      channelRef.current?.close();
    };
  }, [triggerRefresh]);

  // Poll periodically so we stay in sync with server (e.g. cookie changed in another tab)
  useEffect(() => {
    pollIntervalRef.current = setInterval(triggerRefresh, SESSION.POLL_INTERVAL_MS);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [triggerRefresh]);

  // Refresh when tab gains focus (user switched back to this tab)
  useEffect(() => {
    const onFocus = () => triggerRefresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [triggerRefresh]);

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
    window.location.replace("/dashboard");
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
