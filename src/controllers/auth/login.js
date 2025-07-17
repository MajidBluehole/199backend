const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../../models');
const { AuthToken, LoginHistory } = require('../../models');

exports.loginUser = async (req, res) => {
  const { email, password, deviceId } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');

  try {
    const user = await User.findOne({ where: { email } });
    const historyData = {
      email,
      ipAddress,
      userAgent,
      deviceId,
      loginTime: new Date()
    };

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await LoginHistory.create({
        ...historyData,
        userId: user.user_id,
        loginStatus: 'failure',
        failureReason: 'Invalid password'
      });
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    await AuthToken.create({
      userId: user.user_id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    await LoginHistory.create({
      ...historyData,
      userId: user.user_id,
      loginStatus: 'success'
    });

    user.lastLogin = new Date();
    user.loginAttempts = 0;
    await user.save();

    res.status(200).json({
      success: true,
      token,
      message: 'Login successful',
      user: {
        id: user.user_id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phoneNumber: user.phoneNumber,
        country: user.country,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// POST /auth/logout
exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }

    // Remove token from AuthToken collection (if storing)
    await AuthToken.destroy({ where: { token } });

    res.status(200).json({ message: 'Logout successful. Token revoked.' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
};

