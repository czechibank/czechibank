"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { splitBankAccountNameForDisplay } from "@/domain/bankAccount-domain/ba-helpers";
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

/** Displays one bank account card, including muted rendering of the app-assigned numeric suffix. */
export default function BankAccountCard({ bankAccount, session, onDelete, onRename }: Props) {
  const { base, suffix } = splitBankAccountNameForDisplay(bankAccount.name);

  return (
    <Card className="w-max-[400px] group relative duration-300 hover:shadow-md">
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
            <div className="flex flex-wrap items-center gap-2">
              <span>{base}</span>
              {suffix ? <span className="text-muted-foreground">{suffix}</span> : null}
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
        <h1 className="flex scroll-m-20 flex-row items-center space-x-2 text-5xl font-extrabold tracking-tight lg:text-5xl">
          <Image src="/czechitoken-black.svg" alt="Czechitoken" width={40} height={40} />
          <span>{bankAccount.balance.toFixed(1)}</span>
        </h1>
        <p className="text-gray-500">Currency: {bankAccount.currency}</p>
      </CardContent>
    </Card>
  );
}
