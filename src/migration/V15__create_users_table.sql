-- Flyway-compatible migration for the users table

CREATE TABLE users (
    user_id CHAR(36) NOT NULL PRIMARY KEY,
    workspace_id CHAR(36) NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'User', 'ReadOnly') NOT NULL DEFAULT 'User',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    -- Assuming a 'workspaces' table exists with a 'workspace_id' primary key
    -- CONSTRAINT fk_users_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(workspace_id)
);

-- Description: Speeds up user lookups by email during login.
CREATE INDEX idx_users_email ON users(email);

-- Description: Efficiently filter for active (not soft-deleted) users.
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
