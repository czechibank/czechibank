import { CreateDialog } from "@/components/bank-account/create-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBankAccountsByUserId } from "@/domain/bankAccount-domain/ba-repository";
import userService from "@/domain/user-domain/user-service";
import { BankAccount } from "@prisma/client";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await userService.server.getSession(await headers());

  if (!session) {
    redirect("/signin");
  }

  const bankAccounts = await getBankAccountsByUserId(session.user.id);

  return (
    <main className="">
      <h1 className="mb-8 mt-10 text-3xl font-extrabold"> Hello {session.user.name}!</h1>
      <div className="mb-4 flex justify-end">
        <CreateDialog />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {bankAccounts.items.map((ba) => (
          <Link key={ba.id} href={`/bankAccount/${ba.id}`}>
            <BankAccountCard bankAccount={ba} />
          </Link>
        ))}
      </div>
    </main>
  );
}

function BankAccountCard({ bankAccount }: { bankAccount: BankAccount }) {
  return (
    <Card className="w-max-[400px] duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle>{bankAccount.name}</CardTitle>
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
