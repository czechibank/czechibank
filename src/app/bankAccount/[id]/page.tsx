"use server";
import { TransactionTable } from "@/components/transactions/table";
import { TransactionTransfer } from "@/components/transactions/transfer";
import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import userService from "@/domain/user-domain/user-service";

import { incorrectBalanceDisplayFeature } from "@/domain/features-domain/features-application-service";
import featuresService from "@/domain/features-domain/features-service";
import { FeatureType } from "@/domain/features-domain/features.schema";
import { ArrowLeft, CreditCard, History, Send, Wallet } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { nbColors as colors } from "@/lib/neo-brutalism";

export default async function BankAccountPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await userService.server.getSession(await headers());

  if (!session) {
    redirect("/signin");
  }
  const bankAccount = await bankAccountService.getBankAccountByIdAndUserId(params.id, session.user.id);
  if (!bankAccount.success) {
    notFound();
  }
  const allUsers = await userService.server.getAllUsersWithBankAccounts();
  const allFeatures = await featuresService.server.getAllFeatures();

  // simulate a bug in the balance display
  function getBankBalance(balance: number, features: FeatureType[]): string {
    balance = incorrectBalanceDisplayFeature(features, balance);

    return balance.toFixed(1);
  }

  if (!session || !bankAccount || !allFeatures) {
    <h1 className="my-8 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">404</h1>;
  }
  if (bankAccount.success && allFeatures.success) {
    return (
      <div className="pb-12">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border-3 border-black bg-[#6EC1E4] px-4 py-2 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <CreditCard className="h-4 w-4" />
            Account Details
          </div>
          <h1 className="mb-2 text-4xl font-black tracking-tight">{bankAccount.data.name}</h1>
          <div className="inline-block rounded-lg border-2 border-black bg-zinc-100 px-3 py-1 font-mono text-sm dark:bg-zinc-800">
            {bankAccount.data.number}
          </div>
        </div>

        {/* Balance Card */}
        <div
          className="relative mb-8 overflow-hidden rounded-2xl border-3 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          style={{ backgroundColor: colors.pink }}
        >
          {/* Decorative elements */}
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border-4 border-black/20 bg-white/20" />
          <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full border-4 border-black/30 bg-white/20" />

          <div className="relative">
            <div className="mb-2 flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              <span className="text-sm font-bold uppercase">Current Balance</span>
            </div>
            <div className="flex items-center gap-4">
              <Image src="/czechitoken-black.svg" alt="Czechitoken" width={48} height={48} />
              <span className="text-2xl font-black md:text-6xl">
                {getBankBalance(bankAccount.data.balance, allFeatures.data)}
              </span>
            </div>
            <p className="mt-2 text-sm font-bold">{bankAccount.data.currency}</p>
          </div>
        </div>

        {/* Transfer Card */}
        <div className="mb-8 rounded-2xl border-3 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900">
          <div className="border-b-3 border-black p-5">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black"
                style={{ backgroundColor: colors.green }}
              >
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black">Transfer Money</h2>
                <p className="text-sm text-muted-foreground">Send tokens to another account</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            {allUsers.success && allFeatures.success && (
              <TransactionTransfer
                bankAccountNumber={bankAccount.data.number}
                userId={session.user.id}
                allUsers={allUsers.data}
                balance={bankAccount.data.balance}
                features={allFeatures.data}
              />
            )}
          </div>
        </div>

        {/* Transaction History Card */}
        <div className="rounded-2xl border-3 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900">
          <div className="border-b-3 border-black p-5">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black"
                style={{ backgroundColor: colors.yellow }}
              >
                <History className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black">Transaction History</h2>
                <p className="text-sm text-muted-foreground">Your recent transactions</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <TransactionTable bankAccountId={bankAccount.data.id} />
          </div>
        </div>
      </div>
    );
  }
}
