const db = require('../config/database'); // Assuming a mysql2 promise pool is exported


const getSystemConnections = async (req, res) => {
  // Authentication middleware is expected to have attached user info, including organization_id
  const { organization_id } = req.user;

  if (!organization_id) {
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
        organization_id = ?;
    `;

    const [connections] = await db.query(query, [organization_id]);

    res.status(200).json(connections);
  } catch (error) {
    console.error("Error fetching system connections:", error);
    res.status(500).json({ message: "Internal Server Error while fetching system connections." });
  }
};

module.exports = {
  getSystemConnections,
};