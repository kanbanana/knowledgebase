var async = require('async');
var fileSystemConnector = require(__dirname + '/../data_connection/fileSystemConnector');
var databaseConnector = require(__dirname + '/../data_connection/databaseConnector');
var config = require(__dirname + '/../config/config');

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
        async.each(documents, function (item, cb) {
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
        }, function(err) {
            resolve('');
        });
    });
};
(function () {
    setInterval(function () {
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
    }, config.oldTemporaryArticlesDeleteJobOptions.intervalTimeInHours * 60 * 60 * 1000);
})();

articleService.searchArticles = function (q, author) {
    if(q) {
        return new Promise(function (resolve, reject) {
            searchResults = searchEngineConnector.searchArticles(q).then(function (searchResults) {
                if (author) {
                    //TODO: filter searchResults by author (where to get author field?)
                    resolve(searchResults);
                } else {
                    resolve(searchResults);
                }
            });
        }).then(function (searchResults) {
            //TODO add metadata and convert to search results schema (specification needed)
            resolve(searchResults);
        });
    } else if(author) {
        //TODO: filter articles in database by author (how to get content intro as search snippet?)
        return new Promise(function (resolve, reject) {
            resolve('TODO');
        });
    }

}