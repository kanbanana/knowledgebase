/**
 * This module is the main article services. It servas all actions tho the db and file connector.
 *
 * @module lib/router/article
 * @author Martin Starman, Vladislav Chumak
 */

'use strict';

var asyncLib = require('async');
var fileSystemConnector = require('../data_connection/file_system_connector');
var databaseConnector = require('../data_connection/database_connector');
var searchEngineConnector = require('../data_connection/search_engine_connector');
var config = require('../config/config');
var path = require('path');
var PromiseLib = require("promise");

var articleService = module.exports = {};

/**
 * "createArticle" creates an empty article document in the mongodb
 *
 * @function createArticle
 * @static
 *
 * @returns {Promise<module:lib/search_engine_connector~ArticleSchema|Error>} empty Article
 */
articleService.createArticle = function () {
    return databaseConnector.createArticle();
};

/**
 * "saveArticle" saves the content article in the file and ith the DB. The content gets wraps the actual text in
 * a HTML body and puts the title in the HTML head. If the article is temporary the files get copied from
 * the temp folder to the active folder.
 *
 * @param {module:lib/data_connector/models~ArticleSchema} article - current mongoDB object
 * @param {string} content - text of the article as html
 * @param {string} title - article content
 * @param {object} author - last changing author
 * @returns {Promise<module:lib/data_connector/models~ArticleSchema|Error>}
 */
articleService.saveArticle = function (article, title, content, author) {
    return new PromiseLib(function (resolve, reject) {
        var authorName = '';
        var authorMail = '';
        if (author) {
            authorName = author.name || '';
            authorMail = author.email || '';
        }

        content = fileSystemConnector.wrapContentInHTMLBody(content, title);
        fileSystemConnector.saveContent(article._id, content, article.isTemporary).then(function () {
            updateArticle(article, title, authorName, authorMail);
            databaseConnector.saveArticle(article).then(resolve, reject);
            searchEngineConnector.updateIndex();
        }, reject);
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
articleService.findArticleById = function (id) {
    return databaseConnector.findArticleById(id);
};

/**
 * "saveDocument" saves the uploaded file to the article.
 *
 * @function saveDocument
 * @static
 *
 * @param {module:lib/data_connector/models~uploadDocument} document - text of the article as html
 * @param {module:lib/data_connector/models~ArticleSchema} article
 * @returns {Promise<module:lib/data_connector/models~ArticleSchema|Error>}
 */
articleService.saveDocument = function (article, document) {
    return new PromiseLib(function (resolve, reject) {
        fileSystemConnector.saveDocument(document, article._id, article.isTemporary).then(function (storageInfo) {
            databaseConnector.addDocumentToArticle(article, storageInfo).then(resolve, reject);
            searchEngineConnector.updateIndex();
        }, reject);
    });
};

/**
 * "saveDocuments" saves the uploaded files to the article.
 *
 * @function saveDocuments
 * @static
 *
 * @param {module:lib/data_connector/models~uploadDocument[]} documents - text of the article as html
 * @param {module:lib/data_connector/models~ArticleSchema} article
 * @returns {Promise<module:lib/data_connector/models~ArticleSchema|Error>}
 */
articleService.saveDocuments = function (article, documents) {
    var storageInfoList = [];
    return new PromiseLib(function (resolve, reject) {
        asyncLib.eachSeries(documents, function (item, cb) {
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

/**
 * "getArticleContent" reads an article file and returns the extracted body content
 *
 * @function getArticleContent
 * @static
 *
 * @param {string} articleId - mongoDB id
 * @returns {Promise<String|Error>} Returns an error or null
 */
articleService.getArticleContent = function (articleId) {
    return new PromiseLib(function(resolve) {
        fileSystemConnector.readArticleContent(articleId).then(function(content) {
            resolve(content);
        }, function() {
            resolve('');
        });
    });
};

/**
 * "getOldArticleContentAndTitle" reads an old article file and returns the extracted body content
 *
 * @function getOldArticleContentAndTitle
 * @static
 *
 * @param {string} articleId - mongoDB id
 * @returns {Promise<module:lib/search_engine_connector~ArticleSchema|Error>} Returns an error or null
 */
articleService.getOldArticleContentAndTitle = function(articleId) {
    return new PromiseLib(function(resolve) {
        fileSystemConnector.readOldArticleContentAndTitle(articleId).then(function(contentAndTitle) {
            resolve(contentAndTitle);
        }, function() {
            resolve('');
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
articleService.deleteArticle = function(articleId){
    var promiseList = [
        fileSystemConnector.deleteArticle(articleId),
        databaseConnector.deleteArticles(articleId)
    ];

    return PromiseLib.all(promiseList).then(function () {
        searchEngineConnector.updateIndex();
    });
};

/**
 * "deleteDocument" removes a document form the filesystem and from the db.
 *
 * @function deleteDocument
 * @static
 *
 * @param {module:lib/search_engine_connector~ArticleSchema} article
 * @param {string} filename
 * @returns {Promise<Boolean|Error>} Returns an error or true
 */
articleService.deleteDocument = function(article, filename){
    var document = removeFileFromArticle(article, filename);
    if (!document) {
        return PromiseLib.reject(new Error('Document not found'));
    }
    var docPath = fileSystemConnector.getPathToDocumentUnsafe(article, document);

    var promiseList = [
        fileSystemConnector.deleteDocument(docPath),
        databaseConnector.saveArticle(article)
    ];

    return PromiseLib.all(promiseList).then(function () {
        searchEngineConnector.updateIndex();
    });
};

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
                document.path = path.join(config.fileLinkPrefixPerm, article._id + '', document.name + '.' + document.filetype).replace(/[\\]/g, '/');
            });
        }
}

function removeFileFromArticle(article, filename) {
    var hasFound = false;
    article.documents.forEach(function(document, idx) {
        var tempFilename = document.name + "." + document.filetype;
        if(filename === tempFilename) {
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

/**
 * "searchArticles" sends an query to the OSS and sends response.
 *
 * @function searchArticles
 * @static
 *
 * @param {string} q - search query
 * @returns {Promise<module:lib/search_engine_connector~ArticleSchema[]|Error>} pass the deleteTemporaryArticlesOlderThan Promise
 */
articleService.searchArticles = function (q) {
    return new PromiseLib(function (resolve, reject) {
        // captures author:foobar and author:'foo bar'
        var author = q.match(/author:('.+?'|".+?"|[^\s'"]+)/i);
        var onlyAuthor = q.trim().match(/^author:(?:'.+?'|".+?"|[^\s'"]+)$/i);
        // remove author from search terms
        var search = q.replace(/(author:(?:'.*?'|".*?"|[^\s'"]+))/ig, '').trim();

        if (author) {
            author = author[1].replace(/["']/g, '').trim();
            if (author === '' || author.length > 1000) {
                return reject(new Error('Invalid author length'));
            }
        }

        if (!onlyAuthor) {
            if (search === '') {
                return reject(new Error('Search query may not be empty'));
            }
            searchEngineConnector.searchArticles(search).then(function (searchResults) {
                if (searchResults.length === 0) {
                    return resolve(searchResults);
                }

                var ids = [];
                searchResults.forEach(function (searchResult) {
                    if (ids.indexOf(searchResult.id) < 0) {
                        ids.push(searchResult.id);
                    }
                });

                databaseConnector.findArticlesByIds(ids).then(function (articles) {
                    // sort articles like search results
                    articles = articles.sort(function (a, b) {
                        return ids.indexOf(a._id + '') - ids.indexOf(b._id + '');
                    });

                    // filter articles by author
                    if (author) {
                        var authorRegExp = new RegExp('.*' + author + '.*', 'i');
                        articles.forEach(function (article, id) {
                            if (!article.author.name.match(authorRegExp) && !article.lastChangedBy.name.match(authorRegExp)) {
                                articles.splice(id, 1);
                            }
                        });
                    }

                    var promiseList = [];

                    // map search results to articles
                    articles.forEach(function (article) {
                        searchResults.forEach(function (searchResult) {
                            if (article._id + '' === searchResult.id) {
                                if (searchResult.filename === config.articleContentFileName) {
                                    if (searchResult.text) {
                                        article.text = searchResult.text;
                                    } else {
                                        promiseList.push(fileSystemConnector.readArticleContent(article._id).then(function (content) {
                                            article.text = content.substring(0, 200);
                                        }));
                                    }
                                } else {
                                    article.documents.forEach(function (document) {
                                        if (document.name + '.' + document.filetype === searchResult.filename) {
                                            document.containsSearchText = true;
                                            if (!article.text) {
                                                article.text = searchResult.text;
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    });

                    if (promiseList.length > 0) {
                        PromiseLib.all(promiseList).then(function (result) {
                            resolve(articles);
                        });
                    } else {
                        resolve(articles);
                    }
                }, reject);
            });
        } else { //onlyAuthor
            databaseConnector.findArticlesByAuthor(author).then(function (articles) {
                var promiseList = [];

                articles.forEach(function (article) {
                    promiseList.push(fileSystemConnector.readArticleContent(article._id).then(function (content) {
                        article.text = content.substring(0, 200);
                    }));
                });

                if (promiseList.length > 0) {
                    PromiseLib.all(promiseList).then(function (result) {
                        resolve(articles);
                    });
                } else {
                    resolve(articles);
                }
            });
        }
    });
};

/**
 * "getArticlesByIds" finds a list of articles in the mongo db by the mongo _id
 *
 * @function getArticlesByIds
 * @static
 *
 * @param {string[]} ids -  mongoDB _id list
 * @returns {Promise<module:lib/search_engine_connector~ArticleSchema[]|Error>} found articles
 */
articleService.getArticlesByIds = function (ids) {
    return new PromiseLib(function (resolve, reject) {
        databaseConnector.findArticlesByIds(ids).then(function (articles) {
            var promiseList = [];

            articles.forEach(function (article) {
                promiseList.push(fileSystemConnector.readArticleContent(article._id).then(function (content) {
                    article.text = content.substring(0, 200);
                }));
            });

            if (promiseList.length > 0) {
                PromiseLib.all(promiseList).then(function (result) {
                    resolve(articles);
                });
            } else {
                resolve(articles);
            }
        });
    });
};

/**
 * "deleteEmptyArticles" deletes all articles in the db if no corresponding file exists (not even an article.html). This
 * is done in order to get rid of old articles that still exist if somebody deletes the files from disk.
 *
 * @function "deleteEmptyArticles"
 * @static
 *
 * @returns {Promise<module:lib/search_engine_connector~ArticleSchema[]|Error>} pass the findAllPermArticleIds Promise
 */
articleService.deleteEmptyArticles = function(cb){
    databaseConnector.findAllPermArticleIds().then(function (articleIds) {
        articleIds.forEach(function (articleId) {
            fileSystemConnector.isArticleFileExists(articleId).then(function(exists){
                if(!exists) {
                    databaseConnector.deleteArticles(articleId);
                }
            });
        });
        cb();
    });
};

/**
 * "deleteTemporaryArticles" deletes all old temporary articles. Max age gets set in the config.
 *
 * @function "deleteTemporaryArticles"
 * @static
 *
 * @returns {Promise<module:lib/search_engine_connector~ArticleSchema[]|Error>} pass the deleteTemporaryArticlesOlderThan Promise
 */
articleService.deleteTemporaryArticles = function() {
    return databaseConnector.deleteTemporaryArticlesOlderThan(config.oldTemporaryArticlesDeleteJobOptions.maxAgeInHours).then(function (articles) {
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
