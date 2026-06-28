import {
  handleDeleteBankAccountById,
  handleGetBankAccountById,
  handleRenameBankAccountById,
} from "@/app/api/v1/handlers/bank-account/by-id.handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

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

export const GET = withApiHandler(handleGetBankAccountById, {
  successMessage: "Bank account details retrieved successfully",
});

export const DELETE = withApiHandler(handleDeleteBankAccountById, {
  successMessage: "Bank account deleted successfully",
});

export const PATCH = withApiHandler(handleRenameBankAccountById, {
  successMessage: "Bank account renamed successfully",
});
