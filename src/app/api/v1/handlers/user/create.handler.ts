import { parseJsonBody } from "@/app/api/v1/handlers/shared/parse-json-body";
import apikeyService from "@/domain/apikey/apikey-service";
import { UserSchema } from "@/domain/user-domain/user-schema";
import userService from "@/domain/user-domain/user-service";
import { fromUnknown, type AppError } from "@/lib/errors";
import { validateWithResult } from "@/lib/result-helpers";
import { errAsync, ResultAsync } from "neverthrow";

export function handleCreateUser(request: Request) {
  return parseJsonBody(request)
    .andThen((body) => validateWithResult(UserSchema, body))
    .andThen((parsedUser) =>
      ResultAsync.fromPromise(userService.server.createUser(parsedUser, "user"), (e) =>
        fromUnknown(e, "Failed to create user"),
      ),
    )
    .andThen((createdUser) =>
      ResultAsync.fromPromise(apikeyService.server.createApiKey(createdUser.user.id), (e) =>
        fromUnknown(e, "Failed to create API key"),
      )
        .map((apiKey) => ({ ...createdUser.user, apiKey: apiKey.key }))
        .orElse((keyError) =>
          // Without an API key the account is unusable. better-auth offers no
          // transaction spanning user + key creation, so roll the user (and the
          // signup-hook bank account) back instead of leaving partial state.
          ResultAsync.fromPromise(
            userService.server.deleteUserWithBankAccounts(createdUser.user.id).catch((cleanupError) => {
              console.error("[user/create] rollback after API key failure also failed", cleanupError);
            }),
            () => keyError,
          ).andThen(() => errAsync<never, AppError>(keyError)),
        ),
    );
}
