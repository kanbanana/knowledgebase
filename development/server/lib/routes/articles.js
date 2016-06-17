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

var router = {};


// ********************* Route Handlers *********************  //

/**
 * A HTTP Request Handler that handles the article create request. On success the handler will send the new article id. In case of an error the handler will send the Error-Code to the client.
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
 * A HTTP Request Handler that handles the upload of documents. On success the handler will send the new document information as JSON. In case of an error the handler will send the Error-Code 500 to the client.
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
 * A HTTP Request Handler that handles the article save request on an existing article. On success the handler will send back the saved article. In case of an error the handler will send the Error-Code 500 to the client.
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
 * A HTTP Request Handler that sends the article object with the given ID. If the query param "old" is set, the archived version of the article will be sent. In case of an error the handler will send the Error-Code 500 to the client.
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
    if(req.article.isTemporary) {
        return res.status(404).contentType('application/json').send();
    }
    articleService.getArticleContent(req.article._id).then(function (articleContent) {
        var responseArticle = models.articleSchemaToResponseArticle(req.article);
        responseArticle.text = articleContent;
        res.send(responseArticle);
    });
};

/**
 * A HTTP Request Handler that handles the article search request. There are two ways to call this route:
 * a) With the query parameter "q" and the search text as value. In that case, all articles that contain the given search text will be sent to the client.
 * b) With the query parameter "ids" and a comma separated list of IDs as value. In that case, the articles with the given IDs are returned.
 * In case of an error the handler will send the Error-Code 500 to the client.
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
 * A HTTP Request Handler that handles handles the article delete request. In case of error the handler will send the Error-Code 500 to the client.
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
 * A HTTP Request Handler that handles the document delete request. In case of error the handler will send the Error-Code 500 the client.
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
 * A HTTP middleware that checks if the articleId in the route is a valid ID. On Success the article gets set as attribute to the req object. In case of an error the Error-Code 500 will be sent to the client.
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
 * A HTTP middleware that checks if the article post body contains only valid values. In case of invalid data, the Error-Code 500 will be sent to client.
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

    // if (req.body.author.name.length > config.postBodyValidationValues.maxArticleAuthorNameLength ||
    //     req.body.lastChangedBy.name.length > config.postBodyValidationValues.maxArticleAuthorNameLength) {
    //     return res.status(400).contentType('application/json').send();
    // }
    //
    // if (req.body.author.email.length > config.postBodyValidationValues.maxArticleAuthorEmailLength ||
    //     req.body.lastChangedBy.email.length > config.postBodyValidationValues.maxArticleAuthorEmailLength) {
    //     return res.status(400).contentType('application/json').send();
    // }

    // var emailRegexp = /^.+\@.+\..+$/;
    // if (!req.body.author.email.match(emailRegexp) || !req.body.lastChangedBy.email.match(emailRegexp)){
    //     return res.status(400).contentType('application/json').send();
    // }

    next();
};

module.exports = router;