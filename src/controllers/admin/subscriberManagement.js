const Subscriber = require('../../models/subscriber');

// 1. List 50 subscribers (paginated)
exports.getSubscribers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const [total, subscribers] = await Promise.all([
      Subscriber.countDocuments(),
      Subscriber.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    res.status(200).json({
      total,
      page,
      pageSize: limit,
      subscribers
    });
  } catch (err) {
    console.error('Error fetching subscribers:', err);
    res.status(500).json({ message: 'Failed to fetch subscribers' });
  }
};

// 2. Delete a single subscriber by ID
exports.deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    await Subscriber.findByIdAndDelete(id);
    res.status(200).json({ message: 'Subscriber deleted successfully' });
  } catch (err) {
    console.error('Error deleting subscriber:', err);
    res.status(500).json({ message: 'Failed to delete subscriber' });
  }
};

// 3. Bulk delete subscribers by IDs
exports.deleteMultipleSubscribers = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Please provide subscriber IDs to delete.' });
    }

    await Subscriber.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ message: `${ids.length} subscriber(s) deleted.` });
  } catch (err) {
    console.error('Error deleting subscribers:', err);
    res.status(500).json({ message: 'Failed to delete subscribers' });
  }
};
