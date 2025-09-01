"use client";

import userService from "@/domain/user-domain/user-service";
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
        await userService.client.signOut({
          onSuccess: () => {
            router.refresh();
            router.push("/");
          },
          onError: (error) => {
            router.refresh();
            console.log(error);
          },
        });
      }}
    >
      Sign Out
    </Button>
  );
}
