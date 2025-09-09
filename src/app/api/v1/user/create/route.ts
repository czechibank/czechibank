export { DELETE, HEAD, OPTIONS, PATCH, PUT } from "../../routes";

import apikeyService from "@/domain/apikey/apikey-service";
import { UserSchema } from "@/domain/user-domain/user-schema";
import userService from "@/domain/user-domain/user-service";
import { Role } from "@/lib/permissions";
import { validateEventHandler } from "@/lib/response";
import { APIError } from "better-auth/api";
import { z } from "zod";
import { ApiError, handleErrors } from "../../routes";

/**
 * @swagger
 * /user/create:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user account with the provided details
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
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input or email already exists
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
    const parsedUserRole = await validateEventHandler(z.object({ role: z.string() }), body);
    if ("error" in parsedUser || "error" in parsedUserRole) {
      return Response.json(parsedUser, { status: 422 });
    }
    const createdUser = await userService.server.createUser(parsedUser, parsedUserRole.role as Role);
    const apiKey = await apikeyService.server.createApiKey(createdUser.user.id);

    return Response.json({ ...createdUser.user, apiKey: apiKey.key }, { status: 201 });
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
      return Response.json({ error: "Internal Server Error", message: error }, { status: 500 });
    }
  }
}
