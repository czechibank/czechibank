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

export async function getBankAccountsByUserId(
  userId: string,
  { page = 1, limit = 10 }: PaginationParams = {},
): Promise<PaginatedResult<any>> {
  if (!userId) throw new Error("userId is required");

  const skip = (page - 1) * limit;

  const [bankAccounts, total] = await Promise.all([
    prisma.bankAccount.findMany({
      where: {
        userId: userId,
      },
      skip,
      take: limit,
    }),
    prisma.bankAccount.count({
      where: {
        userId: userId,
      },
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
    },
  });

  return bankAccount;
}

export async function getBankAccountByNumber(bankNumber: string) {
  const bankAccount = await prisma.bankAccount.findFirst({
    where: {
      number: bankNumber,
    },
  });

  return bankAccount;
}

export async function deleteBankAccount(bankAccountId: string) {
  const bankAccount = await prisma.bankAccount.delete({
    where: {
      id: bankAccountId,
    },
  });

  return bankAccount;
}

export async function getAllBankAccounts({ page = 1, limit = 10 }: PaginationParams = {}): Promise<
  PaginatedResult<Pick<BankAccount, "number" | "name"> & { user: Pick<User, "name"> }>
> {
  const skip = (page - 1) * limit;

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
      skip,
      take: limit,
      orderBy: {
        number: "asc",
      },
    }),
    prisma.bankAccount.count(),
  ]);

  return {
    items: bankAccounts,
    total,
    page,
    limit,
  };
}
