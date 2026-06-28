import { handleGetCurrentUser } from "@/app/api/v1/handlers/user/get-current-user.handler";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { DELETE, HEAD, OPTIONS, PATCH, POST, PUT } from "../routes";

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
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
export const GET = withApiHandler(handleGetCurrentUser, {
  successMessage: "User profile retrieved successfully",
});

export { DELETE, HEAD, OPTIONS, PATCH, POST, PUT };
