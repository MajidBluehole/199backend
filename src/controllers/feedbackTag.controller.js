const db = require('../config/database'); // Assuming a mysql2/promise connection pool


const addTagsToFeedback = async (req, res) => {
    const { feedbackIds, tagIds } = req.body;

    // Validate input: must be non-empty arrays of integers
    if (!Array.isArray(feedbackIds) || feedbackIds.length === 0 || !Array.isArray(tagIds) || tagIds.length === 0) {
        return res.status(400).json({ message: "Bad Request - Invalid or missing 'feedbackIds' or 'tagIds'." });
    }

    if (feedbackIds.some(id => !Number.isInteger(id) || id <= 0) || tagIds.some(id => !Number.isInteger(id) || id <= 0)) {
        return res.status(400).json({ message: "Bad Request - 'feedbackIds' and 'tagIds' must be arrays of positive integers." });
    }

    // Create all unique pairs for insertion
    const pairsToInsert = [];
    for (const feedbackId of feedbackIds) {
        for (const tagId of tagIds) {
            pairsToInsert.push([feedbackId, tagId]);
        }
    }

    if (pairsToInsert.length === 0) {
        return res.status(400).json({ message: "Bad Request - No valid ID pairs to process." });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // The prompt has conflicting requirements: one says to ignore existing pairs,
        // another says to return 409 if pairs exist. We will implement the stricter
        // 409 error handling as it defines a clearer API contract.

        // Check if any of the associations already exist.
        const checkSql = "SELECT 1 FROM feedback_to_tags WHERE (feedback_id, tag_id) IN (?) LIMIT 1";
        const [existingRows] = await connection.query(checkSql, [pairsToInsert]);

        if (existingRows.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: "Conflict - One or more tag associations already exist." });
        }

        // If no associations exist, perform the bulk insert.
        const insertSql = "INSERT INTO feedback_to_tags (feedback_id, tag_id) VALUES ?";
        const [result] = await connection.query(insertSql, [pairsToInsert]);

        await connection.commit();

        res.status(201).json({ message: `Successfully added ${result.affectedRows} tag associations.` });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error("Error adding tags to feedback items:", error);
        
        // Handle foreign key constraint violations (e.g., a feedbackId or tagId doesn't exist)
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
             return res.status(404).json({ message: "Not Found - One or more feedback or tag IDs do not exist." });
        }

        res.status(500).json({ message: "Internal Server Error" });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    addTagsToFeedback
};