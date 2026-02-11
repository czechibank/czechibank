import { RegisterForm } from "@/components/register/form";
import userService from "@/domain/user-domain/user-service";

import { AlertCircle, UserPlus } from "lucide-react";
import { headers } from "next/headers";

export default async function RegisterPage() {
  const session = await userService.server.getSession(await headers());

  if (session) {
    return (
      <div className="mx-auto max-w-md py-12">
        <div className="rounded-2xl border-3 border-black bg-[#FFE566] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-white">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black">You are already registered</h3>
              <p className="mt-1 text-sm">
                You are already registered and logged in. If you need to create new account, please logout first.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-md py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border-3 border-black bg-[#7ED957] px-4 py-2 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <UserPlus className="h-4 w-4" />
          Join Us
        </div>
        <h1 className="text-4xl font-black tracking-tight">
          <span className="relative inline-block">
            <span className="relative z-10">Register</span>
            <span className="absolute -bottom-1 left-0 h-3 w-full bg-[#7ED957]" />
          </span>
        </h1>
      </div>

      <RegisterForm />
    </div>
  );
}
