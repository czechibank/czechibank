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

const bankAccountService = {
  async createBankAccount(
    bankAccount: Pick<BankAccount, "userId" | "currency" | "name"> & { number?: string; balance?: number },
  ): Promise<SuccessResponse<BankAccount> | ErrorResponse> {
    try {
      const finalName = await getUniqueBankAccountName(bankAccount.name, bankAccount.userId);

      const balanceToSet =
        bankAccount.balance !== undefined ? bankAccount.balance : await getInitialBalanceForUser(bankAccount.userId);

      const result = await repository.createBankAccount({
        ...bankAccount,
        name: finalName,
        balance: balanceToSet,
        number: bankAccount.number,
      });
      return successResponse("Bank account created successfully", result);
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
      // Generate a unique name for this user
      const finalName = await getUniqueBankAccountName(newName, userId, id);

      // Update the account name in the repository
      const updatedBankAccount = await repository.updateBankAccountName(id, finalName);

      return successResponse("Bank account renamed successfully", updatedBankAccount);
    } catch (error: any) {
      return errorResponse(error?.message || "Failed to rename bank account", ApiErrorCode.INTERNAL_ERROR);
    }
  },
};

export default bankAccountService;
