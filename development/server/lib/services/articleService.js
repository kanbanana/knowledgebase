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
    // captures author:foobar and author:'foo bar'
    var author = q.match(/author:(['"].+?['"]|[^\s]+)/i)[1];
    var onlyAuthor = q.match(/^author:(?:['"].+?['"]|[^\s]+)$/i);
    // remove author from search terms
    var search = q.replace(/(author:(?:['"].+?['"]|[^\s]+))/i, '');

    return new Promise(function (resolve, reject) {
        if (!onlyAuthor) {
            searchEngineConnector.searchArticles(search).then(function (searchResults) {
                var ids = [];
                searchResults.forEach(function(searchResult) {
                    if(!ids.contains(searchResult.id)) {
                        ids.push(searchResult.id);
                    }
                });

                databaseConnector.findArticlesByIds(ids).then(function (articles) {
                    // sort articles like search results
                    articles = articles.sort(function (a, b) {
                        return ids.indexOf(a._id+'') - ids.indexOf(b._id+'');
                    });

                    // map search results to articles
                    articles.forEach(function (article) {
                        searchResults.forEach(function (searchResult) {
                            if (article._id+'' === searchResult.id) {
                                if (searchResult.filename === config.articleContentFileName) {
                                    if (searchResult.text) {
                                        article.text = searchResult.text;
                                    } else {
                                        //TODO load snippet from fs
                                    }
                                } else {
                                    article.documents.forEach(function (document){
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

                    // filter searchResults by author
                    if (author) {
                        var spliceIndexes = [];
                        articles.forEach(function (author, id){
                            if (article.author !== author) {
                                spliceIndexes.push(id);
                            }
                        });
                        spliceIndexes.forEach(function (index){
                            articles = articles.splice(index, 1);
                        });
                    }

                    resolve(articles);
                }, reject);
            });
        } else { //onlyAuthor
            databaseConnector.findArticlesByAuthor(author).then(function (articles) {
                //TODO add content snippet?
                resolve(articles);
            });
        }
    });
};
