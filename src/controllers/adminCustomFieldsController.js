const db = require('../config/database'); // Assuming a mysql2/promise connection pool


const updateCustomField = async (req, res) => {
    const { id } = req.params;
    const { label, field_type, options, confirm_data_loss } = req.body;

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Step 1: Fetch the existing custom field and lock the row for update
        const [fields] = await connection.execute(
            'SELECT * FROM custom_fields WHERE id = ? FOR UPDATE',
            [id]
        );

        if (fields.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Custom field not found.' });
        }

        const existingField = fields[0];
        const typeHasChanged = field_type && field_type !== existingField.field_type;

        // Step 2: Check for potential data loss if field type is changing
        if (typeHasChanged && !confirm_data_loss) {
            // Check if any data exists for this custom field in a hypothetical values table
            // This check is crucial for the data loss warning logic.
            // NOTE: The table 'interaction_custom_field_values' is assumed to exist for this logic.
            const [dataCheck] = await connection.execute(
                'SELECT 1 FROM interaction_custom_field_values WHERE custom_field_id = ? LIMIT 1',
                [id]
            );

            if (dataCheck.length > 0) {
                await connection.rollback();
                return res.status(409).json({
                    message: 'Conflict - Changing field type may result in data loss for existing entries. Please confirm to proceed.',
                    requires_confirmation: true
                });
            }
        }

        // Step 3: Proceed with the update
        const newFieldType = field_type || existingField.field_type;

        // If type change was confirmed, delete associated data to prevent type mismatches
        if (typeHasChanged && confirm_data_loss) {
            await connection.execute(
                'DELETE FROM interaction_custom_field_values WHERE custom_field_id = ?',
                [id]
            );
        }

        // Update the main custom_fields table
        await connection.execute(
            'UPDATE custom_fields SET label = ?, field_type = ? WHERE id = ?',
            [label || existingField.label, newFieldType, id]
        );

        // Step 4: Manage custom field options
        // First, clear all existing options for this field to handle updates, additions, and deletions cleanly.
        await connection.execute('DELETE FROM custom_field_options WHERE custom_field_id = ?', [id]);

        // If the new type is one that uses options, insert the new ones.
        if (['DROPDOWN', 'MULTI_SELECT'].includes(newFieldType)) {
            if (Array.isArray(options) && options.length > 0) {
                const optionValues = options.map((opt, index) => [
                    id,
                    opt.value,
                    opt.display_order || index + 1
                ]);
                await connection.query(
                    'INSERT INTO custom_field_options (custom_field_id, value, display_order) VALUES ?',
                    [optionValues]
                );
            }
        }

        // Step 5: Commit the transaction
        await connection.commit();

        res.status(200).json({});

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error updating custom field:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    updateCustomField
};