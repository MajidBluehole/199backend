-- Flyway migration for the data_sources table

CREATE TABLE data_sources (
    id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    organization_id CHAR(36) NOT NULL,
    source_type ENUM('SALESFORCE', 'HUBSPOT', 'ZENDESK', 'SERVICENOW', 'GMAIL', 'OUTLOOK', 'ZOOM', 'TEAMS') NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    connection_status ENUM('CONNECTED', 'DISCONNECTED', 'ERROR') NOT NULL DEFAULT 'DISCONNECTED',
    credentials JSON,
    last_error_message TEXT,
    last_sync_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_data_sources_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Index for efficient querying by organization
CREATE INDEX idx_data_sources_organization_id ON data_sources(organization_id);

-- Index for filtering by status and type within an organization
CREATE INDEX idx_data_sources_status_type ON data_sources(organization_id, connection_status, source_type);
