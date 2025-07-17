const db = require('../config/database'); // Assuming a promise-based MySQL connection pool


const createCustomField = async (req, res) => {
    const { name, label, field_type, options } = req.body;

    // --- Input Validation ---
    if (!name || !label || !field_type) {
        return res.status(400).json({ message: 'Missing required fields: name, label, field_type.' });
    }

    const validFieldTypes = ['TEXT', 'NUMBER', 'DATE', 'DROPDOWN', 'MULTI_SELECT'];
    if (!validFieldTypes.includes(field_type.toUpperCase())) {
        return res.status(400).json({ message: `Invalid field_type. Must be one of: ${validFieldTypes.join(', ')}` });
    }

    if ((field_type.toUpperCase() === 'DROPDOWN' || field_type.toUpperCase() === 'MULTI_SELECT') && (!Array.isArray(options) || options.length === 0)) {
        return res.status(400).json({ message: "The 'options' array is required and cannot be empty for DROPDOWN or MULTI_SELECT types." });
    }

    let connection;
    try {
        connection = await db.promise().getConnection();
        await connection.beginTransaction();

        // 1. Check for name uniqueness within the transaction to prevent race conditions
        const [existingField] = await connection.execute(
            'SELECT id FROM custom_fields WHERE name = ? FOR UPDATE',
            [name]
        );

        if (existingField.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: 'Conflict - A custom field with this name already exists.' });
        }

        // 2. Get the next display order for the new field
        const [[{ nextOrder }]] = await connection.execute(
            'SELECT COALESCE(MAX(display_order), 0) + 1 AS nextOrder FROM custom_fields'
        );

        // 3. Create the custom field record
        const [result] = await connection.execute(
            'INSERT INTO custom_fields (name, label, field_type, is_deletable, display_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
            [name, label, field_type.toUpperCase(), true, nextOrder]
        );

        const newCustomFieldId = result.insertId;
        let createdOptions = [];

        // 4. If options are provided for relevant types, create them
        if ((field_type.toUpperCase() === 'DROPDOWN' || field_type.toUpperCase() === 'MULTI_SELECT') && options.length > 0) {
            const optionValues = options.map((optionValue, index) => [
                newCustomFieldId,
                optionValue,
                index + 1 // Use array index for display_order
            ]);

            await connection.query(
                'INSERT INTO custom_field_options (custom_field_id, value, display_order) VALUES ?',
                [optionValues]
            );
            createdOptions = options;
        }

        await connection.commit();

        // 5. Respond with the newly created resource
        const responsePayload = {
            id: newCustomFieldId,
            name,
            label,
            field_type: field_type.toUpperCase(),
            display_order: nextOrder,
            options: createdOptions,
            is_deletable: true
        };

        res.status(201).json(responsePayload);

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error creating custom field:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    createCustomField
};