"use server";
import { SignIn } from "./auth-components";

import { headers } from "next/headers";
import { auth } from "../../../auth";
import UserButtonClient from "./user-button.client";

// TODO: I tried to resolve problem with client component - better-auth has some problem with useSession
// https://github.com/better-auth/better-auth/issues/1006
export default async function UserButton() {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!session) {
    return <SignIn />;
  }

  return <UserButtonClient session={session} />;
}
