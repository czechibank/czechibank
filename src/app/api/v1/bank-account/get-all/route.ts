import { handleGetAllBankAccounts } from "@/app/api/v1/handlers/bank-account/get-all.handler";
import { withPaginatedApiHandler } from "@/lib/api/with-api-handler";
import { createPaginationMeta } from "@/lib/response";
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
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
export const GET = withPaginatedApiHandler(handleGetAllBankAccounts, {
  successMessage: "Bank accounts retrieved successfully",
  transform: (data) => ({
    body: { bankAccounts: data.items },
    pagination: createPaginationMeta(data.page, data.limit, data.total),
  }),
});

export { DELETE, HEAD, OPTIONS, PATCH, POST, PUT };
