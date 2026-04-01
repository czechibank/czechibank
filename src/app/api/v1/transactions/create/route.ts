import { authenticateRequest } from "@/app/api/v1/auth";
import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import transactionService from "@/domain/transaction-domain/transaction-service";
import { ApiTransactionCreateSchema } from "@/domain/transaction-domain/transation-schema";
import { badRequest } from "@/lib/errors";
import { toApiResponse, validateWithResult } from "@/lib/result-helpers";
import { errAsync, ResultAsync } from "neverthrow";
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
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
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
export async function POST(request: Request) {
  const result = authenticateRequest(request).andThen((user) =>
    ResultAsync.fromPromise(request.json(), () => badRequest("Invalid JSON body"))
      .andThen((body) => validateWithResult(ApiTransactionCreateSchema, body))
      .andThen((validated) =>
        // Verify user has at least one bank account
        bankAccountService.getMyBankAccountsResult(user.id, { page: 1, limit: 1 }).andThen((accounts) => {
          if (accounts.items.length === 0) {
            return errAsync(badRequest("No bank account found for user"));
          }
          return transactionService.sendMoneyToBankNumberResult({
            amount: validated.amount,
            toBankNumber: validated.toBankNumber,
            fromBankNumber: validated.fromBankNumber,
            userId: user.id,
            currency: "CZECHITOKEN",
            applicationType: "api",
          });
        }),
      ),
  );

  return toApiResponse(result, "Transaction successful", 201);
}
