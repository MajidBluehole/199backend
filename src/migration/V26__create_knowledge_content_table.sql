-- Flyway migration script for creating the knowledge_content table

CREATE TABLE knowledge_content (
    content_id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    uploader_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type ENUM('Sales Sheet', 'Technical Doc', 'Case Study', 'Presentation', 'Other') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(1024) NOT NULL,
    file_size BIGINT UNSIGNED NOT NULL,
    file_mime_type VARCHAR(127) NOT NULL,
    view_count INT UNSIGNED NOT NULL DEFAULT 0,
    download_count INT UNSIGNED NOT NULL DEFAULT 0,
    upload_status ENUM('Uploading', 'Processing', 'Completed', 'Failed') NOT NULL DEFAULT 'Uploading',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Constraints
    UNIQUE KEY uq_file_path (file_path(767)), -- Max key length for InnoDB with utf8mb4
    -- Assuming a 'users' table exists with a 'user_id' of type CHAR(36)
    CONSTRAINT fk_content_uploader FOREIGN KEY (uploader_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Description: Efficiently query content by author.
CREATE INDEX idx_content_uploader ON knowledge_content(uploader_id);

-- Description: Efficiently filter content by its type.
CREATE INDEX idx_content_type ON knowledge_content(content_type);

-- Description: Full-text search index for fast keyword searching on title and description.
CREATE FULLTEXT INDEX idx_content_full_text ON knowledge_content(title, description);
