import { authenticateRequest } from "@/app/api/v1/auth";
import apikeyService from "@/domain/apikey/apikey-service";
import { fromUnknown } from "@/lib/errors";
import { ResultAsync } from "neverthrow";
import { headers } from "next/headers";

export function handleListApiKeys(request: Request) {
  return authenticateRequest(request).andThen(() =>
    ResultAsync.fromPromise(
      headers().then((h) => apikeyService.server.listUserApiKey(h)),
      (e) => fromUnknown(e, "Failed to list API keys"),
    ),
  );
}
