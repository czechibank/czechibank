"use server";
import prisma from "@/lib/db";
import { Currency } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function sendMoney({
  fromBankId,
  toBankId,
  amount,
  currency,
}: {
  toBankId: string;
  fromBankId: string;
  amount: number;
  currency: Currency;
}) {
  const response = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        amount: amount,
        currency: currency,
        fromBankId: fromBankId,
        toBankId: toBankId,
      },
      select: {
        amount: true,
        createdAt: true,
        id: true,
        currency: true,
        from: {
          select: {
            number: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        to: {
          select: {
            number: true,
          },
        },
      },
    }),
    prisma.bankAccount.update({
      where: {
        id: fromBankId,
      },
      data: {
        balance: {
          decrement: amount,
        },
      },
    }),
    prisma.bankAccount.update({
      where: {
        id: toBankId,
      },
      data: {
        balance: {
          increment: amount,
        },
      },
    }),
  ]);

  revalidatePath("/bankAccount");

  return response[0];
}

export async function getAllTransactionsByUserId(userId: string) {
  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        {
          from: {
            userId: userId,
          },
        },
        {
          to: {
            userId: userId,
          },
        },
      ],
    },
    include: {
      from: {
        include: {
          user: true,
        },
      },
      to: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return transactions;
}

export async function getAllTransactionsByUserAndBankAccountId(bankAccountId: string, limit: number) {
  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        {
          fromBankId: bankAccountId,
        },
        {
          toBankId: bankAccountId,
        },
      ],
    },
    include: {
      from: {
        include: {
          user: true,
        },
      },
      to: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return transactions;
}

export async function getAllTransactionsByUserIdForAPI(
  userId: string,
  orderBy: string,
  order: "asc" | "desc",
  page: number = 1,
  limit: number = 10,
) {
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        OR: [
          {
            from: {
              userId: userId,
            },
          },
          {
            to: {
              userId: userId,
            },
          },
        ],
      },
      orderBy: {
        [orderBy]: order,
      },
      select: {
        amount: true,
        id: true,
        createdAt: true,
        currency: true,
        from: {
          select: {
            id: true,
            number: true,
            user: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
        to: {
          select: {
            id: true,
            number: true,
            user: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
    }),
    prisma.transaction.count({
      where: {
        OR: [
          {
            from: {
              userId: userId,
            },
          },
          {
            to: {
              userId: userId,
            },
          },
        ],
      },
    }),
  ]);

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getTransactionDetailByTransactionId(transactionId: string, userId: string) {
  const transaction = await prisma.transaction.findUnique({
    where: {
      id: transactionId,
      OR: [
        {
          from: {
            userId: userId,
          },
        },
        {
          to: {
            userId: userId,
          },
        },
      ],
    },
    include: {
      from: {
        select: {
          balance: false,
          number: true,
          currency: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      to: {
        select: {
          balance: false,
          number: true,
          currency: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return transaction;
}
