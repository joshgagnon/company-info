var getDB = require('./db').getDB;
const moment = require('moment');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

module.exports = function(config) {
    const port = config.server_port || 3000;
    let db = getDB(config);

    app.post('/', function (request, response) {
        let companyNames = request.body;

        if (!Array.isArray(companyNames)) {
            response.send('Error. Route requires a JSON array of company names')
        } else {
            Promise.all(companyNames.map((name) => companyNameHistory(name.name, name.date)))
                .then((result) => {
                    const filtered = result.filter((item) => item != null);
                    response.json(filtered);
                });
        }
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
                    queryName: name,
                    history: []
                };

                result.map((item) => {
                    let newItem = {
                        name: item.company_name,
                        startDate: moment(item.start_date).format('DD MMM YYYY')
                    };

                    if (item.end_date) {
                        newItem.endDate = moment(item.end_date).format('DD MMM YYYY');
                    }

                    data.history.push(newItem);
                });

                return data;
            });
    }
}
