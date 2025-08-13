"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BankAccount } from "@prisma/client";
import Image from "next/image";
import { DeleteBankAccountButton } from "./delete-ba-button";

interface Props {
  bankAccount: BankAccount;
  session: { token: string; userId: string; name: string };
  onDelete?: () => void;
}

export default function BankAccountCard({ bankAccount, session, onDelete }: Props) {
  return (
    <Card className="w-max-[400px] group relative duration-300 hover:shadow-md">
      <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
        <DeleteBankAccountButton
          bankAccountId={bankAccount.id}
          session={{
            token: session.token,
            userId: session.userId,
            name: session.name,
          }}
          onDeleted={onDelete}
        />
      </div>
      <CardHeader>
        <CardTitle>{bankAccount.name}</CardTitle>
        <CardDescription>{bankAccount.currency}</CardDescription>
      </CardHeader>
      <CardContent>
        <h1 className="flex scroll-m-20 flex-row items-center space-x-2 text-5xl font-extrabold tracking-tight lg:text-5xl">
          <Image src="/czechitoken-black.svg" alt="Czechitoken" width={40} height={40} />
          <span>{bankAccount.balance.toFixed(1)}</span>
        </h1>
        <p className="text-gray-500">Currency: {bankAccount.currency}</p>
      </CardContent>
    </Card>
  );
}
