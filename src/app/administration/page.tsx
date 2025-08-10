import AdministrationClientPage from "@/app/administration/page.client";
import NoAdminRights from "@/components/administration/no-admin-rights";
import featuresService from "@/domain/features-domain/features-service";
import { FeatureType } from "@/domain/features-domain/features.schema";
import userService from "@/domain/user-domain/user-service";
import { ErrorResponse, SuccessResponse } from "@/lib/response";
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

  const allFeatures: SuccessResponse<FeatureType[]> | ErrorResponse = await featuresService.server.getAllFeatures();
  if (!allFeatures || "error" in allFeatures) {
    console.error("Failed to fetch features:", allFeatures);
    return <div>Error loading features. Please try again later.</div>;
  }

  return <AdministrationClientPage user={user} features={allFeatures.data} />;
}
