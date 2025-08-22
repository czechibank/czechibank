import env from "@/lib/env";
import { ApiErrorCode, errorResponse, successResponse } from "@/lib/response";
import { Currency } from "@prisma/client";
import bankAccountService from "../bankAccount-domain/ba-service";
import { sendDiscordMessage } from "../social-reporting-domain/discord-action";
import * as repository from "./transaction-repository";
import { CreateTransactionNumberToNumberSchema } from "./transation-schema";

function parseTransactionData(
  userId: string,
  fromBankNumber: string,
  toBankNumber: string,
  amount: number,
  currency: Currency,
) {
  const parsedTransaction = CreateTransactionNumberToNumberSchema.safeParse({
    userId,
    fromBankNumber,
    toBankNumber,
    amount,
    currency,
  });

  if (!parsedTransaction.success) {
    return errorResponse(
      "Invalid transaction data",
      ApiErrorCode.VALIDATION_ERROR,
      parsedTransaction.error.errors.map((error) => ({
        code: ApiErrorCode.VALIDATION_ERROR,
        field: error.path.join("."),
        message: error.message,
      })),
    );
  }

  return parsedTransaction.data;
}

const transactionService = {
  async sendMoneyToBankNumber({
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
  }) {
    try {
      const parsedTransaction = parseTransactionData(userId, fromBankNumber, toBankNumber, amount, currency);

      if ("error" in parsedTransaction) {
        return parsedTransaction;
      }

      const fromBankAccount = await bankAccountService.getBankAccountByNumber(parsedTransaction.fromBankNumber);
      if (!fromBankAccount.success) {
        return fromBankAccount;
      }
      if (parsedTransaction.userId !== fromBankAccount.data.userId) {
        return errorResponse("You are not allowed to send money from this bank account", ApiErrorCode.FORBIDDEN);
      }
      const toBankAccount = await bankAccountService.getBankAccountByNumber(parsedTransaction.toBankNumber);

      if ("error" in fromBankAccount || "error" in toBankAccount) {
        return "error" in fromBankAccount ? fromBankAccount : toBankAccount;
      }

      if (fromBankAccount.data.balance < amount) {
        return errorResponse("Insufficient balance", ApiErrorCode.INSUFFICIENT_BALANCE);
      }

      const result = await repository.sendMoney({
        fromBankId: fromBankAccount.data.id,
        toBankId: toBankAccount.data.id,
        amount,
        currency,
      });

      // HARD-CODED DONATION NUMBER, who cares
      if (result.data.message.to.number == "555555555555/5555") {
        console.log(env.DISCORD_WEBHOOK_URL);
        await sendDiscordMessage({
          text: `Money sent from account \`${result.data.message.from.number}\` - **${result.data.message.amount} ${result.data.message.currency}** :tada:`,
          message: "Money sent successfully!",
          sender: `${result.data.message.from.user.name}`,
          applicationType: applicationType,
          city: "prague",
        });
      }
      // if (applicationType === "web") {
      //   revalidatePath("/bankAccount");
      // }
      return successResponse("Transaction successful", result.data);
    } catch (error: any) {
      return errorResponse(error?.message || "Failed to send money to bank number", ApiErrorCode.INTERNAL_ERROR);
    }
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
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (pageNum < 1 || limitNum < 1) {
      return errorResponse("Invalid pagination parameters", ApiErrorCode.VALIDATION_ERROR, [
        {
          code: ApiErrorCode.VALIDATION_ERROR,
          message: "Page and limit must be positive numbers",
        },
      ]);
    }

    const result = await repository.getAllTransactionsByUserIdForAPI(userId, orderBy, order, pageNum, limitNum);

    if (!result) {
      return errorResponse("Failed to retrieve transactions", ApiErrorCode.INTERNAL_ERROR, [
        {
          code: ApiErrorCode.INTERNAL_ERROR,
          message: "Failed to retrieve transactions",
        },
      ]);
    }

    // If the requested page is beyond total pages, return empty array
    if (pageNum > result.pagination.totalPages) {
      return successResponse("Transactions retrieved successfully", {
        transactions: [],
        pagination: {
          ...result.pagination,
          page: pageNum,
        },
      });
    }

    return successResponse("Transactions retrieved successfully", {
      transactions: result.transactions,
      pagination: result.pagination,
    });
  },

  async getTransactionDetailByTransactionId(transactionId: string, userId: string) {
    const transaction = await repository.getTransactionDetailByTransactionId(transactionId, userId);

    if (!transaction) {
      return errorResponse("Transaction not found", ApiErrorCode.NOT_FOUND, [
        {
          code: ApiErrorCode.NOT_FOUND,
          message: "Transaction not found",
        },
      ]);
    }

    return successResponse("Transaction details retrieved successfully", transaction);
  },

  async getAllTransactionsByUserAndBankAccountId(bankAccountId: string) {
    return await repository.getAllTransactionsByUserAndBankAccountId(bankAccountId);
  },
};

export default transactionService;
