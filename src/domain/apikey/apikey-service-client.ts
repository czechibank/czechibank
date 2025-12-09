import { authClient } from "@/lib/auth-client";
import type { Apikey } from "@prisma/client";
import type { ErrorContext, SuccessContext } from "better-auth/react";
import { CreateApiKeySchema } from "./apikey-schema";

/**
 * Client-side service layer for API key domain. Uses better-auth client.
 */
const apikeyServiceClient = {
  /**
   * Creates a new API key. It also validates the input data.
   * @param name - The name of the API key.
   * @param expiresIn - The expiration time of the API key.
   * @param onSuccess - The function to call when the API key is created.
   * @param onError - The function to call when the API key is not created.
   */
  async createApiKey(
    { name, expiresInDays }: CreateApiKeySchema,
    {
      onSuccess,
      onError,
    }: { onSuccess: (context: SuccessContext<Apikey>) => void; onError: (error?: ErrorContext) => void },
  ) {
    const parsed = CreateApiKeySchema.safeParse({ name, expiresInDays });
    if (!parsed.success) {
      onError({
        error: {
          message: parsed.error.message,
        },
      } as ErrorContext);
      return;
    }
    await authClient.apiKey.create(
      {
        name,
        expiresIn: expiresInDays ? expiresInDays * 24 * 60 * 60 : undefined,
      },
      { onSuccess, onError },
    );
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
};

export default apikeyServiceClient;
