"use client";

import { CreateDialog } from "@/components/bank-account/create-ba-dialog";
import { BankAccount } from "@prisma/client";
import { useState } from "react";
import BankAccountCard from "./ba-card";

interface Props {
  initialBankAccounts: BankAccount[];
  session: Session;
}
interface Session {
  token: string;
  userId: string;
  name: string;
}

export default function BankAccountsList({ initialBankAccounts, session }: Props) {
  const [accounts, setAccounts] = useState(initialBankAccounts);

  function handleDelete(id: string) {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <CreateDialog
          session={session}
          onCreated={(newBankAccount: BankAccount) => setAccounts((prev) => [...prev, newBankAccount])}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {accounts.map((ba) => (
          <BankAccountCard key={ba.id} bankAccount={ba} session={session} onDelete={() => handleDelete(ba.id)} />
        ))}
      </div>
    </>
  );
}
