/**
 * This module handles the routing of the article services
 *
 * @module lib/router/article
 * @author Martin Starman, Vladislav Chumak
 */

'use strict';

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
        res.status(500).contentType('application/json').send();
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
        res.contentType('application/json').send(storageInfoList);
    }, function (error) {
        res.status(500).contentType('application/json').send();
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
            res.contentType('application/json').send(responseArticle);
        });
    }, function (error) {
        res.status(500).contentType('application/json').send();
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
    if (req.query.old === '') {
        return articleService.getOldArticleContentAndTitle(req.article._id).then(function (contentAndTitle) {
            if(!contentAndTitle) {
                return res.status(404).contentType('application/json').send();
            }

            res.contentType('application/json').send(contentAndTitle);
        }, function (err) {
            res.status(500).contentType('application/json').send();
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
            res.contentType('application/json').send(models.multipleArticleSchemaToResponseArticles(searchResults));
        }, function (error) {
            res.status(400).contentType('application/json').send();
        });
    } else if (req.query.ids) {
        var ids = req.query.ids.split(',');
        if(ids.length === 0) {
            res.contentType('application/json').status(200).send([]);
        }
        articleService.getArticlesByIds(ids).then(function (articles) {
            res.send(models.multipleArticleSchemaToResponseArticles(articles));
        }, function (error) {
            res.status(400).contentType('application/json').send();
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
        res.status(500).contentType('application/json').send();
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
        res.status(500).contentType('application/json').send();
    });
};

// ********************* Middlewares *********************  //

/**
 * "middlewareRetrieveArticle" is a HTTP middleware. It checks if the articleId in the route
 * is a valid ID.
 *
 * On Success the article get set as attribute to the req Object.
 * On error Error-Code 500 send to client
 *
 * @function middlewareRetrieveArticle
 * @static
 *
 * @param {object} req - Expressjs Request Object
 * @param {object} res - Expressjs Response Object
 * @param {function} next - Expressjs next callback
 */
router.middlewareRetrieveArticle = function (req, res, next) {
    articleService.findArticleById(req.params.articleId).then(function (article) {
        req.article = article;

        if(!req.article) {
            return res.status(404).contentType('application/json').send();
        }

        next();
    }, function (err) {
        res.status(500).contentType('application/json').send();
    });
};

/**
 * "middlewareValidateArticle" is a HTTP middleware. It checks if the article post body contains only valid values.
 *
 * On Success the article get set as attribute to the req Object.
 * On error Error-Code 500 send to client
 *
 * @function middlewareValidateArticle
 * @static
 *
 * @param {object} req - Expressjs Request Object
 * @param {object} res - Expressjs Response Object
 * @param {function} next - Expressjs next callback
 */
router.middlewareValidateArticle = function(req, res, next) {
    var validationResult = validate(req.body, articleGlobalSchema);
    if(validationResult.errors.length > 0) {
        return res.status(400).contentType('application/json').send();
    }

    if (req.body.title.length > config.postBodyValidationValues.maxArticleTitleLength) {
        return res.status(400).contentType('application/json').send();
    }

    if (req.body.author.name.length > config.postBodyValidationValues.maxArticleAuthorNameLength ||
        req.body.lastChangedBy.name.length > config.postBodyValidationValues.maxArticleAuthorNameLength) {
        return res.status(400).contentType('application/json').send();
    }

    if (req.body.author.email.length > config.postBodyValidationValues.maxArticleAuthorEmailLength ||
        req.body.lastChangedBy.email.length > config.postBodyValidationValues.maxArticleAuthorEmailLength) {
        return res.status(400).contentType('application/json').send();
    }

    var emailRegexp = /^.+\@.+\..+$/;
    if (!req.body.author.email.match(emailRegexp) || !req.body.lastChangedBy.email.match(emailRegexp)){
        return res.status(400).contentType('application/json').send();
    }

    next();
};
