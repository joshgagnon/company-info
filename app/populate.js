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
            console.log('Read data from names.json');

            let companiesHistory = [];
            return fs.readFileAsync('./names.json', 'utf8')
                .then((text) => {
                    const companies =  text.split('\n');

                    companies.map((company, i) => {
                        if(i && i % 1000 === 0) {
                            console.log(`${i}/${companies.length} done`)
                        }
                        try{
                            company = JSON.parse(company);
                            let companyNames = [];

                            company.coalesce.map((data) => companiesHistory.push(new NameChange(company.nzbn, company.companyNumber, data.name, data.startDate, data.endDate)));

                            let currentNameStartDate = company.incorporationDate;

                            companyNames.map((name) => {
                                currentNameStartDate = moment(name.end_date, 'DD MMMM YYYY').isAfter(moment(currentNameStartDate, 'DD MMMM YYYY')) ? name.end_date : currentNameStartDate;
                            });

                            companiesHistory.push(new NameChange(company.nzbn, company.companyNumber, company.companyName, currentNameStartDate));


                        }catch(e){
                            console.log('BAD STRING', e, company)
                        }
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
