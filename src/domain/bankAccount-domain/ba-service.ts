import { type AppError, fromUnknown, notFound, validationError } from "@/lib/errors";
import { type ErrorResponse, type SuccessResponse, ApiErrorCode } from "@/lib/response";
import { toServiceResponse } from "@/lib/result-helpers";
import { BankAccount } from "@prisma/client";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
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
  // --- Result-based methods (used by API routes) ---

  createBankAccountResult(
    bankAccount: Pick<BankAccount, "userId" | "currency"> & { name?: string; number?: string; balance?: number },
  ): ResultAsync<BankAccount, AppError> {
    return ResultAsync.fromPromise(
      getUniqueBankAccountName(bankAccount.name || "My Bank Account", bankAccount.userId),
      (e) => fromUnknown(e),
    )
      .andThen((finalName) => {
        if (bankAccount.balance !== undefined) {
          return okAsync({ finalName, balance: bankAccount.balance });
        }
        return getInitialBalanceForUser(bankAccount.userId).map((balance) => ({ finalName, balance }));
      })
      .andThen(({ finalName, balance }) =>
        ResultAsync.fromPromise(repository.createBankAccount({ ...bankAccount, name: finalName, balance }), (e) =>
          fromUnknown(e, "Failed to create bank account"),
        ),
      );
  },

  getBankAccountByIdAndUserIdResult(id: string, userId: string): ResultAsync<BankAccount, AppError> {
    return ResultAsync.fromPromise(repository.getBankAccountByIdAndUserId(id, userId), (e) => fromUnknown(e)).andThen(
      (ba) => (ba ? okAsync(ba) : errAsync(notFound("Bank account not found"))),
    );
  },

  getBankAccountByIdResult(id: string): ResultAsync<BankAccount, AppError> {
    return ResultAsync.fromPromise(repository.getBankAccountById(id), (e) => fromUnknown(e)).andThen((ba) =>
      ba ? okAsync(ba) : errAsync(notFound("Bank account not found")),
    );
  },

  getMyBankAccountsResult(
    userId: string,
    pagination: Pagination,
  ): ResultAsync<repository.PaginatedResult<any>, AppError> {
    if (
      isNaN(pagination.page) ||
      isNaN(pagination.limit) ||
      pagination.page < 1 ||
      pagination.limit < 1 ||
      pagination.limit > 100
    ) {
      return errAsync(
        validationError("Invalid pagination parameters", [
          ...(isNaN(pagination.page) || pagination.page < 1
            ? [{ code: ApiErrorCode.VALIDATION_ERROR, message: "Page must be a positive integer" }]
            : []),
          ...(isNaN(pagination.limit) || pagination.limit < 1 || pagination.limit > 100
            ? [{ code: ApiErrorCode.VALIDATION_ERROR, message: "Limit must be between 1 and 100" }]
            : []),
        ]),
      );
    }
    return ResultAsync.fromPromise(repository.getBankAccountsByUserId(userId, pagination), (e) =>
      fromUnknown(e, "Failed to retrieve bank accounts"),
    );
  },

  getAllBankAccountsResult(pagination: Pagination): ResultAsync<repository.PaginatedResult<any>, AppError> {
    if (
      isNaN(pagination.page) ||
      isNaN(pagination.limit) ||
      pagination.page < 1 ||
      pagination.limit < 1 ||
      pagination.limit > 100
    ) {
      return errAsync(
        validationError("Invalid pagination parameters", [
          ...(isNaN(pagination.page) || pagination.page < 1
            ? [{ code: ApiErrorCode.VALIDATION_ERROR, message: "Page must be a positive integer" }]
            : []),
          ...(isNaN(pagination.limit) || pagination.limit < 1 || pagination.limit > 100
            ? [{ code: ApiErrorCode.VALIDATION_ERROR, message: "Limit must be between 1 and 100" }]
            : []),
        ]),
      );
    }
    return ResultAsync.fromPromise(repository.getAllBankAccounts(pagination), (e) => fromUnknown(e));
  },

  deleteBankAccountResult(bankAccount: BankAccount, userId: string): ResultAsync<BankAccount, AppError> {
    return enforceMinActiveBankAccount(userId)
      .andThen(() => {
        const check = enforceZeroBalance(bankAccount);
        return check.isErr() ? errAsync(check.error) : okAsync(undefined);
      })
      .andThen(() =>
        ResultAsync.fromPromise(repository.deleteBankAccount(bankAccount.id), (e) =>
          fromUnknown(e, "Failed to delete bank account"),
        ),
      );
  },

  getBankAccountByNumberResult(bankNumber: string): ResultAsync<BankAccount, AppError> {
    return ResultAsync.fromPromise(repository.getBankAccountByNumber(bankNumber), (e) => fromUnknown(e)).andThen(
      (ba) => (ba ? okAsync(ba) : errAsync(notFound("Bank account not found"))),
    );
  },

  renameBankAccountResult(id: string, userId: string, newName: string): ResultAsync<BankAccount, AppError> {
    return ResultAsync.fromPromise(getUniqueBankAccountName(newName, userId, id), (e) => fromUnknown(e)).andThen(
      (finalName) =>
        ResultAsync.fromPromise(repository.updateBankAccountName(id, finalName), (e) =>
          fromUnknown(e, "Failed to rename bank account"),
        ),
    );
  },

  // --- Legacy wrapper methods (used by web components via server actions) ---

  async createBankAccount(
    bankAccount: Pick<BankAccount, "userId" | "currency"> & { name?: string; number?: string; balance?: number },
  ): Promise<SuccessResponse<BankAccount> | ErrorResponse> {
    return toServiceResponse(this.createBankAccountResult(bankAccount), "Bank account created successfully");
  },

  async getBankAccountByIdAndUserId(id: string, userId: string) {
    return toServiceResponse(this.getBankAccountByIdAndUserIdResult(id, userId), "Bank account retrieved successfully");
  },

  async getBankAccountById(id: string) {
    return toServiceResponse(this.getBankAccountByIdResult(id), "Bank account retrieved successfully");
  },

  async getMyBankAccounts(userId: string, pagination: Pagination) {
    return toServiceResponse(this.getMyBankAccountsResult(userId, pagination), "Bank accounts retrieved successfully");
  },

  async getAllBankAccounts(pagination: Pagination) {
    return toServiceResponse(this.getAllBankAccountsResult(pagination), "Bank accounts retrieved successfully");
  },

  async deleteBankAccount(
    bankAccount: BankAccount,
    userId: string,
  ): Promise<SuccessResponse<BankAccount> | ErrorResponse> {
    return toServiceResponse(this.deleteBankAccountResult(bankAccount, userId), "Bank account deleted successfully");
  },

  async getBankAccountByNumber(bankNumber: string): Promise<SuccessResponse<BankAccount> | ErrorResponse> {
    return toServiceResponse(this.getBankAccountByNumberResult(bankNumber), "Bank account retrieved successfully");
  },

  async renameBankAccount(
    id: string,
    userId: string,
    newName: string,
  ): Promise<SuccessResponse<BankAccount> | ErrorResponse> {
    return toServiceResponse(this.renameBankAccountResult(id, userId, newName), "Bank account renamed successfully");
  },
};

export default bankAccountService;
