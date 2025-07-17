const { v4: uuidv4 } = require('uuid');
const db = require('../config/database'); // Assuming a mysql2/promise connection pool is exported
// const { checkDesktopAppStatus } = require('../../services/desktopAppService'); // Placeholder for internal service call
// const analysisQueue = require('../../queues/analysisQueue'); // Placeholder for a BullMQ or similar queue


const createInteraction = async (req, res, next) => {
    const { participant_ids, objective } = req.body;
    // Assuming auth middleware populates req.user
    const { user_id, workspace_id } = req.user;

    // 1. Validate input
    if (!objective || !participant_ids || !Array.isArray(participant_ids) || participant_ids.length === 0) {
        return res.status(400).json({ message: "Bad Request - 'participant_ids' must be a non-empty array and 'objective' must not be empty." });
    }

    let connection;
    try {
        // 2. Check desktop app status
        // const isAppActive = await checkDesktopAppStatus(workspace_id);
        // if (!isAppActive) {
        //     return res.status(424).json({ message: "Failed Dependency - Relaivaint desktop application is not running." });
        // }

        connection = await db.getConnection();
        await connection.beginTransaction();

        const interactionId = uuidv4();
        const interactionStatus = 'pending_analysis';
        const createdAt = new Date();

        // 3. Create a new record in the 'interactions' table
        const interactionQuery = `
            INSERT INTO interactions (interaction_id, user_id, workspace_id, objective, status, created_at, started_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await connection.execute(interactionQuery, [interactionId, user_id, workspace_id, objective, interactionStatus, createdAt, createdAt]);

        // 4. Create records in the 'interaction_participants' join table
        if (participant_ids.length > 0) {
            const participantValues = participant_ids.map(contact_id => [interactionId, contact_id]);
            const participantsQuery = `
                INSERT INTO interaction_participants (interaction_id, contact_id) VALUES ?
            `;
            await connection.query(participantsQuery, [participantValues]);
        }

        await connection.commit();

        // 5. Trigger a background job for analysis
        // await analysisQueue.add('start-interaction-analysis', { interactionId });

        // 6. Return the newly created interaction details
        res.status(201).json({
            interaction_id: interactionId,
            status: interactionStatus,
            objective: objective,
            created_at: createdAt.toISOString(),
            redirect_url: `/interactions/${interactionId}` // Example redirect URL
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error creating interaction:', error);
        // Pass to a generic error handler middleware
        next(error); 
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    createInteraction,
};