-- Flyway migration for customer_source_links
-- Description: Links a master customer record to its original records in the source systems for traceability.

CREATE TABLE `customer_source_links` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `master_customer_id` CHAR(36) NOT NULL COMMENT 'Foreign key to the master_customers table.',
  `connected_data_source_id` CHAR(36) NOT NULL COMMENT 'Foreign key to the connected_data_sources table.',
  `source_record_id` VARCHAR(255) NOT NULL COMMENT 'The unique identifier of the record in the source system.',
  `last_synced_at` TIMESTAMP NOT NULL COMMENT 'The timestamp when the record was last synchronized.',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_csl_master_customer` FOREIGN KEY (`master_customer_id`) REFERENCES `master_customers`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_csl_connected_data_source` FOREIGN KEY (`connected_data_source_id`) REFERENCES `connected_data_sources`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index to quickly find all source records for a master customer.
CREATE INDEX `idx_customer_source_links_master_id` ON `customer_source_links` (`master_customer_id`);

-- Unique index to prevent duplicate links and speed up lookups from the source system.
CREATE UNIQUE INDEX `idx_customer_source_links_source_record` ON `customer_source_links` (`connected_data_source_id`, `source_record_id`);
