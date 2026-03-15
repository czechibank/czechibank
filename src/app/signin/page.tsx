"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Toast, useToast } from "@/components/ui/use-toast";
import { MIN_PASSWORD_LENGTH } from "@/constants";
import { LoginSchema, LoginSchemaType, UserBaseSchemaType } from "@/domain/user-domain/user-schema";
import userServiceClient from "@/domain/user-domain/user-service-client";
import {
  broadcastSessionChanged,
  useRedirectToHomeWhenSignedIn,
  useSessionWithRefresh,
} from "@/lib/useSessionWithRefresh";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorContext } from "better-auth/react";
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
    <div>
      <h1 className="my-8 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Sign in</h1>

      <Form {...form}>
        <form action={action} className="my-4 space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                    aria-required="true"
                    aria-invalid={!!form.formState.errors.email}
                    autoComplete="email"
                  />
                </FormControl>
                <FormDescription>Email for sign in</FormDescription>
                <FormMessage id="email-message" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Password <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                    aria-required="true"
                    aria-invalid={!!form.formState.errors.password}
                    type="password"
                    autoComplete="current-password"
                  />
                </FormControl>
                <FormDescription>Your password must be at least {MIN_PASSWORD_LENGTH} characters long.</FormDescription>
                <FormMessage id="password-message" />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button type="submit">Sign in</Button>
            <Link href={"/register"}>
              <Button type="button" variant={"link"}>
                Register
              </Button>
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
