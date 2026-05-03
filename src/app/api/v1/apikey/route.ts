import { authenticateRequest } from "@/app/api/v1/auth";
import apikeyService from "@/domain/apikey/apikey-service";
import { fromUnknown } from "@/lib/errors";
import { toApiResponse } from "@/lib/result-helpers";
import { ResultAsync } from "neverthrow";
import { headers } from "next/headers";

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

export async function GET(request: Request) {
  const result = authenticateRequest(request).andThen(() =>
    ResultAsync.fromPromise(
      headers().then((h) => apikeyService.server.listUserApiKey(h)),
      (e) => fromUnknown(e, "Failed to list API keys"),
    ),
  );

  return toApiResponse(result, "API keys retrieved successfully");
}
