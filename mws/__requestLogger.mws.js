module.exports = ({ utils }) => {
    return async ({ req, res, next }) => {
        const startTime = Date.now();
        
        // Log request
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
            ip: req.ip,
            userAgent: req.get('user-agent')
        });

        // Capture response
        const originalSend = res.send;
        res.send = function(data) {
            const duration = Date.now() - startTime;
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
            originalSend.call(this, data);
        };

        next();
    };
};