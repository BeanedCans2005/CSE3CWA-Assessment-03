const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const router = express.Router();

const isProd = process.env.NODE_ENV === 'production';

// Step 1: send the user to GitHub to authorise.

router.get('/github', (req, res) => {

    // 'state' is a CSRF guard - GitHub echoes it back and we compare.
    
    const state = crypto.randomBytes(16).toString('hex');
    res.cookie('oauth_state', state, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000,
    });

    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
        scope: 'read:user',
        state,
    });

    res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

// Step 2: GitHub redirects back here with a temporary code.

router.get('/github/callback', async (req, res) => {
    const { code, state} = req.query;

    if (!state || state !== req.cookies?.oauth_state) {
        return res.status(400).send('Invalid OAuth state');
    }
    res.clearCookie('oauth_state');

    try {

        // Exchange the code for a GitHub access token.

        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET, code,
                redirect_uri: process.env.GITHUB_CALLBACK_URL
            }),
        });

        const tokenData = await tokenRes.json();
        console.log('GitHub token exchange response:', tokenData);
        if (!tokenData.access_token) {
            return res.status(401).send('OAuth token exchange failed');
        }

    

        // Use the GitHub token once, to identify the user.
        const userRes = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: 'Bearer ${tokenData.access_token}',
                'User-Agent': 'ai-capsule',
            },
        });
        const ghUser = await userRes.json();
        console.log('GitHub /user response:', ghUser);

        // Issue OUR OWN application JWT. This is the token the assignment
        // assesses - NOT GitHub's access token, which we now discard.

        const appToken = jwt.sign(
            { sub: String(ghUser.id), username: ghUser.login },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.cookie('token', appToken, {
            httpOnly: true,         // JavaScript cannot read it
            secure: isProd,         // HTTPS-only in production
            sameSite: 'lax',
            maxAge: 2 * 60 * 60 * 1000, 
        });

        res.redirect('./dashboard');
    } catch (err) {
        console.error('OAuth callback error:', err);
        res.status(500).send('Authentication failed');
    }
});

// Lets the frontend ask "am I logged in, as as whom?"

router.get('/me', (req, res) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({error: 'Unauthorized' });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ id: payload.sub, username: payload.username });
    } catch {
        res.status(401).json({ error: 'Unauthorised' });
    }
});

router.post('/logout', (req, res) => {
    res.clearCooker('token');
    res.json({ success: true });
});

module.exports = router;