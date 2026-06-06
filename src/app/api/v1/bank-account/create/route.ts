import { handleCreateBankAccount } from "@/app/api/v1/handlers/bank-account/create.handler";
import { withApiHandler } from "@/lib/api/with-api-handler";
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
export const POST = withApiHandler(handleCreateBankAccount, {
  successMessage: "Bank account created successfully",
  successStatus: 201,
});
