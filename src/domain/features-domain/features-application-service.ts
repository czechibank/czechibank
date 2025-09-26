import featuresService from "@/domain/features-domain/features-service";
import { FeaturesKeysEnum, FeatureType } from "@/domain/features-domain/features.schema";
import { z, ZodNumber } from "zod";

export function incorrectBalanceDisplayFeature(features: FeatureType[], defaultBalance: number): number {
  if (featuresService.client.getFeatureToggle(FeaturesKeysEnum.BUG_INCORRECT_BALANCE_DISPLAY, features)) {
    return defaultBalance * (Math.random() * (10 - 0.1) + 0.1);
  }

  return defaultBalance;
}

export function amountSchemaToCheckFeature(features: FeatureType[], balance: number): ZodNumber {
  if (featuresService.client.getFeatureToggle(FeaturesKeysEnum.SEND_MONEY_WITHOUT_ACCOUNT_BALANCE, features)) {
    return z.coerce.number().min(0);
  }

  return z.coerce.number().min(0).max(balance);
}

export function showGifInTransactionsFeature(features: FeatureType[]): boolean {
  return featuresService.client.getFeatureToggle(FeaturesKeysEnum.GIFS_IN_TRANSACTIONS, features);
}

export function increaseTimeInSendingTransactionsFeature(features: FeatureType[]): boolean {
  return featuresService.client.getFeatureToggle(FeaturesKeysEnum.INCREASE_TIME_IN_SENDING_TRANSACTIONS, features);
}
