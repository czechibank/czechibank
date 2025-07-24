import { MIN_PASSWORD_LENGTH } from "@/constants";
import { z } from "zod";

export type CreateUserSchema = z.infer<typeof UserSchema>;

export const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(1, "Name cannot be empty or contain only spaces"),
  password: z.string().min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`),
});
