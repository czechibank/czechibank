import BankAccountsList from "@/components/bank-account/ba-list";
import { getBankAccountsByUserId } from "@/domain/bankAccount-domain/ba-repository";
import userService from "@/domain/user-domain/user-service";
import { Sparkles } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await userService.server.getSession(await headers());

  if (!session) {
    redirect("/signin");
  }

  const bankAccounts = await getBankAccountsByUserId(session.user.id);

  return (
    <main className="pb-12">
      {/* Fun greeting header */}
      <div className="mb-8 mt-6">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border-3 border-black bg-[#FFE566] px-4 py-2 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <Sparkles className="h-4 w-4" />
          Dashboard
        </div>
        <h1 className="text-4xl font-black tracking-tight">
          Hello{" "}
          <span className="relative inline-block">
            <span className="relative z-10">{session.user.name}</span>
            <span className="absolute -bottom-1 left-0 h-3 w-full bg-[#ff4c91]" />
          </span>
          ! 👋
        </h1>
        <p className="mt-2 text-muted-foreground">Manage your bank accounts and make transfers</p>
      </div>
      <BankAccountsList
        initialBankAccounts={bankAccounts.items}
        session={{
          token: session.session.token,
          userId: session.session.userId,
          name: session.user.name,
        }}
      />
    </main>
  );
}
