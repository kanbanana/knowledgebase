
'use strict';

var express = require('express');
var path = require('path');
var models = require('../data_connection/models');
var articleService = require('../services/article_service');
var config = require('../config/config');

var router = module.exports = {};

// ********************* Route Handlers *********************  //

/**
 * "onArticleCreateHandler" is a HTTP Request Handler. It handles the article create request.
 * On success the handler will send the new article id.
 * On error the handler will send the Error-Code 500 and the error to the client.
 *
 * @function onArticleCreateHandler
 * @static
 *
 * @param {object} req - Expressjs Request Object
 * @param {object} res - Expressjs Response Object
 */
router.onArticleCreateHandler = function (req, res) {
    articleService.createArticle().then(function (article) {
        res.send(article._id);
    }, function (error) {
        res.send(500, error);
    });
};

/**
 * "onDocumentUploadHandler" is a HTTP Request Handler. It handles the upload fo documents.
 * On success the handler will send the new document information as JSON.
 * On error the handler will send the Error-Code 500 and the error to the client.
 *
 * @function onDocumentUploadHandler
 * @static
 *
 * @send {}
 *
 * @param {object} req - Expressjs Request Object
 * @param {object} res - Expressjs Response Object
 */
router.onDocumentUploadHandler = function (req, res) {
    articleService.saveDocuments(req.article, req.files).then(function (storageInfoList) {
        res.send(storageInfoList);
    }, function (error) {
        res.send(500, error);
    });
};

/**
 * "onArticleSaveHandler" is a HTTP Request Handler. It handles the article save request on an existing article.
 * On error the handler will send the Error-Code 500 and the error to the client.
 *
 * @function onArticleSaveHandler
 * @static
 *
 * @param {object} req - Expressjs Request Object
 * @param {object} res - Expressjs Response Object
 */
router.onArticleSaveHandler = function (req, res) {
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

/**
 * "onArticleGetHandler" is a HTTP Request Handler. It sends the article object.
 * On error the handler will send the Error-Code 500 and the error to the client.
 *
 * @function onArticleGetHandler
 * @static
 *
 * @param {object} req - Expressjs Request Object
 * @param {object} res - Expressjs Response Object
 */
router.onArticleGetHandler = function (req, res) {
    if (!req.article) {
        return res.status(404).send('Article not found');
    }
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

/**
 * "onArticleSearchHandler" is a HTTP Request Handler. It handles the article search request.
 * "onArticleSearchHandler" expects the "GET" parameter "q".
 * On error the handler will send the Error-Code 500 and the error to the client.
 *
 * @function onArticleSearchHandler
 * @static
 *
 * @param {object} req - Expressjs Request Object
 * @param {object} res - Expressjs Response Object
 */
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
        res.status(200).send([]);
    }
};

/**
 * "onArticleDeleteHandler" is a HTTP Request Handler. It handles the article delete request.
 * On error the handler will send the Error-Code 500 and the error to the client.
 *
 * @function onArticleDeleteHandler
 * @static
 *
 * @param {object} req - Expressjs Request Object
 * @param {object} res - Expressjs Response Object
 */
router.onArticleDeleteHandler = function (req, res) {
    articleService.deleteArticle(req.article._id).then(function () {
        res.send(true);
    }, function (err) {
        res.status(500).send(err);
    });
};

/**
 * "onDocumentDeleteHandler" is a HTTP Request Handler. It handles the document delete request.
 * On error the handler will send the Error-Code 500 and the error to the client.
 *
 * @function onDocumentDeleteHandler
 * @static
 *
 * @param {object} req - Expressjs Request Object
 * @param {object} res - Expressjs Response Object
 */
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
        next();
    }, function (err) {
        res.send(500, err);
    });
};

router.middlewareCheckTitle = function (req, res, next) {
    if (req.body.title && req.body.title.length > config.postBodyValidationValues.maxArticleTitleLength) {
        return res.status(400).send('Invalid title length (max. ' + config.postBodyValidationValues.maxArticleTitleLength + ' characters).');
    }

    next();
};

router.middlewareCheckAutherName = function (req, res, next) {
    if (req.body.author && req.body.author.name && req.body.author.name.length > config.postBodyValidationValues.maxArticleAuthorNameLength ||
        req.body.lastChangedBy && req.body.lastChangedBy.name && req.body.lastChangedBy.name.length > config.postBodyValidationValues.maxArticleAuthorNameLength) {
        return res.status(400).send('Invalid author name length (max. ' + config.postBodyValidationValues.maxArticleAuthorNameLength + ' characters).');
    }

    next();
};

router.middlewareCheckAutherMail = function (req, res, next) {
    if (req.body.author && req.body.author.email && req.body.author.email.length > config.postBodyValidationValues.maxArticleAuthorEmailLength ||
        req.body.lastChangedBy && req.body.lastChangedBy.email && req.body.lastChangedBy.email.length > config.postBodyValidationValues.maxArticleAuthorEmailLength) {
        return res.status(400).send('Invalid author email address length (max. ' + config.postBodyValidationValues.maxArticleAuthorEmailLength + ' characters).');
    }

    next()
};
