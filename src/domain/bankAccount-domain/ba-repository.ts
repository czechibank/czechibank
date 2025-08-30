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

// find active accounts starting with a name
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
}: {
  userId: string;
  currency: Currency;
  name?: string;
}) {
  const bankAccount = await prisma.bankAccount.create({
    data: {
      userId: userId,
      currency: currency,
      name: name,
      number: generateRandomDigits(12) + "/5555",
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

  if (!bankAccount) {
    throw new Error("Failed to create bank account");
  }

  return bankAccount;
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
