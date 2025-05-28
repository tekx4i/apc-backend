-- CreateTable
CREATE TABLE `apc_device_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `device_id` INTEGER NOT NULL,
    `location_id` INTEGER NOT NULL,
    `play_list_id` INTEGER NOT NULL,
    `temperature` DOUBLE NOT NULL,
    `description` TEXT NULL,
    `log_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `apc_device_logs` ADD CONSTRAINT `apc_device_logs_device_id_fkey` FOREIGN KEY (`device_id`) REFERENCES `apc_devices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `apc_device_logs` ADD CONSTRAINT `apc_device_logs_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `apc_locations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `apc_device_logs` ADD CONSTRAINT `apc_device_logs_play_list_id_fkey` FOREIGN KEY (`play_list_id`) REFERENCES `apc_play_list`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
