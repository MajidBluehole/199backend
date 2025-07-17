const mysql = require('mysql2/promise');
const AWS = require('aws-sdk');

// In a real application, the database pool would be initialized in a central config file (e.g., config/database.js)
// and imported here. For this example, we assume 'dbPool' is an available configured mysql2 pool.
// const dbPool = require('../../config/database');

// Similarly, AWS SDK and S3 client would be configured centrally.
// This setup assumes environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME) are set.
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});
const s3 = new AWS.S3();
const S3_BUCKET = process.env.S3_BUCKET_NAME;
const URL_EXPIRATION_SECONDS = 300; // 5 minutes


const getDownloadUrl = async (req, res) => {
    const { contentId } = req.params;

    // This is a placeholder for a real database pool
    const dbPool = mysql.createPool({ host: 'localhost', user: 'root', database: 'test' });

    let connection;
    try {
        connection = await dbPool.getConnection();
        await connection.beginTransaction();

        // Step 1: Fetch the content item to get its file path
        const [rows] = await connection.execute(
            'SELECT file_path FROM knowledge_content WHERE content_id = ?',
            [contentId]
        );

        if (rows.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: 'Not Found.' });
        }

        const content = rows[0];
        const filePath = content.file_path;

        if (!filePath) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: 'File path not found for this content.' });
        }

        // Step 2: Increment the download count
        await connection.execute(
            'UPDATE knowledge_content SET download_count = download_count + 1 WHERE content_id = ?',
            [contentId]
        );

        await connection.commit();

        // Step 3: Generate a pre-signed URL from S3
        const s3Params = {
            Bucket: S3_BUCKET,
            Key: filePath,
            Expires: URL_EXPIRATION_SECONDS,
        };

        const downloadUrl = s3.getSignedUrl('getObject', s3Params);

        // Step 4: Return the URL to the client
        res.status(200).json({
            download_url: downloadUrl,
            expires_in: URL_EXPIRATION_SECONDS,
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error getting download URL:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    getDownloadUrl,
};