const jwt = require('jsonwebtoken');

// Verifies the application JWT from the HttpOnly `token` cookie.
// The authenticated user is taken from the VERIFIED token only -
// never from the request body or query string.

function requireAuth(req, res, next) {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({error: 'Unauthorised' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {id: payload.sub, username: payload.username };
        next();
    } catch (err) {
        // Covers expired, malformed and bad-signature tokens -
        // this is what makes the 'fake-token-123' curl test return 401.
        return res.status(401).json({error: 'Unauthorised'});
    }
}

module.exports = requireAuth;