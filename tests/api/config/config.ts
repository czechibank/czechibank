import env from "../../../src/lib/env";

export const config = {
  BASE_URL: "http://" + env.HOST,
};

import { apiKeysExport } from "../../../scripts/seed-helpers/generated-api-keys-export";

export const apiKeys = {
  standardUser: apiKeysExport.find((key) => key.email === "standard.user@example.com")?.apiKeys,
  expiredUser: apiKeysExport.find((key) => key.email === "expired.key@example.com")?.apiKeys,
  multipleKeysUser: apiKeysExport.find((key) => key.email === "multiple.keys@example.com")?.apiKeys,
  highBalanceUser: apiKeysExport.find((key) => key.email === "high.balance@example.com")?.apiKeys,
  appAdmin: apiKeysExport.find((key) => key.email === "app_admin@email.com")?.apiKeys,
  vojta: apiKeysExport.find((key) => key.email === "vojta@czechibank.ostrava.digital")?.apiKeys,
} as const;
