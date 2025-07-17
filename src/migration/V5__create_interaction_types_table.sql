-- Flyway-compatible migration script for creating the interaction_types table

CREATE TABLE interaction_types (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()),
    `name` VARCHAR(255) NOT NULL,
    `icon_name` VARCHAR(100) NOT NULL,
    `is_deletable` BOOLEAN NOT NULL DEFAULT TRUE,
    `display_order` INT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_interaction_types_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Description: Ensures fast lookups and uniqueness checks on the interaction type name.
-- Note: A UNIQUE KEY constraint implicitly creates an index, so a separate CREATE INDEX is not needed for 'name'.
-- We are creating an explicit index as requested for clarity.
CREATE INDEX `idx_interaction_types_name` ON `interaction_types`(`name`) USING BTREE;

-- Description: Optimizes sorting by display order.
CREATE INDEX `idx_interaction_types_display_order` ON `interaction_types`(`display_order`) USING BTREE;
