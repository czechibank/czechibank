import env from "../../../src/lib/env";

export const config = {
  BASE_URL: "http://" + env.HOST,
};

// Generate API key the same way as seed script (must match exactly)
function generateApiKey(email: string, index: number = 0): string {
  const prefix = `key__${index}_${email.toLowerCase()}`;
  return prefix + "0".repeat(64 - prefix.length);
}

export const apiKeys = {
  standardUser: generateApiKey("standard.user@example.com"),
  highBalanceUser: generateApiKey("high.balance@example.com"),
  zeroBalanceUser: generateApiKey("zero.balance@example.com"),
  multipleKeysUser: generateApiKey("multiple.keys@example.com"),
  appAdmin: generateApiKey("app_admin@email.com"),
  vojta: generateApiKey("vojta@czechibank.ostrava.digital"),
} as const;
