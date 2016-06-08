var Article = require('./models').Article;
var config = require('./../config/config');
var path = require('path');

var databaseConnector = module.exports = {};

databaseConnector.createArticle = function () {
    return new Promise(function (resolve, reject) {
        var newArticle = new Article();
        //newArticle.documents = [];
        newArticle.save(function (err) {
            if (!err) {
                resolve(newArticle)
            }

            reject(err)
        });
    });
};

databaseConnector.addDocumentToArticle = function (article, storageInfo) {
    return new Promise(function (resolve, reject) {
        article.documents.push(storageInfo);
        article.save(function (err) {
            if (err) {
                return reject(err);
            }

            resolve(storageInfo);
        });
    });
};

databaseConnector.saveArticle = function (article) {
    return new Promise(function (resolve, reject) {
        article.save(function (error) {
            if (error) {
                return reject(error);
            }
            resolve(article);
        });
    });

};

databaseConnector.findArticleById = function (id) {
    return new Promise(function (resolve, reject) {
        Article.findById(id).exec(function (err, result) {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};

databaseConnector.deleteTemporaryArticlesOlderThan = function (ageInHours) {
    var date = new Date();
    date.setHours(date.getHours() - ageInHours);

    return new Promise(function (resolve, reject) {
        var queryOptions = {lastChanged: {$lt: date}, isTemporary: true};
        Article.find(queryOptions, function (findErr, result) {
            if (findErr) {
                return reject(findErr);
            }

            Article.remove(queryOptions, function (deleteErr) {
                if (deleteErr) {
                    return reject(deleteErr);
                }

                resolve(result);
            });
        });
    });
};

databaseConnector.deleteArticles = function (articleId) {
    return new Promise(function (resolve, reject) {
        var queryOptions = {_id: articleId};
        Article.remove(queryOptions, function (deleteErr) {
            if (deleteErr) {
                return reject(deleteErr);
            }

            resolve();
        });
    });
};



