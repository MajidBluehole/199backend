CREATE TABLE `curation` (
  `curation_id` CHAR(36) NOT NULL,
  `content_id` CHAR(36) NOT NULL,
  `rank_order` INT NOT NULL DEFAULT 0,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`curation_id`),
  UNIQUE KEY `uk_curation_content_id` (`content_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assuming a `content` table with `content_id` as its primary key exists.
-- If it does not, you should create it before running this migration.
-- ALTER TABLE `curation` ADD CONSTRAINT `fk_curation_content` FOREIGN KEY (`content_id`) REFERENCES `content`(`content_id`) ON DELETE CASCADE;

CREATE INDEX `idx_curation_rank_order` ON `curation` (`rank_order`);
