var path = require('path');
var fs = require('fs-extra');
var config = require('../config/config');
var async = require('async');


const whitelistWithDocumentMimeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
    'text/plain'];

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
    async.eachSeries([getOldFolderForArticle, getPermFolderForArticle, getTempFolderForArticle],
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
        async.series([pathContainer.loadPaths.bind(pathContainer),
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
                fs.move(pathContainer.tempFolderPath, pathContainer.permFolderPath, cb);
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

fileSystemConnector.saveFileTemp = function (document, articleId) {
    return fileSystemConnector.saveDocument(document, articleId, true);
};

fileSystemConnector.saveDocument = function (document, articleId, isTemp) {
    articleId += '';
    return new Promise(function (resolve, reject) {
        var targetFilePathPromise;

        var saveDocumentHandler = function (err, targetDirectory) {
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
                        path: path.join(config.uploadDirPerm, articleId, fileName + fileExt),
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

fileSystemConnector.deleteArticle = function (articleId) {
    var pathContainer = new PathContainer(articleId);

    return new Promise(function (resolve, reject) {
        async.series([pathContainer.loadPaths.bind(pathContainer),
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
    async.whilst(
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
    getFolderForArticle(articleId, config.uploadPathPerm, cb);
}

function getTempFolderForArticle(articleId, cb) {
    getFolderForArticle(articleId, config.uploadPathTmp, cb);
}

function getOldFolderForArticle(articleId, cb) {
    getFolderForArticle(articleId, config.uploadPathOld, cb);
}

function getFolderForArticle(articleId, uploadPath, cb) {
    var targetFilePath = path.join(uploadPath, articleId);
    fs.mkdirs(targetFilePath, function (err) {
        cb(err, targetFilePath)
    });
}

