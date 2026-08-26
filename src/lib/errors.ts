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
 * Maps known better-auth error codes to our ApiErrorCode.
 * Better-auth uses its own string codes (e.g. "USER_ALREADY_EXISTS", "RATE_LIMITED")
 * that don't match our enum, so we translate them here.
 */
const betterAuthCodeMap: Record<string, ApiErrorCode> = {
  // Auth / user
  USER_ALREADY_EXISTS: ApiErrorCode.EMAIL_ALREADY_EXISTS,
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: ApiErrorCode.EMAIL_ALREADY_EXISTS,
  INVALID_EMAIL_OR_PASSWORD: ApiErrorCode.UNAUTHORIZED,
  INVALID_PASSWORD: ApiErrorCode.INVALID_PASSWORD,
  INVALID_TOKEN: ApiErrorCode.UNAUTHORIZED,
  SESSION_EXPIRED: ApiErrorCode.UNAUTHORIZED,
  SESSION_NOT_FRESH: ApiErrorCode.UNAUTHORIZED,
  EMAIL_NOT_VERIFIED: ApiErrorCode.FORBIDDEN,
  USER_NOT_FOUND: ApiErrorCode.NOT_FOUND,
  PROVIDER_NOT_FOUND: ApiErrorCode.NOT_FOUND,
  ACCOUNT_NOT_FOUND: ApiErrorCode.NOT_FOUND,
  // Rate limiting
  RATE_LIMITED: ApiErrorCode.RATE_LIMIT_EXCEEDED,
  USAGE_EXCEEDED: ApiErrorCode.RATE_LIMIT_EXCEEDED,
  TOO_MANY_ATTEMPTS: ApiErrorCode.RATE_LIMIT_EXCEEDED,
  TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: ApiErrorCode.RATE_LIMIT_EXCEEDED,
  // Validation
  VALIDATION_ERROR: ApiErrorCode.VALIDATION_ERROR,
  PASSWORD_TOO_SHORT: ApiErrorCode.BAD_REQUEST,
  PASSWORD_TOO_LONG: ApiErrorCode.BAD_REQUEST,
  INVALID_EMAIL: ApiErrorCode.BAD_REQUEST,
};

function resolveErrorCode(code: string): ApiErrorCode {
  if (isValidApiErrorCode(code)) return code;
  return betterAuthCodeMap[code] ?? ApiErrorCode.INTERNAL_ERROR;
}

/**
 * Converts an unknown caught error into an AppError.
 * Handles: better-auth APIError (body.code), plain { code, message } objects,
 * Error instances, and anything else.
 */
export function fromUnknown(error: unknown, fallbackMessage = "An unexpected error occurred"): AppError {
  if (typeof error === "object" && error !== null) {
    const e = error as Record<string, unknown>;

    // better-auth APIError: has body.code and body.message (extends Error)
    if (typeof e.body === "object" && e.body !== null) {
      const body = e.body as Record<string, unknown>;
      if (typeof body.code === "string" && typeof body.message === "string") {
        return { code: resolveErrorCode(body.code), message: body.message };
      }
    }

    // Plain { code, message } objects (e.g. from ba-helpers)
    if (typeof e.code === "string" && typeof e.message === "string") {
      return { code: resolveErrorCode(e.code), message: e.message };
    }
  }
  if (error instanceof Error) {
    return internalError(error.message);
  }
  return internalError(fallbackMessage);
}
