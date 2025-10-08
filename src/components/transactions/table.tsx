"use server";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import transactionService from "@/domain/transaction-domain/transaction-service";
import { Transaction, User } from "@prisma/client";
import { UserAvatar } from "../user/avatar";
import { AlertDestructive } from "./alert";

const LIMIT = 50;

export async function TransactionTable({ bankAccountId }: { bankAccountId: string }) {
  const transactions = await transactionService.getAllTransactionsByUserAndBankAccountId(bankAccountId, LIMIT);

  type TransactionWithUsers = Transaction & {
    to: { user: User };
    from: { user: User };
  };

  function calculateTotalAmount(transactions: TransactionWithUsers[], bankAccount: string) {
    let total = 0;

    for (const transaction of transactions) {
      if (transaction.fromBankId === bankAccount) {
        total -= transaction.amount;
      } else if (transaction.toBankId === bankAccount) {
        total += transaction.amount;
      }
    }

    return total;
  }

  const totalAmount = calculateTotalAmount(transactions, bankAccountId);

  return (
    <div className="my-8 w-full">
      <h1>Transactions</h1>
      <AlertDestructive
        message={`DUE to bad performance, you will see last ${LIMIT} transactions. Use API to see ALL your transactions.`}
      />
      <Table>
        <TableCaption>A list of your recent transactions.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden md:table-cell">Date</TableHead>
            <TableHead className="">From</TableHead>
            <TableHead>To</TableHead>
            <TableHead className="text-right">Amount (CZK)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id.padStart(10)}>
              <TableCell className="hidden md:table-cell">
                {transaction.createdAt.toISOString().split("T")[0]}
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center justify-start space-x-2 md:flex-row">
                  <UserAvatar size={8} image={transaction.from.user.image ?? null} />
                  <span>{transaction.from.user.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-row items-center justify-start space-x-2">
                  <UserAvatar size={8} image={transaction.to.user.image ?? null} />
                  <span>{transaction.to.user.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">{transaction.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Received/Send</TableCell>
            <TableCell className="text-right">{totalAmount}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
