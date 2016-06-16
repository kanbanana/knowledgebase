/**
 * Mongo-DB schema container.
 *
 * @module lib/data_connector/models
 * @author  Martin Satrman, Vladislav Chumak
 */

'use strict';

var mongoose = require('mongoose');


/**
 * @typedef uploadDocument
 * @property {string}  name - file name
 * @property {string} path - web link
 * @property {string} filetype - file extension without dot
 *
 */
var uploadDocument = {
    filetype: String,
    name: String,
    path: String
};


/**
 * MongoDb Article schema holds all necessary information of a article.
 *
 * @typedef ArticleSchema
 *
 * @property  {object} author - object has name and e-mail
 * @property  {string} author.name - author name
 * @property  {string} author.email - author e-mail
 * @property  {object} lastChangedBy - Last person who has changed the article
 * @property  {string} lastChangedBy.name - Name of last person who has changed the article
 * @property  {string} lastChangedBy.email - E-mai last person who has changed the article
 * @property {uploadDocument[]} documents - list of all linked files
 * @property {Date} lastChangedBy - Last save date
 * @property {string} title - Title of the article
 * @property {string} text - Text/Content of the article
 * @property {boolean} isTemporary - true after first save
 */
var ArticleSchema = new mongoose.Schema({
    author: {
        name: {type: String, default: ''},
        email: {type: String, default: ''}
    },
    lastChangedBy: {
        name: {type: String, default: ''},
        email: {type: String, default: ''}
    },

    documents: [uploadDocument],
    lastChanged: Date,
    title: {type: String, default: ""},
    isTemporary: {type: Boolean, default: true}
});


// Sets the lastChanged Date every time before saving
ArticleSchema.pre('save', function (next) {
    this.lastChanged = Date.now();
    next();
});


/**
 *
 * "articleSchemaToResponseArticle" gets an article mongoDb object and strips all mongo-methods and mongo-tags.
 * @static
 * @param {ArticleSchema} articleSchema
 *
 * @returns {ArticleSchema} - striped articleSchema
 */
var articleSchemaToResponseArticle = function (articleSchema) {
    var responseArticle = articleSchema.toJSON();

    responseArticle.id = responseArticle._id;
    delete responseArticle._id;
    delete responseArticle.__v;
    responseArticle.documents.forEach(function (document, index) {
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

/**
 *
 * "multipleArticleSchemaToResponseArticles" gets a list of article mongoDb objects and strips all mongo-methods and mongo-tags.
 *  @static
 *
 * @param {ArticleSchema[]} articleSchemas
 *
 * @returns {ArticleSchema[]} - striped list of articleSchema
 */
var multipleArticleSchemaToResponseArticles = function (articleSchemas) {
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

