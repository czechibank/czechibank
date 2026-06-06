import { handleListApiKeys } from "@/app/api/v1/handlers/apikey/list.handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * @swagger
 * /apikey:
 *   get:
 *     summary: Get user's API keys
 *     description: Retrieves a list of API keys for the authenticated user. The actual key values are not returned for security reasons.
 *     tags: [API Keys]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved API keys
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ApiKey'
 *       401:
 *         description: Unauthorized - Invalid or missing API key
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
 */

export const GET = withApiHandler(handleListApiKeys, {
  successMessage: "API keys retrieved successfully",
});
