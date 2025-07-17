const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { User } = require('../../models');
const bcrypt = require('bcrypt');
const sendEmail = require('../../utils/sendEmail'); // Or your preferred email sending library
const { Op } = require('sequelize');

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email: email } });

    if (!user || !user.isActive || !user.isVerified) {
      return res.status(404).json({
        success: false,
        errorCode: 404,
        message: 'No active account found with that email.'
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Send email
    await sendResetPasswordEmail(email, resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully.'
    });

  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({
      success: false,
      errorCode: 500,
      message: 'Something went wrong. Please try again later.'
    });
  }
};


async function sendResetPasswordEmail(email, token) {
  const verificationLink = `${process.env.FRONTEND_URL}/password-reset?token=${token}`; // Adjust the link

  const subject = 'Password Reset Requested';
  const text = `You requested to reset your password.\n\nClick the link below to continue:\n\n${verificationLink}\n\nThis link will expire in 1 hour.`;
  const html = `<p>You requested to reset your password.</p>
    <p>Click the link below to continue:</p>
    <a href="${verificationLink}">${verificationLink}</a>
    <p>This link will expire in 1 hour.</p>`;

  try {
    const emailData = {
      to: email,
      subject: subject,
      text: text,
      html: html
    };
    await sendEmail(emailData);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    // Optionally handle email sending failure (e.g., log, retry, inform user)
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      where: { resetPasswordToken: token }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid token.' });
    }

    const now = new Date();
    const oneHourAfterExpiry = new Date(user.resetPasswordExpires.getTime() + 60 * 60 * 1000);

    if (now < user.resetPasswordExpires || now > oneHourAfterExpiry) {
      return res.status(400).json({ message: 'Token has expired.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    await passwordResetEmail(user.email, user.firstName);

    return res.status(200).json({ success: true, message: 'Password reset successful. You can now log in.' });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset password. Try again later.' });
  }
};

async function passwordResetEmail(email, firstName) {

  const subject = 'Your password has been updated successfully.';
  const text = `Hi ${firstName || ''},\n\n
    This is a confirmation that your password was successfully changed.\n\n
    If you did not initiate this request, please <a href="${process.env.FRONTEND_URL}/forgot-password">reset your password</a> immediately or contact support.\n\n
    Stay safe,<br/>The Team`;
  const html = `<p>Hi ${firstName || ''},</p>
    <p>This is a confirmation that your password was successfully changed.</p>
    <p>If you did not initiate this request, please <a href="${process.env.FRONTEND_URL}/forgot-password">reset your password</a> immediately or contact support.</p>
    <p>Stay safe,<br/>The Team</p>`;

  try {
    // 5. Send email
    const emailData = {
      to: email,
      subject: subject,
      text: text,
      html: html
    };
    await sendEmail(emailData);

    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    // Optionally handle email sending failure (e.g., log, retry, inform user)
  }
}
