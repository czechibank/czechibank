import { Currency, PrismaClient } from "@prisma/client";
import { auth } from "../auth";

const prisma = new PrismaClient();

const usersToSeed = [
  // Rescue funds
  {
    email: "zachranNas+praha@pejsekAKocicka.cz",
    name: "[OSTRAVA!!!] Pejsek a Kočicka 🐶&🐱",
    password: "PejsekAKocicka123",
    sex: "MALE",
    avatarConfig:
      '{"backgroundColor":["696AC9"],"eyebrows":["variant12"],"eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant03"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["happy05"],"mouthColor":["000000"],"nose":["variant06"],"noseColor":["000000"]}',
    bankAccountNumber: "555555555555/5555",
    apiKey: "11",
    role: "user",
  },
  {
    email: "zachranNas+brno@pejsekAKocicka.cz",
    name: "[BRNO] Pejsek a Kočička 🐶&🐱",
    password: "PejsekAKocicka123",
    sex: "MALE",
    avatarConfig:
      '{"backgroundColor":["0DC681"],"eyebrows":["variant12"],"eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant03"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["happy05"],"mouthColor":["000000"],"nose":["variant06"],"noseColor":["000000"]}',
    bankAccountNumber: "444444444444/5555",
    apiKey: "22",
    role: "user",
  },
  // Core team
  {
    email: "vojta@czechibank.ostrava.digital",
    name: "Vojta 🦊 Cerveny",
    password: "hello123456",
    sex: "MALE",
    avatarConfig:
      '{"backgroundColor":["ff0000"],"eyebrows":["variant11"],"eyebrowsColor":["ffffff"],"eyes":["variant01"],"eyesColor":["ffffff"],"freckles":["variant01"],"frecklesColor":["ffffff"],"frecklesProbability":[null],"glasses":["variant01"],"glassesColor":["ffffff"],"glassesProbability":[null],"mouth":["happy04"],"mouthColor":["ffffff"],"nose":["variant04"],"noseColor":["ffffff"]}',
    bankAccountNumber: "000000000001/5555",
    apiKey: "33",
    role: "admin",
  },
  {
    email: "simona@czechibank.ostrava.digital",
    name: "Simona Humpolová",
    password: "hello123456",
    sex: "FEMALE",
    avatarConfig:
      '{"backgroundColor":["C4DD68"],"eyebrows":["variant12"],"eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant03"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["happy05"],"mouthColor":["000000"],"nose":["variant06"],"noseColor":["000000"]}',
    bankAccountNumber: "000000000002/5555",
    apiKey: "44",
    role: "user",
  },
  {
    email: "vitalii@czechibank.ostrava.digital",
    name: "Vitalii Postolov",
    password: "hello123456",
    sex: "MALE",
    avatarConfig:
      '{"backgroundColor":["ffe900"],"eyebrows":["variant12"],"eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant03"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["happy05"],"mouthColor":["000000"],"nose":["variant06"],"noseColor":["000000"]}',
    bankAccountNumber: "000000000003/5555",
    apiKey: "55",
    role: "user",
  },
  {
    email: "michal@czechibank.ostrava.digital",
    name: "Michal F.",
    password: "hello123456",
    sex: "MALE",
    avatarConfig:
      '{"backgroundColor":["4699CD"],"eyebrows":["variant12"],"eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant03"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["happy05"],"mouthColor":["000000"],"nose":["variant06"],"noseColor":["000000"]}',
    bankAccountNumber: "000000000004/5555",
    apiKey: "66",
    role: "user",
  },
];

async function seedUsers() {
  for (const userSeed of usersToSeed) {
    try {
      console.log(`[seed] Creating user: ${userSeed.email}`);
      const response = await auth.api.createUser({
        body: {
          email: userSeed.email,
          name: userSeed.name,
          password: userSeed.password,
          role: userSeed.role as "user" | "admin",
        },
      });

      const user = response.user;

      console.log(`[seed] Creating API key for user: ${user.email}`);
      const apiKey = await auth.api.createApiKey({ body: { userId: user.id } });

      // Update bank account number
      const bankAccount = await prisma.bankAccount.findFirst({ where: { userId: user.id } });
      if (bankAccount) {
        await prisma.bankAccount.update({
          where: { id: bankAccount.id },
          data: { number: userSeed.bankAccountNumber },
        });
        console.log(`[seed] Updated bank account number for user: ${user.email}`);
      } else {
        console.warn(`[seed] No bank account found for user: ${user.email}`);
      }

      // Update API key if deterministic value is needed
      // TODO: @vojtech-cerveny - this is not working due the api keys are hashed in the DB, so we are not able to update them directly.
      // and API-keys are generated on the fly, so we don't know the values - just after creation.
      await prisma.apikey.update({
        where: { id: apiKey.id },
        data: { key: userSeed.apiKey },
      });
      console.log(`[seed] Updated API key for user: ${user.email}`);
    } catch (error) {
      console.error(`[seed] Error seeding user ${userSeed.email}:`, error);
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
    regularUsers.map((u) => ({
      id: u.id,
      name: u.name,
      accountId: u.bankAccounts[0].id,
      balance: u.bankAccounts[0].balance,
    })),
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

      transactions.push({
        createdAt: transactionDate,
        amount,
        currency: "CZECHITOKEN" as Currency,
        fromBankId: sender.bankAccounts[0].id,
        toBankId: receiver.bankAccounts[0].id,
        senderBalance: sender.bankAccounts[0].balance - amount,
        receiverBalance: receiver.bankAccounts[0].balance + amount,
        senderAccountId: sender.bankAccounts[0].id,
        receiverAccountId: receiver.bankAccounts[0].id,
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

// Generate deterministic transactions between users
async function generateDeterministicTransactions(prisma: PrismaClient) {
  console.log(`[${new Date().toISOString()}] Starting generateDeterministicTransactions...`);

  const allUsers = await prisma.user.findMany({
    include: {
      bankAccounts: true,
    },
  });
  console.log(`[${new Date().toISOString()}] Found ${allUsers.length} total users`);

  // Filter out rescue fund accounts
  const regularUsers = allUsers.filter(
    (user) =>
      !user.bankAccounts[0].number.includes("555555555555") && !user.bankAccounts[0].number.includes("444444444444"),
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
                currency: transaction.currency,
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
  console.log("[seed] Starting seed script...");
  await prisma.$connect();

  // Clean up all data first
  console.log("[seed] Cleaning up database...");
  await prisma.$transaction([
    prisma.transaction.deleteMany(),
    prisma.bankAccount.deleteMany(),
    prisma.user.deleteMany(),
  ]);
  console.log("[seed] Database cleaned up");

  // Seed users
  await seedUsers();

  // Generate transactions (keep your existing logic here)
  await generateDeterministicTransactions(prisma);

  console.log("[seed] Finished all database operations");
}

main()
  .catch((error) => {
    console.error("[seed] Fatal error:", error);
  })
  .finally(() => {
    prisma.$disconnect();
    console.log("[seed] Script finished");
    process.exit(0);
  });
