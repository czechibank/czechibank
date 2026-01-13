import { Prisma, PrismaClient } from "@prisma/client";
import { seededRandom } from "./seeded-random";

type UserWithBankAccounts = Prisma.UserGetPayload<{
  include: {
    bankAccounts: true;
  };
}>;

/**
 * Generates transaction history for a specific user with other users.
 *
 * Creates a specified number of transactions (both incoming and outgoing) for a user
 * with other users in the system. Transactions are generated deterministically and
 * spread over the last 6 months. Only creates transactions if sufficient balance exists.
 *
 * @param prisma - Prisma client instance for database operations
 * @param userId - ID of the user to generate transaction history for
 * @param transactionCount - Number of transactions to generate
 * @param otherUsers - Array of other users (with bank accounts) to transact with
 *
 * @returns Promise that resolves when transaction generation is complete
 *
 * @example
 * ```ts
 * await generateUserTransactionHistory(
 *   prisma,
 *   "user123",
 *   150,
 *   otherUsers
 * );
 * // Generates 150 transactions for user123 with other users
 * ```
 */
export async function generateUserTransactionHistory(
  prisma: PrismaClient,
  userId: string,
  transactionCount: number,
  otherUsers: UserWithBankAccounts[],
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
