const pool = require('../config/database'); // Assuming a mysql2 connection pool is exported
const { v4: uuidv4 } = require('uuid');

const createInteractionType = async (req, res) => {
    const { name, icon_name } = req.body;

    if (!name || !icon_name) {
        return res.status(400).json({ message: 'Bad Request - Missing required fields.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        // Check if an interaction type with the given name already exists
        const [existing] = await connection.execute(
            'SELECT id FROM interaction_types WHERE name = ?',
            [name]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: 'Conflict - An interaction type with this name already exists.' });
        }

        // Calculate the next display_order value
        const [orderResult] = await connection.execute(
            'SELECT MAX(display_order) as maxOrder FROM interaction_types'
        );
        const maxOrder = orderResult[0].maxOrder || 0;
        const displayOrder = maxOrder + 1;

        // Prepare the new record
        const newInteractionType = {
            id: uuidv4(),
            name,
            icon_name,
            is_deletable: true, // New custom types are deletable by default
            display_order: displayOrder
        };

        // Create the new record in the database
        await connection.execute(
            `INSERT INTO interaction_types (id, name, icon_name, is_deletable, display_order, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                newInteractionType.id,
                newInteractionType.name,
                newInteractionType.icon_name,
                newInteractionType.is_deletable,
                newInteractionType.display_order
            ]
        );

        // Return the newly created object
        res.status(201).json(newInteractionType);

    } catch (error) {
        console.error('Error creating interaction type:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    createInteractionType,
};