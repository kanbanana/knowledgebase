var express = require('express');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var articles = require('./routes/articles');

var app = express();

// Define Middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// Define Routes
app.use('/', routes);
app.use('/articles', articles);

// This is a route that sends the index.html, which contains UI for testing
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/views/index.html");
});

module.exports = app;
