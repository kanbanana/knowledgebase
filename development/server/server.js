var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var guid = require('node-uuid');
var fs = require("fs");
var Busboy = require('busboy');

var routes = require('./routes/index');

var app = express();

// Define Middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// Define Routes
app.use('/', routes);

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/views/index.html");
});


module.exports = app;
