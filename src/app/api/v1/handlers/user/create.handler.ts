import { parseJsonBody } from "@/app/api/v1/handlers/shared/parse-json-body";
import apikeyService from "@/domain/apikey/apikey-service";
import { UserSchema } from "@/domain/user-domain/user-schema";
import userService from "@/domain/user-domain/user-service";
import { fromUnknown } from "@/lib/errors";
import { validateWithResult } from "@/lib/result-helpers";
import { ResultAsync } from "neverthrow";

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
      ).map((apiKey) => ({ ...createdUser.user, apiKey: apiKey.key })),
    );
}
