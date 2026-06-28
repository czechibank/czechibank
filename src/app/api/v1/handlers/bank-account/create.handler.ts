import { authenticateRequest } from "@/app/api/v1/auth";
import { evaluateDropsAfterSuccessResult } from "@/app/api/v1/handlers/shared/evaluate-drops";
import { parseJsonBody } from "@/app/api/v1/handlers/shared/parse-json-body";
import { BankAccountSchema } from "@/domain/bankAccount-domain/ba-schema";
import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import { type DropCompletionNotice } from "@/domain/drops-domain/drops-service";
import { type AppError } from "@/lib/errors";
import { validateWithResult } from "@/lib/result-helpers";
import { type BankAccount } from "@prisma/client";
import { type ResultAsync } from "neverthrow";

type CreateBankAccountData = { bankAccount: BankAccount; drops?: DropCompletionNotice[] };

export function handleCreateBankAccount(request: Request): ResultAsync<CreateBankAccountData, AppError> {
  return authenticateRequest(request)
    .andThen((user) =>
      parseJsonBody(request).andThen((body) =>
        validateWithResult(BankAccountSchema, body).map((parsed) => ({ user, parsed })),
      ),
    )
    .andThen(({ user, parsed }) =>
      bankAccountService
        .createBankAccountResult({
          userId: user.id,
          currency: parsed.currency,
          name: parsed.name,
        })
        .map((bankAccount) => ({ user, parsed, bankAccount })),
    )
    .andThen(({ user, parsed, bankAccount }) =>
      evaluateDropsAfterSuccessResult({
        userId: user.id,
        method: "POST",
        path: "/api/v1/bank-account/create", // must match seed-missions triggerPath
        requestBody: parsed as unknown as Record<string, unknown>,
        resultData: bankAccount as unknown as Record<string, unknown>,
      }).map((drops) => ({
        bankAccount,
        ...(drops.length > 0 ? { drops } : {}),
      })),
    );
}
