import { BankAccount, Prisma } from "@prisma/client";
import { seededRandom } from "./seeded-random";

type UserWithBankAccounts = Prisma.UserGetPayload<{
  include: {
    bankAccounts: true;
  };
}>;

/**
 * Generates deterministic transaction data for seeding purposes.
 *
 * Creates a large number of transaction records with deterministic properties:
 * - Sender and receiver are selected deterministically based on seed values
 * - Transaction amounts are between 100 and 10,000 (deterministic)
 * - Transaction dates are spread over the last 6 months (deterministic)
 * - Tracks transaction patterns between users for logging
 *
 * @param regularUsers - Array of users with their bank accounts (excludes rescue funds, should only include seeded users that are in userToTransactionAccount map)
 * @param totalTransactions - Total number of transactions to generate
 * @param userToTransactionAccount - Map of user IDs to their designated transaction bank account
 *
 * @returns Array of transaction data objects ready for database insertion
 *
 * @example
 * ```ts
 * const transactions = generateTransactionData(
 *   regularUsers,
 *   10000,
 *   userToTransactionAccount
 * );
 * // Returns array of transaction objects with fromBankId, toBankId, amount, etc.
 * ```
 */
export function generateTransactionData(
  regularUsers: UserWithBankAccounts[],
  totalTransactions: number,
  userToTransactionAccount: Map<string, { id: string; number: string }>,
) {
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
    `[${new Date().toISOString()}] Regular users with transaction accounts:`,
    regularUsers.map((u) => {
      const transactionAccount = userToTransactionAccount.get(u.id);
      return {
        id: u.id,
        name: u.name,
        transactionAccountId: transactionAccount?.id,
        transactionAccountNumber: transactionAccount?.number,
        balance: transactionAccount
          ? u.bankAccounts.find((ba: BankAccount) => ba.id === transactionAccount.id)?.balance
          : undefined,
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

      const senderAccount = userToTransactionAccount.get(sender.id);
      const receiverAccount = userToTransactionAccount.get(receiver.id);
      if (!senderAccount || !receiverAccount) {
        console.warn(
          `[${new Date().toISOString()}] Skipping transaction ${i + 1} - sender or receiver has no transaction account`,
        );
        continue; // Skip this transaction safely
      }
      transactions.push({
        createdAt: transactionDate,
        amount,
        currency: "CZECHITOKEN",
        fromBankId: senderAccount.id,
        toBankId: receiverAccount.id,
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
