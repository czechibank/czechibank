import UserButton from "@/components/auth/user-button";
import { ModeToggle } from "@/components/theme/toggle-button";
import { AppFooter } from "@/components/ui/app-footer";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#FFFBF5] dark:bg-zinc-950">
      {/* Decorative blurred circles */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-20 top-40 h-40 w-40 rounded-full bg-pink-200/40 blur-3xl dark:bg-pink-900/20" />
        <div className="absolute -right-20 top-80 h-60 w-60 rounded-full bg-yellow-200/40 blur-3xl dark:bg-yellow-900/20" />
        <div className="absolute bottom-40 left-1/3 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-900/20" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b-3 border-black bg-white/80 backdrop-blur-sm dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between py-3 sm:px-6 md:px-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-3 border-black bg-[#FFFBF5] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-800">
              <Image src="/logo.svg" alt="CzechiBank" width={40} height={40} />
            </div>
            <span className="text-xl font-black">CzechiBank</span>
          </Link>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Suspense fallback={<div>Loading...</div>}>
              <UserButton />
            </Suspense>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="relative w-full flex-grow px-4 py-6 pb-10 sm:px-6">
        <div className="mx-auto max-w-3xl">{children}</div>
      </div>

      <AppFooter />
    </div>
  );
}
