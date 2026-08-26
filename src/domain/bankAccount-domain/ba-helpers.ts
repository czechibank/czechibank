import { type AppError, badRequest, fromUnknown, nonZeroBalance, notFound } from "@/lib/errors";
import { BankAccount } from "@prisma/client";
import { err, errAsync, ok, okAsync, type Result, ResultAsync } from "neverthrow";
import * as repository from "./ba-repository";

export function enforceMinActiveBankAccount(userId: string): ResultAsync<void, AppError> {
  return ResultAsync.fromPromise(repository.getBankAccountsByUserId(userId, {}), (e) => fromUnknown(e)).andThen(
    (activeAccounts) =>
      activeAccounts.total <= 1
        ? errAsync<void, AppError>(badRequest("Cannot delete the last active bank account"))
        : okAsync<void, AppError>(undefined),
  );
}

export function enforceZeroBalance(bankAccount: BankAccount): Result<void, AppError> {
  if (!bankAccount) {
    return err(notFound("Bank account not found"));
  }
  if (bankAccount.balance !== 0) {
    return err(nonZeroBalance());
  }
  return ok(undefined);
}

export function getInitialBalanceForUser(userId: string): ResultAsync<number, AppError> {
  return ResultAsync.fromPromise(repository.getBankAccountsByUserId(userId, { page: 1, limit: 1 }), (e) =>
    fromUnknown(e),
  ).map(({ total }) => (total === 0 ? 100_000 : 0));
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
  return `${baseName} (${String(nextNumber).padStart(2, "0")})`;
}
