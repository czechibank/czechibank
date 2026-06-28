"use server";

import dropsService, { type DropCompletionNotice } from "@/domain/drops-domain/drops-service";
import type { ErrorResponse } from "@/lib/response";
import { Currency } from "@prisma/client";
import transactionService from "./transaction-service";

type SendSuccess = Extract<Awaited<ReturnType<typeof transactionService.sendMoneyToBankNumber>>, { success: true }>;

export type SendMoneyWithDropsResult = ErrorResponse | (SendSuccess & { drops: DropCompletionNotice[] });

export async function sendMoneyToBankNumberAction({
  amount,
  currency,
  fromBankNumber,
  toBankNumber,
  userId,
  applicationType,
}: {
  amount: number;
  currency: Currency;
  fromBankNumber: string;
  toBankNumber: string;
  userId: string;
  applicationType: "api" | "web";
}): Promise<SendMoneyWithDropsResult> {
  const result = await transactionService.sendMoneyToBankNumber({
    amount,
    currency,
    fromBankNumber,
    toBankNumber,
    userId,
    applicationType,
  });

  if (!result.success) {
    return result;
  }

  let drops: DropCompletionNotice[] = [];
  try {
    const { completedMissions } = await dropsService.evaluateDropsAfterSuccess({
      userId,
      method: "POST",
      path: "/api/v1/transactions/create", // must match seed-missions triggerPath
      requestBody: { amount, toBankNumber, fromBankNumber },
      resultData: (result.data && typeof result.data === "object" ? result.data : {}) as Record<string, unknown>,
    });
    drops = completedMissions;
  } catch (e) {
    console.error("[drops] post-action eval failed", { userId, where: "transactions/create" }, e);
  }

  return { ...result, drops };
}
