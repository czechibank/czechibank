export { DELETE, HEAD, OPTIONS, PATCH, PUT } from "../../routes";

import apikeyService from "@/domain/apikey/apikey-service";
import { UserSchema } from "@/domain/user-domain/user-schema";
import userService from "@/domain/user-domain/user-service";
import { fromUnknown } from "@/lib/errors";
import { toApiResponse, validateWithResult } from "@/lib/result-helpers";
import { ResultAsync } from "neverthrow";

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
  const result = ResultAsync.fromPromise(request.json(), () => fromUnknown(null, "Invalid JSON body"))
    .andThen((body) => validateWithResult(UserSchema, body))
    .andThen((parsedUser) =>
      ResultAsync.fromPromise(userService.server.createUser(parsedUser, "user"), (e) =>
        fromUnknown(e, "Failed to create user"),
      ),
    )
    .andThen((createdUser) =>
      ResultAsync.fromPromise(apikeyService.server.createApiKey(createdUser.user.id), (e) =>
        fromUnknown(e, "Failed to create API key"),
      ).map((apiKey) => ({ ...createdUser.user, apiKey: apiKey.key })),
    );

  return toApiResponse(result, "User created successfully", 201);
}
