const { Faq, Category } = require("../../models");

// Create a category
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, category, message: "Category created successfully" });
  } catch (error) {
    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category text must be unique.' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json(categories);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create an FAQ
exports.createFAQ = async (req, res) => {
  try {
    const faq = await Faq.create(req.body);
    res.status(201).json({ success: true, faq, message: "FAQ created successfully" });
  } catch (error) {
    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'The combination of categoryId and serial number must be unique.' });
    }
    res.status(400).json({ message: error.message });
  }
};

exports.getFAQs = async (req, res) => {
  try {
    const faqs = await Faq.findAll({
      include: [
        {
          model: Category,
          as: 'category', // This must match the alias used in Faq.belongsTo(...)
          attributes: ['category_text'], // Fetch the category text
        }
      ]
    });

    // Map the response to include only categoryId and remove the unnecessary category field
    const faqsWithCategoryId = faqs.map(faq => {
      const { category, ...faqData } = faq.dataValues; // Destructure to remove category field
      return {
        ...faqData,
        categoryId: category ? { category_text: category.category_text } : null, // Include category_text inside categoryId
      };
    });

    res.status(200).json(faqsWithCategoryId);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(400).json({ message: 'Failed to fetch FAQs' });
  }
};

// Update an FAQ
exports.updateFAQ = async (req, res) => {
  try {
    // Find FAQ by ID
    const faq = await Faq.findOne({ where: { id: req.params.id } });
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    // Update the FAQ
    await faq.update(req.body);

    // Return the updated FAQ
    res.status(200).json({ success: true, faq });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete an FAQ
exports.deleteFAQ = async (req, res) => {
  try {
    // Find FAQ by ID and delete it
    const deleted = await Faq.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    res.status(200).json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};