CREATE TABLE `content_tags` (
    `content_id` CHAR(36) NOT NULL COMMENT 'Foreign key for the content',
    `tag_id` CHAR(36) NOT NULL COMMENT 'Foreign key for the tag',
    PRIMARY KEY (`content_id`, `tag_id`),
    CONSTRAINT `fk_content_tags_content`
        FOREIGN KEY (`content_id`)
        REFERENCES `knowledge_content` (`content_id`)
        ON DELETE CASCADE,
    CONSTRAINT `fk_content_tags_tag`
        FOREIGN KEY (`tag_id`)
        REFERENCES `tags` (`tag_id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Junction table for the many-to-many relationship between content and tags.';

CREATE INDEX `idx_content_tags_tag_id` ON `content_tags` (`tag_id`);