import { APP_SUFFIX_REGEX } from "@/lib/bank-account-name-display";
import { ApiErrorCode } from "@/lib/response";
import { BankAccount } from "@prisma/client";
import * as repository from "./ba-repository";

export { splitBankAccountNameForDisplay } from "@/lib/bank-account-name-display";

/** Prevents deleting the last remaining active bank account for a user. */
export async function enforceMinActiveBankAccount(userId: string) {
  const activeAccounts = await repository.getBankAccountsByUserId(userId, {});
  if (activeAccounts.total <= 1) {
    throw {
      code: ApiErrorCode.BAD_REQUEST,
      message: "Cannot delete the last active bank account",
    };
  }
}

/** Returns the starting balance for a new account: 100_000 for the first one, otherwise 0. */
export async function getInitialBalanceForUser(userId: string): Promise<number> {
  const { total } = await repository.getBankAccountsByUserId(userId, { page: 1, limit: 1 });
  return total === 0 ? 100_000 : 0;
}

/** Prevents deleting a bank account that still has a positive balance. */
export async function enforceZeroBalance(bankAccount: BankAccount) {
  if (!bankAccount) {
    throw {
      code: ApiErrorCode.NOT_FOUND,
      message: "Bank account not found",
    };
  }

  if (bankAccount.balance > 0) {
    throw {
      code: ApiErrorCode.NON_ZERO_BALANCE,
      message: "Cannot delete account with non-zero balance",
    };
  }
}

/**
 * Returns a name that is unique among one user's active bank accounts.
 *
 * Rules:
 * - Only rename when the requested name already exists exactly.
 * - A trailing " (NN)" with 2+ digits is treated as an app-generated suffix and stripped to get the base.
 * - Plain-name duplicates (for example a second "AKA") start at 1 and use the first free suffix.
 * - Numbered duplicates (for example a second "AKA (04)") start at the next number and move upward.
 * - Single-digit " (1)" or names like "AKA(1)" are treated as user-entered text, not app suffixes.
 */
export async function getUniqueBankAccountName(
  baseName: string,
  userId: string,
  currentAccountId?: string,
): Promise<string> {
  const trimmed = baseName.trim();
  const appSuffixMatch = trimmed.match(APP_SUFFIX_REGEX);
  let base = appSuffixMatch ? trimmed.slice(0, -appSuffixMatch[0].length).trimEnd() : trimmed;
  if (base === "") base = trimmed;

  const existingAccounts: Pick<BankAccount, "id" | "name">[] = await repository.findActiveBankAccountsByUser(
    userId,
    base,
  );

  const filtered = currentAccountId ? existingAccounts.filter((ba) => ba.id !== currentAccountId) : existingAccounts;

  // Only auto-rename exact collisions. If the exact requested name is free,
  // keep it even when related names such as "AKA (10)" already exist.
  const hasExactName = filtered.some((ba) => ba.name === trimmed);
  if (!hasExactName) return trimmed;

  const used = new Set<number>();
  for (const ba of filtered) {
    if (ba.name === base) {
      used.add(0);
    } else if (ba.name.startsWith(base + " (") && ba.name.endsWith(")")) {
      const mid = ba.name.slice(base.length + 2, -1);
      const num = parseInt(mid, 10);
      if (!Number.isNaN(num) && /^\d{2,}$/.test(mid)) used.add(num);
    }
  }

  if (used.size === 0) return trimmed;

  // Match Windows-style naming:
  // plain-name collisions start from 1, while "AKA (04)" collisions start from 5.
  let startFrom = 1;
  if (appSuffixMatch) {
    const originalNum = parseInt(appSuffixMatch[1], 10);
    if (!Number.isNaN(originalNum)) startFrom = originalNum + 1;
  }

  let next = startFrom;
  while (used.has(next)) next++;
  const padded = String(next).padStart(2, "0");
  return `${base} (${padded})`;
}
