var express = require('express');
var path = require('path');
var upload = require('multer')({dest: path.join( __projectDir, 'uploadsTemp/')});
var articleService = require(__dirname + '/../services/articleService');
var config = require(__dirname + '/../config/config')

var router = express.Router();

function middlewareRetrieveArticle(req, res, next) {
    articleService.findArticleById(req.params.articleId).then(function(article) {
        req.article = article;
        next();
    }, function(err){
        res.send(500, error);
    });
}

function onDocumentUploadHandler(req, res) {
    articleService.saveDocuments(req.article, req.files).then(function(storageInfoList) {
        res.send(storageInfoList);
    }, function(error) {
        res.send(500, error);
    })
}

function onArticleCreateHandler(req, res) {
    articleService.createArticle().then(function(article) {
        res.send(article._id);
    }, function(error) {
        res.send(500, error);
    });
}

function middlewareCeckTitte(req, res, next) {
    if(req.body.title.length > config.postBodyValidationValues.maxArticleTitleLength) {
        return res.status(400).send('Invalid title length (max. ' + config.postBodyValidationValues.maxArticleTitleLength + ' characters).');
    }

    next();
}

function middlewareCeckAutherName(req, res, next) {
    if(req.body.author && req.body.author.name.length > config.postBodyValidationValues.maxArticleAuthorNameLength ||
        req.body.lastChangedBy && req.body.lastChangedBy.name.length > config.postBodyValidationValues.maxArticleAuthorNameLength) {
        return res.status(400).send('Invalid author name length (max. ' + config.postBodyValidationValues.maxArticleAuthorNameLength + ' characters).');
    }

    next();
}

function middlewareCeckAutherMail(req, res, next) {
    if(req.body.author && req.body.author.email.length > config.postBodyValidationValues.maxArticleAuthorEmailLength ||
        req.body.lastChangedBy && req.body.lastChangedBy.email.length > config.postBodyValidationValues.maxArticleAuthorEmailLength) {
        return res.status(400).send('Invalid author email address length (max. ' + config.postBodyValidationValues.maxArticleAuthorEmailLength + ' characters).');
    }

    next()
}

function onArticleSaveHandler(req, res) {
    articleService.saveArticle(req.article, req.body.title, req.body.text, req.body.lastChangedBy).then(function(article) {
        articleService.getArticleContent(article._id).then(function(articleContent) {
            var responseArticle = articleSchemaToResponseArticle(article);
            responseArticle.text = articleContent;
            res.send(responseArticle);
        });

    }, function(error) {
        res.status(500).send(error);
    });
}


router.all('/:articleId*', middlewareRetrieveArticle);

router.put('/:articleId', middlewareCeckAutherMail, middlewareCeckAutherName, middlewareCeckTitte, onArticleSaveHandler);

router.post('/:articleId/documents', upload.array('documents'), onDocumentUploadHandler);

router.post('/', onArticleCreateHandler);

function articleSchemaToResponseArticle(articleSchema) {
    var responseArticle = articleSchema.toJSON();
    responseArticle.id = responseArticle._id;
    delete responseArticle._id;
    delete responseArticle.__v;

    responseArticle.documents.forEach(function(document) {
        delete document._id;
    });

    return responseArticle;
}

module.exports = router;