-- AlterTable
ALTER TABLE "user" ADD COLUMN     "superTokens" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "mission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "timeWindow" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "superTokens" INTEGER NOT NULL DEFAULT 0,
    "badgeName" TEXT,
    "badgeIcon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission_reward" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,

    CONSTRAINT "mission_reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_mission_achievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" JSONB,

    CONSTRAINT "user_mission_achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_reward" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_reward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reward_name_key" ON "reward"("name");

-- CreateIndex
CREATE UNIQUE INDEX "mission_reward_missionId_rewardId_key" ON "mission_reward"("missionId", "rewardId");

-- CreateIndex
CREATE UNIQUE INDEX "user_mission_achievement_userId_missionId_key" ON "user_mission_achievement"("userId", "missionId");

-- AddForeignKey
ALTER TABLE "mission_reward" ADD CONSTRAINT "mission_reward_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_reward" ADD CONSTRAINT "mission_reward_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_mission_achievement" ADD CONSTRAINT "user_mission_achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_mission_achievement" ADD CONSTRAINT "user_mission_achievement_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_reward" ADD CONSTRAINT "user_reward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_reward" ADD CONSTRAINT "user_reward_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
