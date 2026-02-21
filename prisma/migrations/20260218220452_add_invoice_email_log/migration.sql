-- CreateTable
CREATE TABLE `Invoice` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `externalInvoiceId` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `status` ENUM('unpaid', 'overdue', 'paid') NOT NULL DEFAULT 'unpaid',
    `customerEmail` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `paymentLink` VARCHAR(191) NOT NULL,
    `remindersEnabled` BOOLEAN NOT NULL DEFAULT true,
    `reminderCount` INTEGER NOT NULL DEFAULT 0,
    `lastReminderSentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Invoice_externalInvoiceId_key`(`externalInvoiceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmailLog` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `template` ENUM('friendly', 'professional', 'firm') NOT NULL,
    `status` ENUM('sent', 'failed') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmailLog` ADD CONSTRAINT `EmailLog_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
