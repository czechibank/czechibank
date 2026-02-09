import { authenticateRequest } from "@/app/api/v1/auth";
import transactionService from "@/domain/transaction-domain/transaction-service";
import { toApiResponse } from "@/lib/result-helpers";
import { NextRequest } from "next/server";
import { DELETE, HEAD, OPTIONS, PATCH, POST, PUT } from "../../routes";

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: Get transaction details
 *     description: Retrieves details of a specific transaction
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Transaction details successfully retrieved
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
 *                         transaction:
 *                           $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized - API key is missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const result = authenticateRequest(request)
    .andThen((user) => transactionService.getTransactionDetailResult(id, user.id))
    .map((transaction) => ({ transaction }));

  return toApiResponse(result, "Transaction retrieved successfully");
}

export { DELETE, HEAD, OPTIONS, PATCH, POST, PUT };
