"use client";

import { SESSION } from "@/constants";
import { useSession as useBetterAuthSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

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

  const triggerRefresh = () => {
    refetchRef.current?.();
    router.refresh();
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

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
  }, [router]);

  // Poll periodically so we stay in sync with server (e.g. cookie changed in another tab)
  useEffect(() => {
    if (typeof window === "undefined") return;
    pollIntervalRef.current = setInterval(triggerRefresh, SESSION.POLL_INTERVAL_MS);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [router]);

  // Refresh when tab gains focus (user switched back to this tab)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onFocus = () => triggerRefresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [router]);

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

/** Redirect to home when user has a session. Use on sign-in and register pages so signed-in users don't see the form. */
export function useRedirectToHomeWhenSignedIn(session: { user?: unknown } | null | undefined) {
  useEffect(() => {
    if (session?.user) {
      window.location.replace("/");
    }
  }, [session?.user]);
}

/** Call after sign-in, sign-out, or register so other tabs refetch session and refresh. */
export function broadcastSessionChanged() {
  if (typeof window === "undefined") return;
  try {
    const channel = new BroadcastChannel(SESSION.CHANNEL_NAME);
    channel.postMessage({ type: "SESSION_CHANGED", timestamp: Date.now() });
    channel.close();
  } catch (_) {}
}
