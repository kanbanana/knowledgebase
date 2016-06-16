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
 * "createArticle" creates an empty article document in the mongodb
 *
 * @function createArticle
 * @static
 *
 * @returns {Promise<module:lib/search_engine_connector~ArticleSchema|Error>} empty Article
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

/**
 * "addDocumentToArticle" gets storeage info of a document and pushs it to the article document list
 *
 * @function addDocumentToArticle
 * @static
 *
 * @param {module:lib/search_engine_connector~ArticleSchema} article
 * @param {module:lib/search_engine_connector~uploadDocument} storageInfo
 * @returns {Promise<module:lib/search_engine_connector~uploadDocument|Error>} upload Document
 */
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

/**
 * "saveArticle" saves a article to te mongo db
 *
 * @function saveArticle
 * @static
 *
 * @param {module:lib/search_engine_connector~ArticleSchema} article
 * @returns {Promise<module:lib/search_engine_connector~ArticleSchema|Error>} upload Document
 */
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

/**
 * "findArticleById" finds an article in the mongo db by the mongo _id
 *
 * @function findArticleById
 * @static
 *
 * @param {string} id -  mongoDB _id
 * @returns {Promise<module:lib/search_engine_connector~ArticleSchema|Error>} found article
 */
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

/**
 * "findArticleByIds" finds a list of articles in the mongo db by the mongo _id
 *
 * @function findArticleByIds
 * @static
 *
 * @param {string[]} ids -  mongoDB _id list
 * @returns {Promise<module:lib/search_engine_connector~ArticleSchema[]|Error>} found articles
 */
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

/**
 * "findArticlesByAuthor" finds an article in the mongo db by the author- or lastChangedBy-name.
 * The name gets matched by a regex ".*[author.name].*"
 *
 * @function findArticlesByAuthor
 * @static
 *
 * @param {string} author -  author name
 * @returns {Promise<module:lib/search_engine_connector~ArticleSchema[]|Error>} found article
 */
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

/**
 * "findAllPermArticleIds" finds all not temp articles and returns there ids
 *
 * @function findAllPermArticleIds
 * @static
 *
 * @returns {Promise<string[]|Error>} found articles ids
 */
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

/**
 * "deleteTemporaryArticlesOlderThan" deletes all old temp articles in the mongo db
 *
 * @function deleteTemporaryArticlesOlderThan
 * @static
 *
 * @param {Number} ageInHours - min age of articles
 * @returns {Promise<module:lib/search_engine_connector~ArticleSchema[]|Error>} deleted articles ids
 */
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

/**
 * "deleteArticles" deletes an article
 *
 * @function deleteArticles
 * @static
 *
 * @param {string} articleId - mongo DB id
 * @returns {*|exports|module.exports}
 */
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
