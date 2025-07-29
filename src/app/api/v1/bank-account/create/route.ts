import { checkUserAuthOrThrowError } from "@/app/api/v1/server-actions";
import { BankAccountSchema } from "@/domain/bankAccount-domain/ba-schema";
import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import { withMissionChecking } from "@/lib/mission-middleware";
import { ApiErrorCode, errorResponse, successResponse } from "@/lib/response";
import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "../../routes";
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
async function POSTHandler(request: NextRequest) {
  try {
    const user = await checkUserAuthOrThrowError(request);
    if ("error" in user) {
      return NextResponse.json(user, { status: 401 });
    }
    const body = await request.json();
    const parsedBody = BankAccountSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(errorResponse(parsedBody.error.message, ApiErrorCode.VALIDATION_ERROR));
    }

    const result = await bankAccountService.createBankAccount({
      userId: user.id,
      currency: parsedBody.data.currency,
      name: parsedBody.data.name || "New Bank Account",
    });

    return NextResponse.json(successResponse("Bank account created successfully", { bankAccount: result }), {
      status: 201,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(errorResponse(error.message, error.code, error.details), { status: error.statusCode });
    } else {
      return NextResponse.json(errorResponse("Internal Server Error", ApiErrorCode.INTERNAL_ERROR), { status: 500 });
    }
  }
}

// Export the wrapped handler with mission checking
export const POST = withMissionChecking(POSTHandler, {
  logResults: true,
  includeInResponse: true,
});
