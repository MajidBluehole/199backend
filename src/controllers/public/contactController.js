const { ContactForm } = require("../../models");

exports.submitContactMessage = async (req, res) => {
  try {
    const {
      fullName,
      email,
      subject,
      message,
      category
    } = req.body;

    const contact = await ContactForm.create({
      fullName,
      email,
      subject,
      message,
      category,
      user_id: req.user?.user_id || null, // Sequelize usually uses `id` instead of `_id`
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    await contact.save();
    res.status(201).json({ success: true, message: 'Message submitted successfully!' });
  } catch (error) {
    console.error('Error submitting contact message:', error);
    res.status(500).json({ success: false, message: 'Failed to submit message' });
  }
};
