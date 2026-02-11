"use client";

import { CreateDialog } from "@/components/bank-account/create-ba-dialog";
import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import { BankAccount } from "@prisma/client";
import { CreditCard, TrendingUp, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import CustomSession from "../../../types/session-betterAuth";
import BankAccountCard, { formatBalance } from "./ba-card";

interface BankAccountListProps {
  initialBankAccounts: BankAccount[];
  session: Pick<CustomSession, "token" | "userId" | "name">;
}

export default function BankAccountsList({ initialBankAccounts, session }: BankAccountListProps) {
  const [accounts, setAccounts] = useState(initialBankAccounts);
  const pagination = { page: 1, limit: 100 };

  async function handleRefresh() {
    try {
      const response = await bankAccountService.getMyBankAccounts(session.userId, pagination);

      if (!response.success) {
        console.error("Failed to fetch bank accounts:", response.message);
        return;
      }

      const activeBankAccounts = response.data.items.filter((ba) => ba.isActive);
      setAccounts(activeBankAccounts);
      console.log("Fetched active bank accounts:", activeBankAccounts);
    } catch (err) {
      console.error("Error fetching bank accounts:", err);
    }
  }

  useEffect(() => {
    const handlePageShow = () => {
      handleRefresh();
    };

    window.addEventListener("pageshow", handlePageShow);
    handleRefresh();

    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const totalBalance = accounts.reduce((sum, ba) => sum + ba.balance, 0);

  return (
    <div className="min-w-0">
      {/* Section header with create button */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-3 border-black bg-[#6EC1E4] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black">Your Accounts</h2>
            <p className="text-sm text-muted-foreground">
              {accounts.length} account{accounts.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <CreateDialog
          session={session}
          onCreated={(newBankAccount: BankAccount) => setAccounts((prev) => [...prev, newBankAccount])}
        />
      </div>

      {/* Portfolio summary */}
      {accounts.length > 0 && (
        <div className="mb-6 flex items-center gap-4 rounded-xl border-2 border-black bg-zinc-50 p-4 dark:bg-zinc-800">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-[#FFE566]">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase text-muted-foreground">Portfolio Total</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0">
              <Image src="/czechitoken-black.svg" alt="Czechitoken" width={20} height={20} className="dark:invert" />
              <span className="text-xl font-black tracking-tight sm:text-2xl">{formatBalance(totalBalance)}</span>
              <span className="text-xs font-bold text-muted-foreground">CZECHITOKEN</span>
            </div>
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-xs font-bold uppercase text-muted-foreground">Accounts</p>
            <div className="flex items-center justify-end gap-1.5">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-black">{accounts.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Accounts grid */}
      {accounts.length === 0 ? (
        <div className="rounded-2xl border-3 border-dashed border-black bg-zinc-50 p-12 text-center dark:bg-zinc-900">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-3 border-black bg-[#FFE566]">
            <CreditCard className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-black">No accounts yet</h3>
          <p className="mb-4 text-muted-foreground">Create your first bank account to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {accounts.map((ba) => (
            <div key={ba.id} className="min-w-0">
              <Link href={`/bankAccount/${ba.id}`}>
                <BankAccountCard bankAccount={ba} session={session} onDelete={handleRefresh} onRename={handleRefresh} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
