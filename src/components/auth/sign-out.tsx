"use client";

import { authClient } from "@/lib/auth-client";
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
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/");
            },
          },
        });
      }}
    >
      Sign Out
    </Button>
  );
}
