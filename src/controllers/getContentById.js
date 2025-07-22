const db = require('../config/database'); // Assuming a mysql2/promise connection pool is exported


const getContentById = async (req, res) => {
    const { contentId } = req.params;
    let connection;

    try {
        connection = await db.getConnection();
        // Use a transaction to ensure the view count increment and the data fetch are atomic.
        await connection.beginTransaction();

        // First, increment the view_count. This also serves as a check for existence.
        const [updateResult] = await connection.execute(
            'UPDATE knowledge_content SET view_count = view_count + 1 WHERE content_id = ?',
            [contentId]
        );

        // If no rows were affected, the content ID does not exist.
        if (updateResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Not Found - Content with the specified ID does not exist.' });
        }

        // Now, fetch the updated content details, joining with users and tags.
        const contentQuery = `
            SELECT
                kc.content_id,
                kc.title,
                kc.description,
                kc.content_type,
                kc.file_name,
                kc.file_size,
                kc.view_count,
                kc.download_count,
                kc.created_at,
                kc.updated_at,
                u.user_id AS uploader_id,
                u.firstName AS uploader_name,
                GROUP_CONCAT(t.tag_name) AS tags
            FROM
                knowledge_content kc
            JOIN
                users u ON kc.uploader_id = u.user_id
            LEFT JOIN
                content_tags ct ON kc.content_id = ct.content_id
            LEFT JOIN
                tags t ON ct.tag_id = t.tag_id
            WHERE
                kc.content_id = ?
            GROUP BY
                kc.content_id, u.user_id;
        `;

        const [rows] = await connection.execute(contentQuery, [contentId]);
        
        // This check is technically redundant if the update succeeded, but provides an extra layer of safety.
        if (rows.length === 0) {
            await connection.rollback(); // Should not be reached
            return res.status(404).json({ message: 'Not Found - Content with the specified ID does not exist.' });
        }

        // If all operations were successful, commit the transaction.
        await connection.commit();

        const content = rows[0];

        // Format the response object according to the specified schema.
        const responsePayload = {
            content_id: content.content_id,
            title: content.title,
            description: content.description,
            content_type: content.content_type,
            file_name: content.file_name,
            file_size: content.file_size,
            view_count: content.view_count, // This will be the newly incremented value
            download_count: content.download_count,
            created_at: content.created_at,
            updated_at: content.updated_at,
            uploader: {
                user_id: content.uploader_id,
                name: content.uploader_name
            },
            tags: content.tags ? content.tags.split(',') : [] // Handle case where there are no tags
        };

        res.status(200).json(responsePayload);

    } catch (error) {
        // If an error occurs, roll back any changes from the transaction.
        if (connection) await connection.rollback();
        console.error('Error fetching content by ID:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        // Always release the connection back to the pool.
        if (connection) connection.release();
    }
};

module.exports = {
    getContentById
};