var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    author: {
        name: {type: String, default: ''},
        email: {type: String, default: ''}
    },
    lastChangedBy: {
        name: {type: String, default: ''},
        email: {type: String, default: ''}
    },
    documents: [{
        filetype: String,
        name: String,
        path: String
    }],
    lastChanged: Date,
    title: {type: String, default: ""},
    isTemporary: {type: Boolean, default: true}
});

ArticleSchema.pre('save', function (next) {
    this.lastChanged = Date.now();
    next();
});

var articleSchemaToResponseArticle = function(articleSchema) {
    var responseArticle = articleSchema.toJSON();
    responseArticle.id = responseArticle._id;
    delete responseArticle._id;
    delete responseArticle.__v;
    responseArticle.documents.forEach(function(document, index) {
        delete document._id;
        if (articleSchema.documents[index].containsSearchText) {
            document.containsSearchText = true;
        }
    });


    if (articleSchema.text) {
        responseArticle.text = articleSchema.text;
    }

    responseArticle.lastChanged = responseArticle.date = new Date(articleSchema.lastChanged).getTime();
    return responseArticle;

};


var multipleArticleSchemaToResponseArticles = function(articleSchemas) {
    var responseArticles = [];
    articleSchemas.forEach(function (articleSchema) {
        responseArticles.push(articleSchemaToResponseArticle(articleSchema));
    });
    return responseArticles;
};

module.exports = {
    Article: mongoose.model('Article', ArticleSchema),
    articleSchemaToResponseArticle: articleSchemaToResponseArticle,
    multipleArticleSchemaToResponseArticles: multipleArticleSchemaToResponseArticles
};
