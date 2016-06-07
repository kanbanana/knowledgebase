/**
 * Created by Wlad on 03.06.2016.
 */
//var async = require('async');
var config = require(__dirname + '/../config/config');
var request = require('request');

var uri = config.oss.protocol + '://' + config.oss.hostname + ':' + config.oss.port;

var searchEngineConnector = module.exports = {};

//Push crawler in order to index current article contents which are resident on the file system
searchEngineConnector.pushCrawler = function () {
    return new Promise(function (resolve, reject) {
        var apiUrl = uri + '/services/rest/crawler/file/run/once/' + config.oss.indexName + '/json';
        request(apiUrl, function (error, response, body) {
            if (!error) {
                var crawlerResponse = JSON.parse(body);
                if(!crawlerResponse || !crawlerResponse.successful) {
                    reject(new Error('Could not push Search Engine Crawler to index new article contents: request to search engine was unsuccessful'));
                } else {
                    resolve();
                }
            } else {
                reject(error);
            }
        });
    });
}

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
                    "field": "title",
                    "tag": "em",
                    "separator": "...",
                    "maxSize": 50,
                    "maxNumber": 1,
                    "fragmenter": "NO"
                },
                {
                    "field": "content",            //Get snippet from document content, do not touch!
                    "tag": "em",                //Html tag to highlight keyword in snippet
                    "separator": "...",            //Shortener for snippet, do not touch!
                    "maxSize": 200,                //Max size of snippet
                    "maxNumber": 1,                //Do not touch!
                    "fragmenter": "SENTENCE"        //Do not touch!
                }
            ],
            "enableLog": false,                    //Do not touch!
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
                var searchQueryResponse = JSON.parse(body);
                if(!searchQueryResponse || !searchQueryResponse.successful) {
                    reject('Search query could not be processed: request to search engine was unsuccessful')
                } else {
                    //TODO filter not required fields?
                    resolve(searchQueryResponse);
                }
            }
        });
    });

}