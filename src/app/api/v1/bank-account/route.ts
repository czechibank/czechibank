import { checkUserAuthOrThrowError } from "@/app/api/v1/server-actions";
import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import { ApiErrorCode, createPaginationMeta, errorResponse, successResponse } from "@/lib/response";
import { ApiError, DELETE, HEAD, PATCH, POST, PUT, handleErrors } from "../routes";

/**
 * @swagger
 * /bank-account:
 *   get:
 *     summary: Get user's bank accounts
 *     description: Retrieves a paginated list of bank accounts for the authenticated user
 *     tags: [Bank Accounts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved bank accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Bank accounts retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     bankAccounts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/BankAccount'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     requestId:
 *                       type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       400:
 *         description: Invalid pagination parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function GET(request: Request) {
  try {
    console.log("GET /bank-account/route.ts");
    // 1️⃣ Authenticate user
    let user;
    try {
      user = await checkUserAuthOrThrowError(request);
      if ("error" in user) {
        return Response.json(user, { status: 401 });
      }
    } catch (authErr) {
      return Response.json(
        errorResponse("Authentication failed", ApiErrorCode.UNAUTHORIZED, [
          { code: ApiErrorCode.UNAUTHORIZED, message: (authErr as Error).message },
        ]),
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Validate pagination parameters
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return Response.json(
        errorResponse("Invalid pagination parameters", ApiErrorCode.VALIDATION_ERROR, [
          {
            code: ApiErrorCode.VALIDATION_ERROR,
            message: "Page and limit must be positive numbers",
          },
        ]),
        { status: 400 },
      );
    }

    // Fetch bank accounts from service
    let result;
    try {
      result = await bankAccountService.getMyBankAccounts(user.id, { page, limit });
    } catch (serviceErr) {
      return Response.json(
        errorResponse("Failed to fetch bank accounts", ApiErrorCode.INTERNAL_ERROR, [
          { code: ApiErrorCode.INTERNAL_ERROR, message: (serviceErr as Error).message },
        ]),
        { status: 500 },
      );
    }

    // Check if service returned error
    if ("error" in result) {
      return Response.json(result);
    }

    if (!result.data || !Array.isArray(result.data.items)) {
      return Response.json(
        errorResponse("Invalid data from bank account service", ApiErrorCode.INTERNAL_ERROR, [
          { code: ApiErrorCode.INTERNAL_ERROR, message: "Missing or invalid data property" },
        ]),
        { status: 500 },
      );
    }

    // Return successful response
    return Response.json(
      successResponse(
        "Bank accounts retrieved successfully",
        { bankAccounts: result.data.items },
        {
          timestamp: new Date().toISOString(),
          requestId: request.headers.get("x-request-id") || undefined,
          pagination: createPaginationMeta(result.data.page, result.data.limit, result.data.total),
        },
      ),
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

export { DELETE, HEAD, PATCH, POST, PUT };
