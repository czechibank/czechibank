"use server";

import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import userService from "./user-service";

export async function processUserRegistration(formData: FormData) {
  const userData = {
    email: formData.get("email") as string,
    name: formData.get("name") as string,
    password: formData.get("password") as string,
  };

  const response = await userService.createUserFromEmail(userData);
  if (!response.success) {
    await processUserSignIn({ email: userData.email, password: userData.password });
  }
  return response;
}

export async function processUserSignIn({ email, password }: { email: string; password: string }) {
  const response = await userService.signInUser(email, password);

  console.log(response.success);
  if (!response.success) {
    return response;
  }

  redirect("/");
}

export async function processUserSignOut() {
  await authClient.signOut();
}
