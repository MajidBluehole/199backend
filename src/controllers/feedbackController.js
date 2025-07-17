const pool = require('../config/db'); // Assuming a mysql2/promise connection pool


exports.getFeedback = async (req, res, next) => {
    try {
        // 1. Extract and validate pagination & sorting parameters
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const offset = (page - 1) * limit;

        const sortOrder = req.query.sortOrder && req.query.sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
        const sortByRaw = req.query.sortBy || 'created_at';

        const allowedSortColumns = {
            'created_at': 'f.created_at',
            'user': 'userName',
            'feedback_type': 'f.feedback_type',
            'recommendation_category': 'f.recommendation_category',
            'status': 'f.status'
        };

        if (!Object.keys(allowedSortColumns).includes(sortByRaw)) {
            return res.status(400).json({ message: 'Bad Request - Invalid sort parameter.' });
        }
        const sortBy = allowedSortColumns[sortByRaw];

        // 2. Extract and prepare filter parameters
        const { search, startDate } = req.query;
        let { endDate } = req.query;

        const ensureArray = (param) => {
            if (!param) return [];
            return Array.isArray(param) ? param : [param];
        }

        const feedbackType = ensureArray(req.query.feedbackType);
        const category = ensureArray(req.query.category);
        const userId = ensureArray(req.query.userId);
        const status = ensureArray(req.query.status);

        // 3. Build the WHERE clause and parameters array
        const whereClauses = [];
        const params = [];

        if (search) {
            whereClauses.push("f.comment LIKE ?");
            params.push(`%${search}%`);
        }
        if (startDate) {
            whereClauses.push("f.created_at >= ?");
            params.push(startDate);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1);
            whereClauses.push("f.created_at < ?");
            params.push(end.toISOString().split('T')[0]);
        }
        if (feedbackType.length > 0) {
            whereClauses.push("f.feedback_type IN (?)");
            params.push(feedbackType);
        }
        if (category.length > 0) {
            whereClauses.push("f.recommendation_category IN (?)");
            params.push(category);
        }
        if (userId.length > 0) {
            whereClauses.push("f.user_id IN (?)");
            params.push(userId);
        }
        if (status.length > 0) {
            whereClauses.push("f.status IN (?)");
            params.push(status);
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // 4. Execute total count query for pagination metadata
        const countQuery = `SELECT COUNT(DISTINCT f.feedback_id) as totalItems FROM feedback f ${whereSql}`;
        const [countResult] = await pool.query(countQuery, params);
        const totalItems = countResult[0].totalItems;
        const totalPages = Math.ceil(totalItems / limit);

        // 5. Execute main data retrieval query
        const dataQuery = `
            SELECT
                f.feedback_id,
                f.recommendation_id,
                f.recommendation_category,
                f.feedback_type,
                f.comment,
                f.status,
                f.created_at,
                u.user_id,
                COALESCE(u.full_name, 'Deleted User') as userName,
                (SELECT GROUP_CONCAT(ft.tag_name SEPARATOR ', ') 
                 FROM feedback_to_tags ftt 
                 JOIN feedback_tags ft ON ftt.tag_id = ft.tag_id 
                 WHERE ftt.feedback_id = f.feedback_id) as tags
            FROM
                feedback f
            LEFT JOIN
                users u ON f.user_id = u.user_id
            ${whereSql}
            ORDER BY ${sortBy} ${sortOrder}
            LIMIT ?
            OFFSET ?
        `;

        const dataParams = [...params, limit, offset];
        const [data] = await pool.query(dataQuery, dataParams);

        // 6. Send the structured response
        res.status(200).json({
            pagination: {
                totalItems,
                totalPages,
                currentPage: page,
                pageSize: limit
            },
            data
        });

    } catch (error) {
        console.error('Error fetching feedback list:', error);
        // Pass to a generic error handler middleware
        next(error);
    }
};