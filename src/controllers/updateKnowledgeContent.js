const pool = require('../config/database'); // Assuming a mysql2 promise-based pool is exported from db.js


const updateKnowledgeContent = async (req, res) => {
    const { contentId } = req.params;
    const { title, description, tags } = req.body;
    // Assuming user info is attached by an authentication middleware
    const { user_id: authUserId, role: authUserRole } = req.user;

    if (!title && !description && !tags) {
        return res.status(400).json({ message: 'At least one field (title, description, tags) must be provided for update.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Step 1: Fetch the content item to verify existence and ownership
        const [contentRows] = await connection.execute(
            'SELECT uploader_id FROM knowledge_content WHERE content_id = ?',
            [contentId]
        );

        if (contentRows.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: 'Not Found.' });
        }

        const contentOwnerId = contentRows[0].uploader_id;

        // Step 2: Verify that the authenticated user is the owner or an admin
        if (contentOwnerId !== authUserId && authUserRole !== 'admin') {
            await connection.rollback();
            connection.release();
            return res.status(403).json({ message: 'Forbidden - User is not the owner or an admin.' });
        }

        // Step 3: Update the provided fields in the knowledge_content table
        const updatedAt = new Date();
        await connection.execute(
            'UPDATE knowledge_content SET title = ?, description = ?, updated_at = ? WHERE content_id = ?',
            [title, description, updatedAt, contentId]
        );

        // Step 4: Handle tags update
        // 4a: Clear existing tag associations for this content item
        await connection.execute('DELETE FROM content_tags WHERE content_id = ?', [contentId]);

        // 4b: If new tags are provided, process and associate them
        if (tags && Array.isArray(tags) && tags.length > 0) {
            const tagIds = [];
            for (const tagName of tags) {
                // Find or create the tag to get its ID
                const [existingTag] = await connection.execute('SELECT tag_id FROM tags WHERE tag_name = ?', [tagName.trim()]);
                let tagId;
                if (existingTag.length > 0) {
                    tagId = existingTag[0].tag_id;
                } else {
                    const [newTag] = await connection.execute('INSERT INTO tags (tag_name) VALUES (?)', [tagName.trim()]);
                    tagId = newTag.insertId;
                }
                tagIds.push(tagId);
            }

            // 4c: Create new associations in the content_tags junction table
            const contentTagValues = tagIds.map(id => [contentId, id]);
            if (contentTagValues.length > 0) {
                await connection.query('INSERT INTO content_tags (content_id, tag_id) VALUES ?', [contentTagValues]);
            }
        }

        // Step 5: Commit the transaction
        await connection.commit();

        // Step 6: Prepare and send the successful response
        const response = {
            content_id: contentId,
            title,
            description,
            tags: tags || [],
            updated_at: updatedAt.toISOString(),
        };

        res.status(200).json(response);

    } catch (error) {
        await connection.rollback();
        console.error('Error updating knowledge content:', error);
        res.status(500).json({ message: 'An error occurred while updating the content.' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};


module.exports = { updateKnowledgeContent };
