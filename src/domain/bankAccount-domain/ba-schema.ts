import { Currency } from "@prisma/client";
import { z } from "zod";

// Default schema for bank account creation - name is optional
export const BankAccountSchema = z.object({
  name: z.string().optional(),
  currency: z.nativeEnum(Currency),
});

// shared name validation
export const BankAccountNameSchema = z.string().min(1, "Account name cannot be empty");

// Schema for renaming a bank account
export const RenameBankAccountSchema = z.object({
  name: BankAccountNameSchema,
});

// Schema for creating a bank account
export const CreateBankAccountSchema = z.object({
  name: BankAccountNameSchema,
  currency: z.nativeEnum(Currency), // use Prisma enum, not hardcoded
});
