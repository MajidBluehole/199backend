-- Flyway migration for creating the custom_fields table

CREATE TABLE custom_fields (
    id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    label VARCHAR(255) NOT NULL,
    field_type ENUM('TEXT', 'NUMBER', 'DATE', 'DROPDOWN', 'MULTI_SELECT') NOT NULL,
    is_deletable BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create a unique index on the 'name' column for fast lookups and uniqueness checks.
CREATE UNIQUE INDEX idx_custom_fields_name ON custom_fields(name);

-- Create an index on 'display_order' to optimize sorting.
CREATE INDEX idx_custom_fields_display_order ON custom_fields(display_order);
