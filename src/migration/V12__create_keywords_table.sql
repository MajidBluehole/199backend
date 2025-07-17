-- Flyway migration for the keywords table

CREATE TABLE keywords (
    id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    organization_id CHAR(36) NOT NULL,
    keyword_text VARCHAR(255) NOT NULL,
    category VARCHAR(100) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_keywords_organization
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index to efficiently query keywords by organization
CREATE INDEX idx_keywords_organization_id ON keywords(organization_id);