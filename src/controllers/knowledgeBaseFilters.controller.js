const db = require('../config/database'); // Assuming a mysql2 promise-based connection pool


const getKnowledgeBaseFilters = async (req, res) => {
    try {
        // Query 1: Fetch ENUM values for 'content_type' from the knowledge_content table schema
        const getTypesQuery = "SHOW COLUMNS FROM knowledge_content LIKE 'content_type'";

        // Query 2: Fetch distinct users who have uploaded content
        const getAuthorsQuery = `
            SELECT DISTINCT u.user_id, u.firstName AS name
            FROM users u
            JOIN knowledge_content kc ON u.user_id = kc.uploader_id
            WHERE u.deleted_at IS NULL
            ORDER BY u.firstName;
        `;

        // Query 3: Fetch all distinct tag names
        const getTagsQuery = "SELECT DISTINCT tag_name FROM tags ORDER BY tag_name;";

        // Execute all queries in parallel for efficiency
        const [
            [typeRows], // SHOW COLUMNS returns an array containing one object for the matched column
            [authorRows],
            [tagRows]
        ] = await Promise.all([
            db.query(getTypesQuery),
            db.query(getAuthorsQuery),
            db.query(getTagsQuery)
        ]);

        // Parse ENUM values from the 'Type' column string (e.g., "enum('ARTICLE','UPDATE','TEMPLATE')")
        let contentTypes = [];
        if (typeRows && typeRows.Type) {
            // Use regex to find all values within single quotes
            const matches = typeRows.Type.match(/'([^']*)'/g);
            if (matches) {
                contentTypes = matches.map(val => val.replace(/'/g, ''));
            }
        }

        // The author query already returns the desired format: [{ user_id, name }]
        const authors = authorRows;

        // Map the tag rows from [{ tag_name: '...' }] to ['...']
        const tags = tagRows.map(row => row.tag_name);

        res.status(200).json({
            contentTypes,
            authors,
            tags
        });

    } catch (error) {
        console.error('Error fetching knowledge base filters:', error);
        // The prompt does not specify a 500 error, but it's good practice for unexpected server issues.
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    getKnowledgeBaseFilters
};