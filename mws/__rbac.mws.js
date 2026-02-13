module.exports = ({ managers }) => {
    return (allowedRoles = []) => {
        return async ({ req, res, next }) => {
            try {
                // This assumes __auth or __token was called before
                const userData = req.__ || {}; 
                
                if (!userData.role) {
                    return managers.responseDispatcher.dispatch(res, {
                        ok: false,
                        code: 401,
                        errors: 'Authentication required'
                    });
                }

                // Check if user's role is in allowed roles
                if (!allowedRoles.includes(userData.role)) {
                    return managers.responseDispatcher.dispatch(res, {
                        ok: false,
                        code: 403,
                        errors: 'Insufficient permissions. Required role(s): ' + allowedRoles.join(', ')
                    });
                }

                next(userData);
            } catch (error) {
                console.error('RBAC middleware error:', error);
                return managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: 500,
                    errors: 'Authorization error'
                });
            }
        };
    };
};