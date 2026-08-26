"use server";
import transactionService from "@/domain/transaction-domain/transaction-service";
import { TransactionTableView } from "./table-view";

const LIMIT = 50;

export async function TransactionTable({ bankAccountId }: { bankAccountId: string }) {
  const transactions = await transactionService.getAllTransactionsByUserAndBankAccountId(bankAccountId, LIMIT);

  return <TransactionTableView transactions={transactions} bankAccountId={bankAccountId} limit={LIMIT} />;
}
