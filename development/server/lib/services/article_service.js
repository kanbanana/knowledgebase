
'use strict';

var asyncLib = require('async');
var fileSystemConnector = require('../data_connection/file_system_connector');
var databaseConnector = require('../data_connection/database_connector');
var searchEngineConnector = require('../data_connection/search_engine_connector');
var config = require('../config/config');
var path = require('path');
var PromiseLib = require("promise");

var articleService = module.exports = {};

articleService.createArticle = function () {
    return databaseConnector.createArticle();
};

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

articleService.findArticleById = function (id) {
    return databaseConnector.findArticleById(id);
};

articleService.saveDocument = function (article, document) {
    return new PromiseLib(function (resolve, reject) {
        fileSystemConnector.saveDocument(document, article._id, article.isTemporary).then(function (storageInfo) {
            databaseConnector.addDocumentToArticle(article, storageInfo).then(resolve, reject);
            searchEngineConnector.updateIndex();
        }, reject);
    });
};

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

articleService.getArticleContent = function (articleId) {
    return new PromiseLib(function(resolve) {
        fileSystemConnector.readArticleContent(articleId).then(function(content) {
            resolve(content);
        }, function() {
            resolve('');
        });
    });
};

articleService.getOldArticleContentAndTitle = function(articleId) {
    return new PromiseLib(function(resolve) {
        fileSystemConnector.readOldArticleContentAndTitle(articleId).then(function(contentAndTitle) {
            resolve(contentAndTitle);
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

    return PromiseLib.all(promiseList).then(function () {
        searchEngineConnector.updateIndex();
    });
};

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

articleService.searchArticles = function (q) {
    // captures author:foobar and author:'foo bar'
    var author = q.match(/author:(['"].+?['"]|[^\s]+)/i);
    var onlyAuthor = q.match(/^author:(?:['"].+?['"]|[^\s]+)$/i);
    // remove author from search terms
    var search = q.replace(/(author:(?:['"].+?['"]|[^\s]+))/ig, '');

    if (author) {
        author = author[1].replace(/["']/g, '');
    }

    return new PromiseLib(function (resolve, reject) {
        if (!onlyAuthor) {
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
                        var spliceIndexes = [];
                        articles.forEach(function (author, id) {
                            if (article.author !== author) {
                                spliceIndexes.push(id);
                            }
                        });
                        for (var i = spliceIndexes.length - 1; i >= 0; i--) {
                            articles = articles.splice(spliceIndexes[i], 1);
                        }
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

articleService.deleteEmptyArticles = function(){
    databaseConnector.findAllPermArticleIds().then(function (articleIds) {
        articleIds.forEach(function (articleId) {
            fileSystemConnector.isArticleFileExists(articleId).then(function(exists){
                if(!exists) {
                    return databaseConnector.deleteArticles(articleId);
                }
            });
        });

    });
};


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
