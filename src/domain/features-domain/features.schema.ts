import { z } from "zod";

// add NEW FEATURES here - it will propagate into seed of features and all schemas
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
    category: ["FEATURE", "UI"],
  },
  {
    key: "BUG_INCORRECT_BALANCE_DISPLAY",
    name: "Incorrect balance display",
    description: "Show an incorrect account balance (simulate calculation bug).",
    toggle: false,
    defaultToggle: false,
    category: ["BUG", "UI", "BANK_ACCOUNT"],
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

export type FeatureType = z.infer<typeof FeatureSchema>;

export const FeaturesKeysEnum = Object.fromEntries(availableFeatures.map((f) => [f.key, f.key])) as {
  [K in (typeof availableFeatures)[number]["key"]]: K;
};

export type FeaturesKeys = keyof typeof FeaturesKeysEnum;
