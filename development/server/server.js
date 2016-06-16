'use strict';

var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var debug = require('debug')('server');
var config = require('./lib/config/config');
var path = require('path');

var upload = require('multer')({dest:  path.join(__dirname, config.temporaryUploadDir)});

var articles = require('./lib/routes/articles');

var app = module.exports.app = express();
var router = express.Router();

app.set('port', config.port);

// Define Middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Define Routes
router.all('/:articleId*',articles.middlewareRetrieveArticle);
router.get('/:articleId', articles.onArticleGetHandler);
router.get('/', articles.onArticleSearchHandler);
router.put('/:articleId', articles.middlewareValidateArticle, articles.onArticleSaveHandler);
router.post('/:articleId/documents', upload.array('documents'), articles.onDocumentUploadHandler);
router.post('/', articles.onArticleCreateHandler);
router.delete('/:articleId', articles.onArticleDeleteHandler);
router.delete('/:articleId/documents/:filename', articles.onDocumentDeleteHandler);

app.use('/api/articles', router);

var mongoConnection = null;

module.exports.server = null;


module.exports.listen = function (cb) {
    mongoConnection = require('mongoose').connect(config.dbConnectionString, function(){
        module.exports.server = app.listen(app.get('port'), function(){
            console.log('server listening on port ' + app.get('port') + '!');
            if(cb) {
                cb();
            }
        });
    });

};

module.exports.close = function (callback) {
    module.exports.server.close();
    mongoConnection.disconnect(callback);
};


