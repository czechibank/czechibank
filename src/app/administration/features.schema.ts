import { z } from "zod";

export const FeatureSchema = z.object({
  key: z.string(),
  name: z.string(),
  description: z.string(),
  toggle: z.boolean().default(false),
  category: z.array(z.string()),
  lastChangedBy: z.string().optional(),
  lastChangedAt: z.string().optional(),
});
export type FeatureType = z.infer<typeof FeatureSchema>;

export const AllFeaturesSchema = z.object({
  SEND_MONEY_WITHOUT_ACCOUNT_BALANCE: FeatureSchema,
  GIFS_IN_TRANSACTIONS: FeatureSchema,
  BUG_INCORRECT_BALANCE_DISPLAY: FeatureSchema,
});
export type AllFeaturesType = z.infer<typeof AllFeaturesSchema>;
