import { checkUserAuthOrThrowError } from "@/app/api/v1/server-actions";
import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import { ApiTransactionCreateSchema } from "@/domain/transaction-domain/transaction-schema";
import transactionService from "@/domain/transaction-domain/transaction-service";
import { withValidatedJSON } from "@/lib/api/validation";
import { ApiErrorCode, errorResponse, validateEventHandler } from "@/lib/response";
import { NextResponse } from "next/server";
/**
 * @swagger
 * /transactions/create:
 *   post:
 *     summary: Create a new transaction
 *     description: Creates a new transaction between bank accounts
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionCreate'
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       201:
 *         description: Transaction successfully created
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
 *       400:
 *         description: Invalid input or insufficient funds
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Bank account not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const POST = withValidatedJSON(async (request, body) => {
  try {
    const user = await checkUserAuthOrThrowError(request);
    if ("error" in user) {
      return NextResponse.json(errorResponse(user.error.message, user.error.code), { status: 401 });
    }

    const validatedBody = await validateEventHandler(ApiTransactionCreateSchema, body);
    if ("error" in validatedBody) {
      return NextResponse.json(validatedBody, { status: 400 });
    }

    const { amount, toBankNumber } = validatedBody;
    const userBankAccounts = await bankAccountService.getMyBankAccounts(user.id, { page: 1, limit: 1 });
    if ("error" in userBankAccounts || userBankAccounts.data.items.length === 0) {
      return NextResponse.json(errorResponse("No bank account found for user", "400"), { status: 400 });
    }
    const fromBankNumber = userBankAccounts.data.items[0].number;
    const result = await transactionService.sendMoneyToBankNumber({
      amount,
      toBankNumber,
      fromBankNumber,
      userId: user.id,
      currency: "CZECHITOKEN",
      applicationType: "api",
    });
    if ("error" in result) {
      const error = result.error as { code: ApiErrorCode; message: string };
      if (error.code === "NOT_FOUND") {
        return NextResponse.json(errorResponse("Bank account not found", "404"), { status: 404 });
      }
      return NextResponse.json(errorResponse(error.message, "400"), { status: 400 });
    }
    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error in POST /api/v1/transactions/create:", error);
    return NextResponse.json(errorResponse("Internal server error", "500"), { status: 500 });
  }
});
