/**
 * Mongo-DB connector is a MongoDB facade
 *
 * @module lib/data_connector/database_connector
 * @author  Martin Satrman, Vladislav Chumak
 */

'use strict';

var Article = require('./models').Article;
var config = require('./../config/config');
var ObjectId = require('mongoose').Types.ObjectId;
var PromiseLib = require("promise");

var databaseConnector = module.exports = {};

/**
 * @function createArticle
 * @static
 *
 * @returns {*|exports|module.exports}
 */
databaseConnector.createArticle = function () {
    return new PromiseLib(function (resolve, reject) {
        var newArticle = new Article();
        //newArticle.documents = [];
        newArticle.save(function (err) {
            if (!err) {
                resolve(newArticle);
            }

            reject(err);
        });
    });
};

databaseConnector.addDocumentToArticle = function (article, storageInfo) {
    return new PromiseLib(function (resolve, reject) {
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
    return new PromiseLib(function (resolve, reject) {
        article.save(function (error) {
            if (error) {
                return reject(error);
            }
            resolve(article);
        });
    });

};

databaseConnector.findArticleById = function (id) {
    return new PromiseLib(function (resolve) {
        if (!ObjectId.isValid(id)) {
            resolve(null);
        }

        Article.findById(id).exec(function (err, result) {
            resolve(result);
        });
    });
};

databaseConnector.findArticlesByIds = function (ids) {
    return new PromiseLib(function (resolve, reject) {
        var inIds = [];
        ids.forEach(function (id) {
            if (ObjectId.isValid(id)) {
                inIds.push(id);
            }
        });

        var queryOptions = {_id: {$exists: true, $in: inIds}};
        Article.find(queryOptions, function (err, result) {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};

databaseConnector.findArticlesByAuthor = function (author) {
    return new PromiseLib(function (resolve, reject) {
        var queryOptions = {
            $or: [
                {'author.name': new RegExp('.*' + author + '.*', 'i')},
                {'lastChangedBy.name': new RegExp('.*' + author + '.*', 'i')}
            ]
        };
        Article.find(queryOptions, function (err, result) {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};

databaseConnector.findAllPermArticleIds = function () {
    return new PromiseLib(function (resolve, reject) {
        Article.find({isTemporary: false}, function (findErr, result) {
            if (findErr) {
                return reject(findErr);
            }

            var idArray = [];

            result.forEach(function (item) {
                idArray.push(item._id + '');
            });

            resolve(idArray);
        });
    });
};

databaseConnector.deleteTemporaryArticlesOlderThan = function (ageInHours) {
    if (ageInHours <= 0) {
        return PromiseLib.reject(new Error("ageInHours must be higher than 0"));
    }

    var date = new Date();
    date.setHours(date.getHours() - ageInHours);

    return new PromiseLib(function (resolve, reject) {
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
    return new PromiseLib(function (resolve, reject) {
        var queryOptions = {_id: articleId};
        Article.remove(queryOptions, function (deleteErr) {
            if (deleteErr) {
                return reject(deleteErr);
            }

            resolve();
        });
    });
};
