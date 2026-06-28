import { authenticateRequest } from "@/app/api/v1/auth";
import { isAdmin } from "@/app/api/v1/handlers/shared/is-admin";
import { parseJsonBody } from "@/app/api/v1/handlers/shared/parse-json-body";
import { requireAdmin } from "@/app/api/v1/handlers/shared/require-admin";
import dropsService from "@/domain/drops-domain/drops-service";
import { type ApiRouteContext } from "@/lib/api/with-api-handler";
import { notFound } from "@/lib/errors";
import { errAsync, okAsync, ResultAsync } from "neverthrow";

type SlugParams = { slug: string };

export function handleGetDropMissionBySlug(request: Request, context: ApiRouteContext<SlugParams>) {
  return authenticateRequest(request).andThen((user) =>
    ResultAsync.fromSafePromise(context.params).andThen(({ slug }) =>
      dropsService.getMissionBySlugResult(slug).andThen((mission) =>
        // Hide SECRET missions from non-admins by mapping to a 404 (same as not-found).
        mission.visibility === "SECRET" && !isAdmin(user)
          ? errAsync(notFound("Mission not found"))
          : okAsync({ mission }),
      ),
    ),
  );
}

export function handleUpdateDropMissionBySlug(request: Request, context: ApiRouteContext<SlugParams>) {
  return authenticateRequest(request)
    .andThen((user) => requireAdmin(user))
    .andThen(() => ResultAsync.fromSafePromise(context.params))
    .andThen(({ slug }) =>
      parseJsonBody(request).andThen((body) => dropsService.updateMissionBySlugResult(slug, body)),
    );
}

export function handleDeleteDropMissionBySlug(request: Request, context: ApiRouteContext<SlugParams>) {
  return authenticateRequest(request)
    .andThen((user) => requireAdmin(user))
    .andThen(() => ResultAsync.fromSafePromise(context.params))
    .andThen(({ slug }) => dropsService.deleteMissionBySlugResult(slug));
}
