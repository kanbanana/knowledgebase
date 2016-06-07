module.exports =
{
    port: 3000,

    dbConnectionString: process.env.MONGODB || 'mongodb://' + (process.env.DATABASE_ADDR || 'localhost') + ':' + (process.env.DATABASE_PORT || '27017') + '/knowledgebase',

    fileLinkPrefix: "/server/",
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

    postBodyValidationValues: {
        maxArticleTitleLength: 1000,
        maxArticleAuthorEmailLength: 255,
        maxArticleAuthorNameLength: 1000
    }
};
