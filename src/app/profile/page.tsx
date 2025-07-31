import apikeyService from "@/domain/apikey/apikey-service";
import userService from "@/domain/user-domain/user-service";
import { Apikey } from "@prisma/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ProfileClientPage from "./page.client";

export default async function ProfilePage() {
  const session = await userService.server.getSession(await headers());

  if (!session) {
    redirect("/signin");
  }

  const apiKeys = await apikeyService.server.listUserApiKey(await headers());

  return <ProfileClientPage user={session.user} apiKeys={apiKeys as Omit<Apikey, "key">[]} />;
}
