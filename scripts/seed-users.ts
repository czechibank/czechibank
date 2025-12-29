import { Role } from "@/lib/permissions";
import { Currency, PrismaClient } from "@prisma/client";
import { APIError } from "better-auth/api";
import { UserWithRole } from "better-auth/plugins";
import { auth } from "../auth";
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
const PRIMARY_TRANSACTION_INDEX = 1; // Default: use first bank account

// ============================================================================
// SEED CONFIGURATION
// ============================================================================
// nemazat existujici uzivatele, jen pridavat nove
// resetovat bankovni ucty - a to jen hodnoty

// endpoint pro admina - /api/v1/admin/wipe-db
//

// Helper function to generate a 64-character API key
function generateApiKey(startingValue: string = "", length: number = 64): string {
  return startingValue + "0".repeat(length - startingValue.length);
}

export type UserSeedConfig = {
  email: string;
  name: string;
  password: string;
  avatarConfig: string;
  bankAccountNumber: string | string[];
  apiKey?: string;
  role: "admin" | "user";
  // New fields for special configurations
  balance?: number; // Custom balance (default: 0)
  apiKeyActiveCount?: number; // Number of API keys to create (default: 1)
  hasExpiredApiKey?: boolean; // Create one expired and one active key
  skipApiKey?: boolean; // Don't create any API keys
  needsTransactionHistory?: boolean; // Mark user for transaction history generation
  transactionCount?: number; // Number of transactions for this user
  primaryBalanceIndex?: number; // Which BA gets the 100k/Seed balance (Default BA index: 0)
  primaryTransactionIndex?: number; // Which BA gets involved in the 10,000 seed transactions (Default BA index: 0)
};

export const adminUserToSeed: Omit<
  UserSeedConfig,
  "balance" | "apiKeyActiveCount" | "hasExpiredApiKey" | "skipApiKey" | "needsTransactionHistory" | "transactionCount"
> = {
  email: "app_admin@email.com",
  name: "App Admin",
  password: "app_admin",
  avatarConfig:
    '{"backgroundColor":["C4DD68"],"eyebrows":["variant12"], eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant03"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["happy05"],"mouthColor":["000000"],"nose":["variant06"],"noseColor":["000000"]}',
  bankAccountNumber: "000000000000/5555",
  apiKey: "app_admin_key",
  role: "admin",
};

const usersToSeed: UserSeedConfig[] = [
  // Admin user
  {
    ...adminUserToSeed,
    balance: undefined,
    apiKeyActiveCount: 1,
  },
  // Rescue funds
  {
    email: "zachranNas+praha@pejsekAKocicka.cz",
    name: "[OSTRAVA!!!] Pejsek a Kočicka 🐶&🐱",
    password: "PejsekAKocicka123",
    avatarConfig:
      '{"backgroundColor":["696AC9"],"eyebrows":["variant12"],"eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant03"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["happy05"],"mouthColor":["000000"],"nose":["variant06"],"noseColor":["000000"]}',
    bankAccountNumber: "555555555555/5555",
    apiKey: "11",
    role: "user",
    balance: undefined,
    apiKeyActiveCount: 1,
  },
  {
    email: "zachranNas+brno@pejsekAKocicka.cz",
    name: "[BRNO] Pejsek a Kočička 🐶&🐱",
    password: "PejsekAKocicka123",
    avatarConfig:
      '{"backgroundColor":["0DC681"],"eyebrows":["variant12"],"eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant03"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["happy05"],"mouthColor":["000000"],"nose":["variant06"],"noseColor":["000000"]}',
    bankAccountNumber: "444444444444/5555",
    apiKey: "22",
    role: "user",
    balance: undefined,
    apiKeyActiveCount: 1,
  },
  // Core team
  {
    email: "vojta@czechibank.ostrava.digital",
    name: "Vojta 🦊 🎉 Cerveny",
    password: "hello123456",
    avatarConfig:
      '{"backgroundColor":["ff0000"],"eyebrows":["variant11"],"eyebrowsColor":["ffffff"],"eyes":["variant01"],"eyesColor":["ffffff"],"freckles":["variant01"],"frecklesColor":["ffffff"],"frecklesProbability":[null],"glasses":["variant01"],"glassesColor":["ffffff"],"glassesProbability":[null],"mouth":["happy04"],"mouthColor":["ffffff"],"nose":["variant04"],"noseColor":["ffffff"]}',
    bankAccountNumber: ["000000000001/5555", "100000001001/5555", "100000001021/5555"],
    apiKey: "33",
    role: "admin",
    balance: undefined,
    apiKeyActiveCount: 1,
  },
  // New users based on requirements
  // 1. Standard user - new account, new API key, standard balance
  {
    email: "standard.user@example.com",
    name: "Standard User",
    password: "password123",
    avatarConfig:
      '{"backgroundColor":["4A90E2"],"eyebrows":["variant12"],"eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant01"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["happy01"],"mouthColor":["000000"],"nose":["variant01"],"noseColor":["000000"]}',
    bankAccountNumber: "100000000001/5555",
    apiKey: "standard_user_key_1",
    role: "user",
    balance: 100_000, // Standard balance
    apiKeyActiveCount: 1,
  },
  // 2. Standard user - regular account with 0 balance
  {
    email: "zero.balance@example.com",
    name: "Zero Balance User",
    password: "password123",
    avatarConfig:
      '{"backgroundColor":["E24A4A"],"eyebrows":["variant12"],"eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant01"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["sad01"],"mouthColor":["000000"],"nose":["variant01"],"noseColor":["000000"]}',
    bankAccountNumber: ["100000000002/5555", "100000010011/5555"],
    apiKey: "zero_balance_key",
    role: "user",
    balance: 0,
    apiKeyActiveCount: 1,
  },
  // 3. Standard user with high balance and history of 100+ transactions
  {
    email: "high.balance@example.com",
    name: "High Balance User",
    password: "password123",
    avatarConfig:
      '{"backgroundColor":["4AE24A"],"eyebrows":["variant12"],"eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant02"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["happy03"],"mouthColor":["000000"],"nose":["variant01"],"noseColor":["000000"]}',
    bankAccountNumber: ["100000000003/5555", "100009000003/5555"],
    apiKey: "high_balance_key",
    role: "user",
    balance: 1_000_000, // High balance
    apiKeyActiveCount: 1,
    needsTransactionHistory: true,
    transactionCount: 150, // 100+ transactions
  },
  // 4. Standard user with multiple API keys (e.g., 5)
  {
    email: "multiple.keys@example.com",
    name: "Multiple Keys User",
    password: "password123",
    avatarConfig:
      '{"backgroundColor":["E24AE2"],"eyebrows":["variant12"],"eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant03"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["happy02"],"mouthColor":["000000"],"nose":["variant01"],"noseColor":["000000"]}',
    bankAccountNumber: "100000000004/5555",
    apiKey: "multiple_keys_key_1",
    role: "user",
    balance: 50000,
    apiKeyActiveCount: 5,
  },
  // 5. Standard user with expired API key - 1 expired key, 1 active key
  {
    email: "expired.key@example.com",
    name: "Expired Key User",
    password: "password123",
    avatarConfig:
      '{"backgroundColor":["E2E24A"],"eyebrows":["variant12"],"eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant01"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["neutral01"],"mouthColor":["000000"],"nose":["variant01"],"noseColor":["000000"]}',
    bankAccountNumber: "100000000005/5555",
    apiKey: "expired_key_active",
    role: "user",
    balance: 75000,
    apiKeyActiveCount: 2,
    hasExpiredApiKey: true,
  },
  // 6. Standard user without API key
  {
    email: "no.apikey@example.com",
    name: "No API Key User",
    password: "password123",
    avatarConfig:
      '{"backgroundColor":["4A4AE2"],"eyebrows":["variant12"],"eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant01"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["neutral02"],"mouthColor":["000000"],"nose":["variant01"],"noseColor":["000000"]}',
    bankAccountNumber: "100000000006/5555",
    role: "user",
    balance: 25000,
    skipApiKey: true,
  },
];

async function seedUsers() {
  // Validate seed BA numbers before modifying DB
  await validateSeedBankAccounts(prisma, usersToSeed);

  for (const userSeed of usersToSeed) {
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
          // zachranNas+praha@pejsekAKocicka.cz
          const existing = (await prisma.user.findFirst({
            where: { email: userSeed.email.toLowerCase() },
          })) as UserWithRole | null;

          if (existing) {
            user = existing;
            console.log(`[users seed] User already exists: ${userSeed.email}`);
          } else {
            console.warn(`[users seed] Auth reports user exists, but Prisma cannot find it: ${userSeed.email}`);
            console.log("💚💚💚 user", user);
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

      // Ensure user's bank accounts (supports array in seed)
      await ensureUserBankAccounts(prisma, user, userSeed);

      // Handle API keys based on configuration
      if (userSeed.skipApiKey) {
        console.log(`[users seed] Skipping API key creation for user: ${user.email}`);
      } else {
        const apiKeyActiveCount = userSeed.apiKeyActiveCount || 1;
        const hasExpiredKey = userSeed.hasExpiredApiKey || false;

        if (hasExpiredKey) {
          // Create one expired key and one active key
          console.log(`[users seed] Creating expired API key for user: ${user.email}`);
          const expiredApiKey = await auth.api.createApiKey({ body: { userId: user.id } });
          const expiredDate = new Date();
          expiredDate.setDate(expiredDate.getDate() - 1);
          await prisma.apikey.update({
            where: { id: expiredApiKey.id },
            data: {
              key: generateApiKey("expired_" + user.email),
              expiresAt: expiredDate,
            },
          });
          console.log(`[users seed] Created expired API key (64 chars) for user: ${user.email}`);
        } else {
          // Create multiple API keys or single key
          for (let i = 0; i < apiKeyActiveCount; i++) {
            console.log(`[users seed] Creating API key ${i + 1}/${apiKeyActiveCount} for user: ${user.email}`);
            const apiKey = await auth.api.createApiKey({ body: { userId: user.id } });
            const keyValue = generateApiKey("key_" + "_" + i + "_" + user.email);
            await prisma.apikey.update({
              where: { id: apiKey.id },
              data: { key: keyValue },
            });
            console.log(
              `[users seed] Created API key ${i + 1}/${apiKeyActiveCount} (64 chars) for user: ${user.email}`,
            );
          }
        }
      }
    } catch (error) {
      console.error(`[users seed] Error seeding user ${userSeed.email}:`, error);
    }
  }
}

// Generate deterministic transactions between users
async function generateDeterministicTransactions(prisma: PrismaClient) {
  console.log(`[${new Date().toISOString()}] Starting generateDeterministicTransactions...`);

  const allUsers = await prisma.user.findMany({
    include: {
      bankAccounts: { where: { isActive: true } },
    },
  });
  console.log(`[${new Date().toISOString()}] Found ${allUsers.length} total users`);

  // Filter out rescue fund accounts
  const regularUsers = allUsers.filter(
    (user) =>
      user.bankAccounts.length > 0 &&
      !user.bankAccounts[0].number.includes("555555555555") &&
      !user.bankAccounts[0].number.includes("444444444444") &&
      user.email !== "zero.balance@example.com",
  );
  console.log(`[${new Date().toISOString()}] Found ${regularUsers.length} regular users (excluding rescue funds)`);

  const TOTAL_TRANSACTIONS = 10000; // Increased from 1000 to 10000
  console.log(`[${new Date().toISOString()}] Generating ${TOTAL_TRANSACTIONS} transaction records...`);

  // Build map of users to their transaction account based on seed config index
  const userToTransactionAccount = new Map<string, { id: string; number: string }>();
  for (const userSeed of usersToSeed) {
    const user = regularUsers.find((u) => u.email === userSeed.email);
    if (user) {
      const bankAccountNumbers = Array.isArray(userSeed.bankAccountNumber)
        ? userSeed.bankAccountNumber
        : [userSeed.bankAccountNumber];
      const targetIndex = Math.min(PRIMARY_TRANSACTION_INDEX, bankAccountNumbers.length - 1);
      const targetNumber = bankAccountNumbers[targetIndex];
      const account = user.bankAccounts.find((ba: any) => ba.number === targetNumber && ba.isActive);
      if (account) {
        userToTransactionAccount.set(user.id, { id: account.id, number: account.number });
      }
    }
  }

  try {
    // Generate all transaction data first
    const transactions = generateTransactionData(regularUsers, TOTAL_TRANSACTIONS, userToTransactionAccount);
    console.log(`[${new Date().toISOString()}] Generated ${transactions.length} transaction records`);

    // Process transactions in batches
    const BATCH_SIZE = 100; // Increased from 50 to 100 for better performance
    for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
      const batch = transactions.slice(i, i + BATCH_SIZE);
      console.log(
        `[${new Date().toISOString()}] Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(transactions.length / BATCH_SIZE)} (${batch.length} transactions)...`,
      );

      // Process transactions in parallel within each batch
      for (const [j, transaction] of batch.entries()) {
        const transactionNumber = i + j + 1;

        try {
          // We use a sequential loop so we don't overwhelm the DB connection limit (5)
          await prisma.$transaction(
            async (tx) => {
              // 1. Get real-time balance to ensure sender has enough money
              const sender = await tx.bankAccount.findUnique({
                where: { id: transaction.fromBankId },
              });

              if (!sender || sender.balance < transaction.amount) {
                // Skip if no funds - History record is NOT created here
                return;
              }

              // 2. Create history
              await tx.transaction.create({
                data: {
                  createdAt: transaction.createdAt,
                  amount: transaction.amount,
                  currency: transaction.currency as Currency,
                  fromBankId: transaction.fromBankId,
                  toBankId: transaction.toBankId,
                },
              });

              // 3. Update balances using atomic math operations
              await tx.bankAccount.update({
                where: { id: transaction.fromBankId },
                data: { balance: { decrement: transaction.amount } },
              });

              await tx.bankAccount.update({
                where: { id: transaction.toBankId },
                data: { balance: { increment: transaction.amount } },
              });

              // 4. Progress Logging (Kept from your original logic)
              if (transactionNumber % 1000 === 0) {
                console.log(`[${new Date().toISOString()}] Successfully processed transaction ${transactionNumber}`);
              }
            },
            {
              // Increased timeout specifically for seeding 10k records
              timeout: 15000,
            },
          );
        } catch (error) {
          // Error logging preserved from your original code
          console.error(`[${new Date().toISOString()}] Error processing transaction ${transactionNumber}:`, error);
          // No 'throw' here ensures the rest of the batch continues even if one fails
        }
      }
    }

    console.log(`[${new Date().toISOString()}] Finished processing all ${transactions.length} transactions`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Fatal error in generateDeterministicTransactions:`, error);
    throw error;
  }
}

async function main() {
  console.log("[users seed] Starting seed script...");
  await prisma.$connect();

  // Clean up all data first
  console.log("[users seed] Cleaning up database...");
  await prisma.$transaction([
    prisma.transaction.deleteMany(),
    prisma.apikey.deleteMany(),
    // prisma.bankAccount.deleteMany(),
    // prisma.user.deleteMany(),
  ]);
  console.log("[users seed] Database cleaned up");

  // Seed users
  await seedUsers();

  await resetBankAccountBalances(prisma, usersToSeed);

  // Generate transactions (keep your existing logic here)
  await generateDeterministicTransactions(prisma);

  // Generate additional transaction history for users who need it (after general transactions)
  const allUsers = await prisma.user.findMany({
    include: {
      bankAccounts: { where: { isActive: true } },
    },
  });

  for (const userSeed of usersToSeed) {
    if (userSeed.needsTransactionHistory && userSeed.transactionCount) {
      const user = allUsers.find((u) => u.email === userSeed.email);
      if (user) {
        // Get current transaction count for this user
        const currentTransactionCount = await prisma.transaction.count({
          where: {
            OR: [
              { fromBankId: { in: user.bankAccounts.map((ba) => ba.id) } },
              { toBankId: { in: user.bankAccounts.map((ba) => ba.id) } },
            ],
          },
        });

        const neededTransactions = Math.max(0, userSeed.transactionCount - currentTransactionCount);

        if (neededTransactions > 0) {
          // Get other users (excluding rescue funds and the current user)
          const otherUsers = allUsers.filter(
            (u) =>
              u.id !== user.id &&
              u.bankAccounts.length > 0 &&
              !u.bankAccounts[0].number.includes("555555555555") &&
              !u.bankAccounts[0].number.includes("444444444444"),
          );

          if (otherUsers.length > 0) {
            console.log(
              `[users seed] User ${userSeed.email} has ${currentTransactionCount} transactions, generating ${neededTransactions} more to reach ${userSeed.transactionCount}`,
            );
            await generateUserTransactionHistory(prisma, user.id, neededTransactions, otherUsers);
          } else {
            console.warn(`[users seed] No other users found for generating transaction history for ${userSeed.email}`);
          }
        } else {
          console.log(
            `[users seed] User ${userSeed.email} already has ${currentTransactionCount} transactions (needed: ${userSeed.transactionCount})`,
          );
        }
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
