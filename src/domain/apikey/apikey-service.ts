// Barrel file that re-exports client and server services
// NOTE: Client components should import directly from apikey-service-client.ts
// to avoid bundling server-only code (auth.ts and better-auth server modules)

import apikeyServiceClient from "./apikey-service-client";
import apikeyServiceServer from "./apikey-service-server";

/**
 * Service layer for API key domain.
 *
 * @deprecated For client components, import directly from "./apikey-service-client" to avoid bundling server code.
 * Server components can continue using this file.
 */
const apikeyService = {
  client: apikeyServiceClient,
  server: apikeyServiceServer,
};

export default apikeyService;
