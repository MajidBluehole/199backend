-- Description: This migration creates the 'tags' table.
-- The table stores all available tags that can be applied to content.

CREATE TABLE `tags` (
    `tag_id` CHAR(36) NOT NULL COMMENT 'Unique identifier for the tag, UUID format.',
    `tag_name` VARCHAR(100) NOT NULL COMMENT 'The unique, human-readable identifier for the tag (e.g., node-js, machine-learning).',
    `name` VARCHAR(50) NOT NULL COMMENT 'The display name of the tag (e.g., Node.js, Machine Learning).',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp of when the record was created.',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp of when the record was last updated.',
    PRIMARY KEY (`tag_id`),
    UNIQUE KEY `idx_tags_name_unique` (`tag_name`) COMMENT 'Ensures tag names are unique and allows for fast lookups.',
    UNIQUE KEY `uk_tags_name` (`name`) COMMENT 'Ensures display names are unique.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;