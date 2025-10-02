import apikeyService from "@/domain/apikey/apikey-service";
import { headers } from "next/headers";
import { checkUserAuthOrThrowError } from "../server-actions";

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
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "ak_123"
 *                     description: Unique API key identifier
 *                   name:
 *                     type: string
 *                     nullable: true
 *                     example: "My API Key"
 *                     description: Human-readable name for the API key
 *                   start:
 *                     type: string
 *                     nullable: true
 *                     example: "czb_"
 *                     description: Prefix of the API key
 *                   prefix:
 *                     type: string
 *                     nullable: true
 *                     example: "czb_"
 *                     description: Prefix of the API key
 *                   userId:
 *                     type: string
 *                     example: "usr_123"
 *                     description: ID of the user who owns this API key
 *                   refillInterval:
 *                     type: integer
 *                     nullable: true
 *                     example: 3600
 *                     description: Rate limit refill interval in seconds
 *                   refillAmount:
 *                     type: integer
 *                     nullable: true
 *                     example: 100
 *                     description: Number of requests to refill per interval
 *                   lastRefillAt:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                     description: When the rate limit was last refilled
 *                   enabled:
 *                     type: boolean
 *                     nullable: true
 *                     example: true
 *                     description: Whether the API key is enabled
 *                   rateLimitEnabled:
 *                     type: boolean
 *                     nullable: true
 *                     example: true
 *                     description: Whether rate limiting is enabled
 *                   rateLimitTimeWindow:
 *                     type: integer
 *                     nullable: true
 *                     example: 3600
 *                     description: Rate limit time window in seconds
 *                   rateLimitMax:
 *                     type: integer
 *                     nullable: true
 *                     example: 100
 *                     description: Maximum requests per time window
 *                   requestCount:
 *                     type: integer
 *                     nullable: true
 *                     example: 45
 *                     description: Current number of requests in the time window
 *                   remaining:
 *                     type: integer
 *                     nullable: true
 *                     example: 55
 *                     description: Remaining requests in the current time window
 *                   lastRequest:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                     description: When the API key was last used
 *                   expiresAt:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                     description: When the API key expires
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-01-21T12:27:03.625Z"
 *                     description: When the API key was created
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-01-21T12:27:03.625Z"
 *                     description: When the API key was last updated
 *                   permissions:
 *                     type: string
 *                     nullable: true
 *                     example: "read,write"
 *                     description: Comma-separated list of permissions
 *                   metadata:
 *                     type: string
 *                     nullable: true
 *                     example: "{}"
 *                     description: Additional metadata as JSON string
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Unauthorized"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Internal server error"
 */

export async function GET(request: Request) {
  const user = await checkUserAuthOrThrowError(request);
  if ("error" in user) {
    return Response.json(user, { status: 401 });
  }

  const apiKeys = await apikeyService.server.listUserApiKey(await headers());

  return Response.json(apiKeys);
}
