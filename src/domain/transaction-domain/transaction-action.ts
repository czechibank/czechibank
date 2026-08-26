"use server";

import { ApiErrorCode, errorResponse } from "@/lib/response";
import { Currency } from "@prisma/client";
import { headers } from "next/headers";
import userService from "../user-domain/user-service";
import transactionService from "./transaction-service";

// #89 — the sender is the signed-in user, taken from the session on the server.
// A `userId` from the browser must never decide whose account money leaves.
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
}) {
  const session = await userService.server.getSession(await headers());
  if (!session) {
    return errorResponse("Unauthorized", ApiErrorCode.UNAUTHORIZED);
  }

  return transactionService.sendMoneyToBankNumber({
    amount,
    currency,
    fromBankNumber,
    toBankNumber,
    userId: session.user.id,
    applicationType,
  });
}
