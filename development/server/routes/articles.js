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
    console.log(req.article._id);
    articleService.saveDocuments(req.article, req.files).then(function(storageInfoList) {
        res.send('OK');
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
    articleService.saveArticle(req.article, req.body.title, req.body.content, req.body.name, req.body.email).then(function(article) {
        res.send(article);
    }, function(error) {
        res.status(500).send(error);
    });
}


router.all('/:articleId*', middlewareRetrieveArticle);

router.post('/:articleId', onArticleSaveHandler);

router.put('/:articleId/documents', upload.array('documentToUpload'), onDocumentUploadHandler);

router.put('/', onArticleCreateHandler);


module.exports = router;