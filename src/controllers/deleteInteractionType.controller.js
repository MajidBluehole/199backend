const pool = require('../config/database');


const deleteInteractionType = async (req, res) => {
    const { id } = req.params;
    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Step 1: Find the interaction type by its ID
        const [typeRows] = await connection.execute(
            'SELECT is_deletable FROM interaction_types WHERE id = ?',
            [id]
        );

        if (typeRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Not Found - Interaction type with the specified ID does not exist.' });
        }

        const interactionType = typeRows[0];

        // Step 2: Check if the interaction type is a non-deletable system default
        if (!interactionType.is_deletable) {
            await connection.rollback();
            return res.status(403).json({ message: 'Forbidden - This interaction type is a system default and cannot be deleted.' });
        }

        // Step 3: Check if the interaction type is currently in use by any interactions
        // Note: This assumes a foreign key, e.g., `interaction_type_id`, exists on the `interactions` table.
        const [usageRows] = await connection.execute(
            'SELECT COUNT(*) AS usage_count FROM interactions WHERE interaction_type_id = ?',
            [id]
        );

        if (usageRows[0].usage_count > 0) {
            await connection.rollback();
            return res.status(409).json({ message: 'Conflict - This interaction type is in use and cannot be deleted without migrating associated data.' });
        }

        // Step 4: If checks pass, delete the interaction type
        const [deleteResult] = await connection.execute(
            'DELETE FROM interaction_types WHERE id = ?',
            [id]
        );

        if (deleteResult.affectedRows === 0) {
            // This case is unlikely if the first check passed, but it's good for robustness
            await connection.rollback();
            return res.status(404).json({ message: 'Not Found - Interaction type with the specified ID does not exist.' });
        }

        await connection.commit();

        res.status(204).send();

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error deleting interaction type:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    deleteInteractionType,
};