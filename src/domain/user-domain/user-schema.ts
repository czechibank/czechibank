import { MIN_PASSWORD_LENGTH } from "@/constants";
import { z } from "zod";

const UserBaseSchema = z.object({
  email: z.string().email(),
  password: z.string().min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`),
});

export const LoginSchema = UserBaseSchema;

export const UserSchema = UserBaseSchema.extend({
  name: z.string().trim().min(1, "Name cannot be empty or contain only spaces"),
  image: z.string().optional(),
});

export type CreateUserSchemaType = z.infer<typeof UserSchema>;
export type UserBaseSchemaType = z.infer<typeof UserBaseSchema>;
export type LoginSchemaType = z.infer<typeof LoginSchema>;
