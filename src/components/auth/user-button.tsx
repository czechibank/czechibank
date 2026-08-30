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
import posthog from "posthog-js";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { UserAvatar } from "../user/avatar";
import { SignOut } from "./sign-out";

/** Header avatar/menu or Sign in link. Uses last known session during refetch to avoid layout jump; shows Loading only on first load before any session. */
export default function UserButton() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: session, isPending, error } = useSessionWithRefresh();
  // Last session we actually received, so the header does not flicker to "Sign in" while a
  // refetch is in flight. Held in state rather than a ref because render must stay pure:
  // React can discard a render, and a ref written during one could leak a session the UI
  // never committed.
  const [lastSession, setLastSession] = useState(session);

  useEffect(() => {
    // Store only a result we actually received. A failed check (rate limited, offline)
    // reports null, and storing that would make the header claim the user is signed out
    // while their session is still valid (CZBANK-82). A real sign-out also reports null,
    // but carries no error, so it is stored and the header updates.
    if (!error && session !== undefined) setLastSession(session);
  }, [error, session]);

  useEffect(() => {
    if (session?.user?.id) {
      posthog.identify(session.user.id, {
        email: session.user.email,
        name: session.user.name,
      });
    }
  }, [session?.user?.id]);
  const displaySession = session ?? lastSession;

  if (!mounted) return <Link href="/signin">Sign in</Link>;
  if (isPending && displaySession === undefined) return <p className="mt-8 text-center">Loading...</p>;
  if (!displaySession?.user) return <Link href="/signin">Sign in</Link>;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className="rounded-full border-2 border-solid border-slate-500 hover:border-slate-200"
          data-testid="avatarCtxMenu"
        >
          <UserAvatar image={displaySession.user.image ?? null} size={8} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="leading-none">{displaySession.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{displaySession.user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/profile" className="w-full">
            <Button className="w-full">Profile</Button>
          </Link>
        </DropdownMenuItem>
        {displaySession.user.role === "admin" ? (
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
