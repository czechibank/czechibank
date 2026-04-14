"use client";

import { AnimationLine } from "@/components/text-decorations";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Toast, useToast } from "@/components/ui/use-toast";
import { MIN_PASSWORD_LENGTH } from "@/constants";
import { LoginSchema, LoginSchemaType, UserBaseSchemaType } from "@/domain/user-domain/user-schema";
import userServiceClient from "@/domain/user-domain/user-service-client";
import { nbColors } from "@/lib/neo-brutalism";
import {
  broadcastSessionChanged,
  useRedirectToHomeWhenSignedIn,
  useSessionWithRefresh,
} from "@/lib/useSessionWithRefresh";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorContext } from "better-auth/react";
import { ArrowLeft, LogIn } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

/**
 * Sign-in page. Renders email/password form; redirects to home when the user already has a session.
 * On successful sign-in, broadcasts session change (so other tabs refresh) and the redirect hook navigates to `/`.
 */
export default function SignInPage() {
  const { toast } = useToast();
  const { data: session } = useSessionWithRefresh();
  useRedirectToHomeWhenSignedIn(session);

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    } satisfies LoginSchemaType,
  });

  const action: () => void = form.handleSubmit(async (data: UserBaseSchemaType): Promise<void> => {
    await userServiceClient.signIn({ email: data.email, password: data.password } satisfies UserBaseSchemaType, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "You are signed in",
        } satisfies Toast);
        broadcastSessionChanged();
        // useRedirectToHomeWhenSignedIn will redirect when session refetch completes; avoid double navigation (router.push + hook replace)
      },
      onError: (error: ErrorContext) => {
        form.resetField("password");

        toast({
          title: "Error",
          description: error?.error.message,
          variant: "destructive",
        } satisfies Toast);
      },
    });
  });

  return (
    <div className="mx-auto max-w-md py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="mb-4 flex w-fit items-center gap-1.5 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border-3 border-black bg-[#ff4c91] px-4 py-2 font-bold text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <LogIn className="h-4 w-4" />
          Welcome Back
        </div>
        <h1 className="text-4xl font-black tracking-tight">
          <span className="relative inline-block">
            <span className="relative z-10">Sign in</span>
            <AnimationLine color={nbColors.pink} height={3} />
          </span>
        </h1>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border-3 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900">
        <div className="h-3 rounded-t-xl border-b-3 border-black bg-[#ff4c91]" />
        <div className="p-6">
          <Form {...form}>
            <form action={action} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">
                      Email <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder=""
                        {...field}
                        aria-required="true"
                        aria-invalid={!!form.formState.errors.email}
                        className="rounded-lg border-2 border-black"
                      />
                    </FormControl>
                    <FormDescription>Email for sign in</FormDescription>
                    <FormMessage id="email-message" data-testid="email-message" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">
                      Password <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder=""
                        {...field}
                        aria-required="true"
                        aria-invalid={!!form.formState.errors.password}
                        type="password"
                        className="rounded-lg border-2 border-black"
                      />
                    </FormControl>
                    <FormDescription>
                      Your password must be at least {MIN_PASSWORD_LENGTH} characters long.
                    </FormDescription>
                    <FormMessage id="password-message" data-testid="password-message" />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  className="border-3 border-black bg-[#ff4c91] font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#e6447f] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
                >
                  Sign in
                </Button>
                <Link href="/register">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-3 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Register
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
