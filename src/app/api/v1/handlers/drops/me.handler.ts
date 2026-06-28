import { authenticateRequest } from "@/app/api/v1/auth";
import dropsService from "@/domain/drops-domain/drops-service";

export function handleGetMyDropStatus(request: Request) {
  return authenticateRequest(request).andThen((user) => dropsService.getMyDropStatus(user.id));
}
