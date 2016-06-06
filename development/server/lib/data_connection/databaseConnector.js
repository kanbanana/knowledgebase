var Article = require(__dirname + '/models').Article;
var config = require(__dirname + '/../config/config');
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

databaseConnector.addDocumentToArticle = function(article, storageInfo) {
    return new Promise(function (resolve, reject) {
        article.documents.push(storageInfo);
        article.save(function (err) {
            if(err) {
                return reject(err);
            }

            resolve(storageInfo);
        });
    });
};

databaseConnector.saveArticle = function (article, title, authorName, authorMail) {
    return new Promise(function (resolve, reject) {
        article.title = title;
        if (!article.author.name && !article.author.email) {
            article.author.name = authorName;
            article.author.email = authorMail;
        }

        article.lastChangedBy.name = authorName;
        article.lastChangedBy.email = authorMail;
        article.isTemporary = false;

        article.documents.forEach(function(document) {
            document.path = path.join(config.fileLinkPrefix, config.uploadDirPerm, article._id + '', document.name + '.' + document.filetype).replace(/[\\]/g, '/');
        });

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

databaseConnector.findArticleByAuthor = function (author) {
    return new Promise(function (resolve, reject) {
        var queryOptions = {'author.name': new RegExp('.*' + author + '.*', 'i')};
        Article.find(queryOptions, function (findErr, result) {
            if (findErr) {
                return reject(findErr);
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
