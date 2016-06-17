module.exports =
{
    port: process.env.PORT || 3000,

    dbConnectionString: process.env.MONGODB || 'mongodb://' + (process.env.DATABASE_ADDR || 'localhost') + ':' + (process.env.DATABASE_PORT || '27017') + '/knowledgebase',

    fileLinkPrefixPerm: '/files/articles/',
    fileLinkPrefixTemp: '/files/articles_tmp/',
    uploadDirPerm: 'uploads/articles',
    uploadDirTmp: 'uploads/articles_tmp',
    uploadDirOld: 'uploads/articles_old',

    temporaryUploadDir: 'uploads_temp/',
    whitelistWithDocumentMimeTypes: [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/pdf',
        'text/plain'],

    articleContentFileName: 'article.html',

    oldTemporaryArticlesDeleteJobOptions: {
        intervalTimeInHours: 24,
        maxAgeInHours: 24
    },

    emptyArticlesDeleteJobOptions: {
        intervalTimeInHours: 24
    },

    oss: {
        uri: 'http' + '://' + (process.env.OSS_ADDR || 'localhost') + ':' + (process.env.OSS_PORT || 9090),
        indexName: 'file_index',
        queryName: 'search'
    }
};
