"use client";

import userServiceClient from "@/domain/user-domain/user-service-client";
import { Button } from "../ui/button";

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
            // Use window.location.replace() to prevent back-button navigation to protected pages
            // after logout. This is a standard best practice for logout flows.
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
