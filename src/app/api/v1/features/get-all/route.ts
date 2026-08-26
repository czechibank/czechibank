/**
 * @swagger
 * /features/get-all:
 *   get:
 *     summary: Get all features
 *     description: Retrieve a paginated list of feature flags
 *     tags: [Features]
 *     security:
 *       - ApiKeyAuth: []
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
 *     responses:
 *       200:
 *         description: Features retrieved successfully
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
 *                         features:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Feature'
 *       400:
 *         description: Invalid pagination parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - API key is missing or invalid
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

import { authenticateRequest } from "@/app/api/v1/auth";
import featuresService from "@/domain/features-domain/features-service";
import { createPaginationMeta } from "@/lib/response";
import { toPaginatedApiResponse } from "@/lib/result-helpers";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const result = authenticateRequest(request).andThen(() =>
    featuresService.server.getAllFeaturesResult({ page, limit }),
  );

  return toPaginatedApiResponse(result, "Features retrieved successfully", (data) => ({
    body: { features: data.items },
    pagination: createPaginationMeta(data.page, data.limit, data.total),
  }));
}
