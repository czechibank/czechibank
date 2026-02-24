"use client";

import userServiceClient from "@/domain/user-domain/user-service-client";
import { broadcastSessionChanged } from "@/lib/useSessionWithRefresh";
import { Button } from "../ui/button";

/** Sign-out button. Notifies other tabs via broadcastSessionChanged, then redirects to /signin. */
export function SignOut(props: React.ComponentPropsWithRef<typeof Button>) {
  return (
    <Button
      variant="ghost"
      type="submit"
      className="flex w-full"
      {...props}
      onClick={async () => {
        await userServiceClient.signOut({
          onSuccess: () => {
            broadcastSessionChanged();
            window.location.replace("/signin");
          },
          onError: (error) => {
            console.log(error);
            // Even on error, redirect to signin to ensure clean state
            window.location.replace("/signin");
          },
        });
      }}
    >
      Sign Out
    </Button>
  );
}
