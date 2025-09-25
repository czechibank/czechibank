-- DropForeignKey
ALTER TABLE "feature" DROP CONSTRAINT "feature_userId_fkey";

-- AddForeignKey
ALTER TABLE "feature" ADD CONSTRAINT "feature_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
