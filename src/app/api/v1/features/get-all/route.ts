/**
 * @swagger
 * /features/get-all:
 *  get:
 *    summary: Get all features
 *    description: Retrieve a paginated list of features
 *    tags: [Features]
 *    security:
 *      - ApiKeyAuth: []
 *    parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          minimum: 1
 *          default: 1
 *        description: Page number for pagination
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *          minimum: 1
 *          maximum: 100
 *          default: 10
 *        description: Number of items per page
 *    responses:
 *      200:
 *        description: Features retrieved successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *                  example: true
 *                message:
 *                  type: string
 *                  example: Features retrieved successfully
 *                data:
 *                  type: object
 *                  properties:
 *                    features:
 *                      type: array
 *                      items:
 *                        $ref: '#/components/schemas/Feature'
 *                meta:
 *                  type: object
 *                  properties:
 *                    timestamp:
 *                      type: string
 *                      format: date-time
 *                      description: Response timestamp
 *                    requestId:
 *                      type: string
 *                      description: Unique request identifier for tracing
 *                    pagination:
 *                      type: object
 *                      properties:
 *                        page:
 *                          type: integer
 *                          description: Current page number
 *                        limit:
 *                          type: integer
 *                          description: Number of items per page
 *                        totalItems:
 *                          type: integer
 *                          description: Total number of items across all pages
 *                        totalPages:
 *                          type: integer
 *                          description: Total number of pages available
 *                          example: 5
 *      400:
 *        description: Bad request, invalid parameters
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *
 *      401:
 *        description: Unauthorized - API key is missing or invalid
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *
 *      404:
 *        description: Not Found - No features available
 *         content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *
 *      500:
 *        description: Internal Server Error - An unexpected error occurred
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 */
import { ApiError } from "@/app/api/v1/api-error";
import { handleErrors } from "@/app/api/v1/routes";
import { checkUserAuthOrThrowError } from "@/app/api/v1/server-actions";
import featuresService from "@/domain/features-domain/features-service";
import { ApiErrorCode, successResponse } from "@/lib/response";

export async function GET(request: Request): Promise<Response> {
  try {
    const user = await checkUserAuthOrThrowError(request);
    if ("errror" in user) {
      return Response.json(user, { status: 401 });
    }

    const allFeatures = await featuresService.server.getAllFeatures();

    if ("error" in allFeatures) {
      return Response.json(allFeatures, { status: 404 });
    }

    return Response.json(
      successResponse(
        "Features retrieved successfully",
        { features: allFeatures.data },
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
