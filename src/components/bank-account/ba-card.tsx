"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BankAccount } from "@prisma/client";
import Image from "next/image";
import CustomSession from "../../../types/session-betterAuth";
import { DeleteBankAccountButton } from "./delete-ba-button";
import { RenameDialog } from "./rename-ba-dialog";

interface Props {
  bankAccount: BankAccount;
  session: Pick<CustomSession, "token" | "userId" | "name">;
  onDelete?: () => void;
  onRename?: () => void;
}

export default function BankAccountCard({ bankAccount, session, onDelete, onRename }: Props) {
  return (
    <Card className="group relative max-w-[400px] duration-300 hover:shadow-md">
      <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
        <DeleteBankAccountButton
          bankAccount={bankAccount}
          session={{
            token: session.token,
            userId: session.userId,
            name: session.name,
          }}
          onDeleted={onDelete}
        />
      </div>
      <CardHeader>
        <div className="flex w-full items-center justify-between">
          <CardTitle>
            <div className="flex gap-2">
              {bankAccount.name}
              <RenameDialog
                bankAccountId={bankAccount.id}
                currentName={bankAccount.name}
                session={session}
                onRenamed={onRename}
              />
            </div>
          </CardTitle>
        </div>
        <CardDescription>{bankAccount.currency}</CardDescription>
      </CardHeader>
      <CardContent>
        <h1 className="flex scroll-m-20 flex-row items-center gap-2 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-5xl">
          <Image
            src="/czechitoken-black.svg"
            alt="Czechitoken"
            width={40}
            height={40}
            className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10"
          />
          <span className="truncate">{bankAccount.balance.toFixed(1)}</span>
        </h1>
        <p className="text-gray-500">Currency: {bankAccount.currency}</p>
      </CardContent>
    </Card>
  );
}
