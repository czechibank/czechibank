import { z } from "zod";

/**
 * add NEW FEATURES here - it will propagate into seed of features and all schemas
 * - after adding new feature, you have to run "db:seed:features" script
 */
export const availableFeatures: Omit<FeatureType, "id">[] = [
  {
    key: "SEND_MONEY_WITHOUT_ACCOUNT_BALANCE",
    name: "Allow sending with insufficient balance",
    description: "User can send money even when the account balance is insufficient.",
    toggle: false,
    defaultToggle: false,
    category: ["BUG", "BANK_ACCOUNT"],
  },
  {
    key: "GIFS_IN_TRANSACTIONS",
    name: "GIFs in transactions",
    description: "Enable sending GIFs along with money transfers.",
    toggle: true,
    defaultToggle: true,
    category: ["UI"],
  },
  {
    key: "BUG_INCORRECT_BALANCE_DISPLAY",
    name: "Incorrect balance display",
    description: "Show an incorrect account balance (simulate calculation bug).",
    toggle: false,
    defaultToggle: false,
    category: ["BUG", "UI", "BANK_ACCOUNT", "API"],
  },
  {
    key: "INCREASE_TIME_IN_SENDING_TRANSACTIONS",
    name: "Increase time in sending transactions",
    description: "Increase time in sending transactions.",
    toggle: false,
    defaultToggle: false,
    category: ["BUG"],
  },
  {
    key: "CAN_SEE_YOUR_BANK_ACCOUNT_DETAIL",
    name: "Can see your bank account balance",
    description:
      "Can see your bank account detail. If disabled, only the owner can see the. `GET v1/bank-account/{id}`",
    toggle: false,
    defaultToggle: false,
    category: ["BUG", "BANK_ACCOUNT", "API", "SECURITY"],
  },
];

export const FeatureSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string(),
  toggle: z.boolean().default(false),
  defaultToggle: z.boolean().default(false),
  category: z.array(z.string()),
  lastChangedBy: z.string().optional(),
  lastChangedAt: z.string().optional(),
});

export const AllFeaturesSchema = z.object({
  features: z.array(FeatureSchema),
});

export type FeatureType = z.infer<typeof FeatureSchema>;

export const FeaturesKeysEnum = Object.fromEntries(availableFeatures.map((f) => [f.key, f.key])) as {
  [K in (typeof availableFeatures)[number]["key"]]: K;
};

export type FeaturesKeys = keyof typeof FeaturesKeysEnum;
