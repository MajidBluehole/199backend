const { StaticContent } = require("../../models");

// 1. GET /admin/static-content (List all)
exports.getStaticContentList = async (req, res) => {
  try {
    const contentList = await StaticContent.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, total: contentList.length, content: contentList });
  } catch (error) {
    console.error('Error fetching static content:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch static content' });
  }
};


// 2. GET /static-content/:type
exports.getStaticContentByType = async (req, res) => {
  try {
    const { type } = req.params;

    // Validate type
    const allowedTypes = ['privacy_policy', 'terms_of_service', 'faq', 'about_us'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid content type' });
    }

    const content = await StaticContent.findOne({
      where: { type, isActive: true },
      order: [['createdAt', 'DESC']]
    });

    if (!content) {
      return res.status(404).json({ message: `No active ${type} content found.` });
    }

    res.status(200).json({ content });
  } catch (error) {
    console.error('Error fetching static content by type:', error);
    res.status(500).json({ message: 'Failed to fetch content' });
  }
};

// 3. PUT /admin/static-content/:id (Update one)
exports.updateStaticContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, version, isActive } = req.body;

    const [updated] = await StaticContent.update(
      { title, content, version, isActive, updatedAt: new Date() },
      { where: { id } }
    );

    if (!updated) return res.status(404).json({ message: 'Static content not found' });

    const updatedContent = await StaticContent.findOne({ where: { id } });

    res.status(200).json({ success: true, message: 'Content updated successfully', content: updatedContent });
  } catch (error) {
    console.error('Error updating static content:', error);
    res.status(500).json({ success: false, message: 'Failed to update content' });
  }
};
