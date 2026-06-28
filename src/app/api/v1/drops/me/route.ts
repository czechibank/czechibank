import { handleGetMyDropStatus } from "@/app/api/v1/handlers/drops/me.handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * @swagger
 * /drops/me:
 *   get:
 *     summary: Current user's drop mission status
 *     description: Published missions with progress and completion for the authenticated user.
 *     tags: [Drops]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Status per mission
 *       401:
 *         description: Unauthorized
 */
export const GET = withApiHandler(handleGetMyDropStatus, {
  successMessage: "Drop status retrieved",
});
