import { authenticateRequest } from "@/app/api/v1/auth";
import { parseJsonBody } from "@/app/api/v1/handlers/shared/parse-json-body";
import { requireAdmin } from "@/app/api/v1/handlers/shared/require-admin";
import featuresService from "@/domain/features-domain/features-service";
import { AllFeaturesSchema } from "@/domain/features-domain/features.schema";
import { validateWithResult } from "@/lib/result-helpers";

export function handleUpdateFeatures(request: Request) {
  return authenticateRequest(request)
    .andThen((user) => requireAdmin(user))
    .andThen(() => parseJsonBody(request))
    .andThen((body) => validateWithResult(AllFeaturesSchema, body))
    .andThen(({ features }) => featuresService.server.updateFeaturesResult(features))
    .map((features) => ({ features }));
}
