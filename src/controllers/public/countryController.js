const { Op } = require("sequelize");
const { Country } = require('../../models');

// GET /public/countries
exports.getCountriesList = async (req, res) => {
  try {
    const countries = await Country.findAll({
      attributes: ['id', 'country_name'],
      order: [['country_name', 'ASC']]
    });
    res.status(200).json({ success: true, countries });
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch countries' });
  }
};