"use server";

import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { CreateUserSchema } from "./user-schema";
import userService from "./user-service";

export async function processUserRegistration(formData: FormData) {
  const userData = {
    email: formData.get("email") as string,
    name: formData.get("name") as string,
    password: formData.get("password") as string,
  } satisfies CreateUserSchema;

  const response = await userService.createUserFromEmail(userData);
  if (!response.success) {
    await processUserSignIn({ email: userData.email, password: userData.password });
  }
  return response;
}

export async function processUserSignIn({ email, password }: { email: string; password: string }) {
  await authClient.signIn.email({ email, password });
  redirect("/");
}

export async function processUserSignOut() {
  await authClient.signOut();
}
