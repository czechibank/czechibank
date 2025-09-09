import { ZodSchema } from "zod";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ErrorDetail = {
  code: string;
  field?: string;
  message: string;
};

export type ResponseMeta = {
  timestamp: string;
  requestId?: string;
  pagination?: PaginationMeta;
};

export type SuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
  meta?: ResponseMeta;
};

export type ErrorResponse = {
  success: false;
  message: string;
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
  };
  meta?: ResponseMeta;
};

export type Response<T> = SuccessResponse<T> | ErrorResponse;

export function successResponse<T>(message: string, data: T, meta?: Partial<ResponseMeta>): SuccessResponse<T> {
  return {
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

export function errorResponse(
  message: string,
  code: string,
  details?: ErrorDetail[],
  meta?: Partial<ResponseMeta>,
): ErrorResponse {
  return {
    success: false,
    message,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

export function createPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function validateEventHandler<TInput, TOutput>(
  schema: ZodSchema<TOutput, any, TInput>,
  event: TInput,
): Promise<TOutput | ErrorResponse> {
  const result = await schema.safeParseAsync(event);
  if (!result.success) {
    return errorResponse("Validation error", "VALIDATION_ERROR", result.error.errors);
  }
  return result.data;
}

// Error codes enum for consistent error reporting
export enum ApiErrorCode {
  OPERATION_FAILED = "OPERATION_FAILED",
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",

  // FE errors
  INVALID_PASSWORD = "INVALID_PASSWORD",
  EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS",
}
