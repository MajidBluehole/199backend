-- Flyway migration for the contacts table

-- Assuming the workspaces and users tables already exist with UUID primary keys.

CREATE TABLE contacts (
    `contact_id` CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    `workspace_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NULL,
    `company_name` VARCHAR(255) NULL,
    `title` VARCHAR(255) NULL,
    `source_system` VARCHAR(50) NULL COMMENT 'e.g., ''SALESFORCE'', ''HUBSPOT'', ''MANUAL''',
    `source_record_id` VARCHAR(255) NULL,
    `last_contact_date` TIMESTAMP NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign key constraints
    CONSTRAINT `fk_contacts_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`workspace_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_contacts_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for performance

-- Index for foreign key to efficiently query by workspace
CREATE INDEX `idx_contacts_workspace_id` ON `contacts`(`workspace_id`);

-- Index for foreign key to efficiently retrieve contacts for a specific user
CREATE INDEX `idx_contacts_user_id` ON `contacts`(`user_id`);

-- Index for fast lookup by email address
CREATE INDEX `idx_contacts_email` ON `contacts`(`email`);

-- Index for fast lookup by company name
CREATE INDEX `idx_contacts_company_name` ON `contacts`(`company_name`);

-- FULLTEXT index for fast text search on contact names (MySQL alternative to PostgreSQL's GIN/trgm)
CREATE FULLTEXT INDEX `idx_contacts_full_name_ft` ON `contacts`(`full_name`);
