/**
 * @swagger
 * /features/update:
 *   post:
 *     summary: Update features
 *     description: Update the status of multiple features
 *     tags: [Features]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AllFeatures'
 *     responses:
 *       200:
 *         description: Features updated successfully
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
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Feature not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

import { authenticateRequest } from "@/app/api/v1/auth";
import featuresService from "@/domain/features-domain/features-service";
import { AllFeaturesSchema } from "@/domain/features-domain/features.schema";
import { badRequest, forbidden } from "@/lib/errors";
import { toApiResponse, validateWithResult } from "@/lib/result-helpers";
import { errAsync, okAsync, ResultAsync } from "neverthrow";

export async function POST(request: Request): Promise<Response> {
  const result = authenticateRequest(request)
    .andThen((user) => {
      if (user.role !== "admin") {
        return errAsync(forbidden("Forbidden"));
      }
      return okAsync(user);
    })
    .andThen(() => ResultAsync.fromPromise(request.json(), () => badRequest("Invalid JSON body")))
    .andThen((body) => validateWithResult(AllFeaturesSchema, body))
    .andThen(({ features }) => featuresService.server.updateFeaturesResult(features))
    .map((features) => ({ features }));

  return toApiResponse(result, "Features updated successfully", 200, {
    requestId: request.headers.get("x-request-id") || undefined,
  });
}
