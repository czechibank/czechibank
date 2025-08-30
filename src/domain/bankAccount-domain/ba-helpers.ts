import { BankAccount } from "@prisma/client";
import * as repository from "./ba-repository";

export async function enforceMinActiveBankAccount(userId: string) {
  const activeAccounts = await repository.getBankAccountsByUserId(userId, {});
  if (activeAccounts.total <= 1) {
    throw new Error("Cannot delete the last active bank account");
  }
}

export async function getUniqueBankAccountName(
  baseName: string,
  userId: string,
  currentAccountId?: string,
): Promise<string> {
  const existingAccounts: Pick<BankAccount, "id" | "name">[] = await repository.findActiveBankAccountsByUser(
    userId,
    baseName,
  );

  const filteredAccounts = currentAccountId
    ? existingAccounts.filter((ba) => ba.id !== currentAccountId)
    : existingAccounts;

  const used = new Set(filteredAccounts.map((ba) => parseInt(ba.name.match(/\((\d+)\)$/)?.[1] || "0", 10)));

  if (!used.has(0)) return baseName;

  let nextNumber = 1;
  while (used.has(nextNumber)) nextNumber++;
  return `${baseName}(${String(nextNumber).padStart(2, "0")})`;
}
