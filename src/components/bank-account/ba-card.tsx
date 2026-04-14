"use client";

import { BankAccount } from "@prisma/client";
import { Check, Copy, Wallet } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import CustomSession from "../../../types/session-betterAuth";
import { DeleteBankAccountButton } from "./delete-ba-button";
import { RenameDialog } from "./rename-ba-dialog";

import { nbPalette } from "@/lib/neo-brutalism";

const cardColors = nbPalette;

interface Props {
  bankAccount: BankAccount;
  session: Pick<CustomSession, "token" | "userId" | "name">;
  onDelete?: () => void;
  onRename?: () => void;
}

function formatBalance(balance: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance);
}

export { formatBalance };

export default function BankAccountCard({ bankAccount, session, onDelete, onRename }: Props) {
  const [copied, setCopied] = useState(false);

  const colorIndex = bankAccount.id.charCodeAt(0) % cardColors.length;
  const accentColor = cardColors[colorIndex];

  function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(bankAccount.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="group relative max-w-full overflow-hidden rounded-2xl border-3 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900 sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      {/* Color accent bar */}
      <div className="h-3 rounded-t-xl border-b-3 border-black" style={{ backgroundColor: accentColor }} />

      {/* Delete button - top right */}
      <div className="absolute right-3 top-6 opacity-0 transition-opacity group-hover:opacity-100">
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

      <div className="p-4 sm:p-5">
        {/* Header: icon + name + rename */}
        <div className="mb-4 flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black text-black"
            style={{ backgroundColor: accentColor }}
          >
            <Wallet className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-lg font-black">{bankAccount.name}</h3>
              <RenameDialog
                bankAccountId={bankAccount.id}
                currentName={bankAccount.name}
                session={session}
                onRenamed={onRename}
              />
            </div>
            <p className="text-xs font-bold text-muted-foreground">{bankAccount.currency}</p>
          </div>
        </div>

        {/* Account number — copyable */}
        <button
          type="button"
          onClick={handleCopy}
          className="mb-4 flex w-full items-center justify-between gap-2 rounded-lg border-2 border-black/30 bg-orange-100 px-3 py-2 transition-all hover:border-solid hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-800 dark:hover:bg-zinc-700"
          title="Click to copy account number"
        >
          <span className="truncate font-mono text-xs tracking-wide text-muted-foreground">{bankAccount.number}</span>
          {copied ? (
            <span className="flex shrink-0 items-center gap-1 text-green-600">
              <Check className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold">Copied!</span>
            </span>
          ) : (
            <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
        </button>

        {/* Balance */}
        <div className="rounded-xl border-2 border-black bg-zinc-50 p-3 dark:bg-zinc-800 sm:p-4">
          <p className="mb-1 text-xs font-bold uppercase text-muted-foreground">Balance</p>
          <div className="flex items-center gap-3">
            <Image src="/czechitoken-black.svg" alt="Czechitoken" width={28} height={28} className="dark:invert" />
            <span className="text-2xl font-black tracking-tight sm:text-3xl">{formatBalance(bankAccount.balance)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
