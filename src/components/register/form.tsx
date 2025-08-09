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
          toast({
            title: "Account created",
            description: "You can create your first transaction now! 🎉",
          } satisfies Toast);

          // Redirect to the home page, user will be already signed in
          redirect("/");
        },
        onError: (error: ErrorContext): void => {
          if (error.error.code === "USER_ALREADY_EXISTS") {
            // Reset password fields if user already exists, because of the security reasons
            form.resetField("password");
            form.resetField("confirmPassword");

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
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} type="password" />
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
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} type="password" />
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
