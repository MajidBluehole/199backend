-- Flyway migration for the master_customers table

CREATE TABLE master_customers (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    `organization_id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NULL,
    `email` VARCHAR(255) NULL,
    `company` VARCHAR(255) NULL,
    `merged_data` JSON NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_master_customers_organization` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index for efficient lookup by organization and email
CREATE INDEX `idx_master_customers_org_email` ON `master_customers` (`organization_id`, `email`);

-- Full-text search index for name, email, and company
CREATE FULLTEXT INDEX `idx_master_customers_search` ON `master_customers` (`name`, `email`, `company`);
