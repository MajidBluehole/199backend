const db = require('../../config/database'); // Assuming a database connection module


const getGroupedFilterOptions = async (req, res) => {
    try {
        const sql = `
            SELECT 
                id, 
                category_name, 
                value, 
                display_order 
            FROM 
                filter_options 
            ORDER BY 
                category_name, display_order;
        `;

        const [rows] = await db.promise().query(sql);

        if (!rows || rows.length === 0) {
            return res.status(200).json([]);
        }

        const groupedOptions = {};

        for (const row of rows) {
            if (!groupedOptions[row.category_name]) {
                groupedOptions[row.category_name] = {
                    category_name: row.category_name,
                    values: []
                };
            }

            groupedOptions[row.category_name].values.push({
                id: row.id,
                value: row.value,
                display_order: row.display_order
            });
        }

        const result = Object.values(groupedOptions);

        res.status(200).json(result);

    } catch (error) {
        console.error('Error fetching grouped filter options:', error);
        res.status(500).json({ message: 'Error fetching filter options from the database.' });
    }
};

module.exports = {
    getGroupedFilterOptions
};