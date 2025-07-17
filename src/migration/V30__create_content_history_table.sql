-- Description: Stores historical versions of content items to allow for auditing and rollbacks.

CREATE TABLE `content_history` (
    `history_id` CHAR(36) NOT NULL DEFAULT (UUID()),
    `content_id` CHAR(36) NOT NULL,
    `version` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `body` TEXT NULL,
    `change_author_id` CHAR(36) NOT NULL,
    `saved_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`history_id`),
    CONSTRAINT `fk_content_history_content` FOREIGN KEY (`content_id`) REFERENCES `content`(`content_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_content_history_author` FOREIGN KEY (`change_author_id`) REFERENCES `users`(`user_id`) ON DELETE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index for efficiently retrieving all versions for a specific content item.
CREATE INDEX `idx_content_history_content_version` ON `content_history` (`content_id`, `version`) USING BTREE;