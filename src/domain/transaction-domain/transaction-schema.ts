import { Currency } from "@prisma/client";
import { z } from "zod";
import { roundAmount } from "../../lib/utils";

// AmountSchema: Accepts only numbers, disallows scientific notation, enforces max 3 decimal places, min/max, and rounds to 3 decimals.
// Frontend: Use string validation for user input, but always send number to server.
// Backend: Scientific notation is still something what is handled - request.json() transforms it to number before our validation
export const AmountSchema = z
  .number()
  .min(0.001, "Number must be greater than 0.001")
  .max(Number.MAX_SAFE_INTEGER, "Amount must be less than or equal to 9007199254740991 due security reasons.")
  .refine((val) => !val.toString().toLowerCase().includes("e"), {
    message: "Scientific notation is not allowed",
  })
  .refine((val) => /^\d+(\.\d{1,3})?$/.test(val.toString()), {
    message: "Use amount with max. 3 decimal places (e.g. 1.234)",
  })
  .transform((val) => roundAmount(val, 3));

// AmountSchema with balance validation for frontend forms
export const AmountWithBalanceSchema = (balance: number) =>
  z.preprocess(
    (val) => (typeof val === "string" ? Number(val.replace(",", ".")) : val),
    AmountSchema.refine((val: number) => val <= balance, {
      message: `Amount must be less than or equal to your balance (${balance})`,
    }),
  );

// Reusable bank number validation schema
export const BankNumberSchema = z
  .string()
  .endsWith("5555")
  .length(17, "Bank number must be exactly in format 1111222233334444/5555");

// Schema for the actual transaction creation logic in the service
export const CreateTransactionNumberToNumberSchema = z.object({
  amount: AmountSchema,
  currency: z.custom<Currency>(),
  toBankNumber: BankNumberSchema,
  userId: z.string(),
  fromBankNumber: BankNumberSchema,
});

// Schema specifically for validating the incoming API request body
export const ApiTransactionCreateSchema = z.object({
  amount: AmountSchema,
  toBankNumber: BankNumberSchema,
});
