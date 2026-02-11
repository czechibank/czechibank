"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSessionWithRefresh } from "@/lib/useSessionWithRefresh";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { UserAvatar } from "../user/avatar";
import { SignOut } from "./sign-out";

/** Header avatar/menu or Sign in link. Uses last known session during refetch to avoid layout jump; shows Loading only on first load before any session. */
export default function UserButton() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: session, isPending } = useSessionWithRefresh();
  const lastSessionRef = useRef(session);
  if (session !== undefined) lastSessionRef.current = session;
  const displaySession = session ?? lastSessionRef.current;

  if (!mounted) return <Link href="/signin">Sign in</Link>;
  if (isPending && displaySession === undefined) return <p className="mt-8 text-center">Loading...</p>;
  if (!displaySession?.user) return <Link href="/signin">Sign in</Link>;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className="rounded-full border-3 border-black transition-shadow hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          data-testid="avatarCtxMenu"
        >
          <UserAvatar image={displaySession.user.image ?? null} size={8} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="font-bold leading-none">{displaySession.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{displaySession.user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/profile" className="w-full">
            <Button className="w-full border-2 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              Profile
            </Button>
          </Link>
        </DropdownMenuItem>
        {displaySession.user.role === "admin" ? (
          <DropdownMenuItem asChild>
            <Link href="/administration" className="w-full">
              <Button className="w-full border-2 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                Administration
              </Button>
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
