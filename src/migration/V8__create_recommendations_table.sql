CREATE TABLE recommendations (
    recommendation_id CHAR(36) NOT NULL,
    source_system VARCHAR(50) NOT NULL,
    source_context_id VARCHAR(255) NULL,
    recommendation_text TEXT NOT NULL,
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (recommendation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_recommendations_source ON recommendations(source_system, source_context_id);
