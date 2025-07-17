-- Flyway migration for creating the timeline_events table

-- Description: Aggregates events from all integrated systems for a unified customer timeline.
CREATE TABLE IF NOT EXISTS timeline_events (
    `event_id` CHAR(36) NOT NULL DEFAULT (UUID()),
    `organization_id` CHAR(36) NOT NULL,
    `contact_identifier` VARCHAR(255) NULL,
    `source_system` ENUM('SALESFORCE', 'HUBSPOT', 'ZENDESK', 'GMAIL') NOT NULL,
    `event_type` VARCHAR(100) NULL,
    `event_time` TIMESTAMP NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `external_url` VARCHAR(2048) NULL,
    PRIMARY KEY (`event_id`),
    CONSTRAINT `fk_timeline_organization`
        FOREIGN KEY (`organization_id`)
        REFERENCES `organizations` (`organization_id`)
        ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- Index for efficiently querying the timeline for a specific contact.
CREATE INDEX `idx_timeline_contact_time`
ON `timeline_events` (`organization_id`, `contact_identifier`, `event_time`) USING BTREE;