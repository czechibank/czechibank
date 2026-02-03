"use client";

import { BankAccount } from "@prisma/client";
import { Wallet } from "lucide-react";
import Image from "next/image";
import CustomSession from "../../../types/session-betterAuth";
import { DeleteBankAccountButton } from "./delete-ba-button";
import { RenameDialog } from "./rename-ba-dialog";

// Neobrutalist color palette
const cardColors = ["#ff4c91", "#FFE566", "#6EC1E4", "#FF6B35", "#7ED957", "#B794F6"];

interface Props {
  bankAccount: BankAccount;
  session: Pick<CustomSession, "token" | "userId" | "name">;
  onDelete?: () => void;
  onRename?: () => void;
}

export default function BankAccountCard({ bankAccount, session, onDelete, onRename }: Props) {
  // Pick a consistent color based on account id
  const colorIndex = bankAccount.id.charCodeAt(0) % cardColors.length;
  const accentColor = cardColors[colorIndex];

  return (
    <div className="group relative rounded-2xl border-3 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900">
      {/* Color accent bar */}
      <div className="h-3 rounded-t-xl border-b-3 border-black" style={{ backgroundColor: accentColor }} />

      {/* Delete button - top right */}
      <div className="absolute right-3 top-5 opacity-0 transition-opacity group-hover:opacity-100">
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

      <div className="p-5">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black"
              style={{ backgroundColor: accentColor }}
            >
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black">{bankAccount.name}</h3>
                <RenameDialog
                  bankAccountId={bankAccount.id}
                  currentName={bankAccount.name}
                  session={session}
                  onRenamed={onRename}
                />
              </div>
              <p className="text-xs text-muted-foreground">{bankAccount.currency}</p>
            </div>
          </div>
        </div>

        {/* Balance */}
        <div className="rounded-xl border-2 border-black bg-zinc-50 p-4 dark:bg-zinc-800">
          <p className="mb-1 text-xs font-bold uppercase text-muted-foreground">Balance</p>
          <div className="flex items-center gap-3">
            <Image src="/czechitoken-black.svg" alt="Czechitoken" width={32} height={32} className="dark:invert" />
            <span className="text-4xl font-black">{bankAccount.balance.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
