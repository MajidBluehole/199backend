CREATE TABLE `ai_analyses` (
  `analysis_id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `interaction_id` CHAR(36) NOT NULL,
  `summary` TEXT NULL,
  `status` ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
  `error_message` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`analysis_id`),
  UNIQUE KEY `uk_ai_analyses_interaction_id` (`interaction_id`),
  CONSTRAINT `fk_ai_analyses_interaction` 
    FOREIGN KEY (`interaction_id`) 
    REFERENCES `interactions` (`interaction_id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;