import dropsService, {
  type DropCompletionNotice,
  type EvaluateDropsContext,
} from "@/domain/drops-domain/drops-service";
import { type AppError } from "@/lib/errors";
import { ResultAsync } from "neverthrow";

/**
 * Neverthrow wrapper around `dropsService.evaluateDropsAfterSuccess`, returning
 * the completed-mission notices directly.
 *
 * IMPORTANT: this runs INSIDE the handler pipeline (before the response is
 * built), so the completed missions are included in the API/action response.
 * The frontend relies on this `drops` array to show the celebration GIF, so
 * mission evaluation must NOT be moved into a post-response hook.
 *
 * `evaluateDropsAfterSuccess` already swallows its own errors and resolves to
 * an empty list, so this is wrapped with `fromSafePromise`.
 */
export function evaluateDropsAfterSuccessResult(
  ctx: EvaluateDropsContext,
): ResultAsync<DropCompletionNotice[], AppError> {
  return ResultAsync.fromSafePromise(dropsService.evaluateDropsAfterSuccess(ctx)).map(
    (result) => result.completedMissions,
  );
}
