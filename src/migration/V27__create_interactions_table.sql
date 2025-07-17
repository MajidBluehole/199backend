-- Description: Core table representing a single interaction event like a call or meeting.
CREATE TABLE interactions (
    interaction_id CHAR(36) NOT NULL DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    workspace_id CHAR(36) NOT NULL,
    contact_id CHAR(36) NULL,
    objective TEXT NOT NULL,
    status ENUM('PENDING', 'ANALYZING', 'ACTIVE', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    external_id VARCHAR(255) NULL,
    source_service ENUM('SALESFORCE', 'HUBSPOT', 'ZENDESK', 'GMAIL', 'OUTLOOK', 'ZOOM', 'TEAMS', 'CALENDAR', 'RELAIVAINT_APP') NOT NULL,
    interaction_type ENUM('CALL', 'EMAIL', 'MEETING', 'TICKET', 'NOTE') NOT NULL,
    subject TEXT NOT NULL,
    summary TEXT NULL,
    start_time TIMESTAMP NOT NULL,
    started_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (interaction_id),
    CONSTRAINT fk_interactions_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_interactions_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(workspace_id) ON DELETE CASCADE,
    CONSTRAINT fk_interactions_contact FOREIGN KEY (contact_id) REFERENCES contacts(contact_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Description: Primary index for fetching a user's recent interactions quickly.
CREATE INDEX idx_interactions_user_time ON interactions(user_id, start_time DESC);

-- Description: For finding all interactions with a specific contact for a user.
CREATE INDEX idx_interactions_user_contact ON interactions(user_id, contact_id);

-- Description: For efficiently querying interactions by workspace and time.
CREATE INDEX idx_interactions_workspace_time ON interactions(workspace_id, start_time DESC);
