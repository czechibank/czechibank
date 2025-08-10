import { FeatureType } from "@/app/administration/features.schema";
import { Role } from "@/lib/permissions";
import { PrismaClient } from "@prisma/client";
import { auth } from "../auth";
import { adminUserToSeed } from "./seed-users";

const prisma = new PrismaClient();

export const featuresToSeed: FeatureType[] = [
  {
    key: "SEND_MONEY_WITHOUT_ACCOUNT_BALANCE",
    name: "Allow sending with insufficient balance",
    description: "User can send money even when the account balance is insufficient.",
    toggle: false,
    category: ["BUG", "BANK_ACCOUNT"],
  },
  {
    key: "GIFS_IN_TRANSACTIONS",
    name: "GIFs in transactions",
    description: "Enable sending GIFs along with money transfers.",
    toggle: true,
    category: ["FEATURE", "UI"],
  },
  {
    key: "BUG_INCORRECT_BALANCE_DISPLAY",
    name: "Incorrect balance display",
    description: "Show an incorrect account balance (simulate calculation bug).",
    toggle: false,
    category: ["BUG", "UI", "BANK_ACCOUNT"],
  },
];

export async function seedFeatures() {
  try {
    const baseAdminUserToSeed = adminUserToSeed;
    // get the admin user created in the seed-users script
    let adminUser = await prisma.user.findFirst({
      where: {
        email: baseAdminUserToSeed.email,
      },
    });

    if (!adminUser) {
      // seed the admin user if it does not exist
      await auth.api.createUser({
        body: {
          email: baseAdminUserToSeed.email,
          name: baseAdminUserToSeed.name,
          password: baseAdminUserToSeed.password,
          role: baseAdminUserToSeed.role as Role,
        },
      });

      adminUser = await prisma.user.findFirst({
        where: {
          email: baseAdminUserToSeed.email,
        },
      });

      if (!adminUser) {
        console.error("[features seed] Admin user not found after creation.");
        return;
      }
    }

    for (const feature of featuresToSeed) {
      console.log(`[features seed] Seeding feature ${feature.key}.`);
      await prisma.feature.create({
        data: {
          key: feature.key,
          name: feature.name,
          description: feature.description,
          toggle: feature.toggle,
          category: feature.category,
          userId: adminUser.id,
        },
      });
    }

    console.log("[features seed] Features seeded successfully.");
  } catch (error) {
    console.error("[features seed] Error seeding features:", error);
  }
}

export default async function main() {
  console.log("[features seed] Starting seed script...");
  await prisma.$connect();

  // clean up existing features
  console.log("[features seed] Cleaning up database...");
  await prisma.feature.deleteMany();

  // seed features
  console.log("[features seed] Seeding features...");
  await seedFeatures();

  console.log("[features seed] Finished all database operations");
}

main()
  .catch((error) => {
    console.error("[features seed] Fatal error:", error);
  })
  .finally(() => {
    prisma.$disconnect();
    console.log("[features seed] Script finished");
    process.exit(0);
  });
