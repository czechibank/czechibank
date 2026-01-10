import { checkUserAuthOrThrowError } from "@/app/api/v1/server-actions";
import { ApiErrorCode, successResponse } from "@/lib/response";
import { ApiError, DELETE, HEAD, OPTIONS, PATCH, POST, PUT, handleErrors } from "../routes";

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get current user
 *     description: Retrieves the authenticated user's profile information
 *     tags: [Users]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: User profile successfully retrieved
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
 *                   example: "User profile retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 meta:
 *                   type: object
 *                   additionalProperties: false
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-01-10T22:53:51.562Z"
 *                       description: Response timestamp
 *                   required:
 *                     - timestamp
 *               required:
 *                 - success
 *                 - message
 *                 - data
 *                 - meta
 *       401:
 *         description: Unauthorized - API key is missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: Request) {
  try {
    const user = await checkUserAuthOrThrowError(request);
    // Check if the returned object has an 'error' property, indicating authentication failure
    if ("error" in user) {
      console.log("Authentication failed:", user);
      return Response.json(user, { status: 401 });
    }
    // If no 'error' property, authentication was successful
    return Response.json(successResponse("User profile retrieved successfully", user), {
      status: 200,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return handleErrors(error);
    } else {
      // Ensure unexpected errors are still handled and logged appropriately
      console.error("Internal server error in GET /user:", error);
      throw new ApiError("Internal Server Error", 500, ApiErrorCode.INTERNAL_ERROR, [
        { code: ApiErrorCode.INTERNAL_ERROR, message: error instanceof Error ? error.message : "Unknown error" },
      ]);
    }
  }
}

export { DELETE, HEAD, OPTIONS, PATCH, POST, PUT };
