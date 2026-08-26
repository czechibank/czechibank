"use server";
import prisma from "@/lib/db";
import { Currency } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type SendMoneyResult = {
  amount: number;
  createdAt: Date;
  id: string;
  currency: Currency;
  from: {
    number: string;
    user: {
      name: string;
    };
  };
  to: {
    number: string;
  };
};

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
}): Promise<SendMoneyResult> {
  const response = await prisma.$transaction(async (tx) => {
    // Check and lock the source account balance
    const fromAccount = await tx.bankAccount.findUnique({
      where: { id: fromBankId },
      select: { balance: true },
    });

    if (!fromAccount) {
      throw new Error("Source bank account not found");
    }

    if (fromAccount.balance < amount) {
      throw new Error("INSUFFICIENT_BALANCE");
    }

    // Create the transaction record
    const transaction = await tx.transaction.create({
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
    });

    // Decrement source account balance
    await tx.bankAccount.update({
      where: {
        id: fromBankId,
      },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });

    // Increment destination account balance
    await tx.bankAccount.update({
      where: {
        id: toBankId,
      },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    return transaction;
  });

  revalidatePath("/bankAccount");

  return response;
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
