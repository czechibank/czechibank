import { PrismaClient } from "@prisma/client";

export default async function validateSeedBankAccounts(prisma: PrismaClient, usersToSeed: any[]) {
  // Quick validation: ensure seed file doesn't contain duplicate BA numbers
  // and that provided BA numbers don't already belong to other DB users.
  const allProvidedBAs = usersToSeed
    .flatMap((u) => (Array.isArray(u.bankAccountNumber) ? u.bankAccountNumber : [u.bankAccountNumber]))
    .filter(Boolean);

  // check for duplicates inside seed file
  const dup = allProvidedBAs.filter((v, i, a) => a.indexOf(v) !== i);
  if (dup.length > 0) {
    console.error(`[seed-users] Duplicate bank account numbers in seed file: ${[...new Set(dup)].join(", ")}`);
    throw new Error("Seed contains duplicate bank account numbers. Fix usersToSeed before running.");
  }
  // Validate that primaryBalanceIndex and primaryTransactionIndex point to real array entries
  usersToSeed.forEach((u) => {
    const accountCount = Array.isArray(u.bankAccountNumber) ? u.bankAccountNumber.length : 1;

    if (u.primaryBalanceIndex >= accountCount) {
      throw new Error(
        `User ${u.email} has primaryBalanceIndex ${u.primaryBalanceIndex} but only has ${accountCount} accounts.`,
      );
    }
    if (u.primaryTransactionIndex >= accountCount) {
      throw new Error(
        `User ${u.email} has primaryTransactionIndex ${u.primaryTransactionIndex} but only has ${accountCount} accounts.`,
      );
    }
  });

  // Check for conflicts with other users already in the DB
  if (allProvidedBAs.length > 0) {
    const existing = await prisma.bankAccount.findMany({
      where: { number: { in: allProvidedBAs } },
      include: { user: true },
    });
    const conflicts = existing.filter((e) => {
      const seedEntry = usersToSeed.find((s) =>
        (Array.isArray(s.bankAccountNumber) ? s.bankAccountNumber : [s.bankAccountNumber]).includes(e.number),
      );
      return !seedEntry || seedEntry.email.toLowerCase() !== e.user.email.toLowerCase();
    });
    if (conflicts.length > 0) {
      console.error("[seed-users] Bank account numbers already exist in DB and belong to other users:");
      conflicts.forEach((c) => console.error(`  ${c.number} -> dbUser: ${c.user.email} (userId: ${c.userId})`));
      throw new Error("Seed conflicts with existing DB bank account numbers. Resolve before running seed.");
    }
  }
}
