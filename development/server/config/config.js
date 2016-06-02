var fs = require('fs');
var extend = require('extend');
var path = require('path');

var params = {};
if (fs.existsSync(path.join(__dirname, 'params.json'))) {
    params = require('./params.json');
}

const uploadDirPerm = 'uploads/articles';
const uploadDirTmp = 'uploads/articles_tmp';
const uploadDirOld = 'uploads/articles_old';

module.exports = extend(
    {
        port: 3000,

        dbConnectionString: 'mongodb://localhost:27017/knowledgebase',

        uploadDirPerm: uploadDirPerm,
        uploadPathPerm: path.join(__projectDir, uploadDirPerm) + '/',
        uploadDirTmp: uploadDirTmp,
        uploadPathTmp: path.join(__projectDir, uploadDirTmp) + '/',
        uploadDirOld: uploadDirOld,
        uploadPathOld: path.join(__projectDir, uploadDirOld) + '/',

        articleContentFileName: 'article.html',

        oldTemporaryArticlesDeleteJobOptions: {
            intervalTimeInHours: 24,
            maxAgeInHours: 24
        }
    }, params);