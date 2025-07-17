const db = require('../../config/db'); // Assuming a mysql2/promise connection pool is exported

const getInteractionTypesController = {
    
    async handleRequest(req, res) {
        const { search, sortBy, order } = req.query;

        try {
            let query = 'SELECT id, name, icon_name, is_deletable, display_order FROM interaction_types';
            const queryParams = [];

            // Add search condition if 'search' parameter is provided
            if (search) {
                query += ' WHERE name LIKE ?';
                queryParams.push(`%${search}%`);
            }

            // Add sorting logic
            // Whitelist allowed columns for sorting to prevent SQL injection
            const allowedSortColumns = ['name', 'created_at', 'display_order'];
            const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'display_order';
            
            // Validate sort order direction
            const sortDirection = (order && order.toUpperCase() === 'DESC') ? 'DESC' : 'ASC';

            query += ` ORDER BY ${db.escapeId(sortColumn)} ${sortDirection}`;

            const [interactionTypes] = await db.promise().query(query, queryParams);

            res.status(200).json(interactionTypes);

        } catch (error) {
            console.error('Error fetching interaction types:', error);
            // In a real application, you might have more sophisticated logging
            res.status(500).json({ message: 'Internal Server Error.' });
        }
    }
};


module.exports = { getInteractionTypesController };
