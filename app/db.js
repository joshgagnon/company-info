
const pgp = require('pg-promise')();
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));

let _db;

module.exports = {
    getDB: (config) => {
        if(!_db){
            _db = pgp(config);
        }
        return _db;
    }
}
