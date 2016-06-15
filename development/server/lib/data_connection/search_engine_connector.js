/**
 * Search engine wrapper that is used in order to communicate with the search engine. This is the only module which may access the search engine api directly.
 *
 * @module lib/search_engine_connector
 * @author Vladislav Chumak
 */

'use strict';

var config = require(__dirname + '/../config/config');
var request = require('request');
var path = require('path');
var PromiseLib = require("promise");

var uri = config.oss.protocol + '://' + config.oss.hostname + ':' + config.oss.port;

var searchEngineConnector = module.exports = {};

/**
 * Instructs the search engine to update its search index.
 *
 * @function updateIndex
 * @static
 */
searchEngineConnector.updateIndex = function () {
    var apiUrl = uri + '/services/rest/crawler/file/run/once/' + config.oss.indexName + '/json';
    request(apiUrl, function (error, response, body) {
        if (!error) {
            var crawlerResponse = JSON.parse(body);
            if (!crawlerResponse || !crawlerResponse.successful) {
                console.log(new Error('Could not push Search Engine Crawler to index new article contents: request to search engine was unsuccessful'));
            }
        } else {
            console.log(error);
        }
    });
};

/**
 * Represents a single search result entry for a search query. The entry references a file on the file system which was matched to the search query by search engine.
 *
 * @typedef SearchResultEntry
 * @property {number} id - ID of the article.
 * @property {string} filename - Name of the file which matches the search query.
 * @property {string} text - The snippet of the file content which contains the matched text for the search query. The matched key words are wrapped in &lt;b&gt;.
 */

/**
 * Searches articles by key words.
 *
 * @function searchArticles
 * @static
 * @param {string} q - The search query which contains the key words.
 * @returns {Promise<module:lib/search_engine_connector~SearchResultEntry|Error>} Search results
 */
searchEngineConnector.searchArticles = function (q) {
    return new PromiseLib(function (resolve, reject) {
        var apiUrl = uri + '/services/rest/index/' + config.oss.indexName + '/search/field/' + config.oss.queryName;
        var requestData = {
            "query": q
        };

        request({
            url: apiUrl,
            method: "POST",
            json: requestData
        }, function (err, response, body) {
            if (err) {
                reject(err);
            } else {
                // var searchQueryResponse = JSON.parse(body);
                //body is already a parsed json for some reason...
                if (!body || !body.successful) {
                    reject('Search query could not be processed: request to search engine was unsuccessful');
                } else if (!Array.isArray(body.documents)) {
                    resolve([]);
                } else {
                    var searchResult = [];
                    //original order must be preserved due to the score sorting in each search result
                    for (var i = 0; i < body.documents.length; ++i) {
                        var filepath = null;
                        var textSnippet = null;
                        var fields = body.documents[i].fields;
                        if (Array.isArray(fields)) {
                            for (var j = 0; j < fields.length; ++j) {
                                var field = fields[j];
                                if (field.fieldName && field.fieldName === 'url' && Array.isArray(field.values)) {
                                    filepath = field.values[0];
                                }
                            }
                        }

                        var snippets = body.documents[i].snippets;
                        if (Array.isArray(snippets)) {
                            for (var j = 0; j < snippets.length; ++j) {
                                var snippet = snippets[j];
                                if (snippet.fieldName && snippet.fieldName === 'content' && Array.isArray(snippet.values)) {
                                    textSnippet = snippet.values[0];
                                }
                            }
                        }

                        if (!filepath) {
                            reject('Search query could not be processed: json schema of the result is unsupported');
                        } else {
                            searchResult[i] = {
                                id: filterArticleIdFromFilePath(filepath),
                                filename: decodeURI(path.basename(filepath)),
                                text: textSnippet
                            };
                        }
                    }
                    resolve(searchResult);
                }
            }
        });
    });
};

function filterArticleIdFromFilePath(filepath) {
    var documentDir = path.dirname(filepath);
    var lastIndexOfSlash = documentDir.lastIndexOf('/');
    var lastIndexOfBackslash = documentDir.lastIndexOf('\\');
    var articleIdStartIndex = Math.max(lastIndexOfSlash, lastIndexOfBackslash) + 1;
    return documentDir.substr(articleIdStartIndex);
}
