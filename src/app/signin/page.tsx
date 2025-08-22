"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { Input } from "@/components/ui/input";

import { useToast } from "@/components/ui/use-toast";
import { MIN_PASSWORD_LENGTH } from "@/constants";
import { LoginSchema } from "@/domain/user-domain/user-schema";
import userService from "@/domain/user-domain/user-service";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const router = useRouter();
  const action: () => void = form.handleSubmit(async (data) => {
    await userService.client.signIn(
      { email: data.email, password: data.password },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "You are signed in",
          });
          router.push("/");
        },
        onError: (error) => {
          form.resetField("password");
          toast({
            title: "Error",
            description: error?.error.message,
            variant: "destructive",
          });
        },
      },
    );
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
                  <Input placeholder="" {...field} aria-required="true" aria-invalid={!!form.formState.errors.email} />
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
