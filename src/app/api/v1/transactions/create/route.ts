import { checkUserAuthOrThrowError } from "@/app/api/v1/server-actions";
import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import transactionService from "@/domain/transaction-domain/transaction-service";
import { ApiTransactionCreateSchema } from "@/domain/transaction-domain/transation-schema";
import { ApiErrorCode, errorResponse, validateEventHandler } from "@/lib/response";
import { NextRequest, NextResponse } from "next/server";
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 */
export async function POST(request: NextRequest) {
  try {
    const user = await checkUserAuthOrThrowError(request);
    if ("error" in user) {
      return NextResponse.json(errorResponse(user.error.message, user.error.code), { status: 401 });
    }

    // Read raw body text to check for scientific notation
    const bodyText = await request.text();

    // Check if the body contains scientific notation (e.g., 1e3, 1E3, 1.5e-2)
    if (/"\s*amount\s*"\s*:\s*[-+]?\d+\.?\d*[eE][-+]?\d+/.test(bodyText)) {
      return NextResponse.json(
        errorResponse("Amount must be a standard decimal number, scientific notation is not allowed", "400"),
        { status: 400 },
      );
    }

    const body = JSON.parse(bodyText);

    const validatedBody = await validateEventHandler(ApiTransactionCreateSchema, body);

    if ("error" in validatedBody) {
      return NextResponse.json(validatedBody, { status: 400 });
    }

    const { amount, toBankNumber, fromBankNumber } = validatedBody;

    const userBankAccounts = await bankAccountService.getMyBankAccounts(user.id, { page: 1, limit: 1 });
    if ("error" in userBankAccounts || userBankAccounts.data.items.length === 0) {
      return NextResponse.json(errorResponse("No bank account found for user", "400"), { status: 400 });
    }

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
}
