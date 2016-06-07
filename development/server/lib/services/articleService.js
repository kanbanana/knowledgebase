var async = require('async');
var fileSystemConnector = require(__dirname + '/../data_connection/fileSystemConnector');
var databaseConnector = require(__dirname + '/../data_connection/databaseConnector');
var searchEngineConnector = require(__dirname + '/../data_connection/searchEngineConnector');
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
    return new Promise(function (resolve) {
        fileSystemConnector.readArticleContent(articleId).then(function (content) {
            resolve(content);
        }, function (err) {
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

articleService.searchArticles = function (q) {
    var author = q.match(/author:([^\s]*)/)[1];
    var onlyAuthor = q.match(/^author:([^\s]*)$/);
    // remove author from search terms
    var search = q.replace(/(author:[^\s]*)/, '');

    return new Promise(function (resolve, reject) {
        if (!onlyAuthor) {
            searchEngineConnector.searchArticles(search).then(function (searchResults) {
                //TODO map search results to articles

                if (author) {
                    //TODO: filter searchResults by author (where to get author field?)
                }
                //TODO add metadata and convert to search results schema (specification needed)
                resolve(searchResults);
            });
        } else { //onlyAuthor
            databaseConnector.findArticlesByAuthor(author).then(function (articles) {
                //TODO add content snippet?
                resolve(articles);
            });
        }
    });
};
