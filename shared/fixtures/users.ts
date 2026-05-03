// ============================================================================
// SEED USER DEFINITIONS — Single source of truth
// Used by: seed scripts, API tests, E2E tests
// ============================================================================

export type SeedUserDef = {
  email: string;
  name: string;
  password: string;
  role: "admin" | "user";
  avatarConfig: string;
  bankAccounts: Array<{ number: string }>;
  balance: number;
  apiKeys: Array<{ key: string; active: boolean; rateLimitMax?: number }>;
  transactions?: {
    needsHistory: true;
    targetCount: number;
  };
  /** Which bank account index gets the balance (default: 0) */
  primaryBalanceIndex?: number;
  /** Which bank account index is used for seed transactions (default: 1, falls back to 0) */
  primaryTransactionIndex?: number;
};

/**
 * All seeded users with hardcoded API keys (64-char strings).
 *
 * Named keys give type-safe access: `SEED_USERS.standardUser.email`
 * `as const satisfies` gives literal types + compile-time validation.
 */
export const SEED_USERS = {
  appAdmin: {
    email: "app_admin@email.com",
    name: "App Admin",
    password: "app_admin",
    role: "admin",
    avatarConfig:
      '{"backgroundColor":["C4DD68"],"eyebrows":["variant12"],"eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant03"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["happy05"],"mouthColor":["000000"],"nose":["variant06"],"noseColor":["000000"]}',
    bankAccounts: [{ number: "000000000000/5555" }],
    balance: 0,
    apiKeys: [{ key: "key__0_app_admin@email.com00000000000000000000000000000000000000", active: true }],
  },

  rescueFundsPraha: {
    email: "zachranNas+praha@pejsekAKocicka.cz",
    name: "[OSTRAVA!!!] Pejsek a Kočicka 🐶&🐱",
    password: "PejsekAKocicka123",
    role: "user",
    avatarConfig:
      '{"backgroundColor":["696AC9"],"eyebrows":["variant12"],"eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant03"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["happy05"],"mouthColor":["000000"],"nose":["variant06"],"noseColor":["000000"]}',
    bankAccounts: [{ number: "555555555555/5555" }],
    balance: 0,
    apiKeys: [{ key: "key__0_zachrannas+praha@pejsekakocicka.cz0000000000000000000000", active: true }],
  },

  rescueFundsBrno: {
    email: "zachranNas+brno@pejsekAKocicka.cz",
    name: "[BRNO] Pejsek a Kočička 🐶&🐱",
    password: "PejsekAKocicka123",
    role: "user",
    avatarConfig:
      '{"backgroundColor":["0DC681"],"eyebrows":["variant12"],"eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant03"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["happy05"],"mouthColor":["000000"],"nose":["variant06"],"noseColor":["000000"]}',
    bankAccounts: [{ number: "444444444444/5555" }],
    balance: 0,
    apiKeys: [{ key: "key__0_zachrannas+brno@pejsekakocicka.cz00000000000000000000000", active: true }],
  },

  vojta: {
    email: "vojta@czechibank.ostrava.digital",
    name: "Vojta 🦊 🎉 Cerveny",
    password: "hello123456",
    role: "admin",
    avatarConfig:
      '{"backgroundColor":["ff0000"],"eyebrows":["variant11"],"eyebrowsColor":["ffffff"],"eyes":["variant01"],"eyesColor":["ffffff"],"freckles":["variant01"],"frecklesColor":["ffffff"],"frecklesProbability":[null],"glasses":["variant01"],"glassesColor":["ffffff"],"glassesProbability":[null],"mouth":["happy04"],"mouthColor":["ffffff"],"nose":["variant04"],"noseColor":["ffffff"]}',
    bankAccounts: [{ number: "000000000001/5555" }, { number: "100000001001/5555" }, { number: "100000001021/5555" }],
    balance: 0,
    apiKeys: [{ key: "key__0_vojta@czechibank.ostrava.digital0000000000000000000000000", active: true }],
  },

  standardUser: {
    email: "standard.user@example.com",
    name: "Standard User",
    password: "password123",
    role: "user",
    avatarConfig:
      '{"backgroundColor":["4A90E2"],"eyebrows":["variant12"],"eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant01"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["happy01"],"mouthColor":["000000"],"nose":["variant01"],"noseColor":["000000"]}',
    bankAccounts: [{ number: "100000000001/5555" }],
    balance: 100_000,
    apiKeys: [{ key: "key__0_standard.user@example.com00000000000000000000000000000000", active: true }],
  },

  zeroBalance: {
    email: "zero.balance@example.com",
    name: "Zero Balance User",
    password: "password123",
    role: "user",
    avatarConfig:
      '{"backgroundColor":["E24A4A"],"eyebrows":["variant12"],"eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant01"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["sad01"],"mouthColor":["000000"],"nose":["variant01"],"noseColor":["000000"]}',
    bankAccounts: [{ number: "100000000002/5555" }, { number: "100000010011/5555" }],
    balance: 0,
    apiKeys: [{ key: "key__0_zero.balance@example.com000000000000000000000000000000000", active: true }],
  },

  highBalance: {
    email: "high.balance@example.com",
    name: "High Balance User",
    password: "password123",
    role: "user",
    avatarConfig:
      '{"backgroundColor":["4AE24A"],"eyebrows":["variant12"],"eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant02"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["happy03"],"mouthColor":["000000"],"nose":["variant01"],"noseColor":["000000"]}',
    bankAccounts: [{ number: "100000000003/5555" }, { number: "100009000003/5555" }],
    balance: 1_000_000,
    apiKeys: [{ key: "key__0_high.balance@example.com000000000000000000000000000000000", active: true }],
    transactions: { needsHistory: true as const, targetCount: 150 },
  },

  multipleKeys: {
    email: "multiple.keys@example.com",
    name: "Multiple Keys User",
    password: "password123",
    role: "user",
    avatarConfig:
      '{"backgroundColor":["E24AE2"],"eyebrows":["variant12"],"eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant03"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["happy02"],"mouthColor":["000000"],"nose":["variant01"],"noseColor":["000000"]}',
    bankAccounts: [{ number: "100000000004/5555" }],
    balance: 50_000,
    apiKeys: [
      { key: "key__0_multiple.keys@example.com00000000000000000000000000000000", active: true },
      { key: "key__1_multiple.keys@example.com00000000000000000000000000000000", active: true },
      { key: "key__2_multiple.keys@example.com00000000000000000000000000000000", active: true },
      { key: "key__3_multiple.keys@example.com00000000000000000000000000000000", active: true },
      { key: "key__4_multiple.keys@example.com00000000000000000000000000000000", active: true },
    ],
  },

  expiredKey: {
    email: "expired.key@example.com",
    name: "Expired Key User",
    password: "password123",
    role: "user",
    avatarConfig:
      '{"backgroundColor":["E2E24A"],"eyebrows":["variant12"],"eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant01"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["neutral01"],"mouthColor":["000000"],"nose":["variant01"],"noseColor":["000000"]}',
    bankAccounts: [{ number: "100000000005/5555" }],
    balance: 75_000,
    apiKeys: [
      { key: "expired_expired.key@example.com000000000000000000000000000000000", active: false },
      { key: "key__0_expired.key@example.com0000000000000000000000000000000000", active: true },
    ],
  },

  rateLimited: {
    email: "rate.limited@example.com",
    name: "Rate Limited User",
    password: "password123",
    role: "user",
    avatarConfig:
      '{"backgroundColor":["E2A04A"],"eyebrows":["variant12"],"eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant01"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["neutral01"],"mouthColor":["000000"],"nose":["variant01"],"noseColor":["000000"]}',
    bankAccounts: [{ number: "100000000007/5555" }],
    balance: 10_000,
    apiKeys: [
      { key: "key__0_rate.limited@example.com0000000000000000000000000000000000", active: true, rateLimitMax: 2 },
    ],
  },

  noApiKey: {
    email: "no.apikey@example.com",
    name: "No API Key User",
    password: "password123",
    role: "user",
    avatarConfig:
      '{"backgroundColor":["4A4AE2"],"eyebrows":["variant12"],"eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant01"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["neutral02"],"mouthColor":["000000"],"nose":["variant01"],"noseColor":["000000"]}',
    bankAccounts: [{ number: "100000000006/5555" }],
    balance: 25_000,
    apiKeys: [],
  },
} as const satisfies Record<string, SeedUserDef>;

export type SeedUserKey = keyof typeof SEED_USERS;

/** Array form for iteration (used by seed scripts) */
export const SEED_USERS_LIST: SeedUserDef[] = Object.values(SEED_USERS);
