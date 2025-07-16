"use server";
import prisma from "@/lib/db";
import { ApiErrorCode, errorResponse, successResponse } from "@/lib/response";

/**
 * Custom user repository functions for logic not handled by better-auth.
 * All standard user CRUD/auth flows are handled by better-auth.
 */

/**
 * Regenerates a user's API key (custom logic, not handled by better-auth).
 */
export async function regenerateApiKey(userId: string) {
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      apiKey: Math.random().toString(36).substring(2),
    },
  });

  return successResponse("API key regenerated", user);
}

/**
 * Regenerates a user's avatar config (custom logic, not handled by better-auth).
 */
export async function regenerateAvatarConfig(userId: string, avatarConfig: string) {
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      avatarConfig: JSON.stringify(avatarConfig),
    },
  });
  if ("error" in user) {
    return errorResponse("An error occurred while regenerating the avatar config", ApiErrorCode.OPERATION_FAILED);
  }

  return successResponse("Avatar config regenerated", user);
}

/**
 * Finds a user by API key (if you still use API keys for custom logic).
 */
export async function getUserByApiKey(apiKey: string) {
  const user = await prisma.user.findFirst({
    where: {
      apiKey: apiKey,
    },
  });

  return user;
}
