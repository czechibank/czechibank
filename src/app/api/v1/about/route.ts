import packageJson from "@/../package.json";
import { DELETE, HEAD, OPTIONS, PATCH, POST, PUT } from "../routes";

/**
 * @swagger
 * /about:
 *   get:
 *     summary: Get API information
 *     description: Retrieves information about the API, including version and name
 *     tags: [About]
 *     responses:
 *       200:
 *         description: API information successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This is the best bank ever!
 *                 data:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       description: Current server time
 *                     name:
 *                       type: string
 *                       description: API name
 *                     version:
 *                       type: string
 *                       description: API version
 */
export async function GET(request: Request) {
  const commitHash = process.env.NEXT_PUBLIC_COMMIT_HASH || "unknown";
  return Response.json(
    {
      message: "This is the best bank ever!",
      data: {
        date: new Date(),
        name: packageJson.name,
        version: `${packageJson.version} (${commitHash})`,
      },
    },
    { status: 200 },
  );
}

export { DELETE, HEAD, OPTIONS, PATCH, POST, PUT };
