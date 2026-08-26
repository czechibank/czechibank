import { SEED_USERS } from "./users";

export { SEED_USERS, SEED_USERS_LIST, type SeedUserDef, type SeedUserKey } from "./users";

/** Convenience map: user key → primary API key string (for test auth headers) */
export const apiKey = {
  appAdmin: SEED_USERS.appAdmin.apiKeys[0].key,
  vojta: SEED_USERS.vojta.apiKeys[0].key,
  standardUser: SEED_USERS.standardUser.apiKeys[0].key,
  zeroBalance: SEED_USERS.zeroBalance.apiKeys[0].key,
  highBalance: SEED_USERS.highBalance.apiKeys[0].key,
  multipleKeys: SEED_USERS.multipleKeys.apiKeys[0].key,
  expiredKeyActive: SEED_USERS.expiredKey.apiKeys[1].key,
  rateLimited: SEED_USERS.rateLimited.apiKeys[0].key,
} as const;
