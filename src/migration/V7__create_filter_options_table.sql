CREATE TABLE `filter_options` (
  `id` CHAR(36) NOT NULL COMMENT 'Primary key UUID',
  `category_name` VARCHAR(255) NOT NULL COMMENT 'The name of the filter group, e.g., ''Region'', ''Product''.',
  `value` VARCHAR(255) NOT NULL COMMENT 'A specific option within the category, e.g., ''North America'', ''Product X''.',
  `display_order` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idx_filter_options_category_value` (`category_name`, `value`) COMMENT 'Ensures uniqueness of values within a category and speeds up lookups.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;