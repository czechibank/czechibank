import { checkUserAuthOrThrowError } from "@/app/api/v1/server-actions";
import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import { mapErrorCodeToStatus } from "@/lib/api-error-status-map";
import { ApiErrorCode, successResponse, validateEventHandler } from "@/lib/response";
import { z } from "zod";
import { ApiError, handleErrors } from "../../routes";

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
 *       400:
 *         description: Cannot delete account with non-zero balance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 */

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    console.log("GET /bank-account/[id]/route.ts");

    const { id } = await context.params;
    const schema = z.object({
      id: z.string().cuid(),
    });
    const parsedId = await validateEventHandler(schema, { id });
    if ("error" in parsedId) {
      const status = mapErrorCodeToStatus(parsedId.error.code as ApiErrorCode);
      return Response.json(parsedId, { status });
    }

    const user = await checkUserAuthOrThrowError(request);
    if ("error" in user) {
      const status = mapErrorCodeToStatus(user.error.code as ApiErrorCode);
      return Response.json(user, { status });
    }
    const bankAccountResponse = await bankAccountService.getBankAccountById(parsedId.id, user.id);

    if ("error" in bankAccountResponse) {
      const status = mapErrorCodeToStatus(bankAccountResponse.error.code as ApiErrorCode);
      return Response.json(bankAccountResponse, { status });
    }

    return Response.json(bankAccountResponse, { status: 200 });
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

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const user = await checkUserAuthOrThrowError(request);
    if ("error" in user) {
      return Response.json(user, { status: 401 });
    }
    // First verify the user owns this account
    const bankAccountResponse = await bankAccountService.getBankAccountById(id, user.id);
    if ("error" in bankAccountResponse) {
      return Response.json(bankAccountResponse, { status: 404 });
    }

    const bankAccount = bankAccountResponse.data;
    if (!bankAccount) {
      throw new ApiError("Bank account not found", 404, ApiErrorCode.NOT_FOUND, [
        {
          code: ApiErrorCode.NOT_FOUND,
          message: "Bank account not found",
        },
      ]);
    }

    const result = await bankAccountService.deleteBankAccount(bankAccount, user.id);

    if ("error" in result) {
      const status = mapErrorCodeToStatus(result.error.code as ApiErrorCode);
      return Response.json(result, { status });
    }
    // Verify that isActive is actually false
    if (result.data.isActive !== false) {
      return Response.json(
        { success: false, message: "Bank account deletion failed", error: { code: "INTERNAL_ERROR" } },
        { status: 500 },
      );
    }

    return Response.json(
      successResponse("Bank account deleted successfully", { message: "Bank account deleted successfully" }),
      { status: 200 },
    );
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

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const body = await request.json();
    const schema = z.object({
      name: z.string().min(1, "Bank account name cannot be empty"),
    });
    const parsedBody = schema.safeParse(body);
    if (!parsedBody.success) {
      return Response.json({ error: parsedBody.error.format() }, { status: 422 });
    }
    const { name: newName } = parsedBody.data;

    const user = await checkUserAuthOrThrowError(request);
    if ("error" in user) {
      return Response.json(user, { status: 401 });
    }

    const bankAccountResponse = await bankAccountService.getBankAccountById(id, user.id);
    if ("error" in bankAccountResponse) {
      return Response.json(bankAccountResponse, { status: 404 });
    }

    // Rename the account
    const renameResult = await bankAccountService.renameBankAccount(id, user.id, newName);
    if ("error" in renameResult) {
      return Response.json(renameResult);
    }

    return Response.json(successResponse("Bank account renamed successfully", renameResult.data), { status: 200 });
  } catch (error) {
    if (error instanceof ApiError) return handleErrors(error);
    throw new ApiError("Internal Server Error", 500, ApiErrorCode.INTERNAL_ERROR, [
      { code: ApiErrorCode.INTERNAL_ERROR, message: error instanceof Error ? error.message : "Unknown error" },
    ]);
  }
}
