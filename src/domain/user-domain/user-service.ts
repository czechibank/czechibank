// Barrel file that re-exports client and server services
// NOTE: Client components should import directly from user-service-client.ts
// to avoid bundling server-only code (auth.ts and better-auth server modules)

import userServiceClient from "./user-service-client";
import userServiceServer from "./user-service-server";

/**
 * Service layer for user domain. Orchestrates between better-auth, repositories, and other services.
 *
 * @deprecated For client components, import directly from "./user-service-client" to avoid bundling server code.
 * Server components can continue using this file.
 */
const userService = {
  client: userServiceClient,
  server: userServiceServer,
};

export default userService;
