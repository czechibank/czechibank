/**
 * @swagger
 * /features/get-all:
 *   get:
 *     summary: Get all features
 *     description: Retrieve a paginated list of features
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
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Features retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     features:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Feature'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       description: Response timestamp
 *                     requestId:
 *                       type: string
 *                       description: Unique request identifier for tracing
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           description: Current page number
 *                         limit:
 *                           type: integer
 *                           description: Number of items per page
 *                         totalItems:
 *                           type: integer
 *                           description: Total number of items across all pages
 *                         totalPages:
 *                           type: integer
 *                           description: Total number of pages available
 *                           example: 5
 *       400:
 *         description: Bad request, invalid parameters
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
 *       404:
 *         description: Not Found - No features available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal Server Error - An unexpected error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

import { authenticateRequest } from "@/app/api/v1/auth";
import featuresService from "@/domain/features-domain/features-service";
import { toApiResponse } from "@/lib/result-helpers";

export async function GET(request: Request): Promise<Response> {
  const result = authenticateRequest(request)
    .andThen(() => featuresService.server.getAllFeaturesResult())
    .map((features) => ({ features }));

  return toApiResponse(result, "Features retrieved successfully");
}
