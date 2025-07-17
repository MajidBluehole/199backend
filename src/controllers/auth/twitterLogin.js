const { OAuth } = require('oauth');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const { User } = require('../../models');
const bcrypt = require('bcrypt'); // To hash the password

const consumerKey = process.env.TWITTER_API_KEY;
const consumerSecret = process.env.TWITTER_API_SECRET;
const callbackURL = 'http://localhost:5000/api/auth/twitter/callback';

const oa = new OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    consumerKey,
    consumerSecret,
    '1.0A',
    callbackURL,
    'HMAC-SHA1'
);

const twitterLoginHandler = (req, res) => {
    console.log('--- TWITTER LOGIN HANDLER ---');
    console.log('Session ID (login):', req.sessionID);
    console.log('Request Cookies (login):', req.headers.cookie);

    oa.getOAuthRequestToken((error, oauthToken, oauthTokenSecret) => {
        if (error) {
            console.error('Error in getOAuthRequestToken:', error);
            return res.status(500).json({ error: 'Failed to obtain request token' });
        }
        console.log('Session before save:', req.session);

        // Store the oauthTokenSecret in the session
        req.session.oauthTokenSecret = oauthTokenSecret;

        // Save the session and respond only after a successful save
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ error: 'Failed to save session' });
            }
            console.log('Session after save:', req.session);
            // Respond with the Twitter authentication URL
            res.json({
                url: `https://api.twitter.com/oauth/authenticate?oauth_token=${oauthToken}`,
            });
        });
    });
};

const twitterCallbackHandler = async (req, res) => {
    console.log('--- TWITTER CALLBACK HANDLER ---');
    console.log('Session ID (callback):', req.sessionID);
    console.log('Request Cookies (callback):', req.headers.cookie);

    const { oauth_token, oauth_verifier } = req.query;
    const oauthTokenSecret = req.session.oauthTokenSecret;

    // If the stored oauthTokenSecret is missing, the cookie/session was lost.
    if (!oauthTokenSecret) {
        console.error('OAuth token secret not found in session.');
        return res.status(400).json({ error: 'OAuth token secret not found' });
    }

    // Retrieve access token using the request token and oauth verifier
    oa.getOAuthAccessToken(oauth_token, oauthTokenSecret, oauth_verifier, async (error, oauthAccessToken, oauthAccessTokenSecret, results) => {
        if (error) {
            console.error('Error in getOAuthAccessToken:', error);
            return res.status(500).json({ error: 'Failed to obtain access token' });
        }

        try {
            // Fetch user details from Twitter API
            const userRes = await fetch('https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true', {
                headers: {
                    Authorization: `OAuth oauth_token="${oauthAccessToken}", oauth_token_secret="${oauthAccessTokenSecret}"`,
                },
            });

            if (!userRes.ok) {
                const errorData = await userRes.text();
                console.error('Error fetching user details:', errorData);
                throw new Error('Failed to fetch user details from Twitter');
            }

            const twitterUser = await userRes.json();

            // Check if the user exists in the database
            let user = await User.findOne({ email: twitterUser.email });
            if (!user) {
                // If user does not exist, create a new user in the database
                const hashedPassword = await bcrypt.hash(`${twitterUser.name}@123`, 10);
                user = await User.create({
                    email: twitterUser.email,
                    firstName: twitterUser.name,
                    lastName: '',
                    twitterId: twitterUser.id_str,
                    password: hashedPassword,
                    isVerified: true,
                    isActive: true,
                });
            }

            // Generate JWT token for the user
            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
                expiresIn: '24h',
            });

            // Redirect to your front-end with the JWT token
            res.redirect(`http://localhost:5173/auth/twitter/redirect?token=${token}`);
        } catch (err) {
            console.error('Twitter login failed:', err.message);
            res.status(500).json({ message: 'Twitter login failed', error: err.message });
        }
    });
};

module.exports = { twitterLoginHandler, twitterCallbackHandler };
