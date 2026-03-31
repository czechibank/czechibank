import { authenticateRequest } from "@/app/api/v1/auth";
import { RenameBankAccountSchema } from "@/domain/bankAccount-domain/ba-schema";
import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import { canSeeYourBankAccountDetailFeature as anyOneCanSeeYourBankAccountFeature } from "@/domain/features-domain/features-application-service";
import featuresService from "@/domain/features-domain/features-service";
import { badRequest, conflict } from "@/lib/errors";
import { toApiResponse, validateWithResult } from "@/lib/result-helpers";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

/**
 * @swagger
 * /bank-account/{id}:
 *   get:
 *     summary: Get bank account details
 *     description: Retrieve details of a specific bank account
 *     tags:
 *       - Bank Accounts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bank account ID
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Bank account details retrieved successfully
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
 *       401:
 *         description: Unauthorized - invalid or missing API key
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
 *       422:
 *         description: Validation error (e.g., invalid ID format)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   delete:
 *     summary: Delete bank account
 *     description: Delete a bank account (only possible if balance is 0)
 *     tags:
 *       - Bank Accounts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bank account ID
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Bank account deleted successfully
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
 *                         message:
 *                           type: string
 *                           example: "Bank account deleted successfully"
 *       409:
 *         description: Conflict - cannot delete account due to invalid state
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               nonZeroBalance:
 *                 summary: Non-zero balance
 *                 value:
 *                   success: false
 *                   message: "Cannot delete account with non-zero balance"
 *                   error:
 *                     code: NON_ZERO_BALANCE
 *               stillActive:
 *                 summary: Account still active
 *                 value:
 *                   success: false
 *                   message: "Bank account deletion failed, account still active"
 *                   error:
 *                     code: CONFLICT
 *       401:
 *         description: Unauthorized - invalid or missing API key
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
 *       422:
 *         description: Validation error (e.g., invalid ID format)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   patch:
 *     summary: Rename a bank account
 *     description: Update the name of a bank account. Only the `name` property is expected in the request body.
 *     tags:
 *       - Bank Accounts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bank account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name for the bank account
 *                 example: "My Savings Account"
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Bank account renamed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized - invalid or missing API key
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
 *       422:
 *         description: Validation error (e.g., empty name)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 */

const idSchema = z.object({ id: z.string().cuid() });

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const result = authenticateRequest(request)
    .andThen((user) =>
      validateWithResult(idSchema, { id }).andThen((parsed) => {
        // Check feature flag: if enabled, anyone can see any bank account
        return featuresService.server
          .getAllFeaturesResult()
          .map((result) => anyOneCanSeeYourBankAccountFeature(result.items))
          .orElse(() => okAsync(false))
          .andThen((anyoneCanSee) =>
            anyoneCanSee
              ? bankAccountService.getBankAccountByIdResult(parsed.id)
              : bankAccountService.getBankAccountByIdAndUserIdResult(parsed.id, user.id),
          );
      }),
    )
    .map((bankAccount) => ({ bankAccount }));

  return toApiResponse(result, "Bank account details retrieved successfully");
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const result = authenticateRequest(request).andThen((user) =>
    validateWithResult(idSchema, { id }).andThen((parsed) =>
      bankAccountService.getBankAccountByIdAndUserIdResult(parsed.id, user.id).andThen((bankAccount) =>
        bankAccountService.deleteBankAccountResult(bankAccount, user.id).andThen((deleted) => {
          if (deleted.isActive !== false) {
            return errAsync<{ message: string }, import("@/lib/errors").AppError>(
              conflict("Bank account deletion failed, account still active"),
            );
          }
          return okAsync({ message: "Bank account deleted successfully" });
        }),
      ),
    ),
  );

  return toApiResponse(result, "Bank account deleted successfully");
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const result = authenticateRequest(request).andThen((user) =>
    validateWithResult(idSchema, { id }).andThen((parsed) =>
      ResultAsync.fromPromise(request.json(), () => badRequest("Invalid JSON body"))
        .andThen((body) => validateWithResult(RenameBankAccountSchema, body))
        .andThen(({ name: newName }) =>
          bankAccountService
            .getBankAccountByIdAndUserIdResult(parsed.id, user.id)
            .andThen(() => bankAccountService.renameBankAccountResult(parsed.id, user.id, newName)),
        ),
    ),
  );

  return toApiResponse(result, "Bank account renamed successfully");
}
