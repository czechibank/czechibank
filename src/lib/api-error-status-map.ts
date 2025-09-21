import { ApiErrorCode } from "@/lib/response";

export const apiErrorStatusMap: Record<ApiErrorCode | string, number> = {
  [ApiErrorCode.OPERATION_FAILED]: 400,
  [ApiErrorCode.BAD_REQUEST]: 400,
  [ApiErrorCode.INVALID_PASSWORD]: 400,
  [ApiErrorCode.UNAUTHORIZED]: 401,
  [ApiErrorCode.FORBIDDEN]: 403,
  [ApiErrorCode.NOT_FOUND]: 404,
  [ApiErrorCode.EMAIL_ALREADY_EXISTS]: 409,
  [ApiErrorCode.NON_ZERO_BALANCE]: 409,
  [ApiErrorCode.CONFLICT]: 409,
  [ApiErrorCode.INSUFFICIENT_BALANCE]: 409,
  [ApiErrorCode.VALIDATION_ERROR]: 422,
  [ApiErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ApiErrorCode.INTERNAL_ERROR]: 500,
  [ApiErrorCode.BAD_GATEWAY]: 502,
};

export function mapErrorCodeToStatus(code: ApiErrorCode | string): number {
  if (typeof code === "string") {
    code = ApiErrorCode[code as keyof typeof ApiErrorCode] ?? ApiErrorCode.INTERNAL_ERROR;
  }
  return apiErrorStatusMap[code] ?? 500;
}
