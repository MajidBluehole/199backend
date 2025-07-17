const db = require('../../config/database'); // Assuming a mysql2/promise connection pool


const itemTypeMap = {
  'interaction-types': {
    table: 'interaction_types',
    idColumn: 'id',
    orderColumn: 'display_order'
  },
  'custom-fields': {
    table: 'custom_fields',
    idColumn: 'id',
    orderColumn: 'display_order'
  },
  'filter-options': {
    table: 'filter_options',
    idColumn: 'id',
    orderColumn: 'display_order'
  }
  // Add other reorderable item types here
};


const reorderItems = async (req, res) => {
  const { itemType } = req.params;
  const { orderedIds } = req.body;

  const itemConfig = itemTypeMap[itemType];

  if (!itemConfig) {
    return res.status(400).json({ message: 'Bad Request - Invalid item type specified.' });
  }

  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ message: 'Bad Request - `orderedIds` must be an array.' });
  }

  const connection = await db.getConnection();

  try {
    // 1. Fetch all existing IDs from the database for validation
    const [rows] = await connection.execute(`SELECT ${itemConfig.idColumn} FROM ${itemConfig.table}`);
    const existingIds = new Set(rows.map(row => row[itemConfig.idColumn]));

    // 2. Validate the provided IDs against the existing ones
    if (orderedIds.length !== existingIds.size) {
        return res.status(400).json({ message: 'Bad Request - Mismatched IDs. The number of provided IDs does not match the number of existing items.' });
    }

    const providedIds = new Set(orderedIds);
    for (const id of existingIds) {
        if (!providedIds.has(id)) {
            return res.status(400).json({ message: `Bad Request - Mismatched IDs. Missing or invalid ID found.` });
        }
    }

    // 3. Perform the update within a transaction
    await connection.beginTransaction();

    const updatePromises = orderedIds.map((id, index) => {
      const query = `UPDATE ${itemConfig.table} SET ${itemConfig.orderColumn} = ? WHERE ${itemConfig.idColumn} = ?`;
      // The order is the index in the array (0-based)
      return connection.execute(query, [index, id]);
    });

    await Promise.all(updatePromises);

    await connection.commit();

    res.status(200).json({ message: 'Order updated successfully.' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error reordering items:', error);
    res.status(500).json({ message: 'An internal server error occurred while updating the order.' });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  reorderItems,
};