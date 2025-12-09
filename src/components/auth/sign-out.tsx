"use client";

import userServiceClient from "@/domain/user-domain/user-service-client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export function SignOut(props: React.ComponentPropsWithRef<typeof Button>) {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      type="submit"
      className="flex w-full"
      {...props}
      onClick={async () => {
        await userServiceClient.signOut({
          onSuccess: () => {
            window.location.replace("/");
          },
          onError: (error) => {
            window.location.replace("/");
            console.log(error);
          },
        });
      }}
    >
      Sign Out
    </Button>
  );
}
