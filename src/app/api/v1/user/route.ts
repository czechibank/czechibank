import { authenticateRequest } from "@/app/api/v1/auth";
import { toApiResponse } from "@/lib/result-helpers";
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
export async function GET(request: Request) {
  const result = authenticateRequest(request);
  return toApiResponse(result, "User profile retrieved successfully");
}

export { DELETE, HEAD, OPTIONS, PATCH, POST, PUT };
