import { authenticateRequest } from "@/app/api/v1/auth";
import transactionService from "@/domain/transaction-domain/transaction-service";
import { mapErrorCodeToStatus } from "@/lib/api-error-status-map";
import { validationError } from "@/lib/errors";
import { ApiErrorCode, errorResponse, successResponse } from "@/lib/response";
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
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  const result = authenticateRequest(request).andThen((user) => {
    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
      return errAsync(
        validationError("Invalid pagination parameters", [
          { code: ApiErrorCode.VALIDATION_ERROR, message: "Page and limit must be positive numbers" },
        ]),
      );
    }
    return transactionService.getAllTransactionsByUserIdForAPIResult(user.id, sortBy, sortOrder, page, limit);
  });

  return result.match(
    (data) =>
      Response.json(
        successResponse(
          "Transactions retrieved successfully",
          { transactions: data.transactions },
          {
            pagination: data.pagination,
          },
        ),
      ),
    (error) =>
      Response.json(errorResponse(error.message, error.code, error.details), {
        status: mapErrorCodeToStatus(error.code),
      }),
  );
}
