import UserButton from "@/components/auth/user-button";
import { ModeToggle } from "@/components/theme/toggle-button";
import { AppFooter } from "@/components/ui/app-footer";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="w-full flex-grow px-4 py-4 pb-10 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-row items-center justify-between">
            <Link href={"/dashboard"} className="flex flex-row items-center space-x-2">
              <Image src={`/logo.svg`} alt={"Logo"} width="40" height="40" />
              <span className="text-2xl font-bold">CzechiBank</span>
            </Link>
            <div className="flex flex-1 items-center justify-end space-x-2 p-2">
              <ModeToggle />
              <Suspense fallback={<div>Loading...</div>}>
                <UserButton />
              </Suspense>
            </div>
          </div>
          {children}
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
