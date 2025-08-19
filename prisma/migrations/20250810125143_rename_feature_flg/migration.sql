/*
  Warnings:

  - You are about to drop the `feature_flag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "feature_flag" DROP CONSTRAINT "feature_flag_userId_fkey";

-- DropTable
DROP TABLE "feature_flag";

-- CreateTable
CREATE TABLE "feature" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "toggle" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feature_key_key" ON "feature"("key");

-- AddForeignKey
ALTER TABLE "feature" ADD CONSTRAINT "feature_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
