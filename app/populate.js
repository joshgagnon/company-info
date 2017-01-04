var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var getDB = require('./db').getDB;
const moment = require('moment');

module.exports = function populate(config) {
    const db = getDB(config);

    console.log('Creating DB');
    fs.readFileAsync('./app/dbCreate.sql', 'utf8')
        .then((sql) => {
            return db.none(sql);
        })
        .then(() => {
            console.log('Creating DB functions');

            return fs.readFileAsync('./app/dbFunctions.sql', 'utf8')
                .then((sql) => {
                    return db.none(sql);
                })
                .catch((error) => {
                    console.log(error);
                });
        })
        .then(() => {
            console.log('Read data from previousNames.json');

            let companiesHistory = [];

            return fs.readFileAsync('./previousNames.json', 'utf8')
                .then((jsonString) => {
                    const companies = JSON.parse(jsonString);

                    companies.map((company) => {
                        let companyNames = [];
                        
                        company.coalesce.map((coalesceData) => {
                            companyNames.push({
                                nzbn: company.nzbn,
                                companyName: coalesceData.name,
                                startDate: coalesceData.startDate,
                                endDate: coalesceData.endDate
                            });
                        });

                        let currentNameStartDate = company.incorporationDate;

                        companyNames.push({
                            nzbn: company.nzbn,
                            companyName: company.companyName,
                            startDate: currentNameStartDate,
                            endDate: null
                        })

                        companiesHistory = companiesHistory.concat(companyNames);
                    });
                }).then(() => {
                    console.log('Inserting data into database');

                    function source(index, data, delay) {
                        const companyData = companiesHistory[index];
                        
                        // If companyData is undefined, return it - the DB sequence function will take this as a signal to stop
                        if (companyData === undefined) {
                            return companyData;
                        }

                        // Return a promise to insert the company at this index
                        return db.none("INSERT INTO company_names(nzbn, companyName, startDate, endDate) VALUES(${nzbn}, ${companyName}, ${startDate}, ${endDate})", {
                                nzbn: companyData.nzbn,
                                companyName: companyData.companyName,
                                startDate: moment(companyData.startDate, 'DD MMMM YYYY').format('YYYY-MM-DD'),
                                endDate: companyData.endDate ? moment(companyData.endDate, 'DD MMMM YYYY').format('YYYY-MM-DD') : null
                            });
                    }

                    return db.tx(function (t) {
                        return this.sequence(source);
                    })
                    .then(function (data) {
                        console.log('Data entry done');
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
                })
                .catch((error) => {
                    console.log(error);
                })
        })
        .catch((error) => {
            console.log(error);
        })
        .then(() => {
            process.exit();
        });
};
