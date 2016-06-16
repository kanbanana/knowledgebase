/**
 * database_connector is a MongoDB facade that grants access to the data from the database
 *
 * @module lib/data_connector/database_connector
 * @author  Martin Satrman, Vladislav Chumak
 */

'use strict';

var Article = require('./models').Article;
var config = require('./../config/config');
var ObjectId = require('mongoose').Types.ObjectId;
var PromiseLib = require("promise");

var databaseConnector = {};

/**
 * Creates an empty article and saves it in the database.
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
 * Receives storage info of a document, pushs it to the list of documents of the passed article and saves the changes to the database.
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
 * Saves the passed article to the database.
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
 * Tries to find the article with the given ID.
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
 * Tries to find all articles with the given IDs. The result contains all found articles. If there's no article for one of the IDs, that one just doesn't appear in the result (the function doesn't fail because of that).
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
 * Gets all articles whose author- or last-changed-name is the one passed in as parameter.
 * The name gets matched by the regex ".*[author.name].*"
 *
 * @function findArticlesByAuthor
 * @static
 *
 * @param {string} author -  author name
 * @returns {Promise<module:lib/search_engine_connector~ArticleSchema[]|Error>} found articles
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
 * Finds all articles that are not marked with the temporary flag. The result contains their IDs.
 *
 * @function findAllPermArticleIds
 * @static
 *
 * @returns {Promise<string[]|Error>} found articles IDs
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
 * Deletes all old temporary articles from the database.
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
 * Deletes the article with the given ID.
 *
 * @function deleteArticles
 * @static
 *
 * @param {string} articleId
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

module.exports = databaseConnector;