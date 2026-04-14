"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ToastAction } from "@/components/ui/toast";
import { MIN_PASSWORD_LENGTH } from "@/constants";
import { CreateUserSchemaType, UserSchema } from "@/domain/user-domain/user-schema";
import userServiceClient from "@/domain/user-domain/user-service-client";
import {
  broadcastSessionChanged,
  useRedirectToHomeWhenSignedIn,
  useSessionWithRefresh,
} from "@/lib/useSessionWithRefresh";
import { generateRandomAvatarConfig } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorContext } from "better-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast, Toast } from "../ui/use-toast";

/**
 * Registration form (name, email, password, confirm password). Redirects to home when the user already has a session,
 * except during sign-up so that `router.push("/register/success")` is not overridden. On success, broadcasts session
 * change and navigates to `/register/success`.
 */
export function RegisterForm() {
  const router = useRouter();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const { data: session } = useSessionWithRefresh();
  useRedirectToHomeWhenSignedIn(session, { skipRedirect: isSigningUp });

  const ExtendedUserSchema = UserSchema.extend({
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"], // specify the path of the field that the error is attached to
  });
  type ExtendedUserSchemaType = z.infer<typeof ExtendedUserSchema>;

  const form = useForm<ExtendedUserSchemaType>({
    resolver: zodResolver(ExtendedUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const action: () => void = form.handleSubmit(async (data: ExtendedUserSchemaType): Promise<void> => {
    setIsSigningUp(true);
    await userServiceClient.signUp(
      {
        email: data.email,
        password: data.password,
        name: data.name,
        image: JSON.stringify(generateRandomAvatarConfig()),
      } as CreateUserSchemaType,
      {
        onSuccess: () => {
          form.reset();
          broadcastSessionChanged();
          router.refresh();
          router.push("/register/success");
        },
        onError: (error: ErrorContext): void => {
          setIsSigningUp(false);
          // Reset password fields if user already exists, because of the security reasons
          form.resetField("password");
          form.resetField("confirmPassword");

          if (error.error.code === "USER_ALREADY_EXISTS") {
            form.setError("email", {
              type: "manual",
              message: "This email is already exists",
            });

            // Show toast with an option to sign in
            toast({
              title: "User with this email already exists",
              description: "Would you like to sign in instead?",
              action: (
                <ToastAction altText="Sign in" onClick={() => router.push("/signin")}>
                  Sign in
                </ToastAction>
              ),
            } satisfies Toast);
          } else {
            // Handle other errors
            toast({
              title: "Oh snap! Error",
              description: error.error.message,
            } satisfies Toast);
          }
        },
      },
    );
  });

  return (
    <div className="rounded-2xl border-3 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900">
      <div className="h-3 rounded-t-xl border-b-3 border-black bg-[#7ED957]" />
      <div className="p-6">
        <Form {...form}>
          <form action={action} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">
                    Full name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder=""
                      {...field}
                      aria-required="true"
                      aria-invalid={!!form.formState.errors.name}
                      className="rounded-lg border-2 border-black"
                    />
                  </FormControl>
                  <FormDescription>This is your public display name. In format Firstname Lastname</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                  <FormMessage />
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
                      type="password"
                      aria-required="true"
                      aria-invalid={!!form.formState.errors.password}
                      className="rounded-lg border-2 border-black"
                    />
                  </FormControl>
                  <FormDescription>
                    Your password must be at least {MIN_PASSWORD_LENGTH} characters long.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">
                    Confirm Password <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder=""
                      {...field}
                      type="password"
                      aria-required="true"
                      aria-invalid={!!form.formState.errors.confirmPassword}
                      className="rounded-lg border-2 border-black"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="border-3 border-black bg-[#7ED957] font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#6bc348] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
            >
              Register
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
