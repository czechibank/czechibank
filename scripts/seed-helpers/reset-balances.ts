import { PrismaClient } from "@prisma/client";
import { SeedUserDef } from "../../shared/fixtures/users";
import { PRIMARY_BALANCE_INDEX } from "../seed-users";

/**
 * Resets bank account balances for seeded users based on their seed configuration.
 *
 * For each user:
 * - Sets the bank account matching the `PRIMARY_BALANCE_INDEX` constant from the seed config array
 *   to the balance value specified in seed config (or 100,000 if not specified)
 * - Sets all other bank accounts for the user to 0 balance
 *
 * The function matches bank accounts by their account number from the seed configuration array.
 * Uses the global `PRIMARY_BALANCE_INDEX` constant to determine which account index to use.
 *
 * @param prisma - Prisma client instance for database operations
 * @param users - Array of user seed configurations containing balance information
 *
 * @example
 * ```ts
 * await resetBankAccountBalances(prisma, usersToSeed);
 * // Account at PRIMARY_BALANCE_INDEX gets balance from seed config, others set to 0
 * ```
 */
export default async function resetBankAccountBalances(prisma: PrismaClient, users: SeedUserDef[]) {
  console.log(`[users seed] Resetting bank account balances for ${users.length} users`);
  for (const userSeed of users) {
    const bankAccounts = await prisma.bankAccount.findMany({
      where: { isActive: true, user: { email: userSeed.email } },
      include: { user: true },
    });
    if (bankAccounts.length > 0) {
      // Determine which account should get the balance based on PRIMARY_BALANCE_INDEX constant
      const bankAccountNumbers = userSeed.bankAccounts.map((ba) => ba.number);

      // Use PRIMARY_BALANCE_INDEX constant, but clamp to available accounts if out of bounds
      const targetIndex = Math.min(PRIMARY_BALANCE_INDEX, bankAccountNumbers.length - 1);
      const targetNumber = bankAccountNumbers[targetIndex];

      // Find the account that matches the target number from seed config
      const primaryAccount =
        bankAccountNumbers.length > 0 && targetNumber
          ? bankAccounts.find((ba) => ba.number === targetNumber && ba.isActive)
          : null;

      // Update all accounts: primary gets balance, others get 0
      for (const bankAccount of bankAccounts) {
        if (primaryAccount && bankAccount.id === primaryAccount.id) {
          await prisma.bankAccount.update({
            where: { id: bankAccount.id },
            data: { balance: userSeed.balance ?? 100_000 },
          });
        } else {
          await prisma.bankAccount.update({ where: { id: bankAccount.id }, data: { balance: 0 } });
        }
      }
    }
  }
}
