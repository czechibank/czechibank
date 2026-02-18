import { Role } from "@/lib/permissions";
import { BankAccount, Currency, PrismaClient } from "@prisma/client";
import { APIError } from "better-auth/api";
import { UserWithRole } from "better-auth/plugins";
import { auth } from "../auth";
import { SEED_USERS_LIST } from "../shared/fixtures/users";
import ensureUserBankAccounts from "./seed-helpers/ba-utils";
import { generateTransactionData } from "./seed-helpers/generate-transaction-data";
import { generateUserTransactionHistory } from "./seed-helpers/generate-user-transaction-history";
import resetBankAccountBalances from "./seed-helpers/reset-balances";
import validateSeedBankAccounts from "./seed-helpers/validation";

const prisma = new PrismaClient();

// ============================================================================
// CONFIGURATION
// ============================================================================
// Global setting: which bank account index to use for transactions (0 = first, 1 = second, etc.)
export const PRIMARY_TRANSACTION_INDEX = 1; // Uses second bank account (index 1), falls back to first if only one account exists
// Global setting: which bank account index to use for balance assignment (0 = first, 1 = second, etc.)
export const PRIMARY_BALANCE_INDEX = 0; // Default: use 1st bank account

/**
 * Seeds users into the database based on the shared fixtures.
 *
 * This function:
 * 1. Validates bank account numbers in the seed configuration
 * 2. Creates or updates users using Better Auth
 * 3. Ensures bank accounts exist for each user
 * 4. Creates API keys based on user configuration
 *
 * Handles existing users gracefully by finding and reusing them instead of failing.
 */
async function seedUsers() {
  await validateSeedBankAccounts(prisma, SEED_USERS_LIST);

  for (const userSeed of SEED_USERS_LIST) {
    try {
      console.log(`[users seed] Creating user: ${userSeed.email}`);

      let user: UserWithRole | undefined;

      try {
        const created = await auth.api.createUser({
          body: {
            email: userSeed.email,
            name: userSeed.name,
            password: userSeed.password,
            role: userSeed.role as Role,
          },
        });
        user = created.user;
      } catch (error) {
        if (
          error instanceof APIError &&
          (error.body?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" || error.body?.code === "USER_ALREADY_EXISTS")
        ) {
          const existing = (await prisma.user.findFirst({
            where: { email: userSeed.email.toLowerCase() },
          })) as UserWithRole | null;

          if (existing) {
            user = existing;
            console.log(`[users seed] User already exists: ${userSeed.email}`);
          } else {
            console.warn(`[users seed] Auth reports user exists, but Prisma cannot find it: ${userSeed.email}`);
          }
        } else {
          console.error(`[users seed] Unexpected error from auth.api.createUser for ${userSeed.email}:`, error);
        }
      }

      if (!user) {
        console.warn(
          `[users seed] No user entity resolved for ${userSeed.email}, skipping bank account setup and API keys`,
        );
        continue;
      }

      // Ensure user's bank accounts
      await ensureUserBankAccounts(prisma, user, userSeed);

      // Create API keys from fixture data
      for (let i = 0; i < userSeed.apiKeys.length; i++) {
        const keyDef = userSeed.apiKeys[i];
        console.log(`[users seed] Creating API key ${i + 1}/${userSeed.apiKeys.length} for user: ${user.email}`);
        const createdKey = await auth.api.createApiKey({ body: { userId: user.id } });

        const updateData: { key: string; expiresAt?: Date } = { key: keyDef.key };
        if (!keyDef.active) {
          const expiredDate = new Date();
          expiredDate.setDate(expiredDate.getDate() - 1);
          updateData.expiresAt = expiredDate;
        }

        await prisma.apikey.update({
          where: { id: createdKey.id },
          data: updateData,
        });
        console.log(
          `[users seed] Created ${keyDef.active ? "active" : "expired"} API key ${i + 1}/${userSeed.apiKeys.length} for user: ${user.email}`,
        );
      }
    } catch (error) {
      console.error(`[users seed] Error seeding user ${userSeed.email}:`, error);
    }
  }
}

/**
 * Generates a large number of deterministic transactions between regular users.
 *
 * Creates 10,000 transactions between users (excluding rescue funds and zero balance users).
 * Uses the global `PRIMARY_TRANSACTION_INDEX` constant to determine which bank account
 * index from each user's account array should be used for transactions.
 */
async function generateDeterministicTransactions(prisma: PrismaClient) {
  console.log(`[${new Date().toISOString()}] Starting generateDeterministicTransactions...`);

  const allUsers = await prisma.user.findMany({
    include: {
      bankAccounts: { where: { isActive: true } },
    },
  });
  console.log(`[${new Date().toISOString()}] Found ${allUsers.length} total users`);

  const regularUsers = allUsers.filter(
    (user) =>
      user.bankAccounts.length > 0 &&
      !user.bankAccounts[0].number.includes("555555555555") &&
      !user.bankAccounts[0].number.includes("444444444444") &&
      user.email !== "zero.balance@example.com",
  );
  console.log(`[${new Date().toISOString()}] Found ${regularUsers.length} regular users (excluding rescue funds)`);

  const TOTAL_TRANSACTIONS = 10000;
  console.log(`[${new Date().toISOString()}] Generating ${TOTAL_TRANSACTIONS} transaction records...`);

  // Build map of users to their transaction account based on seed config index
  const userToTransactionAccount = new Map<string, { id: string; number: string }>();
  for (const userSeed of SEED_USERS_LIST) {
    const bankAccountNumbers = userSeed.bankAccounts.map((ba) => ba.number);

    // Check if user is intentionally filtered out (rescue funds, zero balance)
    const isIntentionallyFiltered =
      bankAccountNumbers.some((n) => n.includes("555555555555") || n.includes("444444444444")) ||
      userSeed.email === "zero.balance@example.com";

    const user = regularUsers.find((u) => u.email.toLowerCase() === userSeed.email.toLowerCase());

    if (!user) {
      if (isIntentionallyFiltered) continue;
      console.warn(
        `[users seed] Seeded user ${userSeed.email} not found in regularUsers, skipping transaction account mapping`,
      );
      continue;
    }

    // Use PRIMARY_TRANSACTION_INDEX constant, but clamp to available accounts if out of bounds
    const targetIndex = Math.min(PRIMARY_TRANSACTION_INDEX, bankAccountNumbers.length - 1);
    const targetNumber = bankAccountNumbers[targetIndex];
    const account = user.bankAccounts.find((ba: BankAccount) => ba.number === targetNumber && ba.isActive);
    if (!account) {
      console.warn(
        `[users seed] Transaction account ${targetNumber} (index ${targetIndex}) not found or inactive for user ${userSeed.email}, skipping. Available: ${user.bankAccounts.map((ba) => ba.number).join(", ")}`,
      );
      continue;
    }
    userToTransactionAccount.set(user.id, { id: account.id, number: account.number });
  }
  console.log(
    `[${new Date().toISOString()}] Mapped ${userToTransactionAccount.size} seeded users to transaction accounts`,
  );

  const seededUsersOnly = regularUsers.filter((user) => userToTransactionAccount.has(user.id));
  console.log(
    `[${new Date().toISOString()}] Filtered to ${seededUsersOnly.length} seeded users for transaction generation`,
  );

  try {
    const transactions = generateTransactionData(seededUsersOnly, TOTAL_TRANSACTIONS, userToTransactionAccount);
    console.log(`[${new Date().toISOString()}] Generated ${transactions.length} transaction records`);

    const BATCH_SIZE = 100;
    for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
      const batch = transactions.slice(i, i + BATCH_SIZE);
      console.log(
        `[${new Date().toISOString()}] Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(transactions.length / BATCH_SIZE)} (${batch.length} transactions)...`,
      );

      for (const [j, transaction] of batch.entries()) {
        const transactionNumber = i + j + 1;

        try {
          await prisma.$transaction(
            async (tx) => {
              const sender = await tx.bankAccount.findUnique({
                where: { id: transaction.fromBankId },
              });

              if (!sender || sender.balance < transaction.amount) return;

              await tx.transaction.create({
                data: {
                  createdAt: transaction.createdAt,
                  amount: transaction.amount,
                  currency: transaction.currency as Currency,
                  fromBankId: transaction.fromBankId,
                  toBankId: transaction.toBankId,
                },
              });

              await tx.bankAccount.update({
                where: { id: transaction.fromBankId },
                data: { balance: { decrement: transaction.amount } },
              });

              await tx.bankAccount.update({
                where: { id: transaction.toBankId },
                data: { balance: { increment: transaction.amount } },
              });

              if (transactionNumber % 1000 === 0) {
                console.log(`[${new Date().toISOString()}] Successfully processed transaction ${transactionNumber}`);
              }
            },
            { timeout: 15000 },
          );
        } catch (error) {
          console.error(`[${new Date().toISOString()}] Error processing transaction ${transactionNumber}:`, error);
        }
      }
    }

    console.log(`[${new Date().toISOString()}] Finished processing all ${transactions.length} transactions`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Fatal error in generateDeterministicTransactions:`, error);
    throw error;
  }
}

/**
 * Main seeding function that orchestrates the entire database seeding process.
 */
async function main() {
  console.log("[users seed] Starting seed script...");
  await prisma.$connect();

  // Clean up all data first
  console.log("[users seed] Cleaning up database...");
  await prisma.$transaction([prisma.transaction.deleteMany(), prisma.apikey.deleteMany()]);
  console.log("[users seed] Database cleaned up");

  // Seed users
  await seedUsers();

  await resetBankAccountBalances(prisma, SEED_USERS_LIST);

  // Generate transactions
  await generateDeterministicTransactions(prisma);

  // Generate additional transaction history for specific users
  const allUsers = await prisma.user.findMany({
    where: {
      bankAccounts: {
        some: { isActive: true },
      },
    },
    include: {
      bankAccounts: { where: { isActive: true } },
    },
  });

  for (const userSeed of SEED_USERS_LIST) {
    if (userSeed.transactions) {
      const user = allUsers.find((u) => u.email.toLowerCase() === userSeed.email.toLowerCase());
      if (!user) {
        console.warn(
          `[users seed] User ${userSeed.email} not found in database, skipping transaction history generation`,
        );
        continue;
      }
      const currentTransactionCount = await prisma.transaction.count({
        where: {
          OR: [
            { fromBankId: { in: user.bankAccounts.map((ba) => ba.id) } },
            { toBankId: { in: user.bankAccounts.map((ba) => ba.id) } },
          ],
        },
      });

      const neededTransactions = Math.max(0, userSeed.transactions.targetCount - currentTransactionCount);

      if (neededTransactions > 0) {
        const seededUserEmails = new Set(SEED_USERS_LIST.map((u) => u.email.toLowerCase()));
        const otherUsers = allUsers.filter(
          (u) =>
            u.id !== user.id &&
            u.bankAccounts.length > 0 &&
            seededUserEmails.has(u.email.toLowerCase()) &&
            !u.bankAccounts[0].number.includes("555555555555") &&
            !u.bankAccounts[0].number.includes("444444444444"),
        );

        if (otherUsers.length > 0) {
          console.log(
            `[users seed] User ${userSeed.email} has ${currentTransactionCount} transactions, generating ${neededTransactions} more to reach ${userSeed.transactions.targetCount}`,
          );
          await generateUserTransactionHistory(prisma, user.id, neededTransactions, otherUsers);
        } else {
          console.warn(`[users seed] No other users found for generating transaction history for ${userSeed.email}`);
        }
      } else {
        console.log(
          `[users seed] User ${userSeed.email} already has ${currentTransactionCount} transactions (needed: ${userSeed.transactions.targetCount})`,
        );
      }
    }
  }

  console.log("[users seed] Finished all database operations");
}

main()
  .catch((error) => {
    console.error("[users seed] Fatal error:", error);
  })
  .finally(() => {
    prisma.$disconnect();
    console.log("[users seed] Script finished");
    process.exit(0);
  });
