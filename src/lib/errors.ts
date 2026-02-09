import { ApiErrorCode, type ErrorDetail } from "@/lib/response";

/**
 * Structured application error carried inside Result/ResultAsync Err channel.
 * Plain object (not a class) — serializable and composable.
 */
export type AppError = {
  code: ApiErrorCode;
  message: string;
  details?: ErrorDetail[];
};

// --- Convenience constructors ---

export function notFound(message: string): AppError {
  return { code: ApiErrorCode.NOT_FOUND, message };
}

export function unauthorized(message = "Unauthorized"): AppError {
  return { code: ApiErrorCode.UNAUTHORIZED, message };
}

export function forbidden(message: string): AppError {
  return { code: ApiErrorCode.FORBIDDEN, message };
}

export function badRequest(message: string): AppError {
  return { code: ApiErrorCode.BAD_REQUEST, message };
}

export function validationError(message: string, details?: ErrorDetail[]): AppError {
  return { code: ApiErrorCode.VALIDATION_ERROR, message, details };
}

export function insufficientBalance(message = "Insufficient balance"): AppError {
  return { code: ApiErrorCode.INSUFFICIENT_BALANCE, message };
}

export function nonZeroBalance(message = "Cannot delete account with non-zero balance"): AppError {
  return { code: ApiErrorCode.NON_ZERO_BALANCE, message };
}

export function internalError(message = "Internal server error"): AppError {
  return { code: ApiErrorCode.INTERNAL_ERROR, message };
}

export function operationFailed(message: string): AppError {
  return { code: ApiErrorCode.OPERATION_FAILED, message };
}

export function conflict(message: string): AppError {
  return { code: ApiErrorCode.CONFLICT, message };
}

function isValidApiErrorCode(code: string): code is ApiErrorCode {
  return (Object.values(ApiErrorCode) as string[]).includes(code);
}

/**
 * Converts an unknown caught error into an AppError.
 * Handles: Error instances, thrown { code, message } objects (from ba-helpers),
 * and anything else.
 */
export function fromUnknown(error: unknown, fallbackMessage = "An unexpected error occurred"): AppError {
  if (error instanceof Error) {
    return internalError(error.message);
  }
  if (typeof error === "object" && error !== null && "code" in error && "message" in error) {
    const e = error as { code: string; message: string };
    return { code: isValidApiErrorCode(e.code) ? e.code : ApiErrorCode.INTERNAL_ERROR, message: e.message };
  }
  return internalError(fallbackMessage);
}
