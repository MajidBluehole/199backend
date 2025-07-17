-- Flyway-compatible migration for creating the feedback_submissions table

CREATE TABLE feedback_submissions (
    feedback_id UUID PRIMARY KEY DEFAULT (UUID()),
    user_id UUID NOT NULL,
    recommendation_id UUID,
    rating_type ENUM('thumbs', 'stars') NOT NULL,
    rating_value INT NOT NULL,
    reason_id INT,
    custom_reason_text TEXT,
    comments TEXT,
    submission_status ENUM('synced', 'pending_sync') NOT NULL DEFAULT 'synced',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints are defined here for clarity, assuming related tables exist.
    -- Replace 'users(user_id)', 'recommendations(recommendation_id)', and 'feedback_reasons(reason_id)'
    -- with the actual referenced tables and columns.
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_recommendation FOREIGN KEY (recommendation_id) REFERENCES recommendations(recommendation_id) ON DELETE SET NULL,
    CONSTRAINT fk_feedback_reason FOREIGN KEY (reason_id) REFERENCES feedback_reasons(reason_id) ON DELETE SET NULL
);

-- Index to efficiently retrieve feedback history for a specific user, sorted by date.
CREATE INDEX idx_feedback_user_id ON feedback_submissions (user_id, created_at);

-- Index to efficiently find feedback for a specific recommendation.
CREATE INDEX idx_feedback_recommendation_id ON feedback_submissions (recommendation_id);
