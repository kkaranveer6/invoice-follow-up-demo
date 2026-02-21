-- DropForeignKey
ALTER TABLE `EmailLog` DROP FOREIGN KEY `EmailLog_invoiceId_fkey`;

-- DropForeignKey
ALTER TABLE `Invoice` DROP FOREIGN KEY `Invoice_userId_fkey`;

-- AlterTable
ALTER TABLE `Invoice` MODIFY `paymentLink` TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmailLog` ADD CONSTRAINT `EmailLog_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `EmailLog` RENAME INDEX `EmailLog_invoiceId_fkey` TO `EmailLog_invoiceId_idx`;

-- RenameIndex
ALTER TABLE `Invoice` RENAME INDEX `Invoice_userId_fkey` TO `Invoice_userId_idx`;
