import { authenticateRequest } from "@/app/api/v1/auth";
import { BankAccountSchema } from "@/domain/bankAccount-domain/ba-schema";
import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import { badRequest } from "@/lib/errors";
import { toApiResponse, validateWithResult } from "@/lib/result-helpers";
import { ResultAsync } from "neverthrow";
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
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
export async function POST(request: Request) {
  const result = authenticateRequest(request)
    .andThen((user) =>
      ResultAsync.fromPromise(request.json(), () => badRequest("Invalid JSON body")).andThen((body) =>
        validateWithResult(BankAccountSchema, body).map((parsed) => ({ user, parsed })),
      ),
    )
    .andThen(({ user, parsed }) =>
      bankAccountService.createBankAccountResult({
        userId: user.id,
        currency: parsed.currency,
        name: parsed.name,
      }),
    )
    .map((bankAccount) => ({ bankAccount }));

  return toApiResponse(result, "Bank account created successfully", 201);
}
