-- CreateTable
CREATE TABLE `apc_user_meta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `apc_user_meta` ADD CONSTRAINT `apc_user_meta_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `apc_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
