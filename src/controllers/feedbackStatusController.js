const pool = require('../../config/database');


const hasPermission = (user) => {
    // Example: Only allow users with 'admin' or 'manager' roles to perform this action.
    return user && (user.role === 'admin' || user.role === 'manager');
};


const updateFeedbackStatus = async (req, res) => {
    const { feedbackIds, status } = req.body;
    
    // Assuming auth middleware has attached the user object to the request
    const user = req.user;

    // Validate input
    if (!status || typeof status !== 'string' || !Array.isArray(feedbackIds) || feedbackIds.length === 0) {
        return res.status(400).json({ message: "Bad Request - Invalid or missing 'feedbackIds' or 'status'." });
    }

    // Check permissions
    if (!hasPermission(user)) {
        return res.status(403).json({ message: "Forbidden - User does not have permission to update status." });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        
        const updateQuery = 'UPDATE feedback SET status = ? WHERE feedback_id IN (?)';
        
        const [result] = await connection.query(updateQuery, [status, feedbackIds]);

        res.status(200).json({
            message: 'Feedback statuses updated successfully.',
            updatedCount: result.affectedRows
        });

    } catch (error) {
        console.error('Error updating feedback status:', error);
        res.status(500).json({ message: 'An error occurred while updating feedback status.' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    updateFeedbackStatus
};