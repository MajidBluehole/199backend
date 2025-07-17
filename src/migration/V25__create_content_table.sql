-- Flyway migration for the content table
-- Description: Stores all content items like articles, updates, and templates.

CREATE TABLE content (
    content_id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    content_type ENUM('ARTICLE', 'UPDATE', 'TEMPLATE') NOT NULL,
    status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED', 'PENDING_REVIEW') NOT NULL DEFAULT 'DRAFT',
    author_id CHAR(36) NOT NULL,
    category_id CHAR(36) NOT NULL,
    submitted_by_id CHAR(36) NULL,
    template_variables JSON NULL,
    version INT NOT NULL DEFAULT 1,
    view_count INT NOT NULL DEFAULT 0,
    edit_lock_token CHAR(36) NULL,
    edit_lock_expires_at TIMESTAMP NULL,
    locked_by_user_id CHAR(36) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,

    -- Assuming users(user_id) and categories(category_id) tables exist with CHAR(36) primary keys.
    CONSTRAINT fk_content_author FOREIGN KEY (author_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_content_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
    CONSTRAINT fk_content_submitted_by FOREIGN KEY (submitted_by_id) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_content_locked_by FOREIGN KEY (locked_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for efficient querying

-- For filtering content by its type.
CREATE INDEX idx_content_type ON content(content_type);

-- Efficiently filter content by its publication status.
CREATE INDEX idx_content_status ON content(status);

-- Efficiently sorts content by popularity and recency.
CREATE INDEX idx_content_popularity ON content(view_count DESC, published_at DESC);

-- Supports full-text search across content titles and bodies.
CREATE FULLTEXT INDEX idx_content_fulltext ON content(title, body);
