"use client";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function RegisterSuccessPage() {
  return (
    <div className="mx-auto max-w-sm py-16">
      <div className="rounded-2xl border-3 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900">
        <div className="h-3 rounded-t-xl border-b-3 border-black bg-[#7ED957]" />
        <div className="p-8 text-center">
          {/* Checkmark icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-3 border-black bg-[#7ED957] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <CheckCircle className="h-8 w-8" />
          </div>

          <h2 className="mb-2 text-2xl font-black">Registration Successful!</h2>
          <p className="mb-6 text-sm text-muted-foreground">You can now log in and start using Czechitoken.</p>

          <Link href="/dashboard" className="block">
            <Button className="w-full border-3 border-black bg-[#ff4c91] font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#e6447f] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
              Continue to the app
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
