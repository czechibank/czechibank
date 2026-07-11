import { authenticateRequest } from "@/app/api/v1/auth";
import { isAdmin } from "@/app/api/v1/handlers/shared/is-admin";
import { parsePagination } from "@/app/api/v1/handlers/shared/parse-pagination";
import dropsService from "@/domain/drops-domain/drops-service";

/**
 * Lists drop missions. Pagination is clamped (not validated) to preserve the
 * previous route behavior. Page/limit are carried through so the route can
 * build pagination meta.
 */
export function handleListDropMissions(request: Request) {
  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams);

  return authenticateRequest(request)
    .andThen((user) => {
      const filters = isAdmin(user) ? { page, limit } : { page, limit, visibility: "PUBLISHED" as const };
      return dropsService.getAllMissionsResult(filters);
    })
    .map(({ items, total }) => ({ items, total, page, limit }));
}
