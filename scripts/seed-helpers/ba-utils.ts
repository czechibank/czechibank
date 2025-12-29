import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import { Currency, PrismaClient } from "@prisma/client";

export default async function ensureUserBankAccounts(prisma: PrismaClient, user: any, userSeed: any) {
  // Update bank account number(s) and balance (support string | string[] in seed)
  const providedBAs = Array.isArray(userSeed.bankAccountNumber)
    ? userSeed.bankAccountNumber
    : [userSeed.bankAccountNumber];

  const existingAccounts = await prisma.bankAccount.findMany({
    where: { userId: user.id },
    orderBy: { id: "asc" },
  });

  // 1) Ensure at least one account exists; create or update the primary account
  if (existingAccounts.length === 0) {
    const primaryNumber = providedBAs[0];
    if (primaryNumber) {
      const found = await prisma.bankAccount.findUnique({ where: { number: primaryNumber } });
      //Number taken by someone else -> Create fallback
      if (found && found.userId !== user.id) {
        console.warn(
          `[users seed] Bank account number ${primaryNumber} already exists for another user; skipping reuse for ${user.email}`,
        );
        // create fallback unique number to avoid collision
        const fallbackNumber = `${primaryNumber}_${user.id.slice(0, 6)}`;
        await bankAccountService.createBankAccount({
          userId: user.id,
          currency: Currency.CZECHITOKEN,
          name: user.name ?? user.email,
          number: fallbackNumber,
          balance: userSeed.balance,
        });
        console.log(`[users seed] Created fallback bank account ${fallbackNumber} for user: ${user.email}`);
      } else if (found && found.userId === user.id) {
        // Account already exists and belongs to this user -> ensure it is active and balance updated
        await prisma.bankAccount.update({
          where: { id: found.id },
          data: {
            isActive: true,
            ...(userSeed.balance !== undefined ? { balance: userSeed.balance } : {}),
          },
        });
        console.log(`[users seed] Linked existing bank account ${primaryNumber} to user: ${user.email}`);
      } else {
        // not found anywhere -> create primary
        await bankAccountService.createBankAccount({
          userId: user.id,
          currency: Currency.CZECHITOKEN,
          name: user.name ?? user.email,
          number: primaryNumber,
          balance: userSeed.balance,
        });
        console.log(`[users seed] Created bank account ${primaryNumber} for user: ${user.email}`);
      }
    } else {
      console.warn(`[users seed] No bank account number provided for user: ${user.email}`);
    }
  } else {
    // Update the first existing account with provided primary number (if any)
    const first = existingAccounts[0];
    const primaryNumber = providedBAs[0] ?? first.number;
    // If primaryNumber is used by another user, skip changing it
    const maybeFound = await prisma.bankAccount.findUnique({ where: { number: primaryNumber } });
    if (maybeFound && maybeFound.userId !== user.id) {
      console.warn(
        `[users seed] Primary bank account number ${primaryNumber} belongs to another user; keeping existing number for ${user.email}`,
      );
      await prisma.bankAccount.update({
        where: { id: first.id },
        data: { isActive: true, ...(userSeed.balance !== undefined ? { balance: userSeed.balance } : {}) },
      });
    } else {
      await prisma.bankAccount.update({
        where: { id: first.id },
        data: {
          number: primaryNumber,
          isActive: true,
          ...(userSeed.balance !== undefined ? { balance: userSeed.balance } : {}),
        },
      });
      console.log(`[users seed] Updated primary bank account for user: ${user.email}`);
    }
  }

  // 2) Create additional accounts from provided array (skip duplicates)
  for (let i = 1; i < providedBAs.length; i++) {
    const baNumber = providedBAs[i];
    if (!baNumber) continue;
    const found = await prisma.bankAccount.findUnique({ where: { number: baNumber } });
    if (found) {
      if (found.userId === user.id) {
        // already belongs to this user
        continue;
      }
      console.warn(`[users seed] Skipping bank account ${baNumber} because it exists for another user`);
      continue;
    }

    await bankAccountService.createBankAccount({
      userId: user.id,
      currency: Currency.CZECHITOKEN,
      name: user.name ?? user.email,
      number: baNumber,
    });
    console.log(`[users seed] Created additional bank account ${baNumber} for user: ${user.email}`);
  }
}
