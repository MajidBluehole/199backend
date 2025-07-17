const db = require('../config/db'); // Assuming a database connection pool is exported


const buildFilterClause = (filters) => {
    const { startDate, endDate, feedbackType, category, userId } = filters;
    const whereClauses = ['1 = 1']; // Start with a truthy value to simplify AND appending
    const params = [];

    if (startDate) {
        whereClauses.push('f.created_at >= ?');
        params.push(startDate);
    }

    if (endDate) {
        whereClauses.push('f.created_at <= ?');
        params.push(endDate);
    }

    const toArray = (value) => Array.isArray(value) ? value : (value ? [value] : []);

    const feedbackTypes = toArray(feedbackType);
    if (feedbackTypes.length > 0) {
        whereClauses.push('f.feedback_type IN (?)');
        params.push(feedbackTypes);
    }

    const categories = toArray(category);
    if (categories.length > 0) {
        whereClauses.push('f.recommendation_category IN (?)');
        params.push(categories);
    }

    const userIds = toArray(userId);
    if (userIds.length > 0) {
        whereClauses.push('f.user_id IN (?)');
        params.push(userIds);
    }

    return {
        whereClause: whereClauses.join(' AND '),
        params
    };
};


const getFeedbackSummary = async (req, res) => {
    try {
        const { whereClause, params } = buildFilterClause(req.query);

        // --- Query 1: Feedback Trends over time ---
        const trendsQuery = `
            SELECT 
                DATE(f.created_at) AS date,
                f.feedback_type,
                COUNT(f.feedback_id) AS count
            FROM feedback f
            WHERE ${whereClause}
            GROUP BY date, f.feedback_type
            ORDER BY date ASC;
        `;

        // --- Query 2: Overall Acceptance Rate ---
        const acceptanceQuery = `
            SELECT 
                f.feedback_type,
                COUNT(f.feedback_id) AS count
            FROM feedback f
            WHERE ${whereClause}
            GROUP BY f.feedback_type;
        `;

        const [trendsResults, acceptanceResults] = await Promise.all([
            db.query(trendsQuery, params),
            db.query(acceptanceQuery, params)
        ]);

        // Process trends data for charting
        const feedbackTrends = trendsResults[0].reduce((acc, row) => {
            const date = new Date(row.date).toISOString().split('T')[0]; // Format to YYYY-MM-DD
            if (!acc[date]) {
                acc[date] = {};
            }
            acc[date][row.feedback_type] = row.count;
            return acc;
        }, {});

        // Process acceptance rate data
        const acceptanceRate = acceptanceResults[0].reduce((acc, row) => {
            acc[row.feedback_type] = row.count;
            return acc;
        }, {});

        // Note: topSearchQueries is not implemented as there's no clear source table 
        // for search queries in the provided schema. Returning an empty array to match the API contract.
        const topSearchQueries = [];

        res.status(200).json({
            feedbackTrends,
            acceptanceRate,
            topSearchQueries
        });

    } catch (error) {
        console.error('Error fetching feedback summary:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    getFeedbackSummary
};