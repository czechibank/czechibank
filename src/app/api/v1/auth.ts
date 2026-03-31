import userService from "@/domain/user-domain/user-service";
import { fromUnknown, unauthorized, type AppError } from "@/lib/errors";
import { ApiErrorCode } from "@/lib/response";
import { ResultAsync, errAsync, okAsync } from "neverthrow";
import { auth } from "../../../../auth";

/**
 * Maps a getSession error to the right AppError.
 * Rate limit errors are preserved (→ 429); everything else is treated
 * as an auth failure (→ 401) since getSession only fails for auth reasons.
 */
function mapSessionError(error: unknown): AppError {
  const parsed = fromUnknown(error, "Unauthorized");
  if (parsed.code === ApiErrorCode.RATE_LIMIT_EXCEEDED) return parsed;
  return unauthorized();
}

export function authenticateRequest(request: Request): ResultAsync<typeof auth.$Infer.Session.user, AppError> {
  const apiKey = request.headers.get("X-API-Key");

  if (!apiKey) {
    return errAsync(unauthorized());
  }

  return ResultAsync.fromPromise(
    userService.server.getSession(new Headers({ "x-api-key": apiKey })),
    mapSessionError,
  ).andThen((session) => (session ? okAsync(session.user) : errAsync(unauthorized())));
}
