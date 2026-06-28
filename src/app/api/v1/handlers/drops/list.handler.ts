import { authenticateRequest } from "@/app/api/v1/auth";
import { isAdmin } from "@/app/api/v1/handlers/shared/is-admin";
import dropsService from "@/domain/drops-domain/drops-service";

/**
 * Lists drop missions. Pagination is clamped (not validated) to preserve the
 * previous route behavior. Page/limit are carried through so the route can
 * build pagination meta.
 */
export function handleListDropMissions(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

  return authenticateRequest(request)
    .andThen((user) => {
      const filters = isAdmin(user) ? { page, limit } : { page, limit, visibility: "PUBLISHED" as const };
      return dropsService.getAllMissionsResult(filters);
    })
    .map(({ items, total }) => ({ items, total, page, limit }));
}
