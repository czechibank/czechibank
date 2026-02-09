/**
 * @swagger
 * /features/get-all:
 *   get:
 *     summary: Get all features
 *     description: Retrieve all feature flags
 *     tags: [Features]
 *     security:
 *       - ApiKeyAuth: []
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
 *       401:
 *         description: Unauthorized - API key is missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
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
