import userService from "@/domain/user-domain/user-service";
import { unauthorized, type AppError } from "@/lib/errors";
import { ResultAsync, errAsync, okAsync } from "neverthrow";
import { auth } from "../../../../auth";

export function authenticateRequest(request: Request): ResultAsync<typeof auth.$Infer.Session.user, AppError> {
  const apiKey = request.headers.get("X-API-Key");

  if (!apiKey) {
    return errAsync(unauthorized());
  }

  return ResultAsync.fromPromise(userService.server.getSession(new Headers({ "x-api-key": apiKey })), () =>
    unauthorized(),
  ).andThen((session) => (session ? okAsync(session.user) : errAsync(unauthorized())));
}
