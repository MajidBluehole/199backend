const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const db = require('../config/database'); // Assuming a mysql2/promise connection pool
const pool = require('../config/database'); // Assuming a mysql2/promise connection pool
const { Content } = require('../models');

// --- Mock S3 Service (in a real app, this would be in its own file) ---
const s3UploadService = {
    uploadFile: async (filePath, originalName) => {
        // In a real implementation, this would upload to S3 and return the URL.
        console.log(`Uploading ${originalName} from ${filePath} to S3...`);
        // Simulate a successful upload
        const s3Key = `knowledge-content/${uuidv4()}-${path.basename(originalName)}`;
        const s3Url = `https://your-s3-bucket.s3.amazonaws.com/${s3Key}`;
        // Simulate moving the file to a 'permanent' mock location
        // In a real scenario, the temp file would be streamed to S3.
        await fs.rename(filePath, path.join('uploads', 'permanent', path.basename(filePath)));
        return { Location: s3Url, Key: s3Key };
    },
    deleteFile: async (fileKey) => {
        console.log(`Deleting ${fileKey} from S3...`);
        // In a real implementation, this would delete the object from the S3 bucket.
        return Promise.resolve();
    }
};
// --------------------------------------------------------------------------


const uploadContent = async (req, res) => {
    // Assumes authMiddleware has run and populated req.user
    if (!req.user || !req.user.user_id) {
        return res.status(401).json({ message: 'Unauthorized.' });
    }

    // 1. Validate user permissions (example role check)
    if (req.user.role !== 'admin' && req.user.role !== 'editor') {
        return res.status(403).json({ message: 'Forbidden - User does not have permission to upload.' });
    }

    // 2. Validate input
    if (!req.file) {
        return res.status(400).json({ message: 'Bad Request - Missing file.' });
    }
    const { title, description, tags } = req.body;
    if (!title) {
        // Clean up the uploaded file if validation fails
        await fs.unlink(req.file.path);
        return res.status(400).json({ message: 'Bad Request - Missing required field: title.' });
    }

    const { user_id } = req.user;
    const contentId = uuidv4();
    let s3Response = null;
    let connection;

    try {
        // 3. Stream file to secure storage (S3)
        s3Response = await s3UploadService.uploadFile(req.file.path, req.file.originalname);

        // 4. Start database transaction
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 5. Create record in 'knowledge_content'
        const contentQuery = `
            INSERT INTO knowledge_content 
            (content_id, uploader_id, title, description, content_type, file_name, file_path, file_size, file_mime_type, upload_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await connection.execute(contentQuery, [
            contentId,
            user_id,
            title,
            description || null,
            'file', // Or derive from mime type
            req.file.originalname,
            s3Response.Location,
            req.file.size,
            req.file.mimetype,
            'Completed'
        ]);

        // 6. Find or create tags and create associations
        if (tags && typeof tags === 'string' && tags.trim() !== '') {
            const tagNames = [...new Set(tags.split(',').map(tag => tag.trim()).filter(Boolean))];
            
            for (const tagName of tagNames) {
                let [existingTags] = await connection.execute('SELECT tag_id FROM tags WHERE tag_name = ?', [tagName]);
                let tagId;

                if (existingTags.length > 0) {
                    tagId = existingTags[0].tag_id;
                } else {
                    const [newTagResult] = await connection.execute('INSERT INTO tags (tag_name, name) VALUES (?, ?)', [tagName, tagName]);
                    tagId = newTagResult.insertId;
                }

                await connection.execute('INSERT INTO content_tags (content_id, tag_id) VALUES (?, ?)', [contentId, tagId]);
            }
        }

        // 7. Commit transaction
        await connection.commit();

        // 8. Send success response
        res.status(201).json({
            content_id: contentId,
            title: title,
            upload_status: 'Completed'
        });

    } catch (error) {
        console.error('Content upload failed:', error);

        // Rollback transaction if it was started
        if (connection) await connection.rollback();

        // If DB operation failed after S3 upload, clean up the S3 file
        if (s3Response && s3Response.Key) {
            await s3UploadService.deleteFile(s3Response.Key);
        }

        res.status(500).json({ message: 'An internal server error occurred during the upload process.' });

    } finally {
        // Release DB connection
        if (connection) connection.release();
        // Clean up the temporary file from multer's local storage
        // Note: The mock service renames it, in a real scenario with S3 streaming, you'd just unlink.
        try {
            await fs.unlink(req.file.path);
        } catch (cleanupError) {
            // Ignore error if file was already moved/deleted
            if (cleanupError.code !== 'ENOENT') {
                console.error('Error cleaning up temp file:', cleanupError);
            }
        }
    }
};

// Multer configuration for file uploads
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const uploadMiddleware = multer({
    dest: 'uploads/temp/', // Temporary storage for incoming files
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
    fileFilter: (req, file, cb) => {
        // Add any specific file type validation here if needed
        // e.g., if (!file.mimetype.startsWith('image/')) { ... }
        cb(null, true);
    }
}).single('file');

// Custom error handler for multer to catch file size errors
const handleUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ message: 'Payload Too Large - File exceeds maximum allowed size.' });
        }
        return res.status(400).json({ message: `File upload error: ${err.message}` });
    }
    if (err) {
        return res.status(500).json({ message: 'An unexpected error occurred.' });
    }
    next();
};





// exports.searchKnowledgeContent = async (req, res) => {

    const searchKnowledgeContent = async (req, res) => {
    const { 
        search, 
        contentType, 
        authorId, 
        tags, 
        startDate, 
        endDate, 
        sortBy = 'relevance', 
        sortOrder = 'desc' 
    } = req.query;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    // Validate sort parameters
    const validSortBy = ['relevance', 'popularity', 'createdAt'];
    const validSortOrder = ['asc', 'desc'];

    if (!validSortBy.includes(sortBy) || !validSortOrder.includes(sortOrder)) {
        return res.status(400).json({ message: 'Bad Request - Invalid sort parameter.' });
    }

    if (sortBy === 'relevance' && !search) {
        return res.status(400).json({ message: 'Bad Request - sortBy=relevance requires a search parameter.' });
    }

    try {
        let whereClauses = [];
        let params = [];

        // --- Build WHERE clause --- //
        if (search) {
            // Ensure you have a FULLTEXT index on (title, description) in knowledge_content table
            whereClauses.push('MATCH(kc.title, kc.description) AGAINST(? IN BOOLEAN MODE)');
            params.push(search + '*'); // Using boolean mode for prefix matching
        }
        if (contentType) {
            whereClauses.push('kc.content_type = ?');
            params.push(contentType);
        }
        if (authorId) {
            whereClauses.push('kc.uploader_id = ?');
            params.push(authorId);
        }
        if (startDate) {
            whereClauses.push('kc.created_at >= ?');
            params.push(startDate);
        }
        if (endDate) {
            whereClauses.push('kc.created_at <= ?');
            params.push(endDate);
        }
        if (tags) {
            const tagList = tags.split(',').map(t => t.trim()).filter(t => t);
            if (tagList.length > 0) {
                const placeholders = tagList.map(() => '?').join(',');
                whereClauses.push(`kc.content_id IN (
                    SELECT content_id FROM content_tags ct_inner
                    JOIN tags t_inner ON ct_inner.tag_id = t_inner.tag_id
                    WHERE t_inner.tag_name IN (${placeholders})
                    GROUP BY content_id
                    HAVING COUNT(DISTINCT t_inner.tag_name) = ?
                )`);
                params.push(...tagList, tagList.length);
            }
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // --- Count total results --- //
        const countQuery = `SELECT COUNT(DISTINCT kc.content_id) as total FROM knowledge_content kc ${whereSql}`;
        const [countResult] = await pool.query(countQuery, params);
        const totalResults = countResult[0].total;
        const totalPages = Math.ceil(totalResults / limit);

        if (totalResults === 0) {
            return res.status(200).json({
                page,
                limit,
                total_results: 0,
                total_pages: 0,
                results: []
            });
        }

        // --- Build data query --- //
        let orderByClause;
        switch (sortBy) {
            case 'popularity':
                orderByClause = `ORDER BY (kc.view_count + kc.download_count) ${sortOrder.toUpperCase()}`;
                break;
            case 'createdAt':
                orderByClause = `ORDER BY kc.created_at ${sortOrder.toUpperCase()}`;
                break;
            case 'relevance':
            default:
                orderByClause = `ORDER BY relevance ${sortOrder.toUpperCase()}`;
                break;
        }

        const relevanceScore = sortBy === 'relevance' ? 'MATCH(kc.title, kc.description) AGAINST(? IN BOOLEAN MODE) as relevance,' : '';
        const dataParams = sortBy === 'relevance' ? [search + '*', ...params] : [...params];

        const dataQuery = `
            SELECT
                kc.content_id,
                kc.title,
                kc.description,
                kc.content_type,
                kc.file_name,
                kc.file_size,
                kc.view_count,
                kc.download_count,
                kc.created_at,
                ${relevanceScore}
                u.user_id as uploader_user_id,
                u.firstName as uploader_name,
                GROUP_CONCAT(DISTINCT t.tag_name) as tags
            FROM
                knowledge_content kc
            LEFT JOIN
                users u ON kc.uploader_id = u.user_id
            LEFT JOIN
                content_tags ct ON kc.content_id = ct.content_id
            LEFT JOIN
                tags t ON ct.tag_id = t.tag_id
            ${whereSql}
            GROUP BY
                kc.content_id, u.user_id, u.firstName
            ${orderByClause}
            LIMIT ?
            OFFSET ?
        `;
        dataParams.push(limit, offset);

        const [rows] = await pool.query(dataQuery, dataParams);

        const results = rows.map(row => ({
            content_id: row.content_id,
            title: row.title,
            description: row.description,
            content_type: row.content_type,
            file_name: row.file_name,
            file_size: row.file_size,
            view_count: row.view_count,
            download_count: row.download_count,
            created_at: row.created_at,
            uploader: {
                user_id: row.uploader_user_id,
                name: row.uploader_name
            },
            tags: row.tags ? row.tags.split(',') : []
        }));

        res.status(200).json({
            page,
            limit,
            total_results: totalResults,
            total_pages: totalPages,
            results
        });

    } catch (error) {
        console.error('Error searching knowledge content:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// GET /api/v1/content/popular
const getPopularContent = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const offset = (page - 1) * limit;
        const sortBy = req.query.sortBy === 'popularity' ? 'view_count' : 'published_at';
        const order = sortBy === 'view_count' ? [['view_count', 'DESC'], ['published_at', 'DESC']] : [['published_at', 'DESC']];

        const { count, rows } = await Content.findAndCountAll({
            where: { status: 'PUBLISHED' },
            order,
            limit,
            offset
        });

        res.status(200).json({
            success: true,
            total: count,
            page,
            limit,
            content: rows
        });
    } catch (error) {
        console.error('Error fetching popular content:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch popular content' });
    }
};

module.exports = {
    uploadContent,
    uploadMiddleware,
    handleUploadErrors,
    searchKnowledgeContent,
    getPopularContent,
};