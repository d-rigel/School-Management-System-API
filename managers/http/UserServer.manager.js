const http = require('http');
const express = require('express');
const cors = require('cors');
const app = express();

module.exports = class UserServer {
    constructor({ config, managers }) {
        this.config = config;
        this.userApi = managers.userApi;
    }
    
    /** for injecting middlewares */
    use(args) {
        app.use(args);
    }

    /** server configs */
    run() {
        app.use(cors({ origin: '*' }));
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use('/static', express.static('public'));

        // Health check endpoint
        app.get('/health', (req, res) => {
            res.json({ 
                status: 'ok', 
                timestamp: new Date(),
                service: this.config.dotEnv.SERVICE_NAME || 'school-management-api',
                environment: this.config.dotEnv.NODE_ENV || 'development'
            });
        });

        /** an error handler */
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).send('Something broke!');
        });
        
        /** a single middleware to handle all API requests */
        app.all('/api/:moduleName/:fnName', this.userApi.mw);

        const port = this.config.dotEnv.USER_PORT || this.config.dotEnv.PORT || 3000;
        let server = http.createServer(app);
        server.listen(port, () => {
            console.log(`${(this.config.dotEnv.SERVICE_NAME || 'SCHOOL-MANAGEMENT-API').toUpperCase()} is running on port: ${port}`);
            console.log(`Environment: ${this.config.dotEnv.NODE_ENV || 'development'}`);
            console.log(`Health check: http://localhost:${port}/health`);
            console.log(`API endpoint: http://localhost:${port}/api/:module/:function`);
        });
    }
};

// const http              = require('http');
// const express           = require('express');
// const cors              = require('cors');
// const app               = express();

// module.exports = class UserServer {
//     constructor({config, managers}){
//         this.config        = config;
//         this.userApi       = managers.userApi;
//     }
    
//     /** for injecting middlewares */
//     use(args){
//         app.use(args);
//     }

//     /** server configs */
//     run(){
//         app.use(cors({origin: '*'}));
//         app.use(express.json());
//         app.use(express.urlencoded({ extended: true}));
//         app.use('/static', express.static('public'));

//         /** an error handler */
//         app.use((err, req, res, next) => {
//             console.error(err.stack)
//             res.status(500).send('Something broke!')
//         });
        
//         /** a single middleware to handle all */
//         app.all('/api/:moduleName/:fnName', this.userApi.mw);

//         let server = http.createServer(app);
//         server.listen(this.config.dotEnv.USER_PORT, () => {
//             console.log(`${(this.config.dotEnv.SERVICE_NAME).toUpperCase()} is running on port: ${this.config.dotEnv.USER_PORT}`);
//         });
//     }
// }