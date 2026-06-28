import { handleCreateDropMission } from "@/app/api/v1/handlers/drops/create.handler";
import { handleListDropMissions } from "@/app/api/v1/handlers/drops/list.handler";
import { withApiHandler, withPaginatedApiHandler } from "@/lib/api/with-api-handler";
import { createPaginationMeta } from "@/lib/response";

/**
 * @swagger
 * /drops:
 *   get:
 *     summary: List drop missions
 *     description: Returns published missions for regular users; admins see all missions.
 *     tags: [Drops]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of missions
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a drop mission (admin)
 *     tags: [Drops]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Mission created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export const GET = withPaginatedApiHandler(handleListDropMissions, {
  successMessage: "Drop missions retrieved",
  transform: ({ items, total, page, limit }) => ({
    body: { missions: items },
    pagination: createPaginationMeta(page, limit, total),
  }),
});

export const POST = withApiHandler(handleCreateDropMission, {
  successMessage: "Drop mission created",
  successStatus: 201,
});
