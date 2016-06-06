GLOBAL.__projectDir = __dirname;

var express = require('express');
var logger = require('morgan');
// var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var debug = require('debug')('server');

var articles = require(__dirname + '/lib/routes/articles');
var config = require(__dirname + '/lib/config/config');

var app = express();
var port = normalizePort(process.env.PORT || config.port);

mongoose.connect(config.dbConnectionString);

app.set('port', port);

// Define Middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// app.use(cookieParser());

// Define Routes
app.use('/api/articles', articles);

module.exports.app = app;
module.exports.server = null;
module.exports.listen = function () {
    this.server = app.listen(app.get('port'), function(){
        console.log('server listening on port ' + app.get('port') + '!');
    });
};
module.exports.close = function (callback) {
    this.server.close(callback);
};

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}