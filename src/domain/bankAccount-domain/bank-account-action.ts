"use server";

import dropsService, { type DropCompletionNotice } from "@/domain/drops-domain/drops-service";
import userService from "@/domain/user-domain/user-service";
import { ApiErrorCode, errorResponse, type ErrorResponse } from "@/lib/response";
import type { BankAccount, Currency } from "@prisma/client";
import { headers } from "next/headers";
import bankAccountService from "./ba-service";

type CreateSuccess = Extract<Awaited<ReturnType<typeof bankAccountService.createBankAccount>>, { success: true }>;

export type CreateBankAccountWithDropsResult = ErrorResponse | (CreateSuccess & { drops: DropCompletionNotice[] });

export async function createBankAccountWithDropsAction(input: {
  currency: Currency;
  name?: string;
}): Promise<CreateBankAccountWithDropsResult> {
  // Server actions are client-invokable: the acting user must come from the
  // session, never from the caller's input.
  const session = await userService.server.getSession(await headers());
  const userId = session?.user?.id;
  if (!userId) {
    return errorResponse("Unauthorized", ApiErrorCode.UNAUTHORIZED);
  }

  const result = await bankAccountService.createBankAccount({
    userId,
    currency: input.currency,
    name: input.name,
  });
  if (!result.success) {
    return result;
  }

  const bankAccount = result.data as BankAccount;
  let drops: DropCompletionNotice[] = [];
  try {
    const { completedMissions } = await dropsService.evaluateDropsAfterSuccess({
      userId,
      method: "POST",
      path: "/api/v1/bank-account/create", // must match seed-missions triggerPath
      requestBody: { name: input.name, currency: input.currency },
      resultData: bankAccount as unknown as Record<string, unknown>,
    });
    drops = completedMissions;
  } catch (e) {
    console.error("[drops] post-action eval failed", { userId, where: "bank-account/create" }, e);
  }

  return { ...result, drops };
}
