var asyncLib = require('async');
var fileSystemConnector = require('../data_connection/file_system_connector');
var databaseConnector = require('../data_connection/database_connector');
var config = require('../config/config');

var articleService = module.exports = {};

articleService.createArticle = function () {
    return databaseConnector.createArticle();
};


articleService.saveArticle = function (article, title, content, author) {
    return new Promise(function (resolve, reject) {
        var authorName = "";
        var authorMail = "";
        if (author) {
            authorName = author.name || "";
            authorMail = author.email || "";
        }

        fileSystemConnector.saveContent(article._id, content, article.isTemporary).then(
            function () {
                databaseConnector.saveArticle(article, title, authorName, authorMail).then(resolve, reject);
            }
            , reject);
    });
};

articleService.findArticleById = function (id) {
    return databaseConnector.findArticleById(id);
};

articleService.saveDocument = function (article, document) {
    return new Promise(function (resolve, reject) {
        fileSystemConnector.saveDocument(document, article._id, article.isTemporary).then(function (storageInfo) {
            databaseConnector.addDocumentToArticle(article, storageInfo).then(resolve, reject);
        }, reject);
    });
};

articleService.saveDocuments = function (article, documents) {
    var storageInfoList = [];
    return new Promise(function (resolve, reject) {
        asyncLib.each(documents, function (item, cb) {
            articleService.saveDocument(article, item).then(function (storageInfo) {
                storageInfoList.push(storageInfo);
                cb();
            }, cb);
        }, function (error) {
            if (!error) {
                return resolve(storageInfoList);
            }
            reject(error);
        });
    });
};


articleService.getArticleContent = function (articleId) {
    return new Promise(function(resolve) {
        fileSystemConnector.readArticleContent(articleId).then(function(content) {
            resolve(content);
        }, function() {
            resolve('');
        });
    });
};

function deleteTemporises() {
    databaseConnector.deleteTemporaryArticlesOlderThan(config.oldTemporaryArticlesDeleteJobOptions.maxAgeInHours).then(function (articles) {
        articles.forEach(function (article) {
            fileSystemConnector.deleteArticle(article._id).then(function () {
                },
                function (err) {
                    console.log(err);
                });
        });
        console.log(articles);
    });
}

(function () {
    setInterval(deleteTemporises, config.oldTemporaryArticlesDeleteJobOptions.intervalTimeInHours * 60 * 60 * 1000);
})();