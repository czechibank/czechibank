import packageJson from "@/../package.json";
import { execSync } from "child_process";
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
 *                       example: czechibank
 *                     version:
 *                       type: string
 *                       description: API version and short commit hash
 *                       example: 0.1.4 (abc1234)
 */
export async function GET(request: Request) {
  // Use shortened commit hash from Coolify (SOURCE_COMMIT), fallback to Git when running locally, then "unknown"
  let commitHash =
    process.env.SOURCE_COMMIT?.substring(0, 7) ||
    (() => {
      try {
        return execSync("git rev-parse --short HEAD").toString().trim();
      } catch {
        return "unknown";
      }
    })();

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
