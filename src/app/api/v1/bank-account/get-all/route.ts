import { authenticateRequest } from "@/app/api/v1/auth";
import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import { mapErrorCodeToStatus } from "@/lib/api-error-status-map";
import { validationError } from "@/lib/errors";
import { ApiErrorCode, createPaginationMeta, errorResponse, successResponse } from "@/lib/response";
import { errAsync } from "neverthrow";
import { DELETE, HEAD, OPTIONS, PATCH, POST, PUT } from "../../routes";
/**
 * @swagger
 * /bank-account/get-all:
 *   get:
 *     summary: Get all bank accounts (all users)
 *     description: Retrieve a paginated list of bank accounts
 *     tags: [Bank Accounts]
 *     security:
 *       - ApiKeyAuth: []
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
 *     responses:
 *       200:
 *         description: Bank accounts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Bank accounts retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     bankAccounts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/BankAccount'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       description: Response timestamp
 *                     requestId:
 *                       type: string
 *                       description: Unique request identifier for tracing
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           description: Current page number
 *                         limit:
 *                           type: integer
 *                           description: Items per page
 *                         total:
 *                           type: integer
 *                           description: Total number of items
 *                         totalPages:
 *                           type: integer
 *                           description: Total number of pages
 *       400:
 *         description: Invalid pagination parameters
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
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const result = authenticateRequest(request).andThen(() => {
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return errAsync(
        validationError("Invalid pagination parameters", [
          { code: ApiErrorCode.VALIDATION_ERROR, message: "Page and limit must be positive numbers" },
        ]),
      );
    }
    return bankAccountService.getAllBankAccountsResult({ page, limit });
  });

  return result.match(
    (data) =>
      Response.json(
        successResponse(
          "Bank accounts retrieved successfully",
          { bankAccounts: data.items },
          {
            timestamp: new Date().toISOString(),
            requestId: request.headers.get("x-request-id") || undefined,
            pagination: createPaginationMeta(data.page, data.limit, data.total),
          },
        ),
        { status: 200 },
      ),
    (error) =>
      Response.json(errorResponse(error.message, error.code, error.details), {
        status: mapErrorCodeToStatus(error.code),
      }),
  );
}

export { DELETE, HEAD, OPTIONS, PATCH, POST, PUT };
