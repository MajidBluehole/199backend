const { User } = require('../../models');
const bcrypt = require('bcrypt');
const sendEmail = require('../../utils/sendEmail'); // utility for sending emails

exports.updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.user_id;
    const { firstName, lastName, phoneNumber, country } = req.body;

    const [updatedCount] = await User.update(
      { firstName, lastName, phoneNumber, country },
      { where: { id: adminId } }
    );

    if (updatedCount === 0) {
      return res.status(404).json({ success: false, message: 'Admin not found or no changes made' });
    }

    const updatedUser = await User.findByPk(adminId, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Admin profile update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};


// PUT /user/change-password
exports.changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await User.findByPk(req.user.user_id); // Sequelize style
    if (!admin) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedNewPassword;
    await admin.save();

    await sendPasswordChangedEmail(admin.email, admin.firstName);

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to update password' });
  }
};

const sendPasswordChangedEmail = async (to, firstName) => {
  const subject = 'Your Password Was Changed';
  const text = `
      Hi ${firstName || 'Admin'},\n\n
      This is a confirmation that your password has been successfully updated.\n\n
      If you did not make this change, please reset your password immediately or contact support.\n\n
      Stay safe,<br/>Your Security Team
    `;
  const html = `
      <p>Hi ${firstName || 'Admin'},</p>
      <p>This is a confirmation that your password has been successfully updated.</p>
      <p>If you did not make this change, please reset your password immediately or contact support.</p>
      <p>Stay safe,<br/>Your Security Team</p>
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
