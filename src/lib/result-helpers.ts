import { mapErrorCodeToStatus } from "@/lib/api-error-status-map";
import { type AppError } from "@/lib/errors";
import {
  type ErrorResponse,
  type ResponseMeta,
  type SuccessResponse,
  ApiErrorCode,
  errorResponse,
  successResponse,
} from "@/lib/response";
import { type ResultAsync, ResultAsync as RA } from "neverthrow";
import { type ZodError, type ZodSchema } from "zod";

/**
 * Converts a ResultAsync<T, AppError> into a Next.js Response for API routes.
 * Eliminates try/catch and "error" in result checks.
 *
 * Usage:
 *   return toApiResponse(someService.doThing(args), "Thing done", 200);
 */
export function toApiResponse<T>(
  result: ResultAsync<T, AppError>,
  successMessage: string,
  successStatus = 200,
  meta?: Partial<ResponseMeta>,
): Promise<Response> {
  return result.match(
    (data) =>
      Response.json(successResponse(successMessage, data, { timestamp: new Date().toISOString(), ...meta }), {
        status: successStatus,
      }),
    (error) =>
      Response.json(errorResponse(error.message, error.code, error.details), {
        status: mapErrorCodeToStatus(error.code),
      }),
  );
}

/**
 * Converts a ResultAsync<T, AppError> back into the existing
 * SuccessResponse<T> | ErrorResponse union format.
 *
 * Bridge for web components that call services through Next.js server actions.
 * Components keep using response.success / response.data unchanged.
 */
export async function toServiceResponse<T>(
  result: ResultAsync<T, AppError>,
  successMessage: string,
): Promise<SuccessResponse<T> | ErrorResponse> {
  return result.match(
    (data) => successResponse(successMessage, data),
    (error) => errorResponse(error.message, error.code, error.details),
  );
}

/**
 * Validates data against a Zod schema and returns a Result.
 * Replaces validateEventHandler() in the Result world.
 */
export function validateWithResult<TInput, TOutput>(
  schema: ZodSchema<TOutput, any, TInput>,
  data: TInput,
): ResultAsync<TOutput, AppError> {
  return RA.fromPromise(schema.parseAsync(data), (error) => {
    const zodError = error as ZodError;
    return {
      code: ApiErrorCode.VALIDATION_ERROR,
      message: "Validation error",
      details: zodError.errors?.map((e) => ({
        code: ApiErrorCode.VALIDATION_ERROR,
        field: e.path.join("."),
        message: e.message,
      })),
    };
  });
}
