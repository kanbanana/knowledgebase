var express = require('express');
var path = require('path');
var models = require('../data_connection/models');
var articleService = require('../services/article_service');
var config = require('../config/config');

var router = module.exports = {};

router.middlewareRetrieveArticle = function(req, res, next) {
    articleService.findArticleById(req.params.articleId).then(function(article) {
        req.article = article;
        next();
    }, function(err){
        res.send(500, error);
    });
};

router.onDocumentUploadHandler = function(req, res) {
    articleService.saveDocuments(req.article, req.files).then(function(storageInfoList) {
        res.send(storageInfoList);
    }, function(error) {
        res.send(500, error);
    })
};

router.onArticleCreateHandler = function(req, res) {
    articleService.createArticle().then(function(article) {
        res.send(article._id);
    }, function(error) {
        res.send(500, error);
    });
};

router.middlewareCeckTitle = function(req, res, next) {
    if(req.body.title && req.body.title.length > config.postBodyValidationValues.maxArticleTitleLength) {
        return res.status(400).send('Invalid title length (max. ' + config.postBodyValidationValues.maxArticleTitleLength + ' characters).');
    }

    next();
};

router.middlewareCeckAutherName = function(req, res, next) {
    if(req.body.author && req.body.author.name && req.body.author.name.length > config.postBodyValidationValues.maxArticleAuthorNameLength ||
        req.body.lastChangedBy && req.body.lastChangedBy.name && req.body.lastChangedBy.name.length > config.postBodyValidationValues.maxArticleAuthorNameLength) {
        return res.status(400).send('Invalid author name length (max. ' + config.postBodyValidationValues.maxArticleAuthorNameLength + ' characters).');
    }

    next();
};

router.middlewareCeckAutherMail = function(req, res, next) {
    if(req.body.author && req.body.author.email && req.body.author.email.length > config.postBodyValidationValues.maxArticleAuthorEmailLength ||
        req.body.lastChangedBy && req.body.lastChangedBy.email && req.body.lastChangedBy.email.length > config.postBodyValidationValues.maxArticleAuthorEmailLength) {
        return res.status(400).send('Invalid author email address length (max. ' + config.postBodyValidationValues.maxArticleAuthorEmailLength + ' characters).');
    }

    next()
};

router.onArticleSaveHandler = function(req, res) {
    articleService.saveArticle(req.article, req.body.title, req.body.text, req.body.lastChangedBy).then(function(article) {
        articleService.getArticleContent(article._id).then(function(articleContent) {
            var responseArticle = models.articleSchemaToResponseArticle(article);
            responseArticle.text = articleContent;
            res.send(responseArticle);
        });
    }, function(error) {
        res.status(500).send(error);
    });
};

router.onArticleGetHandler = function(req, res) {
    if(!req.article) {
        return res.status(404).send('Article not found');
    }
    articleService.getArticleContent(req.article._id).then(function(articleContent) {
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
        articleService.getArticlesByIds(req.query.ids.split(',')).then(function (articles) {
            res.send(models.multipleArticleSchemaToResponseArticles(articles));
        }, function (error) {
            res.status(500).send(error);
        });
    } else {
        res.status(404).send('404 - not found');
    }
};

router.onArticleDeleteHandler = function(req,res){
    articleService.deleteArticle(req.article._id).then(function() {
        res.send(true);
    }, function(err){
        res.status(500).send(err);
    });
};

router.onDocumentDeleteHandler = function(req,res){
    articleService.deleteDocument(req.article, req.params.filename).then(function() {
        res.send(true);
    }, function(err){
        res.status(500).send(err);
    });
};
