CREATE TABLE integrations (
    integration_id CHAR(36) NOT NULL DEFAULT (UUID()),
    organization_id CHAR(36) NOT NULL,
    type ENUM('SALESFORCE', 'HUBSPOT', 'ZENDESK', 'SERVICENOW', 'GMAIL', 'OUTLOOK', 'ZOOM', 'TEAMS') NOT NULL,
    status ENUM('CONNECTED', 'DISCONNECTED', 'ERROR') NOT NULL DEFAULT 'DISCONNECTED',
    credentials TEXT COMMENT 'Encrypted credentials or tokens in JSON format.',
    last_sync_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (integration_id),
    CONSTRAINT fk_integrations_organization
        FOREIGN KEY (organization_id)
        REFERENCES organizations(organization_id)
        ON DELETE CASCADE,
    UNIQUE INDEX idx_integrations_org_id_type (organization_id, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;