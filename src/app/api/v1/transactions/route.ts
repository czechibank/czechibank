import { authenticateRequest } from "@/app/api/v1/auth";
import transactionService from "@/domain/transaction-domain/transaction-service";
import { validationError } from "@/lib/errors";
import { ApiErrorCode } from "@/lib/response";
import { toApiResponse, toPaginatedApiResponse } from "@/lib/result-helpers";
import { errAsync } from "neverthrow";
import { NextRequest } from "next/server";
export { DELETE, HEAD, OPTIONS, PATCH, PUT } from "../routes";

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get user's transactions
 *     description: Retrieves a paginated list of transactions for the authenticated user
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, amount]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved transactions
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         transactions:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - API key is missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Validation error (e.g., invalid page, limit, sortBy, or sortOrder)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const ALLOWED_SORT_BY = ["createdAt", "amount"] as const;
const ALLOWED_SORT_ORDER = ["asc", "desc"] as const;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";
  const sortByParam = searchParams.get("sortBy") || "createdAt";
  const sortOrderParam = searchParams.get("sortOrder") || "desc";

  // Validate and parse page
  const pageNum = parseInt(page, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    return toApiResponse(
      errAsync(
        validationError("Invalid pagination parameters", [
          {
            code: ApiErrorCode.VALIDATION_ERROR,
            message: "Page must be a positive integer",
          },
        ]),
      ),
      "Validation failed",
    );
  }

  // Validate and parse limit
  const limitNum = parseInt(limit, 10);
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return toApiResponse(
      errAsync(
        validationError("Invalid pagination parameters", [
          {
            code: ApiErrorCode.VALIDATION_ERROR,
            message: "Limit must be a positive integer between 1 and 100",
          },
        ]),
      ),
      "Validation failed",
    );
  }

  // Validate sortBy
  if (!ALLOWED_SORT_BY.includes(sortByParam as any)) {
    return toApiResponse(
      errAsync(
        validationError(`Invalid sortBy parameter. Allowed values: ${ALLOWED_SORT_BY.join(", ")}`, [
          {
            code: ApiErrorCode.VALIDATION_ERROR,
            message: `sortBy must be one of: ${ALLOWED_SORT_BY.join(", ")}`,
          },
        ]),
      ),
      "Validation failed",
    );
  }

  // Validate sortOrder
  if (!ALLOWED_SORT_ORDER.includes(sortOrderParam as any)) {
    return toApiResponse(
      errAsync(
        validationError(`Invalid sortOrder parameter. Allowed values: ${ALLOWED_SORT_ORDER.join(", ")}`, [
          {
            code: ApiErrorCode.VALIDATION_ERROR,
            message: `sortOrder must be one of: ${ALLOWED_SORT_ORDER.join(", ")}`,
          },
        ]),
      ),
      "Validation failed",
    );
  }

  const sortBy = sortByParam as (typeof ALLOWED_SORT_BY)[number];
  const sortOrder = sortOrderParam as (typeof ALLOWED_SORT_ORDER)[number];

  const result = authenticateRequest(request).andThen((user) =>
    transactionService.getAllTransactionsByUserIdForAPIResult(user.id, sortBy, sortOrder, page, limit),
  );

  return toPaginatedApiResponse(result, "Transactions retrieved successfully", (data) => ({
    body: { transactions: data.transactions },
    pagination: data.pagination,
  }));
}
