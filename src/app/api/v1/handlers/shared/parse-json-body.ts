import { badRequest, type AppError } from "@/lib/errors";
import { ResultAsync } from "neverthrow";

/**
 * Parses a request JSON body into a Result, mapping parse failures to a
 * 400 AppError. Replaces the inline `ResultAsync.fromPromise(request.json(), ...)`
 * repeated across POST/PATCH routes.
 */
export function parseJsonBody(request: Request): ResultAsync<unknown, AppError> {
  return ResultAsync.fromPromise(request.json(), () => badRequest("Invalid JSON body"));
}
