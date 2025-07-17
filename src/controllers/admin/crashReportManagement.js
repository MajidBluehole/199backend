const CrashReport = require('../../models/crashReport');

// 1. List crash reports (paginated, sorted by createdAt desc)
exports.getCrashReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const [total, reports] = await Promise.all([
      CrashReport.countDocuments(),
      CrashReport.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    res.status(200).json({
      total,
      page,
      pageSize: limit,
      reports
    });
  } catch (err) {
    console.error('Error fetching crash reports:', err);
    res.status(500).json({ message: 'Failed to fetch crash reports' });
  }
};

// 2. Delete a single crash report
exports.deleteCrashReport = async (req, res) => {
  try {
    const { id } = req.params;
    await CrashReport.findByIdAndDelete(id);
    res.status(200).json({ message: 'Crash report deleted successfully' });
  } catch (err) {
    console.error('Error deleting crash report:', err);
    res.status(500).json({ message: 'Failed to delete crash report' });
  }
};

// 3. Delete multiple crash reports
exports.deleteMultipleCrashReports = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Please provide crash report IDs to delete.' });
    }

    await CrashReport.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ message: `${ids.length} crash report(s) deleted.` });
  } catch (err) {
    console.error('Error deleting multiple crash reports:', err);
    res.status(500).json({ message: 'Failed to delete crash reports' });
  }
};
