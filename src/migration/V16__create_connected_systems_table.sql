CREATE TABLE connected_systems (
    system_id CHAR(36) NOT NULL DEFAULT (UUID()),
    workspace_id CHAR(36) NOT NULL,
    system_type ENUM('SALESFORCE', 'HUBSPOT', 'GMAIL', 'OUTLOOK', 'ZENDESK', 'ZOOM', 'TEAMS') NOT NULL,
    status ENUM('CONNECTED', 'DISCONNECTED', 'ERROR', 'SYNCING') NOT NULL DEFAULT 'DISCONNECTED',
    last_synced_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (system_id),
    CONSTRAINT fk_connected_systems_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces(workspace_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_connected_systems_workspace_id ON connected_systems(workspace_id);
