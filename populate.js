"use strict";
require("babel-core/register");
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));

fs.readFileAsync(process.argv[2] || 'config.json', 'utf8')
    .then(function(config){
        return require('./app/populate')(JSON.parse(config));
    });