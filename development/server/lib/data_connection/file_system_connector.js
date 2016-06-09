var path = require('path');
var fs = require('fs-extra');
var asyncLib = require('async');
var config = require('../config/config');

function PathContainer(articleId) {
    this.articleId = articleId + '';
    this.oldFolderPath = null;
    this.permFolderPath = null;
    this.tempFolderPath = null;
    this.fullNameOfOldArticleContentFile = null;
    this.fullNameOfCurrentArticleContentFile = null;
}

PathContainer.prototype.loadPaths = function (cb) {
    var self = this;
    var list = [];
    asyncLib.eachSeries([getOldFolderForArticle, getPermFolderForArticle, getTempFolderForArticle],
        function (handler, callback) {
            handler(self.articleId, function (err, result) {
                if (!err) {
                    list.push(result)
                }

                callback(err)
            })
        }, function (err) {
            if (!err) {
                self.oldFolderPath = list[0];
                self.permFolderPath = list[1];
                self.tempFolderPath = list[2];
            }

            cb(err)
        });
};

PathContainer.prototype.loadArticleContentFilePaths = function (cb) {
    var self = this;
    self.fullNameOfOldArticleContentFile = path.join(self.oldFolderPath, config.articleContentFileName);
    self.fullNameOfCurrentArticleContentFile = path.join(self.permFolderPath, config.articleContentFileName);
    cb();
};

PathContainer.prototype.removeTempFolder = function (cb) {
    this.removeFolder(this.tempFolderPath, cb);
};

PathContainer.prototype.removePermFolder = function (cb) {
    this.removeFolder(this.permFolderPath, cb);
};

PathContainer.prototype.removeOldFolder = function (cb) {
    this.removeFolder(this.oldFolderPath, cb);
};

PathContainer.prototype.removeFolder = function (pathToFolder, cb) {
    fs.exists(pathToFolder, function (exists) {
        if (exists) {
            return fs.remove(pathToFolder, cb);
        }

        cb();
    });
};

var fileSystemConnector = module.exports = {};

fileSystemConnector.saveContent = function (articleId, content, isTemporary) {

    var pathContainer = new PathContainer(articleId);

    return new Promise(function (resolve, reject) {
        asyncLib.series([pathContainer.loadPaths.bind(pathContainer),
            pathContainer.loadArticleContentFilePaths.bind(pathContainer),
            function (cb) {
                fs.exists(pathContainer.fullNameOfOldArticleContentFile, function (exists) {
                    if (exists) {
                        return fs.remove(pathContainer.fullNameOfOldArticleContentFile, cb);
                    }

                    cb();
                });
            },
            function (cb) {
                fs.exists(pathContainer.fullNameOfCurrentArticleContentFile, function (exists) {
                    if (exists) {
                        return fs.move(pathContainer.fullNameOfCurrentArticleContentFile, pathContainer.fullNameOfOldArticleContentFile, cb);
                    }

                    cb();
                });
            },
            function (cb) {
                if (!isTemporary) {
                    return cb();
                }
                fs.remove(pathContainer.permFolderPath, function(err) {
                    fs.move(pathContainer.tempFolderPath, pathContainer.permFolderPath, cb);
                });
            },
            function (cb) {
                fs.writeFile(pathContainer.fullNameOfCurrentArticleContentFile, content, cb);
            }
        ], function (err) {
            if (err) {
                return reject(err);
            }
            resolve(err);
        });

    });
};

fileSystemConnector.saveDocument = function (document, articleId, isTemp) {
    articleId += '';
    return new Promise(function (resolve, reject) {
        var saveDocumentHandler = function (err, targetDirectory, fileLinkPrefix) {
            if (err) {
                return reject(err);
            }
            var filenameWithExtension = document.originalname;
            var targetFilePath = path.join(targetDirectory, filenameWithExtension);

            getFilenameLike(targetFilePath, function (newTargetFilePath) {
                targetFilePath = newTargetFilePath;

                fs.move(document.path, targetFilePath, function (err) {
                    if (err) {
                        return reject(err);
                    }
                    var fileExt = path.extname(document.originalname);
                    var fileName = path.basename(targetFilePath, fileExt);
                    resolve({
                        filetype: fileExt.replace('.', ''),
                        path: path.join(fileLinkPrefix, fileName + fileExt).replace(/[\\]/g, '/'),
                        name: fileName
                    });
                });

            });
        };


        if (isTemp) {
            getTempFolderForArticle(articleId, saveDocumentHandler);
        } else {
            getPermFolderForArticle(articleId, saveDocumentHandler);
        }
    });
};

fileSystemConnector.readArticleContent = function(articleId) {
    articleId += '';
    return new Promise (function(resolve, reject) {
        getPermFolderForArticle(articleId, function (err, permFolder) {
            var contentFilePath = path.join(permFolder, config.articleContentFileName);
            fs.readFile(contentFilePath, function (err, contentBuffer) {
                if (err) {
                    return reject(err);
                }
                resolve(contentBuffer.toString());
            });
        });
    });
};

fileSystemConnector.readOldArticleContentAndTitle = function(articleId) {
    articleId += '';
    return new Promise (function(resolve, reject) {
        getOldFolderForArticle(articleId, function (err, oldFolder) {
            var contentFilePath = path.join(oldFolder, config.articleContentFileName);
            fs.readFile(contentFilePath, function (err, contentBuffer) {
                var returnValue = {};
                if (err) {
                    return reject(err);
                }
                returnValue.content = fileSystemConnector.extractHTMLBodyContent(contentBuffer.toString());
                returnValue.title = ''; // TODO: MARTIN - insert logic for extracting title from content
                resolve(returnValue);
            });
        });
    });
};

fileSystemConnector.wrapContentInHTMLBody = function(content, title) {
    return "<html><head><title>" + title + "</title></head><body>" + content + "</body></html>";
};

fileSystemConnector.extractHTMLBodyContent = function(content) {
    var reg = /(<\s*body\s*>)((.|\n)*)(<\/\s*body\s*>)/;

    content.replace(reg, function(match, bodyStartTag, bodyContent){
        content = bodyContent;
    });

    return content;
};

fileSystemConnector.getPathToDocumentUnsafe = function(article, document) {
    var filePath;
    if(article.isTemporary) {
        filePath = getTempFolderForArticle(article._id);
    } else {
        filePath = getPermFolderForArticle(article._id);
    }

    return path.join(filePath, document.name + '.' + document.filetype)
};

fileSystemConnector.deleteDocument = function(filePath) {
    return new Promise(function(resolve, reject){
        fs.remove(filePath, function(err){
           if(err) {
               return reject(err);
           }

            resolve(true);
        });
    });
};

fileSystemConnector.deleteArticle = function (articleId) {
    var pathContainer = new PathContainer(articleId);

    return new Promise(function (resolve, reject) {
        asyncLib.series([pathContainer.loadPaths.bind(pathContainer),
                pathContainer.loadArticleContentFilePaths.bind(pathContainer),
                pathContainer.removeOldFolder.bind(pathContainer),
                pathContainer.removePermFolder.bind(pathContainer),
                pathContainer.removeTempFolder.bind(pathContainer)],
            function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(err);
            });

    });

};

function getFilenameLike(pathToFile, cb) {
    var extension = path.extname(pathToFile);
    var filenameWithoutExtension = path.basename(pathToFile, extension);
    var dirname = path.dirname(pathToFile);
    var globalExists = true;
    var currentFilename = pathToFile;
    var i = 0;
    asyncLib.whilst(
        function () {
            return globalExists;
        },
        function (callback) {
            if (i > 0) {
                currentFilename = path.join(dirname, filenameWithoutExtension + ' (' + i + ')' + extension);
            }
            fs.exists(currentFilename, function (exists) {
                globalExists = exists;
                i++;
                callback();
            });
        },
        function (err, n) {
            cb(currentFilename);
        }
    );
}

function getPermFolderForArticle(articleId, cb) {
    return getFolderForArticle(articleId, config.uploadDirPerm, cb);
}

function getTempFolderForArticle(articleId, cb) {
    return getFolderForArticle(articleId, config.uploadDirTmp, cb);
}

function getOldFolderForArticle(articleId, cb) {
    return getFolderForArticle(articleId, config.uploadDirOld, cb);
}

function getFolderForArticle(articleId, uploadDir, cb) {
    articleId = articleId+'';
    var uploadPath = path.join(__dirname, '..', '..', uploadDir) + '/';
    var targetFilePath = path.join(uploadPath, articleId);
    var targetFileLink = path.join(config.fileLinkPrefix, uploadDir, articleId);
    fs.mkdirs(targetFilePath, function (err) {
        if(cb) {
            cb(null, targetFilePath, targetFileLink); //TODO: fixme first param should be error
        }
    });

    return targetFilePath
}
