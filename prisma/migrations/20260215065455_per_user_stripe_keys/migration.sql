/*
  Warnings:

  - You are about to drop the column `stripeCustomerId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionStatus` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `User_stripeCustomerId_key` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `stripeCustomerId`,
    DROP COLUMN `subscriptionStatus`,
    ADD COLUMN `stripeApiKey` TEXT NULL,
    ADD COLUMN `stripeConnected` BOOLEAN NOT NULL DEFAULT false;
