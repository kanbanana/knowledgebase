/**
 * Created by Wlad on 03.06.2016.
 */
//var async = require('async');
var config = require(__dirname + '/../config/config');
var request = require('request');
var path = require('path');

var uri = config.oss.protocol + '://' + config.oss.hostname + ':' + config.oss.port;

var searchEngineConnector = module.exports = {};

//Push crawler in order to index current article contents which are resident on the file system
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

//Searches articles by key words
searchEngineConnector.searchArticles = function (q) {
    return new Promise(function (resolve, reject) {
        var apiUrl = uri + '/services/rest/index/' + config.oss.indexName + '/search/field';
        var requestData = {
            "query": q,
            "start": 0,
            "rows": 10,                         //How many results do you want?
            "operator": "AND",                     //Do not touch!
            "collapsing": {                        //Aggregate multiple findings in single file
                "max": 2,                        //Max aggregated findings, set to meaningful number
                "mode": "OFF",                    //Do not touch!
                "type": "OPTIMIZED"                //Do not touch!
            },
            "returnedFields": [                    //Get urls of findings, do not touch!
                "url"
            ],
            "snippets": [
                {
                    "field": "content",            //Get snippet from document content, do not touch!
                    "tag": "em",                //Html tag to highlight keyword in snippet
                    "separator": "...",            //Shortener for snippet, do not touch!
                    "maxSize": 200,                //Max size of snippet
                    "maxNumber": 1,                //Do not touch!
                    "fragmenter": "SENTENCE"        //Do not touch!
                }
            ],
            "enableLog": config.oss.enableLog,                    //Do not touch!
            "searchFields": [                    //Fields to search in, do not touch!
                {
                    "field": "title",
                    "mode": "TERM_AND_PHRASE",
                    "boost": 10
                },
                {
                    "field": "content",            //Do not touch!
                    "mode": "TERM_AND_PHRASE",    //Do not touch!
                    "boost": 1                    //Do not touch!
                }
            ]
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
