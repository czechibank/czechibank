-- CreateEnum
CREATE TYPE "DropVisibility" AS ENUM ('PUBLISHED', 'SECRET');

-- CreateEnum
CREATE TYPE "DropRewardType" AS ENUM ('SUPER_TOKENS', 'BADGE', 'VAULT_BONUS', 'LOTTERY_ENTRY', 'DISPLAY_TITLE');

-- AlterTable
ALTER TABLE "user" ADD COLUMN "superTokens" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "user" ADD COLUMN "displayTitle" TEXT;

-- CreateTable
CREATE TABLE "drop_mission" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "visibility" "DropVisibility" NOT NULL DEFAULT 'PUBLISHED',
    "triggerMethod" TEXT NOT NULL,
    "triggerPath" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Prague',
    "definition" JSONB NOT NULL,
    "rewardType" "DropRewardType" NOT NULL,
    "rewardPayload" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drop_mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drop_mission_progress" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "state" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drop_mission_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drop_mission_completion" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "drop_mission_completion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "drop_mission_slug_key" ON "drop_mission"("slug");

-- CreateIndex
CREATE INDEX "drop_mission_triggerMethod_triggerPath_active_idx" ON "drop_mission"("triggerMethod", "triggerPath", "active");

-- CreateIndex
CREATE UNIQUE INDEX "drop_mission_progress_missionId_userId_key" ON "drop_mission_progress"("missionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "drop_mission_completion_missionId_userId_key" ON "drop_mission_completion"("missionId", "userId");

-- AddForeignKey
ALTER TABLE "drop_mission_progress" ADD CONSTRAINT "drop_mission_progress_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "drop_mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drop_mission_progress" ADD CONSTRAINT "drop_mission_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drop_mission_completion" ADD CONSTRAINT "drop_mission_completion_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "drop_mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drop_mission_completion" ADD CONSTRAINT "drop_mission_completion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
