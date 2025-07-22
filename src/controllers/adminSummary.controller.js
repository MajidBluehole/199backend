const { Tag, Content, FeedbackSubmission, Curation, Category } = require('../models');

// GET /api/v1/admin/summary-data
const getAdminSummaryData = async (req, res) => {
  try {
    // Fetch all data in parallel, using correct DB column names for ordering
    const [tags, content, feedbackSubmissions, curations, categories] = await Promise.all([
      Tag.findAll({ order: [['updated_at', 'DESC']] }),
      Content.findAll({ order: [['updated_at', 'DESC']] }),
      FeedbackSubmission.findAll({ order: [['created_at', 'DESC']] }),
      Curation.findAll({ order: [['updated_at', 'DESC']] }),
      Category.findAll({ order: [['updated_at', 'DESC']] }),
    ]);

    res.status(200).json({
      tags: tags.length ? tags : 'No tags found.',
      content: content.length ? content : 'No content found.',
      feedbackSubmissions: feedbackSubmissions.length ? feedbackSubmissions : 'No feedback submissions found.',
      curations: curations.length ? curations : 'No curations found.',
      categories: categories.length ? categories : 'No categories found.',
    });
  } catch (error) {
    console.error('Error fetching admin summary data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getAdminSummaryData }; 