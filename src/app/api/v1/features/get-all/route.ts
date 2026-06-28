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

import { handleGetAllFeatures } from "@/app/api/v1/handlers/features/get-all.handler";
import { withPaginatedApiHandler } from "@/lib/api/with-api-handler";
import { createPaginationMeta } from "@/lib/response";

export const GET = withPaginatedApiHandler(handleGetAllFeatures, {
  successMessage: "Features retrieved successfully",
  transform: (data) => ({
    body: { features: data.items },
    pagination: createPaginationMeta(data.page, data.limit, data.total),
  }),
});
