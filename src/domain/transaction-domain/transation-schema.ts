import { Currency } from "@prisma/client";
import { z } from "zod";

// Helper function to count decimal places
const countDecimalPlaces = (num: number): number => {
  const parts = num.toString().split(".");
  return parts.length > 1 ? parts[1].length : 0;
};

// Helper function to check if value contains scientific notation
const isScientificNotation = (val: unknown): boolean => {
  if (typeof val === "string") {
    return /[eE]/.test(val);
  }
  // Check if the number's string representation contains 'e' (very large or very small numbers)
  if (typeof val === "number") {
    return val.toString().includes("e");
  }
  return false;
};

// Minimum transaction amount (agreed upon: 0.001)
const MIN_AMOUNT = 0.001;
// Maximum decimal places allowed (3 decimal places)
const MAX_DECIMAL_PLACES = 3;

// Reusable amount validation with proper decimal places and minimum amount
const amountValidation = z
  .number()
  .positive("Amount should be positive, this incident was reported. Nice day!")
  .min(MIN_AMOUNT, `Amount must be at least ${MIN_AMOUNT}`)
  .max(Number.MAX_SAFE_INTEGER, "Amount must be less than or equal to 9007199254740991 due security reasons.")
  .refine((val) => !isScientificNotation(val), {
    message: "Amount must be a standard decimal number, scientific notation is not allowed",
  })
  .refine((val) => countDecimalPlaces(val) <= MAX_DECIMAL_PLACES, {
    message: `Amount can have at most ${MAX_DECIMAL_PLACES} decimal places`,
  })
  .transform((val) => Math.round(val * 1000) / 1000);

// Schema for the actual transaction creation logic in the service
export const CreateTransactionNumberToNumberSchema = z.object({
  amount: amountValidation,
  currency: z.custom<Currency>(),
  toBankNumber: z.string().endsWith("5555").length(17, "Bank number must be exactly in format 1111222233334444/5555"),
  userId: z.string(),
  fromBankNumber: z.string(),
});

// Schema specifically for validating the incoming API request body
export const ApiTransactionCreateSchema = z.object({
  amount: amountValidation,
  toBankNumber: z.string().endsWith("5555").length(17, "Bank number must be exactly in format 1111222233334444/5555"),
  fromBankNumber: z.string().endsWith("5555").length(17, "Bank number must be exactly in format 1111222233334444/5555"),
});

export const CreateTransactionUserIdToUserIdUserSchema = z.object({
  amount: amountValidation,
  currency: z.custom<Currency>(),
  fromUserId: z.string(),
  toUserId: z.string(),
});
