import {
  handleDeleteDropMissionBySlug,
  handleGetDropMissionBySlug,
  handleUpdateDropMissionBySlug,
} from "@/app/api/v1/handlers/drops/by-slug.handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * @swagger
 * /drops/{slug}:
 *   get:
 *     summary: Get a drop mission by slug
 *     tags: [Drops]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Mission found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update a drop mission (admin)
 *     tags: [Drops]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Updated
 *       403:
 *         description: Forbidden
 *   delete:
 *     summary: Delete a drop mission (admin)
 *     tags: [Drops]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Deleted
 *       403:
 *         description: Forbidden
 */
export const GET = withApiHandler(handleGetDropMissionBySlug, {
  successMessage: "Drop mission retrieved",
});

export const PUT = withApiHandler(handleUpdateDropMissionBySlug, {
  successMessage: "Drop mission updated",
});

export const DELETE = withApiHandler(handleDeleteDropMissionBySlug, {
  successMessage: "Drop mission deleted",
});
