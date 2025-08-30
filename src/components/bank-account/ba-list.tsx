"use client";

import { CreateDialog } from "@/components/bank-account/create-ba-dialog";
import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import { BankAccount } from "@prisma/client";
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
    <>
      <div className="mb-4 flex justify-end">
        <CreateDialog
          session={session}
          onCreated={(newBankAccount: BankAccount) => setAccounts((prev) => [...prev, newBankAccount])}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {accounts.map((ba) => (
          //comment Silviczka> div added to avoid oppening of bank account card while renaming
          <div key={ba.id}>
            <Link href={`/bankAccount/${ba.id}`}>
              <BankAccountCard bankAccount={ba} session={session} onDelete={handleRefresh} onRename={handleRefresh} />
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
