GLOBAL.__projectDir = __dirname;

var express = require('express');
var logger = require('morgan');
// var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var debug = require('debug')('server');
var config = require('./lib/config/config');
var path = require('path');

var upload = require('multer')({dest:  path.join(__projectDir, config.temporaryUploadDir)});

var articles = require('./lib/routes/articles');

var app = express();
var router = express.Router();
var port = normalizePort(process.env.PORT || config.port);

mongoose.connect(config.dbConnectionString);

app.set('port', port);

// Define Middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// app.use(cookieParser());

// Define Routes
router.all('/:articleId*',articles.middlewareRetrieveArticle);
router.get('/:articleId', articles.onArticleGetHandler);
router.put('/:articleId', articles.middlewareCeckAutherMail, articles.middlewareCeckAutherName, articles.middlewareCeckTitle, articles.onArticleSaveHandler);
router.post('/:articleId/documents', upload.array('documents'), articles.onDocumentUploadHandler);
router.post('/', articles.onArticleCreateHandler);

app.use('/api/articles', router);

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