import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const missions: Prisma.DropMissionCreateInput[] = [
  {
    slug: "100-transactions",
    name: "100 Transactions",
    description: "Create 100 transactions to earn 50 SUPER_TOKENS",
    visibility: "PUBLISHED",
    triggerMethod: "POST",
    triggerPath: "/api/v1/transactions/create",
    timezone: "Europe/Prague",
    definition: {
      version: 1,
      schedule: { kind: "always" },
      progressMode: { kind: "aggregate_count", source: "transaction_created", threshold: 100 },
      rule: { kind: "all", of: [] },
    },
    rewardType: "SUPER_TOKENS",
    rewardPayload: { amount: 50 },
    active: true,
  },
  {
    slug: "emergency-fund-vault",
    name: "Vault Creator's Challenge",
    description: "Create a vault (bank account) named 'Emergency Fund' to earn 50 SUPER_TOKENS",
    visibility: "PUBLISHED",
    triggerMethod: "POST",
    triggerPath: "/api/v1/bank-account/create",
    timezone: "Europe/Prague",
    definition: {
      version: 1,
      schedule: { kind: "always" },
      progressMode: { kind: "instant" },
      rule: {
        kind: "bank_account_name",
        op: "eq",
        values: ["Emergency Fund"],
        caseSensitive: true,
      },
    },
    rewardType: "SUPER_TOKENS",
    rewardPayload: { amount: 50 },
    active: true,
  },
  {
    slug: "happy-hour-222",
    name: "Happy Hour Transfer",
    description: "Send exactly 222 CZT between 14:00-14:30 CET to enter the daily lottery",
    visibility: "PUBLISHED",
    triggerMethod: "POST",
    triggerPath: "/api/v1/transactions/create",
    timezone: "Europe/Prague",
    definition: {
      version: 1,
      schedule: { kind: "time_of_day", start: "14:00", end: "14:30" },
      progressMode: { kind: "instant" },
      rule: { kind: "amount", equals: 222 },
    },
    rewardType: "SUPER_TOKENS",
    rewardPayload: { amount: 50 },
    active: true,
  },
];

export async function seedMissions() {
  for (const m of missions) {
    await prisma.dropMission.upsert({
      where: { slug: m.slug },
      create: m,
      update: {
        name: m.name,
        description: m.description,
        visibility: m.visibility,
        triggerMethod: m.triggerMethod,
        triggerPath: m.triggerPath,
        timezone: m.timezone,
        definition: m.definition,
        rewardType: m.rewardType,
        rewardPayload: m.rewardPayload,
        active: m.active,
        startsAt: m.startsAt ?? null,
        endsAt: m.endsAt ?? null,
      },
    });
    console.log(`[missions seed] Upserted mission: ${m.slug}`);
  }
}

async function main() {
  console.log("[missions seed] Starting...");
  await prisma.$connect();
  await seedMissions();
  console.log("[missions seed] Done.");
}

main()
  .catch((e) => {
    console.error("[missions seed] Fatal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
