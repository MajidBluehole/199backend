const { ContactForm } = require("../../models");

// 1. GET /admin/contact-messages
exports.getContactMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const [total, messages] = await Promise.all([
      ContactForm.count(),
      ContactForm.findAll({
        order: [['createdAt', 'DESC']],
        offset,
        limit
      })
    ]);

    res.status(200).json({
      total,
      page,
      pageSize: limit,
      messages
    });
  } catch (err) {
    console.error('Error fetching contact messages:', err);
    res.status(500).json({ message: 'Failed to fetch contact messages' });
  }
};

// 2. DELETE /admin/contact-messages/:id
exports.deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ContactForm.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.status(200).json({ success: true, message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ success: false, message: 'Failed to delete message' });
  }
};

// 3. DELETE /admin/contact-messages (bulk)
exports.deleteMultipleMessages = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide message IDs to delete.' });
    }

    const deletedCount = await ContactForm.destroy({
      where: { id: ids }
    });

    res.status(200).json({
      success: true,
      message: `${deletedCount} message(s) deleted.`
    });
  } catch (err) {
    console.error('Error deleting multiple messages:', err);
    res.status(500).json({ success: false, message: 'Failed to delete messages' });
  }
};
