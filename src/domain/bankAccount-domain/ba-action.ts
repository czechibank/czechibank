"use server";

import { forbidden, unauthorized } from "@/lib/errors";
import { toServiceResponse } from "@/lib/result-helpers";
import { Currency } from "@prisma/client";
import { errAsync } from "neverthrow";
import { headers } from "next/headers";
import userService from "../user-domain/user-service";
import * as repository from "./ba-repository";
import bankAccountService from "./ba-service";

// #188 — every web mutation and read is scoped to the signed-in user, taken
// from the server session. The browser never decides whose accounts are
// touched. Ownership of a target account is checked on the server before any
// rename or delete, because the repository writes by id without checking.

async function sessionUserId(): Promise<string | null> {
  const session = await userService.server.getSession(await headers());
  return session?.user.id ?? null;
}

export async function createBankAccountAction({ currency, name }: { currency: Currency; name?: string }) {
  const userId = await sessionUserId();
  if (!userId) return toServiceResponse(errAsync(unauthorized()), "");
  return toServiceResponse(
    bankAccountService.createBankAccountResult({ userId, currency, name }),
    "Bank account created successfully",
  );
}

export async function renameBankAccountAction({ bankAccountId, newName }: { bankAccountId: string; newName: string }) {
  const userId = await sessionUserId();
  if (!userId) return toServiceResponse(errAsync(unauthorized()), "");
  const owned = await repository.getBankAccountByIdAndUserId(bankAccountId, userId);
  if (!owned) return toServiceResponse(errAsync(forbidden("You do not own this bank account")), "");
  return toServiceResponse(
    bankAccountService.renameBankAccountResult(bankAccountId, userId, newName),
    "Bank account renamed successfully",
  );
}

export async function deleteBankAccountAction({ bankAccountId }: { bankAccountId: string }) {
  const userId = await sessionUserId();
  if (!userId) return toServiceResponse(errAsync(unauthorized()), "");
  const owned = await repository.getBankAccountByIdAndUserId(bankAccountId, userId);
  if (!owned) return toServiceResponse(errAsync(forbidden("You do not own this bank account")), "");
  return toServiceResponse(
    bankAccountService.deleteBankAccountResult(owned, userId),
    "Bank account deleted successfully",
  );
}

export async function getMyBankAccountsAction(pagination: { page: number; limit: number }) {
  const userId = await sessionUserId();
  if (!userId) return toServiceResponse(errAsync(unauthorized()), "");
  return toServiceResponse(
    bankAccountService.getMyBankAccountsResult(userId, pagination),
    "Bank accounts retrieved successfully",
  );
}
