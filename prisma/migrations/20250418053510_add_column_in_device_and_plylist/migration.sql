-- AlterTable
ALTER TABLE `apc_devices` ADD COLUMN `temperature` DOUBLE NULL;

-- AlterTable
ALTER TABLE `apc_play_list` ADD COLUMN `count` INTEGER NOT NULL DEFAULT 0;
