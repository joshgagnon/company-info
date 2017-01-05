var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
const pgp = require('pg-promise')();
var getDB = require('./db').getDB;
const moment = require('moment');

module.exports = function populate(config) {
    const db = getDB(config);

    console.log('Creating database');
    runSqlFile(db, './app/dbCreate.sql')
        .then(() => {
            console.log('Creating database functions');
            runSqlFile(db, './app/dbFunctions.sql')
        })
        .then(() => {
            console.log('Read data from previousNames.json');

            let companiesHistory = [];

            return fs.readFileAsync('./previousNames.json', 'utf8')
                .then((jsonString) => {
                    const companiesJson = JSON.parse(jsonString);

                    companiesJson.map((company) => {
                        let companyNames = [];
                        
                        company.coalesce.map((data) => companyNames.push(new NameChange(company.nzbn, company.companyNumber, data.name, data.startDate, data.endDate)));

                        let currentNameStartDate = company.incorporationDate;

                        companyNames.map((name) => {
                            currentNameStartDate = name.end_date > currentNameStartDate ? name.end_date : currentNameStartDate;
                        });

                        companyNames.push(new NameChange(company.nzbn, company.companyNumber, company.companyName, currentNameStartDate));

                        companiesHistory = companiesHistory.concat(companyNames);
                    });
                }).then(() => {
                    console.log('Inserting data into database');

                    const insertHelper = new pgp.helpers.ColumnSet(['nzbn', 'company_number', 'company_name', 'start_date', 'end_date'], {table: 'company_names'});

                    const query = pgp.helpers.insert(companiesHistory, insertHelper);
                    return db.none(query)
                        .catch((error) => {
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

function runSqlFile(db, filename) {
    return fs.readFileAsync(filename, 'utf8')
        .then((sql) => {
            return db.none(sql);
        })
        .catch((error) => {
            console.log(error);
        });
}

function NameChange(nzbn, companyNumber, name, startDate, endDate=null) {
    this.nzbn = nzbn;
    this.company_number = companyNumber;
    this.company_name = name;
    this.start_date = startDate;
    this.end_date = endDate;
}
