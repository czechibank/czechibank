import { type AppError, forbidden, fromUnknown, insufficientBalance, notFound, validationError } from "@/lib/errors";
import { ApiErrorCode, type ErrorResponse, type SuccessResponse } from "@/lib/response";
import { toServiceResponse, validateWithResult } from "@/lib/result-helpers";
import { Currency } from "@prisma/client";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import bankAccountService from "../bankAccount-domain/ba-service";
import { increaseTimeInSendingTransactionsFeature } from "../features-domain/features-application-service";
import featuresService from "../features-domain/features-service";
import { sendDiscordMessage } from "../social-reporting-domain/discord-action";
import * as repository from "./transaction-repository";
import { CreateTransactionNumberToNumberSchema } from "./transation-schema";

const DONATION_ACCOUNT_NUMBER = "555555555555/5555";

const transactionService = {
  // --- Result-based methods (used by API routes) ---

  sendMoneyToBankNumberResult({
    userId,
    fromBankNumber,
    toBankNumber,
    amount,
    currency,
    applicationType,
  }: {
    userId: string;
    fromBankNumber: string;
    toBankNumber: string;
    amount: number;
    currency: Currency;
    applicationType: "api" | "web";
  }): ResultAsync<repository.SendMoneyResult, AppError> {
    // Feature flag check (non-blocking — if it fails, we just skip the delay)
    return featuresService.server
      .getAllFeaturesResult()
      .andThen((result) => {
        if (increaseTimeInSendingTransactionsFeature(result.items)) {
          return ResultAsync.fromSafePromise<void, AppError>(new Promise((resolve) => setTimeout(resolve, 5000)));
        }
        return okAsync<void, AppError>(undefined);
      })
      .orElse(() => okAsync<void, AppError>(undefined))
      .andThen(() =>
        validateWithResult(CreateTransactionNumberToNumberSchema, {
          userId,
          fromBankNumber,
          toBankNumber,
          amount,
          currency,
        }),
      )
      .andThen((parsed) =>
        bankAccountService.getBankAccountByNumberResult(parsed.fromBankNumber).andThen((fromAcct) => {
          if (parsed.userId !== fromAcct.userId) {
            return errAsync(forbidden("You are not allowed to send money from this bank account"));
          }
          return bankAccountService.getBankAccountByNumberResult(parsed.toBankNumber).andThen((toAcct) =>
            ResultAsync.fromPromise(
              repository.sendMoney({
                fromBankId: fromAcct.id,
                toBankId: toAcct.id,
                amount: parsed.amount,
                currency: parsed.currency,
              }),
              (e) => {
                // Handle insufficient balance error from repository
                if (e instanceof Error && e.message === "INSUFFICIENT_BALANCE") {
                  return insufficientBalance();
                }
                return fromUnknown(e, "Failed to send money");
              },
            ).map((transaction) => {
              // Fire-and-forget Discord notification for donation account
              if (transaction.to.number === DONATION_ACCOUNT_NUMBER) {
                sendDiscordMessage({
                  text: `Money sent from account \`${transaction.from.number}\` - **${transaction.amount} ${transaction.currency}** :tada:`,
                  message: "Money sent successfully!",
                  sender: `${transaction.from.user.name}`,
                  applicationType,
                  city: "prague",
                }).catch((e) => console.error("[Discord]", e));
              }
              return transaction;
            }),
          );
        }),
      );
  },

  getAllTransactionsByUserIdForAPIResult(
    userId: string,
    orderBy: string,
    order: "asc" | "desc",
    page: string,
    limit: string,
  ): ResultAsync<any, AppError> {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
      return errAsync(
        validationError("Invalid pagination parameters", [
          { code: ApiErrorCode.VALIDATION_ERROR, message: "Page and limit must be positive numbers" },
        ]),
      );
    }

    return ResultAsync.fromPromise(
      repository.getAllTransactionsByUserIdForAPI(userId, orderBy, order, pageNum, limitNum),
      (e) => fromUnknown(e, "Failed to retrieve transactions"),
    ).andThen((result) => {
      if (!result) {
        return errAsync(fromUnknown(null, "Failed to retrieve transactions"));
      }

      // If requested page is beyond total pages, return empty
      if (pageNum > result.pagination.totalPages) {
        return okAsync({
          transactions: [],
          pagination: { ...result.pagination, page: pageNum },
        });
      }

      return okAsync({
        transactions: result.transactions,
        pagination: result.pagination,
      });
    });
  },

  getTransactionDetailResult(transactionId: string, userId: string): ResultAsync<any, AppError> {
    return ResultAsync.fromPromise(repository.getTransactionDetailByTransactionId(transactionId, userId), (e) =>
      fromUnknown(e),
    ).andThen((transaction) => (transaction ? okAsync(transaction) : errAsync(notFound("Transaction not found"))));
  },

  // --- Legacy wrapper methods (used by web components) ---

  async sendMoneyToBankNumber(params: {
    userId: string;
    fromBankNumber: string;
    toBankNumber: string;
    amount: number;
    currency: Currency;
    applicationType: "api" | "web";
  }): Promise<SuccessResponse<any> | ErrorResponse> {
    return toServiceResponse(this.sendMoneyToBankNumberResult(params), "Transaction successful");
  },

  async getAllTransactionsByUserId(userId: string) {
    return await repository.getAllTransactionsByUserId(userId);
  },

  async getAllTransactionsByIdFromAPI(
    userId: string,
    orderBy: string,
    order: "asc" | "desc",
    page: string,
    limit: string,
  ) {
    return toServiceResponse(
      this.getAllTransactionsByUserIdForAPIResult(userId, orderBy, order, page, limit),
      "Transactions retrieved successfully",
    );
  },

  async getTransactionDetailByTransactionId(transactionId: string, userId: string) {
    return toServiceResponse(
      this.getTransactionDetailResult(transactionId, userId),
      "Transaction details retrieved successfully",
    );
  },

  async getAllTransactionsByUserAndBankAccountId(bankAccountId: string, limit: number) {
    return await repository.getAllTransactionsByUserAndBankAccountId(bankAccountId, limit);
  },
};

export default transactionService;
