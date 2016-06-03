require('../server');
var model = require('../data_connection/databaseConnector');
var artService = require('../services/articleService');
var process = require('process');
var fs = require('fs-extra');

model.createArticle().then(function (aticle) {
    fs.copySync(__dirname + "/test.pdf", __dirname + "/test1.pdf");
    var document = {
        filename: "test1",
        originalname: "test.pdf",
        path: __dirname + "/test1.pdf"
    };

    artService.saveDocument(aticle, document).then(function () {
        fs.copySync(__dirname + "/test.pdf", __dirname + "/test1.pdf");

        artService.saveDocument(aticle, document).then(function () {
            console.log("done");
            process.exit();
        }, function (err) {
            console.log(err);
            process.exit(1)
        });
    }, function (err) {
        console.log(err);
        process.exit(1)
    });
}, function (err) {
    console.log(err);
    process.exit(1);
});
