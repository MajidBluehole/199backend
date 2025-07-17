-- Flyway migration to create the interaction_transcripts table and its indexes.

CREATE TABLE IF NOT EXISTS `interaction_transcripts` (
    `transcript_id` CHAR(36) NOT NULL COMMENT 'Unique identifier for the transcript segment',
    `interaction_id` CHAR(36) NOT NULL COMMENT 'Foreign key linking to the parent interaction',
    `speaker_identifier` VARCHAR(255) NULL COMMENT 'Identifier for the speaker (e.g., name, email)',
    `start_time_seconds` INT UNSIGNED NOT NULL COMMENT 'The start time of the segment in seconds from the beginning of the interaction',
    `end_time_seconds` INT UNSIGNED NOT NULL COMMENT 'The end time of the segment in seconds from the beginning of the interaction',
    `text` TEXT NOT NULL COMMENT 'The transcribed text of the segment',
    `is_edited` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Flag indicating if the transcript has been manually edited',
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

    PRIMARY KEY (`transcript_id`),
    CONSTRAINT `fk_transcripts_interaction_id`
        FOREIGN KEY (`interaction_id`)
        REFERENCES `interactions` (`interaction_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `chk_end_time_after_start_time` CHECK (`end_time_seconds` >= `start_time_seconds`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores individual segments of a conversation transcript for an interaction.';

-- Index to quickly fetch all transcript segments for a given interaction.
CREATE INDEX `idx_transcripts_interaction_id` ON `interaction_transcripts` (`interaction_id`) USING BTREE;

-- Full-text search index on the transcript text.
-- Note: FULLTEXT indexes are only supported by InnoDB and MyISAM engines.
CREATE FULLTEXT INDEX `idx_transcripts_text_search` ON `interaction_transcripts` (`text`);
