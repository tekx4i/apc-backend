/*
  Warnings:

  - Added the required column `user_id` to the `apc_ads_booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `apc_ads_booking` ADD COLUMN `user_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `apc_ads_booking` ADD CONSTRAINT `apc_ads_booking_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `apc_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
