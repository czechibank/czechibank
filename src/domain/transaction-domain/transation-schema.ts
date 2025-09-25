import { Currency } from "@prisma/client";
import { z } from "zod";

// Schema for the actual transaction creation logic in the service
export const CreateTransactionNumberToNumberSchema = z.object({
  amount: z
    .number()
    .positive("Amount should be positive, this incident was reported. Nice day!")
    .max(Number.MAX_SAFE_INTEGER, "Amount must be less than or equal to 9007199254740991 due security reasons.")
    .transform((val) => Math.round(val * 10) / 10),
  currency: z.custom<Currency>(),
  toBankNumber: z.string().endsWith("5555").length(17, "Bank number must be exactly in format 1111222233334444/5555"),
  userId: z.string(),
  fromBankNumber: z.string(),
});

// Schema specifically for validating the incoming API request body
export const ApiTransactionCreateSchema = z.object({
  amount: z
    .number()
    .positive("Amount should be positive, this incident was reported. Nice day!")
    .max(Number.MAX_SAFE_INTEGER, "Amount must be less than or equal to 9007199254740991 due security reasons.")
    .transform((val) => Math.round(val * 10) / 10),
  toBankNumber: z.string().endsWith("5555").length(17, "Bank number must be exactly in format 1111222233334444/5555"),
  fromBankNumber: z.string().endsWith("5555").length(17, "Bank number must be exactly in format 1111222233334444/5555"),
});

export const CreateTransactionUserIdToUserIdUserSchema = z.object({
  amount: z
    .number()
    .positive("Amount should be positive, this incident was reported. Nice try. Nice day!")
    .max(Number.MAX_SAFE_INTEGER, "Amount must be less than or equal to 9007199254740991 due security reasons.")
    .transform((val) => parseFloat(val.toFixed(1))),
  currency: z.custom<Currency>(),
  fromUserId: z.string(),
  toUserId: z.string(),
});
