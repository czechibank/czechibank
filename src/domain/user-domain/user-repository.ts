import { UserWithBankAccounts } from "@/components/transactions/transfer";
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

export async function getAllUsersWithBankAccounts(): Promise<UserWithBankAccounts[]> {
  return await prisma.user.findMany({
    include: {
      bankAccounts: {
        where: { isActive: true },
      },
    },
  });
}

/**
 * Deletes a user together with their bank accounts. Sessions, accounts and
 * API keys cascade via the schema. Used as compensating cleanup when a later
 * registration step fails — better-auth offers no transaction spanning user
 * creation and API key issuance.
 */
export async function deleteUserWithBankAccounts(userId: string): Promise<void> {
  await prisma.$transaction([
    prisma.bankAccount.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);
}
