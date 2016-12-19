
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var getDB = require('./db').getDB;

module.exports = function populate(config) {
    const db = getDB(config)
    // now read from previousNames.json and populate the db,

    // company identifier will be nzbn

    // make a table with nzbn, companyName, startDate, endDate

    // now populate functions
    return fs.readFileAsync('./app/dbFunctions.sql', 'utf8')
         .then(function(sql){
            return db.none(sql);
        })
         .then(function(){
            return db;
         })
};