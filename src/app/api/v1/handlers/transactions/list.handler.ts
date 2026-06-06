import { authenticateRequest } from "@/app/api/v1/auth";
import transactionService from "@/domain/transaction-domain/transaction-service";
import { validationError, type AppError } from "@/lib/errors";
import { ApiErrorCode } from "@/lib/response";
import { errAsync, okAsync, type ResultAsync } from "neverthrow";

const ALLOWED_SORT_BY = ["createdAt", "amount"] as const;
const ALLOWED_SORT_ORDER = ["asc", "desc"] as const;

type ListQuery = {
  pageNum: number;
  limitNum: number;
  sortBy: (typeof ALLOWED_SORT_BY)[number];
  sortOrder: (typeof ALLOWED_SORT_ORDER)[number];
};

/**
 * Validates the list query params, preserving the exact messages and the
 * pre-auth ordering of the previous inline route.
 */
function parseListQuery(searchParams: URLSearchParams): ResultAsync<ListQuery, AppError> {
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";
  const sortByParam = searchParams.get("sortBy") || "createdAt";
  const sortOrderParam = searchParams.get("sortOrder") || "desc";

  const pageNum = parseInt(page, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    return errAsync(
      validationError("Invalid pagination parameters", [
        { code: ApiErrorCode.VALIDATION_ERROR, message: "Page must be a positive integer" },
      ]),
    );
  }

  const limitNum = parseInt(limit, 10);
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return errAsync(
      validationError("Invalid pagination parameters", [
        { code: ApiErrorCode.VALIDATION_ERROR, message: "Limit must be a positive integer between 1 and 100" },
      ]),
    );
  }

  if (!ALLOWED_SORT_BY.includes(sortByParam as (typeof ALLOWED_SORT_BY)[number])) {
    return errAsync(
      validationError(`Invalid sortBy parameter. Allowed values: ${ALLOWED_SORT_BY.join(", ")}`, [
        { code: ApiErrorCode.VALIDATION_ERROR, message: `sortBy must be one of: ${ALLOWED_SORT_BY.join(", ")}` },
      ]),
    );
  }

  if (!ALLOWED_SORT_ORDER.includes(sortOrderParam as (typeof ALLOWED_SORT_ORDER)[number])) {
    return errAsync(
      validationError(`Invalid sortOrder parameter. Allowed values: ${ALLOWED_SORT_ORDER.join(", ")}`, [
        { code: ApiErrorCode.VALIDATION_ERROR, message: `sortOrder must be one of: ${ALLOWED_SORT_ORDER.join(", ")}` },
      ]),
    );
  }

  return okAsync({
    pageNum,
    limitNum,
    sortBy: sortByParam as (typeof ALLOWED_SORT_BY)[number],
    sortOrder: sortOrderParam as (typeof ALLOWED_SORT_ORDER)[number],
  });
}

export function handleListTransactions(request: Request) {
  const searchParams = new URL(request.url).searchParams;

  return parseListQuery(searchParams).andThen(({ pageNum, limitNum, sortBy, sortOrder }) =>
    authenticateRequest(request).andThen((user) =>
      transactionService.getAllTransactionsByUserIdForAPIResult(user.id, sortBy, sortOrder, pageNum, limitNum),
    ),
  );
}
