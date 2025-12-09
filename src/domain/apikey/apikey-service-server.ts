import { auth } from "../../../auth";

/**
 * Server-side service layer for API key domain. Uses better-auth server API.
 */
const apikeyServiceServer = {
  /**
   * List the API keys for a user
   * @param session - The session of the user
   * @returns The API keys
   */
  async listUserApiKey(headers: Headers) {
    return await auth.api.listApiKeys({ headers });
  },

  /**
   * Create an API key for a user
   * @param userId - The ID of the user to create the API key for
   * @returns The API key
   */
  async createApiKey(userId: string) {
    return await auth.api.createApiKey({
      body: {
        userId,
      },
    });
  },

  /**
   * Verify an API key via better-auth on server side
   * @param apiKey - The API key to verify
   * @returns The API key
   */
  async verifyApiKey(apiKey: string) {
    return await auth.api.verifyApiKey({
      body: {
        key: apiKey,
      },
    });
  },
};

export default apikeyServiceServer;
