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

/**
 * Callback for file and error handling.
 *
 * @callback fileErrorCallback
 * @param {Error} error - The error of the search operation.
 * @param {string} currentFilename - The path plus file name to a file.
 */

/**
 * Callback for file handling.
 *
 * @callback fileCallback
 * @param {string} currentFilename - The path plus file name to a file.
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
                self.fullNameOfOldArticleContentFile = path.join(self.oldFolderPath, self.articleId + config.articleContentFileName);
                self.fullNameOfCurrentArticleContentFile = path.join(self.permFolderPath, self.articleId + config.articleContentFileName);

            }

            cb(err);
        });
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
 * "saveDocument" saves the the uploaded file to the Aricle.
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

/**
 * "readArticleContent" reads an article file and returns the extracted body content
 *
 * @function readArticleContent
 * @static
 *
 * @param {string} articleId - mongoDB id
 * @returns {Promise<String|Error>} Returns an error or null
 */
fileSystemConnector.readArticleContent = function (articleId) {
    articleId += '';
    var pathContainer = new PathContainer(articleId);
    return new PromiseLib(function (resolve, reject) {
        pathContainer.loadPaths(function (err, permFolder) {
            var contentFilePath = pathContainer.fullNameOfCurrentArticleContentFile;
            fs.readFile(contentFilePath, function (err, contentBuffer) {
                if (err) {
                    return reject(err);
                }
                resolve(fileSystemConnector.extractHTMLBodyContent(contentBuffer.toString()));
            });
        });
    });
};

/**
 * "readOldArticleContentAndTitle" reads an old article file and returns the extracted body content
 *
 * @function readOldArticleContentAndTitle
 * @static
 *
 * @param {string} articleId - mongoDB id
 * @returns {Promise<module:lib/search_engine_connector~ArticleSchema|Error>} Returns an error or null
 */
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

/**
 * "extractHTMLTitleContent" extracts the content of the title tag
 *
 * @function extractHTMLTitleContent
 * @static
 *
 * @param {string} content - HTML content
 * @returns {string} Returns the HTML page title
 */
fileSystemConnector.extractHTMLTitleContent = function (content) {
    var reg = /(<\s*title\s*>)((.|\n)*)(<\/\s*title\s*>)/;

    var regCleanUp = /<(\/)?\s*[^>]+\s*>/g;

    content.replace(reg, function (match, bodyStartTag, bodyContent) {
        content = bodyContent;
    });

    return content.replace(regCleanUp, '');
};

/**
 * "wrapContentInHTMLBody" wraps a string in a HTML body and a title in the head.title tag
 *
 * @function wrapContentInHTMLBody
 * @static
 *
 * @param {string} content - HTML body content
 * @param {string} title - HTML title
 * @returns {string} Returns the HTML page
 */
fileSystemConnector.wrapContentInHTMLBody = function (content, title) {
    return "<html><head><title>" + title + "</title></head><body>" + content + "</body></html>";
};

/**
 * "extractHTMLBodyContent" extracts the content of the body tag.
 *
 * @function extractHTMLBodyContent
 * @static
 *
 * @param {string} content - HTML content
 * @returns {string} Returns the HTML page body content
 */
fileSystemConnector.extractHTMLBodyContent = function (content) {
    var reg = /(<\s*body\s*>)((.|\n)*)(<\/\s*body\s*>)/;
    var regCleanUp = /<(\/)?\s*body\s*>/g;

    content.replace(reg, function (match, bodyStartTag, bodyContent) {
        content = bodyContent;
    });

    return content.replace(regCleanUp, '');
};

/**
 * "getPathToDocumentUnsafe" returns the path to an document will not create folder if not exists.
 *
 * @function getPathToDocumentUnsafe
 * @static
 *
 * @param {module:lib/search_engine_connector~ArticleSchema} article
 * @param {module:lib/search_engine_connector~uploadDocument} document
 * @returns {string} Returns absolute path to an article document
 */
fileSystemConnector.getPathToDocumentUnsafe = function (article, document) {
    var filePath;
    if (article.isTemporary) {
        filePath = getTempFolderForArticle(article._id);
    } else {
        filePath = getPermFolderForArticle(article._id);
    }

    return path.join(filePath, document.name + '.' + document.filetype);
};

/**
 * "deleteDocument" removes any file by a given path
 *
 * @function deleteDocument
 * @static
 *
 * @param {string} filePath - path to file
 * @returns {Promise<Boolean|Error>} Returns an error or true
 */
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

/**
 * "deleteArticle" deletes all files belonging to an article
 *
 * @function deleteArticle
 * @static
 *
 * @param {string} articleId - mongoDB id
 * @returns {Promise<Error>} Returns an error or null
 */
fileSystemConnector.deleteArticle = function (articleId) {
    var pathContainer = new PathContainer(articleId);

    return new PromiseLib(function (resolve, reject) {
        asyncLib.series([pathContainer.loadPaths.bind(pathContainer),
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

/**
 * "isArticleFileExists" checks if an article HTML file exists
 *
 * @function isArticleFileExists
 * @static
 *
 * @param {string} articleId - mongoDB id
 * @returns {Promise<boolean|Error>} Returns true if file exists of false if not. Error.
 */
fileSystemConnector.isArticleFileExists = function (articleId) {
    var pathContainer = new PathContainer(articleId);
    var isExists;
    return new PromiseLib(function (resolve, reject) {
        asyncLib.series([pathContainer.loadPaths.bind(pathContainer),
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

/**
 * "getFilenameLike" checks if file already exists. If file exists adds an number on the end of the file
 *
 * @param {string} pathToFile - origin file path with name
 * @param {fileCallback} cb
 */
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

/**
 * "getPermFolderForArticle" returns the path to the perm folder of an article. If folder not exists it will create the folder.
 *
 * @param {string} articleId - mongoDB id
 * @param {fileErrorCallback} cb
 *
 * @return {string} Path to perm folder of article
 */
function getPermFolderForArticle(articleId, cb) {
    return getFolderForArticle(articleId, config.uploadDirPerm, cb);
}

/**
 * "getPermFolderForArticle" returns the path to the temp folder of an article. If folder not exists it will create the folder.
 *
 * @param {string} articleId - mongoDB id
 * @param {fileErrorCallback} cb
 *
 * @return {string} Path to temp folder of article
 */
function getTempFolderForArticle(articleId, cb) {
    return getFolderForArticle(articleId, config.uploadDirTmp, cb);
}

/**
 * "getPermFolderForArticle" returns the path to the old folder of an article. If folder not exists it will create the folder.
 *
 * @param {string} articleId - mongoDB id
 * @param {fileErrorCallback} cb
 *
 * @return {string} Path to old folder of article
 */
function getOldFolderForArticle(articleId, cb) {
    return getFolderForArticle(articleId, config.uploadDirOld, cb);
}

/**
 * "getPermFolderForArticle" returns the path to a folder of an article. If folder not exists it will create the folder.
 *
 * @param {string} articleId - mongoDB id
 * @param {string} uploadDir - upload dir snippet
 * @param {fileErrorCallback} cb
 *
 * @return {string} Path to the folder of article
 */
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
