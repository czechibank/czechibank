export { DELETE, HEAD, OPTIONS, PATCH, PUT } from "../../routes";

import { UserSchema } from "@/domain/user-domain/user-schema";
import userService from "@/domain/user-domain/user-service";

import { ApiErrorCode, validateEventHandler } from "@/lib/response";
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
    if ("error" in parsedUser) {
      return Response.json(parsedUser, { status: 422 });
    }
    const response = await userService.createUserFromEmail(parsedUser, true);
    console.log("response", response);
    if (!response.success) {
      if (response.error?.code === ApiErrorCode.EMAIL_ALREADY_EXISTS) {
        return Response.json(response, { status: 400 });
      }
      return Response.json(response);
    }

    return Response.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return handleErrors(error);
    } else {
      return Response.json({ error: "Internal Server Error", message: error }, { status: 500 });
    }
  }
}
