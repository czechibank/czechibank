"use server";
import prisma from "@/lib/db";

/**
 * Custom user repository functions for logic not handled by better-auth.
 * All standard user CRUD/auth flows are handled by better-auth.
 */

/**
 * Regenerates a user's avatar config (custom logic, not handled by better-auth).
 */
export async function regenerateAvatarConfig(userId: string, avatarConfig: string): Promise<void> {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      image: avatarConfig,
    },
  });
}

/**
 * Finds a user by API key (if you still use API keys for custom logic).
 */
export async function getUserByApiKey(apiKey: string): Promise<any> {
  return await prisma.user.findFirst({
    where: {
      apikeys: {
        some: {
          key: apiKey,
        },
      },
    },
  });
}

export async function getAllUsers(): Promise<any> {
  return await prisma.user.findMany({
    include: {
      bankAccounts: true,
    },
  });
}
