import transactionService from "@/domain/transaction-domain/transaction-service";
import { mapErrorCodeToStatus } from "@/lib/api-error-status-map";
import { ApiErrorCode, errorResponse, successResponse } from "@/lib/response";
import { NextRequest, NextResponse } from "next/server";
import { DELETE, HEAD, OPTIONS, PATCH, POST, PUT } from "../../routes";
import { checkUserAuthOrThrowError } from "../../server-actions";

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
  const params = await props.params;
  try {
    const user = await checkUserAuthOrThrowError(request);
    if ("error" in user) {
      return NextResponse.json(errorResponse(user.error.message, user.error.code), {
        status: mapErrorCodeToStatus(user.error.code),
      }); //401
    }

    const result = await transactionService.getTransactionDetailByTransactionId(params.id, user.id);

    if ("error" in result) {
      const { code, message } = result.error;

      if (code === ApiErrorCode.NOT_FOUND) {
        return NextResponse.json(errorResponse("Transaction not found", code), { status: mapErrorCodeToStatus(code) }); //404
      }

      return NextResponse.json(errorResponse(message, ApiErrorCode.INTERNAL_ERROR), {
        status: mapErrorCodeToStatus(ApiErrorCode.INTERNAL_ERROR), //500
      });
    }

    return NextResponse.json(successResponse("Transaction retrieved successfully", { transaction: result.data }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error in GET /api/v1/transactions/[id]:", error);
    return NextResponse.json(errorResponse("Internal server error", ApiErrorCode.INTERNAL_ERROR), {
      status: mapErrorCodeToStatus(ApiErrorCode.INTERNAL_ERROR), //500
    });
  }
}

export { DELETE, HEAD, OPTIONS, PATCH, POST, PUT };
