-- Flyway migration for the custom_field_options table

CREATE TABLE custom_field_options (
    id CHAR(36) NOT NULL COMMENT 'Primary key UUID for the option',
    custom_field_id CHAR(36) NOT NULL COMMENT 'Foreign key to the custom_fields table',
    value VARCHAR(255) NOT NULL COMMENT 'The actual value of the option',
    display_order INT NOT NULL COMMENT 'The order in which the option should be displayed',
    PRIMARY KEY (id),
    CONSTRAINT fk_custom_field_options_field_id
        FOREIGN KEY (custom_field_id)
        REFERENCES custom_fields(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index to efficiently retrieve all options for a given custom field
CREATE INDEX idx_custom_field_options_field_id
ON custom_field_options(custom_field_id)
USING BTREE;
