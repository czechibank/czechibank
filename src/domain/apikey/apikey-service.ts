import { authClient } from "@/lib/auth-client";
import type { Apikey } from "@prisma/client";
import type { ErrorContext, SuccessContext } from "better-auth/react";
import { auth } from "../../../auth";
import { CreateApiKeySchema } from "./apikey-schema";

const apikeyService = {
  client: {
    /**
     * Creates a new API key. It also validates the input data.
     * @param name - The name of the API key.
     * @param expiresIn - The expiration time of the API key.
     * @param onSuccess - The function to call when the API key is created.
     * @param onError - The function to call when the API key is not created.
     */
    async createApiKey(
      { name, expiresIn }: CreateApiKeySchema,
      {
        onSuccess,
        onError,
      }: { onSuccess: (context: SuccessContext<Apikey>) => void; onError: (error?: ErrorContext) => void },
    ) {
      const parsed = CreateApiKeySchema.safeParse({ name, expiresIn });
      if (!parsed.success) {
        onError({
          error: {
            message: parsed.error.message,
          },
        } as ErrorContext);
        return;
      }
      await authClient.apiKey.create(parsed.data, { onSuccess, onError });
    },

    /**
     * Deletes an API key.
     * @param keyId - The ID of the API key to delete.
     * @param onSuccess - The function to call when the API key is deleted.
     * @param onError - The function to call when the API key is not deleted.
     */
    async deleteApiKey(
      keyId: string,
      { onSuccess, onError }: { onSuccess: () => void; onError: (error?: ErrorContext) => void },
    ) {
      await authClient.apiKey.delete({ keyId }, { onSuccess, onError });
    },
  },
  server: {
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
  },
};

export default apikeyService;
