var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    author: {
        name: {type: String, default: ""},
        email: {type: String, default: ""}
    },
    lastChangedBy: {
        name: {type: String, default: ""},
        email: {type: String, default: ""}
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

module.exports = {
    Article: mongoose.model('Article', ArticleSchema),
};
