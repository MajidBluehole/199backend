CREATE TABLE IF NOT EXISTS ai_recommendations (
    `recommendation_id` CHAR(36) NOT NULL DEFAULT (UUID()),
    `interaction_id` CHAR(36) NOT NULL,
    `type` ENUM(
        'CREATE_SF_OPPORTUNITY',
        'CREATE_ZENDESK_TICKET',
        'SCHEDULE_FOLLOW_UP',
        'DRAFT_EMAIL',
        'CREATE_SF_TASK'
    ) NOT NULL,
    `details` JSON,
    `status` ENUM(
        'PENDING',
        'ACTION_TAKEN',
        'DISMISSED'
    ) NOT NULL DEFAULT 'PENDING',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`recommendation_id`),
    CONSTRAINT `fk_recommendations_interaction` 
        FOREIGN KEY (`interaction_id`) 
        REFERENCES `interactions`(`interaction_id`)
        ON DELETE CASCADE
);

-- To quickly fetch all recommendations for an interaction.
CREATE INDEX `idx_recommendations_interaction_id` ON `ai_recommendations`(`interaction_id`);
