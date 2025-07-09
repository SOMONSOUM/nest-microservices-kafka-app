/*
  Warnings:

  - You are about to drop the column `refreshTokenHashed` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `refreshTokenHashed`,
    ADD COLUMN `hashedRefreshToken` VARCHAR(191) NULL;
