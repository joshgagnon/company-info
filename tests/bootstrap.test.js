var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));


before(() => {
    return fs.readFileAsync('./config.json', 'utf8')
        .then(function(config){
            return require('../app/populate')(JSON.parse(config));
        })

});