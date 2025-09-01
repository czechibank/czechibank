"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { UserAvatar } from "../user/avatar";
import { SignOut } from "./sign-out";

export default function UserButton() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/signin");
    }
  }, [isPending, session, router]);

  if (isPending) return <p className="mt-8 text-center">Loading...</p>;
  if (!session?.user) return <Link href="/signin">Sign in</Link>;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className="rounded-full border-2 border-solid border-slate-500 hover:border-slate-200"
          data-testid="avatarCtxMenu"
        >
          <UserAvatar image={session.user.image ?? null} size={8} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="leading-none">{session.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/profile" className="w-full">
            <Button className="w-full">Profile</Button>
          </Link>
        </DropdownMenuItem>
        {session.user.role === "admin" ? (
          <DropdownMenuItem asChild>
            <Link href="/administration" className="w-full">
              <Button className="w-full">Administration</Button>
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem>
          <SignOut className="w-full" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
