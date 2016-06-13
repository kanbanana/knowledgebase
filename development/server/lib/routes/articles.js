var express = require('express');
var path = require('path');
var models = require('../data_connection/models');
var articleService = require('../services/article_service');
var config = require('../config/config');
var validate = require('jsonschema').validate;
var articleGlobalSchema = require('../schemas/article.json');
var articlesGlobalSchema = require('../schemas/articles.json');

var router = module.exports = {};


// ********************* Route Handlers *********************  //

router.onArticleCreateHandler = function (req, res) {
    articleService.createArticle().then(function (article) {
        res.send(article._id);
    }, function (error) {
        res.send(500, error);
    });
};

router.onDocumentUploadHandler = function (req, res) {
    articleService.saveDocuments(req.article, req.files).then(function (storageInfoList) {
        res.send(storageInfoList);
    }, function (error) {
        res.send(500, error);
    })
};

router.onArticleSaveHandler = function (req, res) {
    if(  req.params)
    articleService.saveArticle(req.article, req.body.title, req.body.text, req.body.lastChangedBy).then(function (article) {
        articleService.getArticleContent(article._id).then(function (articleContent) {
            var responseArticle = models.articleSchemaToResponseArticle(article);
            responseArticle.text = articleContent;
            res.send(responseArticle);
        });
    }, function (error) {
        res.status(500).send(error);
    });
};

router.onArticleGetHandler = function (req, res) {
    if (req.query.old === '') {
        return articleService.getOldArticleContentAndTitle(req.article._id).then(function (contentAndTitle) {
            res.send(contentAndTitle);
        }, function (err) {
            res.status(500).send("Error while reading old version.");
        });
    }
    articleService.getArticleContent(req.article._id).then(function (articleContent) {
        var responseArticle = models.articleSchemaToResponseArticle(req.article);
        responseArticle.text = articleContent;
        res.send(responseArticle);
    });
};

router.onArticleSearchHandler = function(req, res) {
    if (req.query.q) {
        articleService.searchArticles(req.query.q).then(function (searchResults) {
            res.send(models.multipleArticleSchemaToResponseArticles(searchResults));
        }, function (error) {
            res.status(500).send(error);
        });
    } else if (req.query.ids) {
        var ids = req.query.ids.split(',');
        if(ids.length === 0) {
            res.status(200).send([]);
        }
        articleService.getArticlesByIds(ids).then(function (articles) {
            res.send(models.multipleArticleSchemaToResponseArticles(articles));
        }, function (error) {
            res.status(500).send(error);
        });
    } else {
        res.status(200).send([]);
    }
};

router.onArticleDeleteHandler = function (req, res) {
    articleService.deleteArticle(req.article._id).then(function () {
        res.send(true);
    }, function (err) {
        res.status(500).send(err);
    });
};

router.onDocumentDeleteHandler = function (req, res) {
    articleService.deleteDocument(req.article, req.params.filename).then(function () {
        res.send(true);
    }, function (err) {
        res.status(500).send(err);
    });
};

// ********************* Middlewares *********************  //

router.middlewareRetrieveArticle = function (req, res, next) {
    articleService.findArticleById(req.params.articleId).then(function (article) {
        req.article = article;

        if(!req.article) {
            return res.status(404).send('Article not found');
        }

        next();
    }, function (err) {
        res.send(500, error);
    });
};

router.middlewareValidateArticle = function(req, res, next) {
    var validationResult = validate(req.body, articleGlobalSchema);
    if(validationResult.errors.length > 0) {
        return res.status(400).send('Invalid input: ' + validationResult.errors[0]);
    }

    if (req.body.title.length > config.postBodyValidationValues.maxArticleTitleLength) {
        return res.status(400).send('Invalid title length (max. ' + config.postBodyValidationValues.maxArticleTitleLength + ' characters).');
    }

    if (req.body.author.name.length > config.postBodyValidationValues.maxArticleAuthorNameLength ||
        req.body.lastChangedBy.name.length > config.postBodyValidationValues.maxArticleAuthorNameLength) {
        return res.status(400).send('Invalid author name length (max. ' + config.postBodyValidationValues.maxArticleAuthorNameLength + ' characters).');
    }

    if (req.body.author.email.length > config.postBodyValidationValues.maxArticleAuthorEmailLength ||
        req.body.lastChangedBy.email.length > config.postBodyValidationValues.maxArticleAuthorEmailLength) {
        return res.status(400).send('Invalid author email address length (max. ' + config.postBodyValidationValues.maxArticleAuthorEmailLength + ' characters).');
    }

    next();
};
