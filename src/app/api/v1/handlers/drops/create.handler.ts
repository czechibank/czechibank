import { authenticateRequest } from "@/app/api/v1/auth";
import { parseJsonBody } from "@/app/api/v1/handlers/shared/parse-json-body";
import { requireAdmin } from "@/app/api/v1/handlers/shared/require-admin";
import dropsService from "@/domain/drops-domain/drops-service";

export function handleCreateDropMission(request: Request) {
  return authenticateRequest(request)
    .andThen((user) => requireAdmin(user))
    .andThen(() => parseJsonBody(request))
    .andThen((body) => dropsService.createMissionResult(body));
}
