/*
  Warnings:

  - You are about to drop the column `apiKey` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `avatarConfig` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `banExpires` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `banReason` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `banned` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `sex` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "apiKey",
DROP COLUMN "avatarConfig",
DROP COLUMN "banExpires",
DROP COLUMN "banReason",
DROP COLUMN "banned",
DROP COLUMN "password",
DROP COLUMN "role",
DROP COLUMN "sex";
