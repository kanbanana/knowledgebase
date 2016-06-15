/**
 * File system connector is a fs facade
 *
 * @module lib/data_connector/file_system_connector
 * @author  Martin Satrman, Vladislav Chumak
 */

/**
 * Callback for error handling.
 *
 * @callback errorCallback
 * @param {Error} error - The error of the search operation.
 */


'use strict';

var path = require('path');
var fs = require('fs-extra');
var asyncLib = require('async');
var config = require('../config/config');
var PromiseLib = require("promise");

/**
 * PathContainer is the constructor of a private object.
 * The PathContainer object has all the path to the article folders.
 * The folder paths have to be loaded asyc
 *
 * @param {string|Object} articleId - A MongoDB article id (_id)
 * @constructor
 */
function PathContainer(articleId) {
    this.articleId = articleId + '';
    this.oldFolderPath = null;
    this.permFolderPath = null;
    this.tempFolderPath = null;
    this.fullNameOfOldArticleContentFile = null;
    this.fullNameOfCurrentArticleContentFile = null;
}

/**
 * "loadPaths" loads all path to the directories asynchronously
 *
 * @param {errorCallback} cb
 */
PathContainer.prototype.loadPaths = function (cb) {
    var self = this;
    var list = [];
    asyncLib.eachSeries([getOldFolderForArticle, getPermFolderForArticle, getTempFolderForArticle],
        function (handler, callback) {
            handler(self.articleId, function (err, result) {
                if (!err) {
                    list.push(result);
                }

                callback(err);
            });
        }, function (err) {
            if (!err) {
                self.oldFolderPath = list[0];
                self.permFolderPath = list[1];
                self.tempFolderPath = list[2];
            }

            cb(err);
        });
};

/**
 * "loadPaths" loads all path to the article.html files asynchronously
 *
 * @param {errorCallback} cb
 */
PathContainer.prototype.loadArticleContentFilePaths = function (cb) {
    var self = this;
    self.fullNameOfOldArticleContentFile = path.join(self.oldFolderPath, config.articleContentFileName);
    self.fullNameOfCurrentArticleContentFile = path.join(self.permFolderPath, config.articleContentFileName);
    cb();
};

/**
 * "removeTempFolder" removes the temp folder asynchronously
 *
 * @param {errorCallback} cb
 */
PathContainer.prototype.removeTempFolder = function (cb) {
    this.removeFolder(this.tempFolderPath, cb);
};

/**
 * "removePermFolder" removes the current version folder asynchronously
 *
 * @param {errorCallback} cb
 */
PathContainer.prototype.removePermFolder = function (cb) {
    this.removeFolder(this.permFolderPath, cb);
};

/**
 * "removeOldFolder" removes the old version folder asynchronously
 *
 * @param {errorCallback} cb
 */
PathContainer.prototype.removeOldFolder = function (cb) {
    this.removeFolder(this.oldFolderPath, cb);
};

/**
 * "removeFolder" removes a folder asynchronously
 *
 * @param {string} pathToFolder - path to target directory
 * @param {errorCallback} cb
 */
PathContainer.prototype.removeFolder = function (pathToFolder, cb) {
    fs.exists(pathToFolder, function (exists) {
        if (exists) {
            return fs.remove(pathToFolder, cb);
        }

        cb();
    });
};

var fileSystemConnector = module.exports = {};

/**
 * "saveContent" saves the content article in the file. The content gets wraps the actual text in
 * a HTML body and puts the title in the HTML head. If the article is temporary the files get copied from
 * the temp folder to the active folder.
 *
 * @param {string| Object} articleId - MongoDB _id
 * @param {string} content - text of the article as html
 * @param {boolean} isTemporary - Is true if the article is still temporary
 * @returns {Promise<module:lib/data_connector/models~ArticleSchema|Error>}
 */
fileSystemConnector.saveContent = function (articleId, content, isTemporary) {

    var pathContainer = new PathContainer(articleId);

    return new PromiseLib(function (resolve, reject) {
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
                fs.remove(pathContainer.permFolderPath, function () {
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

/**
 * "saveDocument" saves the the uploaded file to the .
 *
 * @param {module:lib/data_connector/models~uploadDocument} document - text of the article as html
 * @param {string| Object} articleId - MongoDB _id
 * @param {boolean} isTemp - Is true if the article is still temporary
 * @returns {Promise<module:lib/data_connector/models~ArticleSchema|Error>}
 */
fileSystemConnector.saveDocument = function (document, articleId, isTemp) {
    articleId += '';
    return new PromiseLib(function (resolve, reject) {
        var fileLinkPrefix;
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
                        path: path.join(fileLinkPrefix, fileName + fileExt).replace(/[\\]/g, '/'),
                        name: fileName
                    });
                });

            });
        };


        if (isTemp) {
            fileLinkPrefix = config.fileLinkPrefixTemp + articleId;
            getTempFolderForArticle(articleId, saveDocumentHandler);
        } else {
            fileLinkPrefix = config.fileLinkPrefixPerm + articleId;
            getPermFolderForArticle(articleId, saveDocumentHandler);
        }
    });
};

fileSystemConnector.readArticleContent = function (articleId) {
    articleId += '';
    return new PromiseLib(function (resolve, reject) {
        getPermFolderForArticle(articleId, function (err, permFolder) {
            var contentFilePath = path.join(permFolder, config.articleContentFileName);
            fs.readFile(contentFilePath, function (err, contentBuffer) {
                if (err) {
                    return reject(err);
                }
                resolve(fileSystemConnector.extractHTMLBodyContent(contentBuffer.toString()));
            });
        });
    });
};

fileSystemConnector.readOldArticleContentAndTitle = function (articleId) {
    articleId += '';
    return new PromiseLib(function (resolve, reject) {
        getOldFolderForArticle(articleId, function (err, oldFolder) {
            var contentFilePath = path.join(oldFolder, config.articleContentFileName);
            fs.readFile(contentFilePath, function (err, contentBuffer) {
                var returnValue = {};
                if (err) {
                    return reject(err);
                }

                var totalHtmlContent = contentBuffer.toString();

                returnValue.text = fileSystemConnector.extractHTMLBodyContent(totalHtmlContent);
                returnValue.title = fileSystemConnector.extractHTMLTitleContent(totalHtmlContent);
                resolve(returnValue);
            });
        });
    });
};

fileSystemConnector.extractHTMLTitleContent = function (content) {
    var reg = /(<\s*title\s*>)((.|\n)*)(<\/\s*title\s*>)/;

    content.replace(reg, function (match, bodyStartTag, bodyContent) {
        content = bodyContent;
    });

    return content;
};


fileSystemConnector.wrapContentInHTMLBody = function (content, title) {
    return "<html><head><title>" + title + "</title></head><body>" + content + "</body></html>";
};

fileSystemConnector.extractHTMLBodyContent = function (content) {
    var reg = /(<\s*body\s*>)((.|\n)*)(<\/\s*body\s*>)/;

    content.replace(reg, function (match, bodyStartTag, bodyContent) {
        content = bodyContent;
    });

    return content;
};

fileSystemConnector.getPathToDocumentUnsafe = function (article, document) {
    var filePath;
    if (article.isTemporary) {
        filePath = getTempFolderForArticle(article._id);
    } else {
        filePath = getPermFolderForArticle(article._id);
    }

    return path.join(filePath, document.name + '.' + document.filetype);
};

fileSystemConnector.deleteDocument = function (filePath) {
    return new PromiseLib(function (resolve, reject) {
        fs.remove(filePath, function (err) {
            if (err) {
                return reject(err);
            }

            resolve(true);
        });
    });
};

fileSystemConnector.deleteArticle = function (articleId) {
    var pathContainer = new PathContainer(articleId);

    return new PromiseLib(function (resolve, reject) {
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

fileSystemConnector.isArticleFileExists = function (articleId) {
    var pathContainer = new PathContainer(articleId);
    var isExists;
    return new PromiseLib(function (resolve, reject) {
        asyncLib.series([pathContainer.loadPaths.bind(pathContainer),
                pathContainer.loadArticleContentFilePaths.bind(pathContainer),
                function(cb){
                    fs.exists(pathContainer.fullNameOfCurrentArticleContentFile, function(exists) {
                        isExists = exists;
                        cb();
                    });
                }
            ],
            function (err) {
                if (err) {
                    return reject(err);
                }


                resolve(isExists);
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
        function () {
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
    articleId = articleId + '';
    var uploadPath = path.join(__dirname, '..', '..', uploadDir) + '/';
    var targetFilePath = path.join(uploadPath, articleId);
    fs.mkdirs(targetFilePath, function (err) {
        if (cb) {
            cb(err, targetFilePath);
        }
    });

    return targetFilePath;
}
