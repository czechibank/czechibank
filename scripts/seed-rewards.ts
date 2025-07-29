import { PrismaClient } from "@prisma/client";
import { REWARDS } from "../src/constants/rewards";

const prisma = new PrismaClient();

async function seedRewards() {
  console.log("🌱 Seeding rewards...");

  try {
    for (const reward of REWARDS) {
      const existingReward = await prisma.reward.findUnique({
        where: { name: reward.name },
      });

      if (existingReward) {
        console.log(`⏭️  Reward "${reward.name}" already exists, skipping...`);
        continue;
      }

      const createdReward = await prisma.reward.create({
        data: {
          name: reward.name,
          description: reward.description,
          superTokens: reward.superTokens,
          badgeName: reward.badgeName,
          badgeIcon: reward.badgeIcon,
          isActive: true,
        },
      });

      console.log(
        `✅ Created reward: ${createdReward.name} (${createdReward.superTokens} tokens${reward.badgeName ? ` + ${reward.badgeName} badge` : ""})`,
      );
    }

    console.log("🎉 Rewards seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding rewards:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedRewards()
    .then(() => {
      console.log("✅ Rewards seeding finished successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Rewards seeding failed:", error);
      process.exit(1);
    });
}

export { seedRewards };
