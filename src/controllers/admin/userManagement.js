const bcrypt = require('bcrypt');
const { User } = require('../../models');
const { Op, fn, col, where } = require('sequelize');

//GET /admin/users?page=2&limit=10&role=user&isActive=true&search=john
exports.getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      isActive,
      isVerified,
      search
    } = req.query;

    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const skipDocuments = (currentPage - 1) * itemsPerPage;

    // Base filters
    const baseFilter = {
      isDeleted: false
    };

    if (role && role !== '') queryFilters.role = role;
    if (isActive !== undefined && isActive !== '') queryFilters.isActive = isActive === 'true';
    if (isVerified !== undefined && isVerified !== '') queryFilters.isVerified = isVerified === 'true';


    // Build full where condition
    const whereCondition = {
      ...baseFilter
    };

    if (search) {
      whereCondition[Op.and] = [
        {
          [Op.or]: [
            where(fn('LOWER', col('email')), {
              [Op.like]: `%${search.toLowerCase()}%`
            }),
            where(fn('LOWER', col('firstName')), {
              [Op.like]: `%${search.toLowerCase()}%`
            }),
            where(fn('LOWER', col('lastName')), {
              [Op.like]: `%${search.toLowerCase()}%`
            })
          ]
        }
      ];
    }

    const [totalUsersCount, paginatedUsers] = await Promise.all([
      User.count({ where: whereCondition }),
      User.findAll({
        where: whereCondition,
        attributes: { exclude: ['password'] },
        offset: skipDocuments,
        limit: itemsPerPage,
        order: [['createdAt', 'DESC']]
      })
    ]);

    res.status(200).json({
      success: true,
      totalUsers: totalUsersCount,
      currentPage,
      itemsPerPage,
      users: paginatedUsers
    });
  } catch (error) {
    console.error('Admin GET /users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};


exports.getAdminProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, country, role, lastLogin } = req.user;
    res.status(200).json({
      success: true,
      firstName,
      lastName,
      email,
      phoneNumber,
      country,
      role,
      lastLogin
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const existing = await User.findOne( {where: { email: email }});

    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      isVerified: true,
      isActive: true
    });

    await newUser.save();
    res.status(201).json({ success: true, message: 'User created successfully', userId: newUser.id });
  } catch (err) {
    res.status(500).json({ success: false, message: 'User creation failed' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;

    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10);
    }

    // Update user in the database
    const result = await User.update(update, { where: { id: id } });

    if (result[0] === 0) {
      return res.status(404).json({ success: false, message: 'User not found or no changes made' });
    }

    // Fetch the updated user data
    const updatedUser = await User.findOne({ where: { id: id }, attributes: { exclude: ['password'] } });

    res.status(200).json({ success: true, message: 'User updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed', error: err.message });
  }
};

exports.DeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.update({ isDeleted: true }, { where: { id } });
    res.status(200).json({ success: true, message: 'User soft-deleted' });
  } catch (err) {
    console.error('MySQL DeleteUser error:', err);
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
};
