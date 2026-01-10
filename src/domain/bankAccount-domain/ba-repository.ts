"use server";
import prisma from "@/lib/db";
import { BankAccount, Currency, User } from "@prisma/client";

function generateRandomDigits(digitCount: number) {
  let randomNumber = "";
  for (let i = 0; i < digitCount; i++) {
    randomNumber += Math.floor(Math.random() * 10);
  }
  return randomNumber;
}

export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

// find active accounts starting with a name for rename
export async function findActiveBankAccountsByUser(userId: string, startsWith?: string) {
  return prisma.bankAccount.findMany({
    where: { userId, isActive: true, name: startsWith ? { startsWith } : undefined },
    select: { id: true, name: true },
  });
}

export async function getBankAccountsByUserId(
  userId: string,
  { page = 1, limit = 10 }: PaginationParams = {},
): Promise<PaginatedResult<any>> {
  if (!userId) throw new Error("userId is required");

  const skip = (page - 1) * limit;

  const whereClause = {
    userId,
    isActive: true,
  };

  const [bankAccounts, total] = await Promise.all([
    prisma.bankAccount.findMany({
      where: whereClause,
      skip,
      take: limit,
    }),
    prisma.bankAccount.count({
      where: whereClause,
    }),
  ]);

  return {
    items: bankAccounts,
    total,
    page,
    limit,
  };
}

export async function createBankAccount({
  userId,
  currency,
  name = "My Bank Account",
  balance,
  number,
}: {
  userId: string;
  currency: Currency;
  name?: string;
  balance: number;
  number?: string;
}) {
  // Try creating a bank account with a random number; retry on unique-constraint collisions.
  const MAX_ATTEMPTS = 6;
  let lastError: any = null;

  // checking how many bank accounts the user has
  const bankAccountsCount = await prisma.bankAccount.count({
    where: { userId },
  });

  name = name === "My Bank Account" ? `My Bank Account (${bankAccountsCount + 1})` : name;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    //if BA number is provided (seeded users), use it, otherwise random generation
    const candidateNumber = number ?? generateRandomDigits(12) + "/5555";
    try {
      const bankAccount = await prisma.bankAccount.create({
        data: {
          userId: userId,
          currency: currency,
          name: name,
          balance,
          number: candidateNumber,
          isActive: true,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      return bankAccount;
    } catch (error: any) {
      lastError = error;
      // Prisma unique constraint error code is P2002 — retry with a new number
      if (error?.code === "P2002") {
        // small backoff before retrying
        await new Promise((res) => setTimeout(res, 50 * attempt));
        continue;
      }
      // For other errors, rethrow immediately
      throw error;
    }
  }

  throw new Error(
    `Failed to create unique bank account after ${MAX_ATTEMPTS} attempts: ${lastError?.message || lastError}`,
  );
}

export async function getBankAccountByIdAndUserId(bankAccountId: string, userId: string) {
  console.log(bankAccountId, userId);
  const bankAccount = await prisma.bankAccount.findFirst({
    where: {
      id: bankAccountId,
      userId: userId,
      isActive: true,
    },
  });

  return bankAccount;
}

export async function getBankAccountById(bankAccountId: string) {
  const bankAccount = await prisma.bankAccount.findFirst({
    where: {
      id: bankAccountId,
      isActive: true,
    },
  });

  return bankAccount;
}

export async function getBankAccountByNumber(bankNumber: string) {
  const bankAccount = await prisma.bankAccount.findFirst({
    where: {
      number: bankNumber,
      isActive: true,
    },
  });

  return bankAccount;
}

export async function deleteBankAccount(bankAccountId: string) {
  const bankAccount = await prisma.bankAccount.update({
    where: {
      id: bankAccountId,
    },
    data: { isActive: false },
  });

  return bankAccount;
}

export async function getAllBankAccounts({ page = 1, limit = 10 }: PaginationParams = {}): Promise<
  PaginatedResult<Pick<BankAccount, "number" | "name"> & { user: Pick<User, "name"> }>
> {
  const skip = (page - 1) * limit;

  const whereClause = {
    isActive: true,
  };
  const [bankAccounts, total] = await Promise.all([
    prisma.bankAccount.findMany({
      select: {
        number: true,
        // id: true,
        // balance: true,
        // currency: true,
        name: true,
        user: {
          select: {
            name: true,
          },
        },
      },
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        number: "asc",
      },
    }),
    prisma.bankAccount.count({ where: whereClause }),
  ]);

  return {
    items: bankAccounts,
    total,
    page,
    limit,
  };
}

export async function updateBankAccountName(id: string, newName: string): Promise<BankAccount> {
  const updated = await prisma.bankAccount.update({
    where: { id },
    data: { name: newName },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!updated) {
    throw new Error("Failed to update bank account name");
  }

  return updated;
}
