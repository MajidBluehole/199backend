-- Flyway migration for creating the insight_models table

CREATE TABLE `insight_models` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `organization_id` CHAR(36) NOT NULL,
  `model_key` VARCHAR(100) NOT NULL COMMENT 'A unique key for the model, e.g., ''topic_detection''.',
  `display_name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `is_enabled` BOOLEAN NOT NULL DEFAULT FALSE,
  `configuration` JSON COMMENT 'Stores model-specific parameters like sensitivity or thresholds.',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT `fk_insight_models_organization` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE,

  -- Indexes
  UNIQUE KEY `idx_insight_models_organization_key` (`organization_id`, `model_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
