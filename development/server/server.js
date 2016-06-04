GLOBAL.__projectDir = __dirname;

var express = require('express');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var http = require('http');
var debug = require('debug')('server');

var articles = require(__dirname + '/lib/routes/articles');
var config = require(__dirname + '/lib/config/config');

var app = express();
var port = normalizePort(process.env.PORT || '3000');

mongoose.connect(config.dbConnectionString);

app.set('port', port);

// Define Middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// Define Routes
app.use('/articles', articles);

// This is a route that sends the index.html, which contains UI for testing
app.get('/', function (req, res) {
    console.log('serving file');
    res.sendFile(__dirname + '/views/index.html');
});

var server = http.createServer(app);
server.on('error', onError);
server.on('listening', onListening);

module.exports.app = app;
module.exports.server = server;
module.exports.listen = function () {
    server.listen.apply(server, arguments);
    console.log('Example app listening on port ' + app.get('port') + '!');
};
module.exports.close = function (callback) {
    server.close(callback);
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

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}