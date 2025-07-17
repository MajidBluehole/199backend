-- Description: Creates the interaction_participants join table to link contacts to interactions.

CREATE TABLE `interaction_participants` (
  `interaction_id` CHAR(36) NOT NULL COMMENT 'Foreign key to the interactions table.',
  `contact_id` CHAR(36) NOT NULL COMMENT 'Foreign key to the contacts table.',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp of when the record was created.',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp of when the record was last updated.',

  PRIMARY KEY (`interaction_id`, `contact_id`),

  CONSTRAINT `fk_interaction_participants_interaction_id`
    FOREIGN KEY (`interaction_id`)
    REFERENCES `interactions`(`interaction_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT `fk_interaction_participants_contact_id`
    FOREIGN KEY (`contact_id`)
    REFERENCES `contacts`(`contact_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Join table for interactions and contacts (participants).';