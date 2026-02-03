"use client";

import { CreateDialog } from "@/components/bank-account/create-ba-dialog";
import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import { BankAccount } from "@prisma/client";
import { CreditCard } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import CustomSession from "../../../types/session-betterAuth";
import BankAccountCard from "./ba-card";
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
      // Re-fetch bank accounts whenever the page is restored from the browser's back/forward cache
      handleRefresh();
    };

    window.addEventListener("pageshow", handlePageShow);

    //Fetch fresh data immediately on initial page load (mount).
    handleRefresh();

    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return (
    <div>
      {/* Section header with create button */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-3 border-black bg-[#6EC1E4] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
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
        <div className="grid gap-6 sm:grid-cols-2">
          {accounts.map((ba) => (
            <div key={ba.id}>
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
