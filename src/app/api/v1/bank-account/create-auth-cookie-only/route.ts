import { BankAccountSchema } from "@/domain/bankAccount-domain/ba-schema";
import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import { ApiErrorCode, errorResponse, successResponse } from "@/lib/response";
import { ApiError, handleErrors } from "../../routes";
import { checkUserAuthOrThrowErrorCookieOnly } from "../../server-actions-no-apikey";
/**
 * @swagger
 * /bank-account/create-auth-cookie-only:
 *   post:
 *     summary: Create a new bank account (cookie-based auth)
 *     description: Creates a new bank account for the authenticated user  using cookie-based authentication only (no API key required)
 *     tags: [Bank Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BankAccountCreate'
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
    const user = await checkUserAuthOrThrowErrorCookieOnly(request);
    if ("error" in user) {
      return Response.json(user, { status: 401 });
    }
    const body = await request.json();
    const parsedBody = BankAccountSchema.safeParse(body);

    if (!parsedBody.success) {
      return Response.json(errorResponse(parsedBody.error.message, ApiErrorCode.VALIDATION_ERROR));
    }

    const result = await bankAccountService.createBankAccount({
      userId: user.id,
      currency: parsedBody.data.currency,
      name: parsedBody.data.name || "New Bank Account",
    });

    return Response.json(successResponse("Bank account created successfully", { bankAccount: result }), {
      status: 201,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return handleErrors(error);
    } else {
      throw new ApiError("Internal Server Error", 500, ApiErrorCode.INTERNAL_ERROR, [
        { code: ApiErrorCode.INTERNAL_ERROR, message: error instanceof Error ? error.message : "Unknown error" },
      ]);
    }
  }
}
