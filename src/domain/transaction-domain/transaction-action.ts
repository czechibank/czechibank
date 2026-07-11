"use server";

import dropsService, { type DropCompletionNotice } from "@/domain/drops-domain/drops-service";
import userService from "@/domain/user-domain/user-service";
import { ApiErrorCode, errorResponse, type ErrorResponse } from "@/lib/response";
import { Currency } from "@prisma/client";
import { headers } from "next/headers";
import transactionService from "./transaction-service";

type SendSuccess = Extract<Awaited<ReturnType<typeof transactionService.sendMoneyToBankNumber>>, { success: true }>;

export type SendMoneyWithDropsResult = ErrorResponse | (SendSuccess & { drops: DropCompletionNotice[] });

export async function sendMoneyToBankNumberAction({
  amount,
  currency,
  fromBankNumber,
  toBankNumber,
  applicationType,
}: {
  amount: number;
  currency: Currency;
  fromBankNumber: string;
  toBankNumber: string;
  applicationType: "api" | "web";
}): Promise<SendMoneyWithDropsResult> {
  // Server actions are client-invokable: the acting user must come from the
  // session, never from the caller's input. Ownership of `fromBankNumber` is
  // enforced against this userId inside the transaction service.
  const session = await userService.server.getSession(await headers());
  const userId = session?.user?.id;
  if (!userId) {
    return errorResponse("Unauthorized", ApiErrorCode.UNAUTHORIZED);
  }

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
