import { authenticateRequest } from "@/app/api/v1/auth";
import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import { createPaginationMeta } from "@/lib/response";
import { toPaginatedApiResponse } from "@/lib/result-helpers";
import { DELETE, HEAD, PATCH, POST, PUT } from "../routes";

/**
 * @swagger
 * /bank-account:
 *   get:
 *     summary: Get user's bank accounts
 *     description: Retrieves a paginated list of bank accounts for the authenticated user
 *     tags: [Bank Accounts]
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
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved bank accounts
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
 *                     requestId:
 *                       type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       400:
 *         description: Invalid pagination parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       502:
 *         description: Bad Gateway - Bank account service returned malformed or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               malformedData:
 *                 summary: Malformed service response
 *                 value:
 *                   success: false
 *                   message: "Invalid data from bank account service"
 *                   error:
 *                     code: BAD_GATEWAY
 *                     message: "Service returned missing or malformed data"
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const result = authenticateRequest(request).andThen((user) =>
    bankAccountService.getMyBankAccountsResult(user.id, { page, limit }),
  );

  return toPaginatedApiResponse(result, "Bank accounts retrieved successfully", (data) => ({
    body: { bankAccounts: data.items },
    pagination: createPaginationMeta(data.page, data.limit, data.total),
  }));
}

export { DELETE, HEAD, PATCH, POST, PUT };
