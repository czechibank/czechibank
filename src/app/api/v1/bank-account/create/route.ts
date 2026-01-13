import { checkUserAuthOrThrowError } from "@/app/api/v1/server-actions";
import { BankAccountSchema } from "@/domain/bankAccount-domain/ba-schema";
import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import { ApiErrorCode, errorResponse, successResponse } from "@/lib/response";
import { NextResponse } from "next/server";
import { ApiError, handleErrors } from "../../routes";
/**
 * @swagger
 * /bank-account/create:
 *   post:
 *     summary: Create a new bank account
 *     description: Creates a new bank account for the authenticated user
 *     tags: [Bank Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BankAccountCreate'
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       201:
 *         description: Bank account successfully created
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
 *                         bankAccount:
 *                           $ref: '#/components/schemas/BankAccount'
 *       400:
 *         description: Invalid input
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
 */
export async function POST(request: Request) {
  try {
    const user = await checkUserAuthOrThrowError(request);
    if ("error" in user) {
      return NextResponse.json(user, { status: 401 });
    }
    const body = await request.json();
    const parsedBody = BankAccountSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(errorResponse(parsedBody.error.message, ApiErrorCode.VALIDATION_ERROR), { status: 400 });
    }

    const result = await bankAccountService.createBankAccount({
      userId: user.id,
      currency: parsedBody.data.currency,
      name: parsedBody.data.name,
    });

    return NextResponse.json(successResponse("Bank account created successfully", { bankAccount: result }), {
      status: 201,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return handleErrors(error);
    } else {
      return handleErrors(
        new ApiError("Internal Server Error", 500, ApiErrorCode.INTERNAL_ERROR, [
          { code: ApiErrorCode.INTERNAL_ERROR, message: error instanceof Error ? error.message : "Unknown error" },
        ]),
      );
    }
  }
}
