-- Flyway migration for creating the connected_data_sources table

CREATE TABLE connected_data_sources (
    id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    organization_id CHAR(36) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    connection_status ENUM('PENDING', 'CONNECTED', 'ERROR', 'SYNCING') NOT NULL DEFAULT 'PENDING',
    credentials JSON NOT NULL,
    sync_schedule VARCHAR(50) NOT NULL DEFAULT 'DAILY',
    last_sync_at TIMESTAMP NULL DEFAULT NULL,
    last_sync_status ENUM('SUCCESS', 'FAILED', 'IN_PROGRESS', 'PARTIAL_SUCCESS') NULL DEFAULT NULL,
    last_sync_error_message TEXT NULL,
    created_by_user_id CHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Assuming 'organizations' and 'users' tables exist with UUID primary keys
    CONSTRAINT fk_cds_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_cds_user FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Index for efficient querying by organization
CREATE INDEX idx_connected_data_sources_org_id ON connected_data_sources(organization_id);

-- Index for filtering connections by status within an organization
CREATE INDEX idx_connected_data_sources_status ON connected_data_sources(organization_id, connection_status);
