const loader = require('./_common/fileLoader');

module.exports = class MiddlewareLoader { 

    constructor(injectable){
        this.mws = {};
        this.injectable = injectable;
    }

    load(){
        const mws = loader('./mws/**/*.mw.js');
        Object.keys(mws).map(ik=>{
            /** Safety Check: Log what is being loaded */
        if (typeof mws[ik] !== 'function') {
            throw new Error(`Middleware Error: The file "${ik}" did not export a function. Received: ${typeof mws[ik]}`);
        }
            /** call the mw builder */

            mws[ik]=mws[ik](this.injectable);
        })
        return mws;
    }
   
}

