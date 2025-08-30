import { ApiErrorCode, ErrorResponse, errorResponse, SuccessResponse, successResponse } from "@/lib/response";
import { BankAccount } from "@prisma/client";
import { enforceMinActiveBankAccount, getUniqueBankAccountName } from "./ba-helpers";
import * as repository from "./ba-repository";

type Pagination = {
  page: number;
  limit: number;
};
type BankAccountSummary = {
  id: string;
  name: string;
};

// // Enforces that a user must always have at least 1 active bank account
// async function enforceMinActiveBankAccount(userId: string) {
//   const activeAccounts = await repository.getBankAccountsByUserId(userId, {});
//   if (activeAccounts.total <= 1) {
//     throw new Error("Cannot delete the last active bank account");
//   }
// }

// //auto rename duplicates of already existing BA names
// export async function getUniqueBankAccountName(
//   baseName: string,
//   userId: string,
//   currentAccountId?: string,
// ): Promise<string> {
//   const existingAccounts: BankAccountSummary[] = await repository.findActiveBankAccountsByUser(userId, baseName);

//   // Exclude the account being renamed
//   const filteredAccounts = currentAccountId
//     ? existingAccounts.filter((ba) => ba.id !== currentAccountId)
//     : existingAccounts;

//   const used = new Set(filteredAccounts.map((ba) => parseInt(ba.name.match(/\((\d+)\)$/)?.[1] || "0", 10)));
//   if (!used.has(0)) {
//     return baseName;
//   }
//   let nextNumber = 1;
//   while (used.has(nextNumber)) nextNumber++;
//   return `${baseName}(${String(nextNumber).padStart(2, "0")})`;
// }

const bankAccountService = {
  async createBankAccount(
    bankAccount: Pick<BankAccount, "userId" | "currency" | "name">,
  ): Promise<SuccessResponse<BankAccount> | ErrorResponse> {
    try {
      const finalName = await getUniqueBankAccountName(bankAccount.name, bankAccount.userId);
      const result = await repository.createBankAccount({ ...bankAccount, name: finalName });
      return successResponse("Bank account created successfully", result);
    } catch (error: any) {
      return errorResponse(error?.message || "Failed to create bank account", ApiErrorCode.INTERNAL_ERROR);
    }
  },

  async getBankAccountById(id: string, userId: string) {
    const bankAccount = await repository.getBankAccountByIdAndUserId(id, userId);

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

  async deleteBankAccount(id: string, userId: string): Promise<SuccessResponse<BankAccount> | ErrorResponse> {
    try {
      await enforceMinActiveBankAccount(userId);

      const deletedBankAccount = await repository.deleteBankAccount(id);
      return successResponse("Bank account deleted successfully", deletedBankAccount);
    } catch (error: any) {
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
