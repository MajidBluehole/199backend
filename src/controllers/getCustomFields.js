const db = require('../config/database');


const getCustomFields = async (req, res, next) => {
    let connection;
    try {
        connection = await db.getConnection();

        // Fetch all custom fields and all options in parallel
        const [fieldsPromise, optionsPromise] = await Promise.all([
            connection.query(`
                SELECT id, name, label, field_type, display_order 
                FROM custom_fields 
                ORDER BY display_order ASC, created_at ASC
            `),
            connection.query(`
                SELECT id, custom_field_id, value, display_order 
                FROM custom_field_options 
                ORDER BY display_order ASC
            `)
        ]);

        const [fields] = fieldsPromise;
        const [options] = optionsPromise;

        // Create a map of options grouped by their parent custom_field_id for efficient lookup
        const optionsMap = options.reduce((map, option) => {
            const { custom_field_id, ...optionData } = option;
            if (!map[custom_field_id]) {
                map[custom_field_id] = [];
            }
            map[custom_field_id].push(optionData);
            return map;
        }, {});

        // Combine fields with their respective options
        const responseData = fields.map(field => ({
            id: field.id,
            name: field.name,
            label: field.label,
            field_type: field.field_type,
            display_order: field.display_order,
            options: (field.field_type === 'DROPDOWN' || field.field_type === 'MULTI_SELECT') 
                     ? (optionsMap[field.id] || []) 
                     : []
        }));

        res.status(200).json(responseData);

    } catch (error) {
        console.error('Failed to retrieve custom fields:', error);
        // Pass error to the centralized error handler
        next(error);
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    getCustomFields
};