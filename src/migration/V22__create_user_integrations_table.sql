-- Flyway migration for the user_integrations table
-- Description: Manages user connections to third-party services like CRMs, email, and calendars.

-- Note: This script assumes a 'users' table with a 'user_id' primary key of type CHAR(36) already exists.

CREATE TABLE user_integrations (
    integration_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    service_name ENUM('SALESFORCE', 'HUBSPOT', 'ZENDESK', 'GMAIL', 'OUTLOOK', 'ZOOM', 'TEAMS', 'CALENDAR') NOT NULL,
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT NULL,
    status ENUM('CONNECTED', 'DISCONNECTED', 'ERROR') NOT NULL DEFAULT 'DISCONNECTED',
    last_sync_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (integration_id),
    CONSTRAINT fk_user_integrations_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Index to efficiently retrieve all integrations for a specific user.
CREATE INDEX idx_user_integrations_user_id ON user_integrations(user_id);

-- Unique index to ensure a user can only have one integration per service.
CREATE UNIQUE INDEX idx_user_integrations_user_service ON user_integrations(user_id, service_name);
