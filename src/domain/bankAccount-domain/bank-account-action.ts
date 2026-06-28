"use server";

import dropsService, { type DropCompletionNotice } from "@/domain/drops-domain/drops-service";
import type { ErrorResponse } from "@/lib/response";
import type { BankAccount, Currency } from "@prisma/client";
import bankAccountService from "./ba-service";

type CreateSuccess = Extract<Awaited<ReturnType<typeof bankAccountService.createBankAccount>>, { success: true }>;

export type CreateBankAccountWithDropsResult = ErrorResponse | (CreateSuccess & { drops: DropCompletionNotice[] });

export async function createBankAccountWithDropsAction(input: {
  userId: string;
  currency: Currency;
  name?: string;
}): Promise<CreateBankAccountWithDropsResult> {
  const result = await bankAccountService.createBankAccount(input);
  if (!result.success) {
    return result;
  }

  const bankAccount = result.data as BankAccount;
  let drops: DropCompletionNotice[] = [];
  try {
    const { completedMissions } = await dropsService.evaluateDropsAfterSuccess({
      userId: input.userId,
      method: "POST",
      path: "/api/v1/bank-account/create", // must match seed-missions triggerPath
      requestBody: { name: input.name, currency: input.currency },
      resultData: bankAccount as unknown as Record<string, unknown>,
    });
    drops = completedMissions;
  } catch (e) {
    console.error("[drops] post-action eval failed", { userId: input.userId, where: "bank-account/create" }, e);
  }

  return { ...result, drops };
}
