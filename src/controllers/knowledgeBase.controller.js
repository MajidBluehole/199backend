const db = require('../../config/db'); // Assuming a mysql2/promise connection pool
const storageService = require('../../services/storageService'); // Assuming a service to handle S3/file storage


const deleteContent = async (req, res) => {
    const { contentId } = req.params;
    // Assuming auth middleware populates req.user with id and role
    const { userId, userRole } = req.user;

    let connection;
    try {
        connection = await db.getConnection();

        // 1. Fetch the content to verify ownership and get file path
        const [rows] = await connection.execute(
            'SELECT uploader_id, file_path FROM knowledge_content WHERE content_id = ?',
            [contentId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Not Found.' });
        }

        const content = rows[0];

        // 2. Verify that the authenticated user is the owner or an admin
        const isOwner = content.uploader_id === userId;
        const isAdmin = userRole === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Forbidden - User is not the owner or an admin.' });
        }

        // Use a transaction to ensure atomicity of file and DB deletion
        await connection.beginTransaction();

        // 3. Delete the file from the storage system (e.g., S3)
        if (content.file_path) {
            try {
                await storageService.deleteFile(content.file_path);
            } catch (storageError) {
                console.error(`Failed to delete file from storage: ${content.file_path}`, storageError);
                // Rollback transaction if file deletion fails, as it's a critical part of the operation
                await connection.rollback();
                return res.status(500).json({ message: 'Failed to delete associated file.' });
            }
        }

        // 4. Delete the record from the 'knowledge_content' table.
        // Associated records in 'content_tags' are assumed to be deleted via ON DELETE CASCADE.
        await connection.execute(
            'DELETE FROM knowledge_content WHERE content_id = ?',
            [contentId]
        );

        await connection.commit();

        // 5. Return success response
        res.status(204).send();

    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error('Failed to rollback transaction:', rollbackError);
            }
        }
        console.error('Error deleting knowledge content:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    deleteContent,
};