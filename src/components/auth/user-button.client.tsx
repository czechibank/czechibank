"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Session, User } from "better-auth";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { UserAvatar } from "../user/avatar";
import { SignIn } from "./auth-components";
import { SignOut } from "./sign-out";

type UnionSession = { session: Session; user: User };

export default function UserButtonClient({ session }: { session: UnionSession }) {
  if (!session) {
    return (
      <div className="rounded-full border-2 border-solid border-slate-500 hover:border-slate-200">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <SignIn />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="rounded-full border-2 border-solid border-slate-500 hover:border-slate-200">
          <UserAvatar image={session.user.image ?? null} size={8} />
          {/* <UserIcon className="h-6 w-6" /> */}
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
