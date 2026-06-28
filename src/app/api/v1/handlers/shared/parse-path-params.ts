import { type AppError } from "@/lib/errors";
import { validateWithResult } from "@/lib/result-helpers";
import { ResultAsync } from "neverthrow";
import { type ZodSchema } from "zod";

/**
 * Resolves the Next.js dynamic route params promise and validates it against a
 * Zod schema. Replaces the inline `ResultAsync.fromSafePromise(context.params)`
 * + `validateWithResult(...)` pattern in `[id]` / `[slug]` routes.
 */
export function parsePathParams<TInput, TOutput>(
  paramsPromise: Promise<TInput>,
  schema: ZodSchema<TOutput, any, TInput>,
): ResultAsync<TOutput, AppError> {
  return ResultAsync.fromSafePromise(paramsPromise).andThen((params) => validateWithResult(schema, params));
}
