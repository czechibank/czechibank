"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { MIN_PASSWORD_LENGTH } from "@/constants";

import { UserSchema } from "@/domain/user-domain/user-schema";
import userService from "@/domain/user-domain/user-service";
import { Response } from "@/lib/response";
import { generateRandomAvatarConfig } from "@/lib/utils";
import { redirect } from "next/navigation";
import { useState } from "react";
import { toast } from "../ui/use-toast";

export function RegisterForm() {
  const [serverResponse, setServerResponse] = useState<Response<any> | null>(null);

  const ExtendedUserSchema = UserSchema.extend({
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"], // specify the path of the field that the error is attached to
  });

  const form = useForm<z.infer<typeof ExtendedUserSchema>>({
    resolver: zodResolver(ExtendedUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  console.log(form.formState.errors);

  const action: () => void = form.handleSubmit(async (data: z.infer<typeof ExtendedUserSchema>) => {
    await userService.client.signUp(
      {
        email: data.email,
        password: data.password,
        name: data.name,
        image: JSON.stringify(generateRandomAvatarConfig()),
      },
      {
        onSuccess: () => {
          form.reset();
          toast({
            title: "Account created",
            description: "You can create your first transaction now! 🎉",
          });
          redirect("/");
        },
        onError: (error) => {
          toast({
            title: "Oh snap!Error",
            description: error.error.message,
          });
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
        {serverResponse && !serverResponse.success && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{serverResponse.message}</AlertDescription>
          </Alert>
        )}
        {serverResponse && serverResponse.success && (
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Yay!</AlertTitle>
            <AlertDescription>
              {serverResponse.message}. Now you can log into application and start your journey in Czechitoken!
            </AlertDescription>
          </Alert>
        )}
      </form>
    </Form>
  );
}
