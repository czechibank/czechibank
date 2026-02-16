import featuresService from "@/domain/features-domain/features-service";
import { FeaturesKeysEnum, FeatureType } from "@/domain/features-domain/features.schema";
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

export function incorrectBalanceDisplayFeature(features: FeatureType[], defaultBalance: number): number {
  if (featuresService.client.getFeatureToggle(FeaturesKeysEnum.BUG_INCORRECT_BALANCE_DISPLAY, features)) {
    return defaultBalance * (Math.random() * (10 - 0.1) + 0.1);
  }

  return defaultBalance;
}

export function amountSchemaToCheckFeature(features: FeatureType[], balance: number) {
  const baseValidation = z.preprocess((val) => {
    // Reject scientific notation
    if (isScientificNotation(val)) {
      throw new Error("Amount must be a standard decimal number, scientific notation is not allowed");
    }
    return val;
  }, z.coerce.number());

  if (featuresService.client.getFeatureToggle(FeaturesKeysEnum.SEND_MONEY_WITHOUT_ACCOUNT_BALANCE, features)) {
    return baseValidation.pipe(
      z
        .number()
        .min(MIN_AMOUNT, `Amount must be at least ${MIN_AMOUNT}`)
        .refine((val) => countDecimalPlaces(val) <= MAX_DECIMAL_PLACES, {
          message: `Amount can have at most ${MAX_DECIMAL_PLACES} decimal places`,
        }),
    );
  }

  return baseValidation.pipe(
    z
      .number()
      .min(MIN_AMOUNT, `Amount must be at least ${MIN_AMOUNT}`)
      .max(balance, `Amount cannot exceed your balance of ${balance}`)
      .refine((val) => countDecimalPlaces(val) <= MAX_DECIMAL_PLACES, {
        message: `Amount can have at most ${MAX_DECIMAL_PLACES} decimal places`,
      }),
  );
}

export function showGifInTransactionsFeature(features: FeatureType[]): boolean {
  return featuresService.client.getFeatureToggle(FeaturesKeysEnum.GIFS_IN_TRANSACTIONS, features);
}

export function increaseTimeInSendingTransactionsFeature(features: FeatureType[]): boolean {
  return featuresService.client.getFeatureToggle(FeaturesKeysEnum.INCREASE_TIME_IN_SENDING_TRANSACTIONS, features);
}

export function canSeeYourBankAccountDetailFeature(features: FeatureType[]): boolean {
  return featuresService.client.getFeatureToggle(FeaturesKeysEnum.CAN_SEE_YOUR_BANK_ACCOUNT_DETAIL, features);
}
