const db = require('../config/database'); // Assuming a db connection pool module using mysql2/promise
const { v4: uuidv4 } = require('uuid');


const submitFeedback = async (req, res) => {
    const {
        recommendation_id,
        rating_type, // 'positive' or 'negative'
        reason_id,
        custom_reason_text,
        comments
    } = req.body;

    // Assumes auth middleware has attached the user object to the request
    if (!req.user || !req.user.user_id) {
        return res.status(401).json({ message: 'Unauthorized - User authentication failed.' });
    }
    const { user_id } = req.user;

    // 1. Basic Validation
    if (!recommendation_id || !rating_type) {
        return res.status(400).json({ message: 'Bad Request - Missing required fields: recommendation_id, rating_type.' });
    }
    if (rating_type !== 'positive' && rating_type !== 'negative') {
        return res.status(400).json({ message: 'Bad Request - rating_type must be "positive" or "negative".' });
    }
    if (rating_type === 'negative' && !reason_id) {
        return res.status(400).json({ message: 'Bad Request - reason_id is required for negative ratings.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 2. Check if the recommendation exists
        const [recommendations] = await connection.execute(
            'SELECT recommendation_id FROM recommendations WHERE recommendation_id = ?',
            [recommendation_id]
        );

        if (recommendations.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Not Found - The specified recommendation_id does not exist.' });
        }

        // 3. Conditional validation for 'Other' reason if rating is negative
        if (rating_type === 'negative') {
            const [reasons] = await connection.execute(
                'SELECT reason_text FROM feedback_reasons WHERE reason_id = ? AND is_active = 1',
                [reason_id]
            );
            if (reasons.length === 0) {
                await connection.rollback();
                return res.status(400).json({ message: 'Bad Request - Invalid or inactive reason_id provided.' });
            }
            // Check if the reason is 'Other' and if custom text is missing
            if (reasons[0].reason_text.toLowerCase() === 'other' && (!custom_reason_text || custom_reason_text.trim() === '')) {
                 await connection.rollback();
                 return res.status(400).json({ message: 'Bad Request - custom_reason_text is required when the reason is "Other".' });
            }
        }

        // 4. Insert the new feedback record into the feedback_submissions table
        const feedback_id = uuidv4();
        const insertQuery = `
            INSERT INTO feedback_submissions (
                feedback_id, user_id, recommendation_id, rating_type, 
                reason_id, custom_reason_text, comments, submission_status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        
        const insertParams = [
            feedback_id,
            user_id,
            recommendation_id,
            rating_type,
            rating_type === 'negative' ? reason_id : null,
            (rating_type === 'negative' && custom_reason_text) ? custom_reason_text.trim() : null,
            comments || null,
            'submitted'
        ];

        await connection.execute(insertQuery, insertParams);

        await connection.commit();

        // 5. Send success response
        res.status(201).json({
            feedback_id: feedback_id,
            message: "Feedback submitted successfully."
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error submitting feedback:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        if (connection) connection.release();
    }
};




const removeTagFromFeedback = async (req, res) => {
    const { feedbackId, tagId } = req.params;

    try {
        const [result] = await db.promise().query(
            'DELETE FROM feedback_to_tags WHERE feedback_id = ? AND tag_id = ?',
            [feedbackId, tagId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Not Found - The specified feedback item or tag association does not exist.'
            });
        }

        // Successfully deleted the association, return 204 No Content
        res.status(204).send();

    } catch (error) {
        console.error('Error removing tag from feedback:', error);
        // Check for foreign key constraint errors or other specific DB errors if needed
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    submitFeedback,
    removeTagFromFeedback
};
