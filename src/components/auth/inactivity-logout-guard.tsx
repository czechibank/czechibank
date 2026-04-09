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
import { useInactivityLogout } from "@/lib/useInactivityLogout";
import { useSessionWithRefresh } from "@/lib/useSessionWithRefresh";

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
  const userId = session?.user != null && "id" in session.user ? (session.user as { id: string }).id : null;

  const { showDialog, countdownSec, handleStaySignedIn, commitStaySignedInRefs } = useInactivityLogout({
    userId,
    refetchSession,
  });

  if (!userId) return null;

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
