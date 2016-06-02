var express = require('express');
var router = express.Router();
var fs = require("fs");
var Busboy = require('busboy');
var guid = require('node-uuid');
var path = require('path');
var multer = require('multer');
var upload = multer({dest: path.join( __projectDir, 'uploadsTemp/')});
var articleService = require('../services/articleService');

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

router.put('/:articleId', onArticleSaveHandler);

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