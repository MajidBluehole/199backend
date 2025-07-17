const db = require('../config/database'); // Assuming a mysql2 promise pool is exported


const getSystemConnections = async (req, res) => {
  // Authentication middleware is expected to have attached user info, including workspace_id
  const { workspace_id } = req.user;

  if (!workspace_id) {
    // This is a fallback; the auth middleware should prevent unauthorized access.
    return res.status(401).json({ message: "Unauthorized - Authentication token is missing or invalid." });
  }

  try {
    const query = `
      SELECT
        system_type,
        status
      FROM
        connected_systems
      WHERE
        workspace_id = ?;
    `;

    const [connections] = await db.query(query, [workspace_id]);

    res.status(200).json(connections);
  } catch (error) {
    console.error("Error fetching system connections:", error);
    res.status(500).json({ message: "Internal Server Error while fetching system connections." });
  }
};

module.exports = {
  getSystemConnections,
};