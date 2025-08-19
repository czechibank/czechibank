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

import { ApiError } from "@/app/api/v1/api-error";
import { handleErrors } from "@/app/api/v1/routes";
import { checkUserAuthOrThrowError } from "@/app/api/v1/server-actions";
import featuresService from "@/domain/features-domain/features-service";
import { AllFeaturesSchema } from "@/domain/features-domain/features.schema";
import { ApiErrorCode, successResponse, validateEventHandler } from "@/lib/response";

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await checkUserAuthOrThrowError(request);
    if ("errror" in user) {
      return Response.json(user, { status: 401 });
    }

    const body = await request.json();
    const validatedBody = await validateEventHandler(AllFeaturesSchema, body);

    if ("error" in validatedBody) {
      return Response.json(validatedBody, { status: 400 });
    }

    const { features } = validatedBody;
    const updatedFeatures = await featuresService.server.updateFeatures(features);

    if ("error" in updatedFeatures) {
      return Response.json(updatedFeatures, { status: 404 });
    }

    return Response.json(
      successResponse(
        "Features updated successfully",
        { features: updatedFeatures.data },
        {
          timestamp: new Date().toISOString(),
          requestId: request.headers.get("x-request-id") || undefined,
        },
      ),
      {
        status: 200,
      },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return handleErrors(error);
    } else {
      throw new ApiError("Internal Server Error", 500, ApiErrorCode.INTERNAL_ERROR, [
        { code: ApiErrorCode.INTERNAL_ERROR, message: error instanceof Error ? error.message : "Unknown error" },
      ]);
    }
  }
}
