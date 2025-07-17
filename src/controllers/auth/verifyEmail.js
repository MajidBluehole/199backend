const { Sequelize } = require('sequelize');
const { User } = require('../../models');
const nodemailer = require('../../utils/sendEmail'); // Or your preferred email sending library


exports.verifyRegisterEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ success: false, message: 'Verification token is missing.' });
        }

        // Find the user by the verification token and check if the token is still valid
        const user = await User.findOne({
            where: {
                verificationToken: token,
                verificationExpires: { [Sequelize.Op.gt]: new Date() }, // Token expiration check
            }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired verification token.' });
        }

        // Update the user’s verification status
        user.isVerified = true;
        user.isActive = true;
        user.verificationToken = null; // Clear the verification token
        user.verificationExpires = null; // Clear the expiration time
        user.lastLogin = new Date(); // Optionally set the last login time to now
        await user.save();

        // Send a success response
        res.status(200).json({ success: true, message: 'Email verified successfully. You can now log in.' });

    } catch (error) {
        console.error('Error during email verification:', error);
        res.status(500).json({ success: false, message: 'Email verification failed. Please try again later.' });
    }
};

async function sendWelcomeEmail(email) {

    const subject = 'Welcome to our app';
    const text = `Dear user, Welcome to our app`;
    const html = `<p>Dear user, Welcome to our app</p>`;

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

exports.verifyPasswordResetEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ message: 'Verification token is missing.' });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token.' });
        }

        res.status(200).json({ message: 'Email verified successfully. You can now reset your password.' });
        // Optionally redirect the user to the login page on the frontend
        // res.redirect('/login');
    } catch (error) {
        console.error('Error during email verification:', error);
        res.status(500).json({ message: 'Email verification failed. Please try again later.' });
    }
};