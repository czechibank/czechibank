"use client";

import { useToast } from "@/components/ui/use-toast";
import userServiceClient from "@/domain/user-domain/user-service-client";
import { describeSignOutFailure } from "@/lib/signout-error-message";
import { broadcastSignedOut } from "@/lib/useSessionWithRefresh";
import type { ErrorContext } from "better-auth/react";
import posthog from "posthog-js";
import { useState } from "react";
import { Button } from "../ui/button";

/**
 * Sign-out button.
 *
 * On success: tells the other windows via broadcastSignedOut, then redirects to /signin.
 *
 * On failure: stays on the page and shows the error. It must never redirect to /signin,
 * because the server only clears the session when the request reaches the handler. A
 * failed sign-out that navigates to /signin looks identical to a successful one, while
 * the session cookie is still valid - so going back or reloading returns the user to
 * their account (CZBANK-82).
 */
export function SignOut(props: React.ComponentPropsWithRef<typeof Button>) {
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    // Guard against repeat clicks: each one is another request, which makes a
    // rate-limit rejection more likely rather than less.
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      await userServiceClient.signOut({
        onSuccess: () => {
          posthog.capture("user_signed_out");
          posthog.reset();
          broadcastSignedOut();
          window.location.replace("/signin");
        },
        onError: (error: ErrorContext) => {
          console.error("[auth] sign-out failed", error);
          toast({
            variant: "destructive",
            title: "Sign out failed",
            description: describeSignOutFailure(error),
          });
          setIsSigningOut(false);
        },
      });
    } catch (error) {
      // Network failure or thrown error: same rule, do not pretend the user is signed out.
      console.error("[auth] sign-out failed", error);
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: "You are still signed in. Please check your connection and try again.",
      });
      setIsSigningOut(false);
    }
  };

  return (
    <Button
      variant="ghost"
      type="submit"
      className="flex w-full"
      {...props}
      disabled={isSigningOut || props.disabled}
      onClick={handleSignOut}
    >
      {isSigningOut ? "Signing out..." : "Sign Out"}
    </Button>
  );
}
