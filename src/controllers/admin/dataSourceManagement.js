const { DataSource, InsightModel } = require('../../models');
const { Op } = require('sequelize');

// GET /api/v1/admin/config/data-sources
exports.getDataSources = async (req, res) => {
  try {
    const organizationId = req.user.organization_id;
    const { type, status } = req.query;
    const where = { organizationId };
    if (type) where.sourceType = type;
    if (status) where.connectionStatus = status;
    const dataSources = await DataSource.findAll({
      where,
      attributes: [
        'id',
        ['sourceType', 'source_type'],
        ['displayName', 'display_name'],
        ['connectionStatus', 'connection_status'],
        ['lastSyncAt', 'last_sync_at'],
        ['lastErrorMessage', 'last_error_message']
      ],
      order: [['createdAt', 'DESC']]
    });
    if (!dataSources || dataSources.length === 0) {
      return res.status(404).json({ message: 'No data sources found for this organization.' });
    }
    res.status(200).json(dataSources);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// POST /api/v1/admin/config/data-sources
exports.addDataSource = async (req, res) => {
  try {
    const organizationId = req.user.organization_id;
    const { source_type, display_name, credentials } = req.body;
    if (!source_type || !display_name || !credentials) {
      return res.status(400).json({ message: 'Bad Request - Invalid or missing parameters.' });
    }
    // Here you would attempt to connect/validate credentials with the external service
    // For now, assume success
    const newSource = await DataSource.create({
      organizationId,
      sourceType: source_type,
      displayName: display_name,
      credentials,
      connectionStatus: 'CONNECTED',
      lastErrorMessage: null
    });
    res.status(201).json({ id: newSource.id, message: 'Data source added and connected.' });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// DELETE /api/v1/admin/config/data-sources/:sourceId
exports.deleteDataSource = async (req, res) => {
  try {
    const organizationId = req.user.organization_id;
    const { sourceId } = req.params;
    const dataSource = await DataSource.findOne({ where: { id: sourceId, organizationId } });
    if (!dataSource) {
      return res.status(404).json({ message: 'Not Found - Data source with the specified ID does not exist.' });
    }
    // Check for dependencies in insight_models (if such a model exists)
    if (InsightModel) {
      const dependentModels = await InsightModel.findAll({
        where: { dataSourceId: sourceId, enabled: true },
        attributes: ['name']
      });
      if (dependentModels.length > 0) {
        return res.status(409).json({
          message: 'Conflict - Cannot delete source as it is a dependency for active insight models.',
          dependentModels: dependentModels.map(m => m.name)
        });
      }
    }
    await dataSource.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
}; 