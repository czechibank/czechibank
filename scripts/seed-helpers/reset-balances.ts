import { PrismaClient } from "@prisma/client";
import { UserSeedConfig } from "../seed-users";

export default async function resetBankAccountBalances(prisma: PrismaClient, users: UserSeedConfig[]) {
  console.log(`[users seed] Resetting bank account balances for ${users.length} users`);
  for (const user of users) {
    const bankAccounts = await prisma.bankAccount.findMany({
      where: { isActive: true, user: { email: user.email } },
      include: { user: true },
      orderBy: { id: "asc" },
    });
    if (bankAccounts.length > 0) {
      // forEach is not "async-aware." It fires off all the update commands to the database but does not wait for them to finish before moving to the next part of your script
      for (const [index, bankAccount] of bankAccounts.entries()) {
        if (index === 0) {
          await prisma.bankAccount.update({
            where: { id: bankAccount.id },
            data: { balance: user.balance ?? 100_000 },
          });
        } else {
          await prisma.bankAccount.update({ where: { id: bankAccount.id }, data: { balance: 0 } });
        }
      }
    }
  }
}
