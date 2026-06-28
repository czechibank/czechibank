import { authenticateRequest } from "@/app/api/v1/auth";
import featuresService from "@/domain/features-domain/features-service";

export function handleGetAllFeatures(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  return authenticateRequest(request).andThen(() => featuresService.server.getAllFeaturesResult({ page, limit }));
}
