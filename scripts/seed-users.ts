import { Role } from "@/lib/permissions";
import { Currency, PrismaClient } from "@prisma/client";
import { APIError } from "better-auth/api";
import { UserWithRole } from "better-auth/plugins";
import { auth } from "../auth";

const prisma = new PrismaClient();

// nemazat existujici uzivatele, jen pridavat nove
// resetovat bankovni ucty - a to jen hodnoty

// endpoint pro admina - /api/v1/admin/wipe-db
//

// Helper function to generate a 64-character API key
function generateApiKey(startingValue: string = "", length: number = 64): string {
  return startingValue + "0".repeat(length - startingValue.length);
}

type UserSeedConfig = {
  email: string;
  name: string;
  password: string;
  avatarConfig: string;
  bankAccountNumber: string;
  apiKey?: string;
  role: "admin" | "user";
  // New fields for special configurations
  balance?: number; // Custom balance (default: 0)
  apiKeyActiveCount?: number; // Number of API keys to create (default: 1)
  hasExpiredApiKey?: boolean; // Create one expired and one active key
  skipApiKey?: boolean; // Don't create any API keys
  needsTransactionHistory?: boolean; // Mark user for transaction history generation
  transactionCount?: number; // Number of transactions for this user
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
    bankAccountNumber: "000000000001/5555",
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
    bankAccountNumber: "100000000002/5555",
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
    bankAccountNumber: "100000000003/5555",
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
  for (const userSeed of usersToSeed) {
    try {
      console.log(`[users seed] Creating user: ${userSeed.email}`);
      let response: UserWithRole | undefined;
      try {
        const user = await auth.api.createUser({
          body: {
            email: userSeed.email,
            name: userSeed.name,
            password: userSeed.password,
            role: userSeed.role as Role,
          },
        });
        response = user.user;
      } catch (error) {
        if (error instanceof APIError) {
          if (error.body?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
            // zachranNas+praha@pejsekAKocicka.cz
            const user = (await prisma.user.findFirst({
              where: { email: userSeed.email.toLowerCase() },
            })) as UserWithRole;
            response = user;
            console.log(`[users seed] User already exists: ${userSeed.email}`);
            console.log("💚💚💚 user", user);
          }
        }
      }

      const user: UserWithRole = response!;

      // Update bank account number and balance
      const bankAccount = await prisma.bankAccount.findFirst({ where: { userId: user.id, isActive: true } });
      if (bankAccount) {
        const updateData: { number: string; isActive: boolean; balance?: number } = {
          number: Array.isArray(userSeed.bankAccountNumber)
            ? userSeed.bankAccountNumber[0]
            : userSeed.bankAccountNumber,
          isActive: true,
        };
        if (userSeed.balance !== undefined) {
          updateData.balance = userSeed.balance;
        }
        await prisma.bankAccount.update({
          where: { id: bankAccount.id },
          data: updateData,
        });
        console.log(
          `[users seed] Updated bank account number${userSeed.balance !== undefined ? ` and balance (${userSeed.balance})` : ""} for user: ${user.email}`,
        );
      } else {
        console.warn(`[users seed] No bank account found for user: ${user.email}`);
      }

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
          expiredDate.setDate(expiredDate.getDate() - 1); // Expired yesterday
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
            // Generate 64-character API key
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

// Helper function to generate deterministic random numbers
function seededRandom(seed: number, offset: number = 0) {
  // Use a more stable random number generation
  const x = Math.sin(seed + offset) * 10000;
  const result = x - Math.floor(x);

  // Add logging for seed 4 to debug the issue
  if (seed === 4) {
    console.log(`[${new Date().toISOString()}] Debugging seed 4 with offset ${offset}...`);
    console.log(`[${new Date().toISOString()}] seed 4 calculation:`, { x, result });
  }

  return result;
}

// Test the seededRandom function with more test cases
console.log(`[${new Date().toISOString()}] Testing seededRandom function...`);
for (let i = 0; i < 10; i++) {
  console.log(`[${new Date().toISOString()}] seededRandom(${i}) = ${seededRandom(i)}`);
}

// Generate transaction data
function generateTransactionData(regularUsers: any[], totalTransactions: number) {
  console.log(
    `[${new Date().toISOString()}] Starting generateTransactionData with ${regularUsers.length} users and ${totalTransactions} transactions`,
  );
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  const transactions = [];

  // Track transaction patterns
  const transactionPatterns = new Map<string, Map<string, number>>();
  regularUsers.forEach((user) => {
    transactionPatterns.set(user.name, new Map());
    regularUsers.forEach((otherUser) => {
      transactionPatterns.get(user.name)!.set(otherUser.name, 0);
    });
  });

  // Log user information for debugging
  console.log(
    `[${new Date().toISOString()}] Regular users:`,
    regularUsers.map((u) => {
      const activeBA = u.bankAccounts.find((ba: any) => ba.isActive);
      return {
        id: u.id,
        name: u.name,
        accountId: activeBA?.id,
        balance: activeBA?.balance,
      };
    }),
  );

  for (let i = 0; i < totalTransactions; i++) {
    try {
      const seed = i;

      // Generate random but deterministic sender and receiver
      const senderIndex = Math.floor(seededRandom(seed, 0) * regularUsers.length);
      let receiverIndex = Math.floor(seededRandom(seed, 1) * regularUsers.length);
      let retryCount = 0;
      const MAX_RETRIES = 5;

      // Ensure sender and receiver are different
      while (receiverIndex === senderIndex && retryCount < MAX_RETRIES) {
        receiverIndex = Math.floor(seededRandom(seed, 2 + retryCount) * regularUsers.length);
        retryCount++;
      }

      // If we couldn't find a different receiver after max retries, skip this transaction
      if (receiverIndex === senderIndex) {
        console.log(
          `[${new Date().toISOString()}] Skipping transaction ${i + 1} - couldn't find different receiver after ${MAX_RETRIES} retries`,
        );
        continue;
      }

      const sender = regularUsers[senderIndex];
      const receiver = regularUsers[receiverIndex];

      // Track transaction pattern
      const currentCount = transactionPatterns.get(sender.name)!.get(receiver.name)!;
      transactionPatterns.get(sender.name)!.set(receiver.name, currentCount + 1);

      // Generate random but deterministic amount between 100 and 10000
      const amount = Math.floor(100 + seededRandom(seed, 3) * 9900);

      // Generate random but deterministic timestamp within the 6-month period
      const timeOffset = Math.floor(seededRandom(seed, 4) * (now.getTime() - sixMonthsAgo.getTime()));
      const transactionDate = new Date(sixMonthsAgo.getTime() + timeOffset);

      // Log progress every 100 transactions
      if (i % 100 === 0) {
        console.log(`[${new Date().toISOString()}] Generated ${i} transactions so far...`);
      }

      const senderAccount = sender.bankAccounts.find((ba: any) => ba.isActive);
      const receiverAccount = receiver.bankAccounts.find((ba: any) => ba.isActive);
      if (!senderAccount || !receiverAccount) {
        console.warn(
          `[${new Date().toISOString()}] Skipping transaction ${i + 1} - sender or receiver has no active account`,
        );
        continue; // Skip this transaction safely
      }
      transactions.push({
        createdAt: transactionDate,
        amount,
        currency: "CZECHITOKEN",
        fromBankId: senderAccount.id,
        toBankId: receiverAccount.id,
        senderBalance: senderAccount.balance - amount,
        receiverBalance: receiverAccount.balance + amount,
        senderAccountId: senderAccount.id,
        receiverAccountId: receiverAccount.id,
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error generating transaction ${i}:`, error);
      throw error;
    }
  }

  // Log transaction patterns
  console.log(`\n[${new Date().toISOString()}] Transaction Patterns:`);
  console.log("From -> To: Count");
  console.log("----------------");
  transactionPatterns.forEach((receivers, sender) => {
    receivers.forEach((count, receiver) => {
      console.log(`${sender} -> ${receiver}: ${count}`);
    });
    console.log("----------------");
  });

  console.log(`[${new Date().toISOString()}] Finished generating ${transactions.length} transactions`);
  return transactions;
}

// Generate transaction history for a specific user
async function generateUserTransactionHistory(
  prisma: PrismaClient,
  userId: string,
  transactionCount: number,
  otherUsers: any[],
) {
  console.log(
    `[users seed] Generating ${transactionCount} transactions for user ${userId} with ${otherUsers.length} other users`,
  );

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { bankAccounts: { where: { isActive: true } } },
  });

  if (!user || user.bankAccounts.length === 0) {
    console.warn(`[users seed] User ${userId} not found or has no bank account, skipping transaction generation`);
    return;
  }

  const userAccount = user.bankAccounts[0];
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  // Get other users' bank accounts
  const otherAccounts = [];
  for (const otherUser of otherUsers) {
    const accounts = await prisma.bankAccount.findMany({
      where: { userId: otherUser.id, isActive: true },
    });
    if (accounts.length > 0) {
      otherAccounts.push(accounts[0]);
    }
  }

  if (otherAccounts.length === 0) {
    console.warn(`[users seed] No other accounts found for transaction generation`);
    return;
  }

  let currentBalance = userAccount.balance || 0;

  for (let i = 0; i < transactionCount; i++) {
    try {
      const seed = i + 10000; // Use different seed to avoid conflicts
      const isIncoming = seededRandom(seed, 0) > 0.5; // 50% chance of incoming vs outgoing
      const otherAccount = otherAccounts[Math.floor(seededRandom(seed, 1) * otherAccounts.length)];
      const amount = Math.floor(100 + seededRandom(seed, 2) * 9900);
      const timeOffset = Math.floor(seededRandom(seed, 3) * (now.getTime() - sixMonthsAgo.getTime()));
      const transactionDate = new Date(sixMonthsAgo.getTime() + timeOffset);

      if (isIncoming) {
        // Incoming transaction - fetch current balances
        const currentSenderAccount = await prisma.bankAccount.findUnique({
          where: { id: otherAccount.id },
        });
        const currentUserAccount = await prisma.bankAccount.findUnique({
          where: { id: userAccount.id },
        });

        if (!currentSenderAccount || !currentUserAccount) {
          console.warn(`[users seed] Account not found, skipping transaction ${i + 1}`);
          continue;
        }

        // Only create transaction if sender has enough balance
        if (currentSenderAccount.balance >= amount) {
          const transaction = await prisma.transaction.create({
            data: {
              createdAt: transactionDate,
              amount,
              currency: "CZECHITOKEN",
              fromBankId: otherAccount.id,
              toBankId: userAccount.id,
            },
          });

          currentBalance = currentUserAccount.balance + amount;
          await prisma.bankAccount.update({
            where: { id: userAccount.id },
            data: { balance: currentBalance },
          });

          // Update sender balance (decrease)
          const senderBalance = currentSenderAccount.balance - amount;
          await prisma.bankAccount.update({
            where: { id: otherAccount.id },
            data: { balance: Math.max(0, senderBalance) },
          });
        }
      } else {
        // Outgoing transaction (only if user has enough balance)
        const currentUserAccount = await prisma.bankAccount.findUnique({
          where: { id: userAccount.id },
        });
        const currentReceiverAccount = await prisma.bankAccount.findUnique({
          where: { id: otherAccount.id },
        });

        if (!currentUserAccount || !currentReceiverAccount) {
          console.warn(`[users seed] Account not found, skipping transaction ${i + 1}`);
          continue;
        }

        if (currentUserAccount.balance >= amount) {
          const transaction = await prisma.transaction.create({
            data: {
              createdAt: transactionDate,
              amount,
              currency: "CZECHITOKEN",
              fromBankId: userAccount.id,
              toBankId: otherAccount.id,
            },
          });

          currentBalance = currentUserAccount.balance - amount;
          await prisma.bankAccount.update({
            where: { id: userAccount.id },
            data: { balance: currentBalance },
          });

          // Update receiver balance (increase)
          const receiverBalance = currentReceiverAccount.balance + amount;
          await prisma.bankAccount.update({
            where: { id: otherAccount.id },
            data: { balance: receiverBalance },
          });
        }
      }

      if ((i + 1) % 50 === 0) {
        console.log(`[users seed] Generated ${i + 1}/${transactionCount} transactions for user ${userId}`);
      }
    } catch (error) {
      console.error(`[users seed] Error generating transaction ${i + 1} for user ${userId}:`, error);
    }
  }

  console.log(`[users seed] Finished generating ${transactionCount} transactions for user ${userId}`);
}

async function resetBankAccountBalances(prisma: PrismaClient, users: UserSeedConfig[]) {
  console.log(`[users seed] Resetting bank account balances for ${users.length} users`);
  for (const user of users) {
    const bankAccounts = await prisma.bankAccount.findMany({
      where: { isActive: true, user: { email: user.email } },
      include: { user: true },
      orderBy: { id: "asc" },
    });
    if (bankAccounts.length > 0) {
      bankAccounts.forEach(async (bankAccount, index) => {
        if (index === 0) {
          await prisma.bankAccount.update({
            where: { id: bankAccount.id },
            data: { balance: user.balance ?? 100_000 },
          });
        } else {
          await prisma.bankAccount.update({ where: { id: bankAccount.id }, data: { balance: 0 } });
        }
      });
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

  try {
    // Generate all transaction data first
    const transactions = generateTransactionData(regularUsers, TOTAL_TRANSACTIONS);
    console.log(`[${new Date().toISOString()}] Generated ${transactions.length} transaction records`);

    // Process transactions in batches
    const BATCH_SIZE = 100; // Increased from 50 to 100 for better performance
    for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
      const batch = transactions.slice(i, i + BATCH_SIZE);
      console.log(
        `[${new Date().toISOString()}] Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(transactions.length / BATCH_SIZE)} (${batch.length} transactions)...`,
      );

      // Process transactions in parallel within each batch
      await Promise.all(
        batch.map(async (transaction, j) => {
          const transactionNumber = i + j + 1;
          try {
            // Create transaction record
            const createdTransaction = await prisma.transaction.create({
              data: {
                createdAt: transaction.createdAt,
                amount: transaction.amount,
                currency: transaction.currency as Currency,
                fromBankId: transaction.fromBankId,
                toBankId: transaction.toBankId,
              },
            });

            // Update sender balance
            await prisma.bankAccount.update({
              where: { id: transaction.senderAccountId },
              data: { balance: transaction.senderBalance },
            });

            // Update receiver balance
            await prisma.bankAccount.update({
              where: { id: transaction.receiverAccountId },
              data: { balance: transaction.receiverBalance },
            });

            // Log progress every 1000 transactions
            if (transactionNumber % 1000 === 0) {
              console.log(`[${new Date().toISOString()}] Successfully processed transaction ${transactionNumber}`);
            }
          } catch (error) {
            console.error(`[${new Date().toISOString()}] Error processing transaction ${transactionNumber}:`, error);
            throw error;
          }
        }),
      );
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
