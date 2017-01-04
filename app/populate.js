var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var getDB = require('./db').getDB;

module.exports = function populate(config) {
    const db = getDB(config);

    // Build the DB
    runSqlFile(db, './app/dbCreate.sql'); // Run the DB create sql
    runSqlFile(db, './app/dbFunctions.sql'); // Populate functions

    let companiesHistory = [];

    fs.readFileAsync('./previousNames.json', 'utf8')
        .then((jsonString) => {
            console.log('Read data from previousNames.json');

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
                        startDate: formatDateForDB(companyData.startDate),
                        endDate: formatDateForDB(companyData.endDate)
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
        }).catch((error) => {
            console.log(error);
        }).then(() => {
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
        });;
}

function formatDateForDB(date) {
    const twoDigits = (input) => {
        input += '';
        if (input == null || input.length === 0)
            return '00';

        if (input.length === 1)
            return '0' + input;

        return input.slice(-2);
    }

    date = new Date(date);
    return date.getFullYear()
           + '-' + twoDigits(1 + date.getMonth())
           + '-' + twoDigits(date.getDate());
}
