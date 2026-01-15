export { DELETE, HEAD, OPTIONS, PATCH, PUT } from "../../routes";

import apikeyService from "@/domain/apikey/apikey-service";
import { UserSchema } from "@/domain/user-domain/user-schema";
import userService from "@/domain/user-domain/user-service";
import { ApiErrorCode, errorResponse, successResponse, validateEventHandler } from "@/lib/response";
import { APIError } from "better-auth/api";
import { ApiError, handleErrors } from "../../routes";

/**
 * @swagger
 * /user/create:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user account with the provided details and automatically generates an API key
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       201:
 *         description: User successfully created
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
 *                   example: "User created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-01-10T22:53:51.562Z"
 *                       description: Response timestamp
 *                   required:
 *                     - timestamp
 *       400:
 *         description: Invalid input or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Validation error
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
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedUser = await validateEventHandler(UserSchema, body);

    if ("error" in parsedUser) {
      return Response.json(parsedUser, { status: 422 });
    }
    const createdUser = await userService.server.createUser(parsedUser, "user");
    const apiKey = await apikeyService.server.createApiKey(createdUser.user.id);

    return Response.json(successResponse("User created successfully", { ...createdUser.user, apiKey: apiKey.key }), {
      status: 201,
    });
  } catch (error) {
    // TODO: @vojtech-cerveny - handle better-auth - we can reuse their ApiErrorCodes etc.
    // https://www.better-auth.com/docs/concepts/api#error-handling

    // if (error instanceof BetterAuthAPIError) {
    //   const newError = new ApiError(error.message, error.statusCode, ApiErrorCode.EMAIL_ALREADY_EXISTS);
    //   return handleErrors(newError);
    // }
    if (error instanceof ApiError || error instanceof APIError) {
      return handleErrors(error);
    } else {
      return Response.json(
        errorResponse("Internal Server Error", ApiErrorCode.INTERNAL_ERROR, [
          { code: ApiErrorCode.INTERNAL_ERROR, message: error instanceof Error ? error.message : "Unknown error" },
        ]),
        { status: 500 },
      );
    }
  }
}
