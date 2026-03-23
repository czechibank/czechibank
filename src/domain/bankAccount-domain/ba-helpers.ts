import { ApiErrorCode } from "@/lib/response";
import { BankAccount } from "@prisma/client";
import * as repository from "./ba-repository";

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

/** Returns the initial balance for a new bank account: 100_000 for the first account, otherwise 0. */
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

/** Matches the app-assigned suffix at the end of a name: " (01)", " (10)", " (123)". Not " (1)" or "name(1)". */
const APP_SUFFIX_REGEX = /\s\((\d{2,})\)$/;

/** Splits a stored name into base text and optional app suffix for muted/grey UI display. */
export function splitBankAccountNameForDisplay(name: string): { base: string; suffix: string | null } {
  const match = name.trim().match(APP_SUFFIX_REGEX);
  if (!match) return { base: name, suffix: null };
  const suffix = match[0];
  const base = name.slice(0, -suffix.length);
  return { base, suffix };
}

/**
 * Returns a unique bank account name for one user.
 *
 * Rules:
 * - Only rename when the requested name already exists exactly.
 * - A trailing " (NN)" with 2+ digits is treated as the app suffix and stripped to get the base.
 * - Plain-name duplicates (e.g. second "AKA"): start from 1 and pick the first free suffix (fills gaps).
 * - Numbered duplicates (e.g. second "AKA (04)"): start from (parsed suffix + 1) and pick the first free ≥ that.
 * - Single-digit " (1)" or names like "AKA(1)" are treated as user text, not app suffixes.
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

  // Only auto-rename when there is already an account with exactly the same requested name.
  // If there is no exact match (e.g. existing AKA (10), requested AKA (04)), respect the user's name.
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

  // Windows-like behaviour:
  // - If we're colliding with the plain base name (no suffix), start from 1 and pick the first free.
  // - If we're colliding with a suffixed name like "AKA (04)", start from 5 and pick the first free ≥ that.
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
