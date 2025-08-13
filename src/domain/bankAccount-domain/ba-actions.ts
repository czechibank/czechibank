import { ApiErrorCode, ErrorResponse, SuccessResponse, errorResponse, successResponse } from "@/lib/response";
import { BankAccount, Currency } from "@prisma/client";
import bankAccountService from "./ba-service";

interface Session {
  userId: string;
}

const validCurrencies = Object.values(Currency); // ['CZECHITOKEN', 'CZK', 'USD']

function isValidCurrency(value: string): value is Currency {
  return validCurrencies.includes(value as Currency);
}

export async function createBankAccountAction(
  data: { name: string; currency: string },
  session: Session,
): Promise<SuccessResponse<BankAccount> | ErrorResponse> {
  try {
    if (!isValidCurrency(data.currency)) {
      return errorResponse(`Invalid currency: ${data.currency}`, ApiErrorCode.VALIDATION_ERROR);
    }
    const bankAccount = await bankAccountService.createBankAccount({
      userId: session.userId,
      currency: data.currency as Currency,
      name: data.name,
    });
    return bankAccount;
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : String(err), ApiErrorCode.INTERNAL_ERROR);
  }
}

export async function deleteBankAccountAction(
  id: string,
  session: Session,
): Promise<SuccessResponse<BankAccount> | ErrorResponse> {
  try {
    if (!session?.userId) {
      return errorResponse("User is not authenticated", ApiErrorCode.UNAUTHORIZED);
    }

    const existingAccount = await bankAccountService.getBankAccountById(id, session.userId);
    if (!("data" in existingAccount) || !existingAccount.data) {
      return errorResponse("Bank account not found or unauthorized", ApiErrorCode.NOT_FOUND);
    }

    const deletedAccount = await bankAccountService.deleteBankAccount(id);

    if ("data" in deletedAccount && deletedAccount.data) {
      return successResponse("Bank account deleted successfully", deletedAccount.data);
    } else {
      return deletedAccount;
    }
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : String(err), ApiErrorCode.INTERNAL_ERROR);
  }
}
