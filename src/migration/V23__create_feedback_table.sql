-- Flyway migration for creating the feedback table

CREATE TABLE feedback (
    feedback_id CHAR(36) NOT NULL PRIMARY KEY COMMENT 'Primary key for the feedback entry, stored as UUID.',
    user_id CHAR(36) NULL COMMENT 'Links to the user who gave feedback. SET NULL on user deletion.',
    recommendation_id CHAR(36) NOT NULL COMMENT 'Identifier for the recommendation being reviewed.',
    recommendation_category VARCHAR(100) NOT NULL COMMENT 'e.g., Salesforce, Zendesk, Zoom/Teams.',
    feedback_type ENUM('helpful', 'not_helpful', 'incorrect') NOT NULL COMMENT 'The type of feedback provided.',
    comment TEXT NULL COMMENT 'Optional free-text comment from the user.',
    status ENUM('new', 'reviewed', 'actioned') NOT NULL DEFAULT 'new' COMMENT 'The processing status of the feedback.',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp of when the feedback was created.',
    
    -- This assumes a 'users' table exists with a 'user_id' CHAR(36) primary key.
    -- If the 'users' table is created in a later migration, this constraint should be added separately.
    CONSTRAINT fk_feedback_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL
) COMMENT='Stores all user-submitted feedback on AI recommendations.';

-- Indexes

-- For filtering feedback by user.
CREATE INDEX idx_feedback_user_id ON feedback(user_id);

-- For sorting and filtering by date.
CREATE INDEX idx_feedback_created_at ON feedback(created_at);

-- For efficient filtering on common criteria like feedback type and status.
CREATE INDEX idx_feedback_type_status ON feedback(feedback_type, status);

-- For full-text search on comments. Requires MySQL 5.6+ for InnoDB.
CREATE FULLTEXT INDEX idx_feedback_comment_fulltext ON feedback(comment);
