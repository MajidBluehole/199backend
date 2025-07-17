const { StaticContent } = require("../../models");
const { Op } = require("sequelize");

exports.getStaticContentByType = async (req, res) => {
  const { type } = req.params;

  try {
    const validTypes = ['privacy_policy', 'terms_of_service', 'faq', 'about_us'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid static content type' });
    }

    const content = await StaticContent.findOne({
      where: {
        type,
        isActive: true
      }
    });

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    return res.status(200).json({
      type: content.type,
      title: content.title,
      content: content.content,
      version: content.version,
      updatedAt: content.updatedAt
    });
  } catch (error) {
    console.error('Error fetching static content:', error);
    return res.status(500).json({ message: 'Failed to fetch content' });
  }
};
