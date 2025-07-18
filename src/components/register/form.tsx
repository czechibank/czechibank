"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

import { UserSchema } from "@/domain/user-domain/user-schema";
import { authClient } from "@/lib/auth-client";
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
    },
  });

  const action: () => void = form.handleSubmit(async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value as string));

    authClient.signUp.email(
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
            title: "Error",
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
              <FormDescription>
                Your password must be at least 6 characters long.{" "}
                <span className="font-bold text-red-600">
                  Do not use your personal passwords - database is not encrypted. Use
                </span>
                <span className="ml-2 rounded-lg bg-gray-800 p-1 px-2 font-mono font-semibold text-white">
                  Password123456
                </span>
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
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="MALE">Male</SelectItem>
                  </SelectContent>
                </Select>
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
