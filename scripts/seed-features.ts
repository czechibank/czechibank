import { availableFeatures } from "@/domain/features-domain/features.schema";
import { Role } from "@/lib/permissions";
import { PrismaClient } from "@prisma/client";
import { cloneDeep } from "lodash";
import { auth } from "../auth";

const prisma = new PrismaClient();

export async function seedAdminUser() {
  const baseAdminUserToSeed = {
    email: "app_admin@email.com",
    name: "App Admin",
    password: "app_admin",
    avatarConfig:
      '{"backgroundColor":["C4DD68"],"eyebrows":["variant12"], eyebrowsColor":["000000"],"eyes":["variant01"],"eyesColor":["000000"],"freckles":["variant01"],"frecklesColor":["000000"],"frecklesProbability":[null],"glasses":["variant03"],"glassesColor":["000000"],"glassesProbability":[null],"mouth":["happy05"],"mouthColor":["000000"],"nose":["variant06"],"noseColor":["000000"]}',
    bankAccountNumber: "000000000000/5555",
    apiKey: "app_admin_key",
    role: "admin",
  };

  // get the admin user created in the seed-users script
  let adminUser = await prisma.user.findFirst({
    where: {
      email: baseAdminUserToSeed.email,
    },
  });

  console.log(JSON.stringify(adminUser));

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
  }

  return adminUser;
}

export async function seedFeatures() {
  try {
    const adminUser = await seedAdminUser();
    if (!adminUser) {
      console.error("[features seed] Admin user not found after creation.");
      return;
    }

    const featuresToSeed = cloneDeep(availableFeatures);
    for (const feature of featuresToSeed) {
      console.log(`[features seed] Seeding feature ${adminUser.id}.`);
      await prisma.feature.create({
        data: {
          key: feature.key,
          name: feature.name,
          description: feature.description,
          toggle: feature.toggle,
          defaultToggle: feature.defaultToggle,
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
