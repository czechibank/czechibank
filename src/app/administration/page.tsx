import AdministrationClientPage from "@/app/administration/page.client";
import NoAdminRights from "@/components/administration/no-admin-rights";
import userService from "@/domain/user-domain/user-service";
import { User } from "@prisma/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdministrationPage() {
  const session = await userService.server.getSession(await headers());

  if (!session) {
    redirect("/signin");
  }

  const user: User = session.user as User;
  if (user.role !== "admin") {
    return <NoAdminRights />;
  }

  return <AdministrationClientPage user={user} />;
}
