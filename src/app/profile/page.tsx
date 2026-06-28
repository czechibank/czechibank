import apikeyServiceServer from "@/domain/apikey/apikey-service-server";
import dropsService from "@/domain/drops-domain/drops-service";
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

  const apiKeys = await apikeyServiceServer.listUserApiKey(await headers());
  const gamification = await dropsService.getGamificationSummary(session.user.id);

  return (
    <ProfileClientPage user={session.user} apiKeys={apiKeys as Omit<Apikey, "key">[]} gamification={gamification} />
  );
}
