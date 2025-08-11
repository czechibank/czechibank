import { Currency } from "@prisma/client";
import bankAccountService from "./ba-service";

interface Session {
  userId: string;
}

const validCurrencies = Object.values(Currency); // ['CZECHITOKEN', 'CZK', 'USD']

function isValidCurrency(value: string): value is Currency {
  return validCurrencies.includes(value as Currency);
}

export async function createBankAccountAction(data: { name: string; currency: string }, session: Session) {
  try {
    if (!isValidCurrency(data.currency)) {
      return { success: false, error: `Invalid currency: ${data.currency}` };
    }
    const bankAccount = await bankAccountService.createBankAccount({
      userId: session.userId,
      currency: data.currency as Currency,
      name: data.name,
    });
    return { success: true, data: bankAccount };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : err };
  }
}
