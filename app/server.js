var getDB = require('./db').getDB;
const moment = require('moment');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

module.exports = function(config) {
    const port = 3000;
    let db = getDB(config);

    app.post('/', function (request, response) {
        let companyNames = request.body;
        let jsonResponse = {};

        Promise.all(companyNames.map((name) => {
                return companyNameHistory(name.name, name.date).then((result) => {
                    if (result != null) {
                        jsonResponse[name.name] = result;
                    }
                });
            }))
            .then(() => {
                response.json(jsonResponse);
            });
    });

    app.listen(port, function () {
        console.log('Node server running at localhost:' + port);
    });

    function companyNameHistory(name, date) {
        date = (date ? moment(date) : moment()).format('YYYY-MM-DD');

        return db.func('company_name_history', [name, date])
            .then((result) => {
                if (result.length == 0) {
                    return null;
                }

                let data = {
                    nzbn: result[0].nzbn,
                    companyNumber: result[0].company_number,
                    history: []
                };

                result.map((item) => {
                    let newItem = {
                        name: item.name,
                        startDate: item.start_date
                    };

                    if (item.end_date) {
                        newItem.endDate = item.end_date;
                    }

                    data.history.push(newItem);
                });

                return data;
            });
    }
}
