CREATE TABLE `feedback_to_tags` (
    `feedback_id` CHAR(36) NOT NULL COMMENT 'Foreign key for the feedback item.',
    `tag_id` INT NOT NULL COMMENT 'Foreign key for the tag.',
    PRIMARY KEY (`feedback_id`, `tag_id`),
    CONSTRAINT `fk_feedback_to_tags_feedback_id` 
        FOREIGN KEY (`feedback_id`) 
        REFERENCES `feedback` (`feedback_id`) 
        ON DELETE CASCADE,
    CONSTRAINT `fk_feedback_to_tags_tag_id` 
        FOREIGN KEY (`tag_id`) 
        REFERENCES `feedback_tags` (`tag_id`) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Many-to-many join table linking feedback items to tags.';

CREATE INDEX `idx_feedback_to_tags_tag_id` ON `feedback_to_tags` (`tag_id`) USING BTREE;