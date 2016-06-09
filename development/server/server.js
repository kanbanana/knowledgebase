var express = require('express');
var logger = require('morgan');
// var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var debug = require('debug')('server');
var config = require('./lib/config/config');
var path = require('path');
var articleService = require('./lib/services/article_service')

var upload = require('multer')({dest:  path.join(__dirname, config.temporaryUploadDir)});

var articles = require('./lib/routes/articles');

var app = module.exports.app = express();
var router = express.Router();

mongoose.connect(config.dbConnectionString);

app.set('port', config.port);

// Define Middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// app.use(cookieParser());

// Define Routes
router.all('/:articleId*',articles.middlewareRetrieveArticle);
router.get('/:articleId', articles.onArticleGetHandler);
router.get('/', articles.onArticleSearchHandler);
router.put('/:articleId', articles.middlewareCeckAutherMail, articles.middlewareCeckAutherName, articles.middlewareCeckTitle, articles.onArticleSaveHandler);
router.post('/:articleId/documents', upload.array('documents'), articles.onDocumentUploadHandler);
router.post('/', articles.onArticleCreateHandler);
router.delete('/:articleId', articles.onArticleDeleteHandler);
router.delete('/:articleId/documents/:filename', articles.onDocumentDeleteHandler);

app.use('/api/articles', router);

module.exports.listen = function () {
    this.server = app.listen(app.get('port'), function(){
        console.log('server listening on port ' + app.get('port') + '!');
    });
};
module.exports.close = function (callback) {
    this.server.close(callback);
};


// start the background job that regularly deletes all temporary articles
(function () {
    setInterval(articleService.deleteTemporaryArticles, config.oldTemporaryArticlesDeleteJobOptions.intervalTimeInHours * 60 * 60 * 1000);
})();
