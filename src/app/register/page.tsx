import { RegisterForm } from "@/components/register/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import userService from "@/domain/user-domain/user-service";

import { AlertCircle } from "lucide-react";
import { headers } from "next/headers";

export default async function RegisterPage() {
  const session = await userService.server.getSession(await headers());

  if (session) {
    return (
      <div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>You are already registered</AlertTitle>
          <AlertDescription>
            You are already registered and logged in. If you need to create new account, please logout first.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  return (
    <div>
      <h1 className="my-8 mb-3 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Register</h1>
      <p className="mb-9 text-sm text-muted-foreground"></p>

      <RegisterForm />
    </div>
  );
}
