const { AuthToken, User } = require('../../models');
const sendEmail = require('../../utils/sendEmail'); // your reusable sendEmail function
const bcrypt = require("bcrypt");

// GET /user/profile
exports.getProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, countryId, role, lastLogin } = req.user;
    res.status(200).json({
      success: true,
      firstName,
      lastName,
      email,
      phoneNumber,
      countryId,
      role,
      lastLogin
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

// PUT /user/profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = (({ firstName, lastName, phoneNumber, countryId }) => ({
      firstName,
      lastName,
      phoneNumber,
      countryId
    }))(req.body);

    Object.assign(req.user, updates);
    await req.user.save();

    res.status(200).json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

// PUT /user/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    await sendPasswordChangedEmail(user.email, user.firstName);

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to update password' });
  }
};

const sendPasswordChangedEmail = async (to, firstName) => {
  const subject = 'Your Password Was Changed';
  const text = `
      Hi ${firstName || 'User'},\n\n
      This is a confirmation that your password has been successfully updated.\n\n
      If you did not make this change, please reset your password immediately or contact support.\n\n
      Stay safe,\nYour Security Team
    `;
  const html = `
      <p>Hi ${firstName || 'User'},</p>
      <p>This is a confirmation that your password has been successfully updated.</p>
      <p>If you did not make this change, please reset your password immediately or contact support.</p>
      <p>Stay safe,<br/>Your Security Team</p>
    `;

  const emailData = {
    to,  // ✅ Corrected from 'email' to 'to'
    subject,
    text,
    html,
  };

  await sendEmail(emailData);
};

// DELETE /user/delete-account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const token = req.headers.authorization?.split(" ")[1];

    if (!userId || !token) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // Fetch user from DB using findByPk instead of findById
    const user = await User.findByPk(userId);  // Corrected: findByPk instead of findById
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Mark user as deleted
    user.isDeleted = true;
    user.isActive = false;
    await user.save();

    // Send account deletion email
    await sendAccountDeletedEmail(user.email, user.firstName);

    // Remove current token from AuthToken store (logout)
    await AuthToken.destroy({ where: { token } });  // Corrected to use destroy for token deletion

    // Optionally: delete all tokens if you want to revoke all sessions
    // await AuthToken.destroy({ where: { userId } });

    res.status(200).json({ success: true, message: 'Account deleted and user logged out successfully' });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ success: false, message: "Failed to delete account" });
  }
};


const sendAccountDeletedEmail = async (to, firstName) => {
  const subject = 'Account Deletion Confirmation';
  const text = `
      Hi ${firstName || ''},\n\n
      This is to confirm that your account has been successfully deleted.\n\n
      If you did not request this, please contact our support team immediately.\n\n
      Thank you for using our service.
    `;

  const html = `
      <p>Hi ${firstName || ''},</p>
      <p>This is to confirm that your account has been successfully deleted.</p>
      <p>If you did not request this, please contact our support team immediately.</p>
      <p>Thank you for using our service.</p>
    `;
  const emailData = {
    to,
    subject: subject,
    text: text,
    html: html
  };
  await sendEmail(emailData);
  return;
};