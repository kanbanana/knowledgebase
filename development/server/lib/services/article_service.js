var asyncLib = require('async');
var fileSystemConnector = require('../data_connection/file_system_connector');
var databaseConnector = require('../data_connection/database_connector');
var config = require('../config/config');
var path = require('path');

var articleService = module.exports = {};

articleService.createArticle = function () {
    return databaseConnector.createArticle();
};


articleService.saveArticle = function (article, title, content, author) {
    return new Promise(function (resolve, reject) {
        var authorName = '';
        var authorMail = '';
        if (author) {
            authorName = author.name || '';
            authorMail = author.email || '';
        }

        content = fileSystemConnector.wrapContentInHTMLBody(content, title);
        fileSystemConnector.saveContent(article._id, content, article.isTemporary).then(
            function () {
                updateArticle(article, title, authorName, authorMail);
                databaseConnector.saveArticle(article).then(resolve, reject);
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
            content = fileSystemConnector.extractHTMLBodyContent(content);
            resolve(content);
        }, function() {
            resolve('');
        });
    });
};

articleService.deleteArticle = function(articleId){
    var promiseList = [
        fileSystemConnector.deleteArticle(articleId),
        databaseConnector.deleteArticles(articleId)
    ];

    return Promise.all(promiseList)

};

articleService.deleteTemporaryArticles = function(){
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
};

articleService.deleteDocument = function(article, filename){
    var document = removeFileFromArticle(article, filename);
    var docPath = fileSystemConnector.getPathToDocumentUnsafe(article, document);

    var promiseList = [
        fileSystemConnector.deleteDocument(docPath),
        databaseConnector.saveArticle(article)
    ];

    return Promise.all(promiseList)
};

/**
 * updateArticle sets the lastChangedBy JSON and the author iff empty.
 *
 * @param article
 * @param title
 * @param authorName
 * @param authorMail
 */
function updateArticle(article, title, authorName, authorMail) {
        article.title = title;
        if (!article.author.name && !article.author.email) {
            article.author.name = authorName;
            article.author.email = authorMail;
        }

        article.lastChangedBy.name = authorName;
        article.lastChangedBy.email = authorMail;
        if(article.isTemporary) {
            article.isTemporary = false;
            article.documents.forEach(function (document) {
                document.path = path.join(config.fileLinkPrefix, config.uploadDirPerm, article._id + '', document.name + '.' + document.filetype).replace(/[\\]/g, '/');
            });
        }
}

function removeFileFromArticle(article, filename) {
    var hasFound = false;
    article.documents.forEach(function(document, idx) {
        var tempFilename = document.name + "." + document.filetype;
        if(filename == tempFilename) {
            hasFound = document;
            var tempDocument = article.documents.pop();
            if(idx !== article.documents.length) {
                article.documents[idx] = tempDocument;
            }

            return false;
        }
    });

    if(hasFound && article.hasOwnProperty("markModified")) {
        article.markModified('documents');
    }

    return hasFound;
}