import prisma from "../src/lib/db";

async function createTestMission() {
  try {
    console.log("🎯 Creating test mission...");

    // First, get a reward to use
    const reward = await prisma.reward.findFirst();
    if (!reward) {
      console.error("❌ No rewards found in database");
      return;
    }

    // Create a test mission
    const mission = await prisma.mission.create({
      data: {
        name: "Test Transaction Mission",
        description: "Complete a transaction to earn rewards",
        type: "transaction_count",
        status: "active",
        endpoint: "/api/v1/transactions/create",
        method: "POST",
        conditions: {
          type: "payload_validation",
          requiredFields: ["amount", "toBankNumber"],
          exactValues: {
            amount: 100,
          },
        },
        timeWindow: {
          type: "always",
        },
        rewards: {
          create: {
            rewardId: reward.id,
          },
        },
      },
      include: {
        rewards: {
          include: {
            reward: true,
          },
        },
      },
    });

    console.log("✅ Test mission created successfully!");
    console.log("Mission ID:", mission.id);
    console.log("Mission Name:", mission.name);
    console.log("Endpoint:", mission.endpoint);
    console.log("Method:", mission.method);
    console.log("Rewards:", mission.rewards.length);
  } catch (error) {
    console.error("❌ Error creating test mission:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestMission();
