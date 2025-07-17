"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Response } from "@/lib/response";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { useToast } from "../ui/use-toast";

export function SignIn({
  provider,
  withIcon = false,
  text = "Sign in",
  ...props
}: { provider?: string; withIcon?: boolean; text?: string } & React.ComponentPropsWithRef<typeof Button>) {
  const [serverResponse, setServerResponse] = useState<Response<any> | null>(null);
  const { toast } = useToast();
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const action: () => void = form.handleSubmit(async (data) => {
    await authClient.signIn.email(
      { email: data.email, password: data.password },
      {
        onSuccess: () => {
          console.log("success");
          redirect("/");
        },
        onError: (error) => {
          console.log(error);
        },
      },
    );
  });

  return (
    <Dialog>
      <DialogTrigger>
        <div>Sign in</div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in</DialogTitle>
          <DialogDescription>
            {serverResponse && !serverResponse.success && (
              <Alert variant="destructive" className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Oops!</AlertTitle>
                <AlertDescription>{serverResponse.message}</AlertDescription>
              </Alert>
            )}
            <Form {...form}>
              <form action={action} className="my-4 space-y-4">
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
                      <FormDescription>Your password must be at least 6 characters long.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Sign in</Button>
              </form>
            </Form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
