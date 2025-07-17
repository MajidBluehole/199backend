const db = require('../config/database'); // Assuming a mysql2/promise connection pool


const getDesktopAppStatus = async (req, res) => {
    // The user ID should be available from the authentication middleware (e.g., req.user.id)
    const { userId } = req.user;

    // The prompt implies a user-specific check. The `user_integrations` table is the most
    // logical place for this, assuming it tracks individual user connections with a type
    // and a heartbeat timestamp. We'll assume a schema like:
    // user_integrations(integration_id, user_id, integration_type, status, last_heartbeat_at)
    const query = `
        SELECT last_heartbeat_at 
        FROM user_integrations 
        WHERE user_id = ? AND integration_type = 'DESKTOP_APP'
        LIMIT 1;
    `;

    try {
        const [integrations] = await db.promise().query(query, [userId]);

        if (integrations.length === 0) {
            // No desktop app integration has been set up for this user.
            return res.status(200).json({ status: 'UNKNOWN' });
        }

        const lastHeartbeat = integrations[0].last_heartbeat_at;

        if (!lastHeartbeat) {
            // The integration exists but has never sent a heartbeat.
            return res.status(200).json({ status: 'INACTIVE' });
        }

        // A heartbeat is considered recent if it occurred in the last 5 minutes.
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const lastHeartbeatDate = new Date(lastHeartbeat);

        if (lastHeartbeatDate >= fiveMinutesAgo) {
            return res.status(200).json({ status: 'ACTIVE' });
        } else {
            return res.status(200).json({ status: 'INACTIVE' });
        }

    } catch (error) {
        console.error('Failed to get desktop app status:', error);
        // A generic error for the client, specific error is logged for debugging.
        return res.status(500).json({ message: 'An error occurred while checking the application status.' });
    }
};

module.exports = {
    getDesktopAppStatus,
};