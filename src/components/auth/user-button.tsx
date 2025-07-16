import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "../../../auth";
import { Button } from "../ui/button";
import { SignIn } from "./auth-components";
import { SignOut } from "./sign-out";

export default async function UserButton() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return <SignIn />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="rounded-full border-2 border-solid border-slate-500 hover:border-slate-200">
          {/* <UserAvatar size={8} userAvatarConfig={session.user.avatarConfig} /> */}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="leading-none">{session.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuItem>
          <Link href="/profile" className="w-full">
            <Button className="w-full">Profile</Button>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <SignOut className="w-full" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
