var path = require('path');
var fs = require('fs');
var extend = require('extend');

var params = {};
if (fs.existsSync(path.join(__dirname, 'params.json'))) {
    params = require('./params.json');
}

module.exports = extend(
    {
        port: 3000,

        dbConnectionString: 'mongodb://localhost:27017/knowledgebase',

        fileLinkPrefix: "/server/",
        uploadDirPerm: 'uploads/articles',
        uploadDirTmp: 'uploads/articles_tmp',
        uploadDirOld: 'uploads/articles_old',

        articleContentFileName: 'article.html',

        oldTemporaryArticlesDeleteJobOptions: {
            intervalTimeInHours: 24,
            maxAgeInHours: 24
        },

        postBodyValidationValues: {
            maxArticleTitleLength: 1000,
            maxArticleAuthorEmailLength: 255,
            maxArticleAuthorNameLength: 1000,
        }
    }, params);