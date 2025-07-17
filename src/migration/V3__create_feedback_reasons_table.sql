CREATE TABLE `feedback_reasons` (
  `reason_id` INT NOT NULL AUTO_INCREMENT,
  `reason_text` VARCHAR(255) NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`reason_id`),
  UNIQUE KEY `uk_feedback_reasons_reason_text` (`reason_text`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;