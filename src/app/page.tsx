import BankAccountsList from "@/components/bank-account/ba-list";
import { getBankAccountsByUserId } from "@/domain/bankAccount-domain/ba-repository";
import userService from "@/domain/user-domain/user-service";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const apikeyHeaders = await headers();
  const session = await userService.server.getSession(apikeyHeaders);

  if (!session) {
    redirect("/signin");
  }
  const { id, token, userId, expiresAt, createdAt, updatedAt, ipAddress, userAgent } = session.session;

  const bankAccounts = await getBankAccountsByUserId(session.user.id);

  return (
    <main className="">
      <h1 className="mb-8 mt-10 text-3xl font-extrabold"> Hello {session.user.name}!</h1>
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
