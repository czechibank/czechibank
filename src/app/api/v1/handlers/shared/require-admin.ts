import { forbidden, type AppError } from "@/lib/errors";
import { errAsync, okAsync, type ResultAsync } from "neverthrow";

/**
 * Admin role gate. Passes the user through on success, otherwise returns a
 * 403 AppError. Replaces the duplicated `isAdmin` + `forbidden()` checks in
 * the drops and features routes.
 */
export function requireAdmin<U extends { role?: string | null }>(user: U): ResultAsync<U, AppError> {
  return user.role === "admin" ? okAsync(user) : errAsync(forbidden("Forbidden"));
}
