import { Apikey, User } from "@prisma/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import ProfileClientPage from "./page.client";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  const apiKeys = (await auth.api.listApiKeys({
    headers: await headers(),
  })) as Apikey[];

  const user = session.user;

  return <ProfileClientPage user={user as User} apiKeys={apiKeys} />;
}
