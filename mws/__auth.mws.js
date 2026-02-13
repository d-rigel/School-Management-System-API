const jwt = require('jsonwebtoken');

module.exports = ({ config, cache, managers }) => {
    return async ({ req, res, next }) => {
        try {
            // Support both Bearer token and header token
            let token = null;
            
            //  Bearer token 
            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
                token = req.headers.authorization.substring(7);
            }
            // Custom token header 
            else if (req.headers.token) {
                token = req.headers.token;
            }
            
            if (!token) {
                return managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: 401,
                    errors: 'No token provided. Use Authorization: Bearer <token> or token header'
                });
            }

            // Verify token
            let decoded;
            try {
                decoded = jwt.verify(token, config.dotEnv.JWT_SECRET);
            } catch (err) {
                if (err.name === 'TokenExpiredError') {
                    return managers.responseDispatcher.dispatch(res, {
                        ok: false,
                        code: 401,
                        errors: 'Token expired'
                    });
                }
                return managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: 401,
                    errors: 'Invalid token'
                });
            }

            // Check if token is blacklisted
            const isBlacklisted = await cache.get({
                key: `blacklist:${token}`
            });

            if (isBlacklisted) {
                return managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: 401,
                    errors: 'Token has been revoked'
                });
            }

            // Pass decoded data to next middleware (template pattern)
            next(decoded);
            
        } catch (error) {
            console.error('Auth middleware error:', error);
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 500,
                errors: 'Authentication error'
            });
        }
    };
};