const db = require('../config/database'); // Assuming a db connection pool module


const searchContacts = async (req, res) => {
    // Authentication middleware is assumed to have populated req.user
    if (!req.user || !req.user.workspace_id) {
        return res.status(401).json({ message: 'Unauthorized - Authentication token is missing or invalid.' });
    }
    const { workspace_id } = req.user;
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ message: "Bad Request - Missing required query parameter 'q'." });
    }

    const limit = parseInt(req.query.limit, 10) || 10;
    const searchQuery = `%${q}%`;

    try {
        const connection = await db.getConnection();
        try {
            const query = `
                SELECT 
                    contact_id, 
                    full_name, 
                    email, 
                    company_name, 
                    source_system 
                FROM contacts 
                WHERE 
                    workspace_id = ? AND
                    (full_name LIKE ? OR email LIKE ? OR company_name LIKE ?)
                LIMIT ?;
            `;

            const [results] = await connection.query(query, [workspace_id, searchQuery, searchQuery, searchQuery, limit]);
            res.status(200).json(results);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error searching contacts:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    searchContacts,
};