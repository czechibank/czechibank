"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ToastAction } from "@/components/ui/toast";
import { MIN_PASSWORD_LENGTH } from "@/constants";
import { CreateUserSchemaType, UserSchema } from "@/domain/user-domain/user-schema";
import userService from "@/domain/user-domain/user-service";
import { generateRandomAvatarConfig } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorContext } from "better-auth/react";
import { redirect } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast, Toast } from "../ui/use-toast";

export function RegisterForm() {
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
  console.log(form.formState.errors);

  const action: () => void = form.handleSubmit(async (data: ExtendedUserSchemaType): Promise<void> => {
    await userService.client.signUp(
      {
        email: data.email,
        password: data.password,
        name: data.name,
        image: JSON.stringify(generateRandomAvatarConfig()),
      } as CreateUserSchemaType,
      {
        onSuccess: () => {
          form.reset();

          redirect("/register/success");
        },
        onError: (error: ErrorContext): void => {
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
                <ToastAction altText="Sign in" onClick={() => redirect("/signin")}>
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
    <Form {...form}>
      <form action={action} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Full name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="" {...field} aria-required="true" aria-invalid={!!form.formState.errors.name} />
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
              <FormLabel>
                Email <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="" {...field} aria-required="true" aria-invalid={!!form.formState.errors.email} />
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
              <FormLabel>
                Password <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  {...field}
                  type="password"
                  aria-required="true"
                  aria-invalid={!!form.formState.errors.password}
                />
              </FormControl>
              <FormDescription>Your password must be at least {MIN_PASSWORD_LENGTH} characters long.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Confirm Password <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  {...field}
                  type="password"
                  aria-required="true"
                  aria-invalid={!!form.formState.errors.confirmPassword}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Register</Button>
      </form>
    </Form>
  );
}
