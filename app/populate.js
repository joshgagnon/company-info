
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var getDB = require('./db').getDB;

module.exports = function populate(config) {
    const db = getDB(config);

    // Build the DB
    runSqlFile(db, './app/dbCreate.sql'); // Run the DB create sql
    runSqlFile(db, './app/dbFunctions.sql'); // Populate functions
        

    fs.readFileAsync('./previousNames.json', 'utf8')
        .then((jsonString) => {
            const companies = JSON.parse(jsonString);

            companies.map((company) => {
                let companyNames = [];
                
                company.coalesce.map((coalesceData) => {
                    companyNames.push({
                        nzbn: company.nzbn,
                        companyName: coalesceData.name,
                        startDate: formatDateForDB(coalesceData.startDate),
                        endDate: formatDateForDB(coalesceData.endDate)
                    });
                });

                let currentNameStartDate = company.incorporationDate;

                companyNames.map((name) => {
                    if (name.endDate > currentNameStartDate) {
                        currentNameStartDate = name.endDate;
                    }
                });

                companyNames.push({
                    nzbn: company.nzbn,
                    companyName: company.companyName,
                    startDate: currentNameStartDate,
                    endDate: null
                })

                companyNames.map(name => insertCompanyName(db, name));
            });

            return true;
        }).then(() => {
            console.log('done');
        }).catch((error) => {
            console.log(error);
        });

    // now populate functions
    return true;
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

function insertCompanyName(db, companyData) {
    db.none("INSERT INTO company_names(nzbn, companyName, startDate, endDate) VALUES(${nzbn}, ${companyName}, ${startDate}, ${endDate})", {
        nzbn: companyData.nzbn,
        companyName: companyData.companyName,
        startDate: companyData.startDate,
        endDate: companyData.endDate
    })
    .catch((error) => console.log(error));
}
