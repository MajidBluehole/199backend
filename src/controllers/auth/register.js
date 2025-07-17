const { User, Country } = require('../../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // For potential immediate login after verification (optional)
const crypto = require('crypto');
const sendEmail = require('../../utils/sendEmail'); // Or your preferred email sending library
const { validationResult } = require("express-validator"); // ✅ Import this!
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Use your secret key from Stripe dashboard
const twilio = require("twilio");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendSMS(to, message) {
  try {
    if (!twilioPhoneNumber) {
      console.warn("TWILIO_PHONE_NUMBER is not set. SMS will not be sent via Twilio.");
      console.log(`Simulating SMS to ${to}: ${message}`);
      return true;
    }
    const twilioMessage = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to,
    });
    console.log(`SMS sent successfully to ${to}. SID: ${twilioMessage.sid}`);
    return true;
  } catch (error) {
    console.error(`Error sending SMS to ${to}:`, error);
    return false;
  }
}

exports.registerUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, firstName, lastName, country_code, phoneNumber, countryId } = req.body;

        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            if (!existingUser.isVerified || !existingUser.isActive) {
                return res.status(408).json({
                    message: 'User already registered but not verified. Please request a new verification code.',
                });
            }
            return res.status(409).json({ message: 'Email already exists.' });
        }

        // Lookup country by id (country is actually country_id)
        const countryRecord = await Country.findOne({ where: { id: countryId } });
        if (!countryRecord) {
            return res.status(400).json({ message: 'Invalid country ID.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(20).toString('hex');
        const verificationExpires = Date.now() + 24 * 60 * 60 * 1000;

        let otp = null;
        let otpExpires = null;
        let isVerified = false;
        let isActive = false;

        if (phoneNumber) {
            otp = generateOTP();
            otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        }

        const newUser = await User.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            country_code,
            phoneNumber,
            countryId: countryId,
            verificationToken: phoneNumber ? null : verificationToken,
            verificationExpires: phoneNumber ? null : verificationExpires,
            isVerified,
            isActive,
            otp,
            otpExpires
        });
        await newUser.save();

        if (phoneNumber && otp) {
            const smsMessage = `Your OTP for registration is: ${otp}`;
            // await sendSMS(`${country_code}${phoneNumber}`, smsMessage);
            return res.status(201).json({
                status: 'success',
                message: 'Registration successful. OTP sent to your phone. Please verify your phone number.',
                userId: newUser.id
            });
        } else {
            await sendVerificationEmail(email, verificationToken);
            return res.status(201).json({
                status: 'success',
                message: 'Registration successful. Please check your email to verify your account.',
                userId: newUser.id
            });
        }
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({
            status: 'error',
            message: 'Registration failed. Please try again later.',
        });
    }
};


async function sendVerificationEmail(email, token) {
    console.log(email);
    const verificationLink = `${process.env.FRONTEND_URL}/verify-register-email?token=${token}`;

    const subject = "Verify Your Email Address";
    const text = `Thank you for registering! \nPlease click the following link to verify your email address:\n\n ${verificationLink}\n\nThis link will expire in 24 hours.`;
    const html = `
        <p>Thank you for registering! Please click the following link to verify your email address:</p>
        <p><a href="${verificationLink}" target="_blank">${verificationLink}</a></p>
        <p>This link will expire in 24 hours.</p>
    `;

    try {
        const emailData = {
            to: email,
            subject,
            text,
            html,
        };
        await sendEmail(emailData);

        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error("Error sending verification email:", error);
    }
}

exports.resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (!existingUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // If the user is not verified or inactive
        if (!existingUser.isVerified || !existingUser.isActive) {
            // Generate a unique verification token
            const verificationToken = crypto.randomBytes(20).toString('hex');
            const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

            existingUser.verificationToken = verificationToken;
            existingUser.verificationExpires = verificationExpires;

            await existingUser.save();

            // Send verification email
            await sendVerificationEmail(existingUser.email, verificationToken);

            return res.status(200).json({ success: true, message: 'Verification email resent. Please check your inbox.' });
        }

        // If the user is already verified or active
        return res.status(409).json({ success: false, message: 'Account already verified or active.' });

    } catch (error) {
        console.error('Error during resend verification:', error);
        res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
    }
};

// POST /auth/verify-otp
exports.verifyRegisterOtp = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found.' });
        }
        if (user.isVerified) {
            return res.status(400).json({ status: 'error', message: 'User already verified.' });
        }
        if (user.otp !== otp) {
            return res.status(400).json({ status: 'error', message: 'Invalid OTP.' });
        }
        if (user.otpExpires < new Date()) {
            return res.status(400).json({ status: 'error', message: 'OTP has expired. Please request a new one.' });
        }
        user.isVerified = true;
        user.isActive = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();
        return res.status(200).json({ status: 'success', message: 'Phone number verified successfully!' });
    } catch (error) {
        console.error('Error during OTP verification:', error);
        res.status(500).json({ status: 'error', message: 'OTP verification failed. Please try again later.' });
    }
};

