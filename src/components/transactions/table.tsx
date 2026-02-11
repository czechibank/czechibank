"use server";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import transactionService from "@/domain/transaction-domain/transaction-service";
import { Transaction, User } from "@prisma/client";
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, Inbox } from "lucide-react";
import { UserAvatar } from "../user/avatar";

const LIMIT = 50;

type TransactionWithUsers = Transaction & {
  to: { user: User };
  from: { user: User };
};

function formatDate(date: Date): { day: string; month: string } {
  return {
    day: date.getDate().toString(),
    month: date.toLocaleString("en", { month: "short" }).toUpperCase(),
  };
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export async function TransactionTable({ bankAccountId }: { bankAccountId: string }) {
  const transactions = await transactionService.getAllTransactionsByUserAndBankAccountId(bankAccountId, LIMIT);

  function isIncoming(transaction: TransactionWithUsers) {
    return transaction.toBankId === bankAccountId;
  }

  function getCounterparty(transaction: TransactionWithUsers) {
    return isIncoming(transaction) ? transaction.from.user : transaction.to.user;
  }

  function calculateTotal(transactions: TransactionWithUsers[]) {
    return transactions.reduce((total, t) => {
      return total + (isIncoming(t) ? t.amount : -t.amount);
    }, 0);
  }

  const totalAmount = calculateTotal(transactions);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-3 border-black bg-zinc-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-800">
          <Inbox className="h-8 w-8 text-zinc-400" />
        </div>
        <p className="text-lg font-black">No transactions yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Send some tokens to get started!</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Warning bar */}
      <div className="mb-4 flex items-center gap-3 rounded-xl border-2 border-black bg-[#FFE566] p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-white">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <p className="text-sm font-bold">Showing last {LIMIT} transactions. Use the API for the complete history.</p>
      </div>

      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="hidden w-[70px] md:table-cell">Date</TableHead>
            <TableHead>Transaction</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const incoming = isIncoming(transaction);
            const counterparty = getCounterparty(transaction);
            const date = formatDate(transaction.createdAt);

            return (
              <TableRow key={transaction.id}>
                {/* Date block */}
                <TableCell className="hidden py-3 md:table-cell">
                  <div className="flex flex-col items-center rounded-lg border-2 border-black bg-zinc-50 px-2 py-1 text-center dark:bg-zinc-800">
                    <span className="text-lg font-black leading-tight">{date.day}</span>
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground">{date.month}</span>
                  </div>
                </TableCell>

                {/* Transaction details */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    {/* Direction arrow badge */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-black ${
                        incoming ? "bg-[#7ED957]" : "bg-[#ff4c91]"
                      }`}
                    >
                      {incoming ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>

                    {/* Counterparty info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold">{incoming ? "Received from" : "Sent to"}</p>
                      <div className="flex items-center gap-1.5">
                        <UserAvatar size={5} image={counterparty.image ?? null} />
                        <span className="truncate text-sm text-muted-foreground">{counterparty.name}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Amount pill */}
                <TableCell className="py-3 text-right">
                  <span
                    className={`inline-block rounded-lg border-2 border-black px-3 py-1 text-sm font-black ${
                      incoming
                        ? "bg-[#7ED957]/20 text-green-700 dark:text-green-400"
                        : "bg-[#ff4c91]/20 text-pink-700 dark:text-pink-400"
                    }`}
                  >
                    {incoming ? "+" : "\u2212"}
                    {formatAmount(transaction.amount)} CZK
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow className="border-t-2 border-black">
            <TableCell colSpan={2} className="hidden py-3 md:table-cell">
              <span className="font-black">Net Total</span>
            </TableCell>
            <TableCell className="py-3 md:hidden">
              <span className="font-black">Net Total</span>
            </TableCell>
            <TableCell className="py-3 text-right">
              <span
                className={`inline-block rounded-xl border-3 border-black px-4 py-1.5 text-sm font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                  totalAmount >= 0 ? "bg-[#7ED957]" : "bg-[#ff4c91]"
                }`}
              >
                {totalAmount >= 0 ? "+" : "\u2212"}
                {formatAmount(Math.abs(totalAmount))} CZK
              </span>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
