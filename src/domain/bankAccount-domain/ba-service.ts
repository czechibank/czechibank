import { isPrismaUniqueOnFields } from "@/lib/prisma-unique";
import { ApiErrorCode, ErrorResponse, errorResponse, SuccessResponse, successResponse } from "@/lib/response";
import { BankAccount } from "@prisma/client";
import {
  enforceMinActiveBankAccount,
  enforceZeroBalance,
  getInitialBalanceForUser,
  getUniqueBankAccountName,
} from "./ba-helpers";
import * as repository from "./ba-repository";

type Pagination = {
  page: number;
  limit: number;
};

const MAX_BANK_ACCOUNT_NAME_WRITE_ATTEMPTS = 6;

/** True when the active-account `(userId, name)` uniqueness constraint rejected the write. */
function isActiveBankAccountNameUniqueViolation(error: unknown): boolean {
  return isPrismaUniqueOnFields(error, ["userId", "name"]);
}

const bankAccountService = {
  async createBankAccount(
    bankAccount: Pick<BankAccount, "userId" | "currency"> & { name?: string; number?: string; balance?: number },
  ): Promise<SuccessResponse<BankAccount> | ErrorResponse> {
    try {
      const balanceToSet =
        bankAccount.balance !== undefined ? bankAccount.balance : await getInitialBalanceForUser(bankAccount.userId);

      let lastError: unknown;
      for (let attempt = 1; attempt <= MAX_BANK_ACCOUNT_NAME_WRITE_ATTEMPTS; attempt++) {
        const finalName = await getUniqueBankAccountName(bankAccount.name || "My Bank Account", bankAccount.userId);
        try {
          const result = await repository.createBankAccount({
            ...bankAccount,
            name: finalName,
            balance: balanceToSet,
            number: bankAccount.number,
          });
          return successResponse("Bank account created successfully", result);
        } catch (error: any) {
          lastError = error;
          if (error?.code === "P2002" && isActiveBankAccountNameUniqueViolation(error)) {
            // Another request claimed the same name first; recompute and retry.
            await new Promise((r) => setTimeout(r, 40 * attempt));
            continue;
          }
          throw error;
        }
      }
      return errorResponse(
        `Failed to create bank account with a unique name after ${MAX_BANK_ACCOUNT_NAME_WRITE_ATTEMPTS} attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
        ApiErrorCode.INTERNAL_ERROR,
      );
    } catch (error: any) {
      return errorResponse(error?.message || "Failed to create bank account", ApiErrorCode.INTERNAL_ERROR);
    }
  },

  async getBankAccountByIdAndUserId(id: string, userId: string) {
    const bankAccount = await repository.getBankAccountByIdAndUserId(id, userId);

    if (!bankAccount) {
      return errorResponse("Bank account not found", ApiErrorCode.NOT_FOUND);
    }

    return successResponse("Bank account retrieved successfully", bankAccount);
  },

  async getBankAccountById(id: string) {
    const bankAccount = await repository.getBankAccountById(id);
    if (!bankAccount) {
      return errorResponse("Bank account not found", ApiErrorCode.NOT_FOUND);
    }

    return successResponse("Bank account retrieved successfully", bankAccount);
  },

  async getMyBankAccounts(userId: string, pagination: Pagination) {
    if (pagination.page < 1 || pagination.limit < 1) {
      return errorResponse("Invalid pagination parameters", ApiErrorCode.VALIDATION_ERROR);
    }

    try {
      const bankAccounts = await repository.getBankAccountsByUserId(userId, pagination);
      return successResponse("Bank accounts retrieved successfully", bankAccounts);
    } catch (error: any) {
      return errorResponse(error?.message || "Failed to retrieve bank accounts", ApiErrorCode.INTERNAL_ERROR);
    }
  },

  async getAllBankAccounts(pagination: Pagination) {
    if (pagination.page < 1 || pagination.limit < 1) {
      return errorResponse("Invalid pagination parameters", ApiErrorCode.VALIDATION_ERROR);
    }

    const bankAccounts = await repository.getAllBankAccounts(pagination);
    return successResponse("Bank accounts retrieved successfully", bankAccounts);
  },

  async deleteBankAccount(
    bankAccount: BankAccount,
    userId: string,
  ): Promise<SuccessResponse<BankAccount> | ErrorResponse> {
    try {
      await enforceMinActiveBankAccount(userId);
      await enforceZeroBalance(bankAccount);
      const deletedBankAccount = await repository.deleteBankAccount(bankAccount.id);
      return successResponse("Bank account deleted successfully", deletedBankAccount);
    } catch (error: any) {
      if (
        error?.code === ApiErrorCode.BAD_REQUEST ||
        error?.code === ApiErrorCode.NON_ZERO_BALANCE ||
        error?.code === ApiErrorCode.NOT_FOUND
      ) {
        return errorResponse(error.message, error.code);
      }

      return errorResponse(error?.message || "Failed to delete bank account", ApiErrorCode.INTERNAL_ERROR);
    }
  },

  async getBankAccountByNumber(bankNumber: string): Promise<SuccessResponse<BankAccount> | ErrorResponse> {
    try {
      const bankAccount = await repository.getBankAccountByNumber(bankNumber);
      if (!bankAccount) {
        return errorResponse("Bank account not found", ApiErrorCode.NOT_FOUND);
      }
      return successResponse("Bank account retrieved successfully", bankAccount);
    } catch (error: any) {
      if (
        error?.code === ApiErrorCode.BAD_REQUEST ||
        error?.code === ApiErrorCode.INSUFFICIENT_BALANCE ||
        error?.code === ApiErrorCode.NOT_FOUND
      ) {
        return errorResponse(error.message, error.code);
      }
      return errorResponse(error?.message || "Bank account not found", ApiErrorCode.NOT_FOUND);
    }
  },
  async renameBankAccount(
    id: string,
    userId: string,
    newName: string,
  ): Promise<SuccessResponse<BankAccount> | ErrorResponse> {
    try {
      let lastError: unknown;
      for (let attempt = 1; attempt <= MAX_BANK_ACCOUNT_NAME_WRITE_ATTEMPTS; attempt++) {
        const finalName = await getUniqueBankAccountName(newName, userId, id);
        try {
          const updatedBankAccount = await repository.updateBankAccountName(id, finalName);
          return successResponse("Bank account renamed successfully", updatedBankAccount);
        } catch (error: any) {
          lastError = error;
          if (error?.code === "P2002" && isActiveBankAccountNameUniqueViolation(error)) {
            // Another request claimed the same name first; recompute and retry.
            await new Promise((r) => setTimeout(r, 40 * attempt));
            continue;
          }
          throw error;
        }
      }
      return errorResponse(
        `Failed to rename bank account to a unique name after ${MAX_BANK_ACCOUNT_NAME_WRITE_ATTEMPTS} attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
        ApiErrorCode.INTERNAL_ERROR,
      );
    } catch (error: any) {
      return errorResponse(error?.message || "Failed to rename bank account", ApiErrorCode.INTERNAL_ERROR);
    }
  },
};

export default bankAccountService;
