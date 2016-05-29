var express = require('express');
var router = express.Router();
var fs = require("fs");
var Busboy = require('busboy');
var guid = require('node-uuid');
var path = require('path');

const uploadDirectory = path.join(__dirname, '../uploads') + '\\';
const whitelistWithDocumentMimeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
    'text/plain'
];

router.post('/:articleId/documents', function (req, res) {

    var busboy = new Busboy({headers: req.headers});
    busboy.on('file', function (fieldname, file, originalFilename, encoding, mimetype) {

        // TODO: send error, when file type is invalid
        // if(!whitelistWithDocumentMimeTypes.indexOf(mimetype) > -1) {
        //     res.status(422).send('Invalid file type. Supported file types are: ' + whitelistWithDocumentMimeTypes.toString());
        //     // req.pipe(busboy);
        //     return;
        // }

        var fileExtensionOfTemporaryFile = path.extname(originalFilename);
        var temporaryFilenameWithoutExtension = guid.v4();
        var temporaryFilename = temporaryFilenameWithoutExtension + fileExtensionOfTemporaryFile;
        var targetDirectory = getTemporaryFolderForArticle(req.params.articleId);
        var targetFilePath = path.join(targetDirectory, temporaryFilename);

        var fileOutputStream = fs.createWriteStream(targetFilePath);

        file.on('data', function (data) {
            fileOutputStream.write(data);
        });
        file.on('end', function () {
            fileOutputStream.end();
            res.sendStatus(200)
        });
    });
    req.pipe(busboy);
});

function getTemporaryFolderForArticle(articleId) {

    var targetDirectory = path.join(uploadDirectory, articleId);
    try {
        fs.statSync(targetDirectory);
    }
    catch(e) {
        if(e.code === 'ENOENT') {
            // this exception is thrown, when the folder doesn't exist
            fs.mkdir(targetDirectory);
        }
    }

    return targetDirectory;
}

module.exports = router;