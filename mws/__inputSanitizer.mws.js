module.exports = ({ utils }) => {
    return async ({ req, res, next }) => {
        try {
            // Sanitize body
            if (req.body && typeof req.body === 'object') {
                req.body = sanitizeObject(req.body);
            }

            // Sanitize query params
            if (req.query && typeof req.query === 'object') {
                req.query = sanitizeObject(req.query);
            }

            next();
        } catch (error) {
            console.error('Input sanitizer error:', error);
            next();
        }
    };

    function sanitizeObject(obj) {
        const sanitized = {};
        
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                let value = obj[key];
                
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    sanitized[key] = sanitizeObject(value);
                }
                else if (Array.isArray(value)) {
                    sanitized[key] = value.map(item => 
                        typeof item === 'string' ? sanitizeString(item) : item
                    );
                }
                else if (typeof value === 'string') {
                    sanitized[key] = sanitizeString(value);
                }
                else {
                    sanitized[key] = value;
                }
            }
        }
        
        return sanitized;
    }

    function sanitizeString(str) {
        return str
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
    }
};