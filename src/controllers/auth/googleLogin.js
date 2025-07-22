const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const { AuthToken, User, Organization } = require('../../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Use your secret key from Stripe dashboard
const bcrypt = require('bcrypt');

exports.googleLoginHandler = async (req, res) => {
    const { access_token } = req.body;

    if (!access_token) {
        return res.status(400).json({ success: false, message: 'Access token is required' });
    }

    try {
        // Fetch user info from Google using access_token
        const googleUserInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const profile = await googleUserInfoRes.json();

        if (!profile || !profile.email) {
            return res.status(401).json({ success: false, message: 'Failed to fetch Google user info' });
        }

        const userEmail = profile.email;
        const userId = profile.sub;

        // Check or create user
        let user = await User.findOne({ where: { email: userEmail } });
        if (user) {
            if (!user.isActive || !user.isVerified) {
                return res.status(403).json({ message: 'User Not Found' });
            }
        }
        // const lowercasedEmail = userEmail.toLowerCase();
        // let stripe_customer_id = null;
        // const existingCustomers = await stripe.customers.list({ email: lowercasedEmail });
        // if (existingCustomers.data.length > 0) {
        //   stripe_customer_id = existingCustomers.data[0].id;
        // } else {
        //   const newCustomer = await stripe.customers.create({
        //     email: lowercasedEmail,
        //     name: `${profile.given_name} ${profile.family_name || ""}`,
        //   });
        //   stripe_customer_id = newCustomer.id;
        // }
        const dummyPassword = profile.given_name + '@123';
        const hashedPassword = await bcrypt.hash(dummyPassword, 10);

        if (!user) {
            // Create organization first
            const newOrg = await Organization.create({ name: profile.given_name || '' });
            user = new User({
                email: userEmail,
                firstName: profile.given_name || '',
                lastName: profile.family_name || '',
                googleId: userId,
                isVerified: true,
                isActive: true,
                password: hashedPassword,
                organization_id: newOrg.organization_id,
            });
            await user.save();
        }

        // Generate JWT token
        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
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

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                user_id: user.user_id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
            token,
            redirectUrl: user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard',
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
};
