-- Flyway-compatible migration script for creating the recommendation_weights table

CREATE TABLE recommendation_weights (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    organization_id CHAR(36) NOT NULL,
    attribute_key VARCHAR(100) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    weight INTEGER NOT NULL DEFAULT 50,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT fk_recommendation_weights_organization
        FOREIGN KEY (organization_id) REFERENCES organizations(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_weight_range CHECK (weight >= 0 AND weight <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create a unique index to ensure each organization has only one weight per attribute.
CREATE UNIQUE INDEX idx_rec_weights_organization_key
ON recommendation_weights(organization_id, attribute_key);
