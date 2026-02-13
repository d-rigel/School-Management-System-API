module.exports = ({ cache, config, managers }) => {
    return async ({ req, res, next }) => {
        try {
            // Get identifier from device middleware or direct IP
            const device = req.__ && req.__.device ? req.__.device : { ip: req.ip };
            const identifier = device.ip;
            const key = `rate_limit:${identifier}`;

            // Get current request count
            const current = await cache.get({ key });
            const count = current ? parseInt(current) : 0;

            // Check if limit exceeded
            const maxRequests = config.dotEnv.RATE_LIMIT_MAX_REQUESTS || 100;
            if (count >= maxRequests) {
                return managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: 429,
                    errors: `Too many requests. Maximum ${maxRequests} requests allowed`
                });
            }

            // Increment counter
            const newCount = count + 1;
            const ttl = Math.floor((config.dotEnv.RATE_LIMIT_WINDOW || 900000) / 1000);
            
            if (count === 0) {
                await cache.set({ 
                    key, 
                    value: newCount.toString(), 
                    ttl 
                });
            } else {
                await cache.set({ 
                    key, 
                    value: newCount.toString() 
                });
            }

            // Add rate limit headers
            res.setHeader('X-RateLimit-Limit', maxRequests);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - newCount));

            next();
        } catch (error) {
            console.error('Rate limiter error:', error);
            next();
        }
    };
};