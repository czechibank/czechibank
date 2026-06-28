import { authenticateRequest } from "@/app/api/v1/auth";
import { evaluateDropsAfterSuccessResult } from "@/app/api/v1/handlers/shared/evaluate-drops";
import { parseJsonBody } from "@/app/api/v1/handlers/shared/parse-json-body";
import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import transactionService from "@/domain/transaction-domain/transaction-service";
import { ApiTransactionCreateSchema } from "@/domain/transaction-domain/transation-schema";
import { badRequest } from "@/lib/errors";
import { validateWithResult } from "@/lib/result-helpers";
import { errAsync } from "neverthrow";

export function handleCreateTransaction(request: Request) {
  return authenticateRequest(request).andThen((user) =>
    parseJsonBody(request)
      .andThen((body) => validateWithResult(ApiTransactionCreateSchema, body))
      .andThen((validated) =>
        // Verify user has at least one bank account
        bankAccountService.getMyBankAccountsResult(user.id, { page: 1, limit: 1 }).andThen((accounts) => {
          if (accounts.items.length === 0) {
            return errAsync(badRequest("No bank account found for user"));
          }
          return transactionService
            .sendMoneyToBankNumberResult({
              amount: validated.amount,
              toBankNumber: validated.toBankNumber,
              fromBankNumber: validated.fromBankNumber,
              userId: user.id,
              currency: "CZECHITOKEN",
              applicationType: "api",
            })
            .map((transactionData) => ({ user, validated, transactionData }));
        }),
      )
      .andThen(({ user: currentUser, validated, transactionData }) =>
        evaluateDropsAfterSuccessResult({
          userId: currentUser.id,
          method: "POST",
          path: "/api/v1/transactions/create", // must match seed-missions triggerPath
          requestBody: {
            amount: validated.amount,
            toBankNumber: validated.toBankNumber,
            fromBankNumber: validated.fromBankNumber,
          },
          resultData: (transactionData && typeof transactionData === "object" ? transactionData : {}) as Record<
            string,
            unknown
          >,
        }).map((drops) => ({
          ...transactionData,
          ...(drops.length > 0 ? { drops } : {}),
        })),
      ),
  );
}
