-- Flyway migration script for creating the field_mappings table

CREATE TABLE IF NOT EXISTS field_mappings (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    connected_data_source_id CHAR(36) NOT NULL,
    source_field_path VARCHAR(255) NOT NULL COMMENT 'Path to the field in the source system, e.g., ''Account.Name''.',
    relaivaint_master_field VARCHAR(255) NOT NULL COMMENT 'Path to the field in the master customer record, e.g., ''customer.name''.',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_field_mappings_connection_id (connected_data_source_id) COMMENT 'Quickly retrieve all mappings for a given connection.',
    FOREIGN KEY (connected_data_source_id) REFERENCES connected_data_sources(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Defines how fields from a source system map to the master fields in Relaivaint.';