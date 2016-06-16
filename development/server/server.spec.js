'use strict';

var request = require('supertest');
var mongoose = require('mongoose');
var assert = require('assert');
var validate = require('jsonschema').validate;

var databaseConnector = require('./lib/data_connection/database_connector');
var articleService = require('./lib/services/article_service');
var fileSystemConnector = require('./lib/data_connection/file_system_connector');

var application = require('./server.js');

// Schemas
var ArticleSchema = require('./raml/schemas/article.json');
var SearchQResponseSchema = require('./raml/schemas/search_q_response.json');
var SearchIdsResponseSchema = require('./raml/schemas/search_ids_response.json');
var PostArticleResponseSchema = require('./raml/schemas/post_article_response.json');
var PostDocumentResponseSchema = require('./raml/schemas/post_document_response.json');

// Data
var ArticleExample = require('./raml/examples/getArticle.json');
var ApacheExample = require('./raml/examples/apache.json');

function ValidateSchema(schema, done) {
    return function (err, res) {
        if (err) return done(err);

        var validationResult = validate(res.body, schema);

        if (validationResult.errors.length > 0) return done(validationResult.errors);
        done();
    };
}

function GetValidData(url, schema) {
    return function (done) {
        request(application.app)
            .get(url)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(ValidateSchema(schema, done));
    };
}

function PostValidData(url, schema) {
    return function (done) {
        request(application.app)
            .post(url)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(ValidateSchema(schema, done));
    };
}

function PutValidData(url, data, schema) {
    return function (done) {
        request(application.app)
            .put(url)
            .send(data)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(ValidateSchema(schema, done));
    };
}

describe('', function () {
    before(function (done) {
        this.timeout(10000);
        application.listen(function () {
            setTimeout(done, 5000);
        });
    });

    after(function (done) {
        application.close(done);
    });

    describe('GET', function () {

        it('request with q=test', GetValidData('/api/articles?q=test', SearchQResponseSchema));
        it('request with q=', GetValidData('/api/articles?q=', SearchQResponseSchema));

        describe('With Article:', function () {
            var ArticleIds = [];

            before(function (done) {
                var numberOfArticlesToCreate = 10;
                var counter = 0;
                var counterArticleSwap = 0;
                // create some articles save them twice and attach a file
                for (var i = 0; i < numberOfArticlesToCreate; i++) {
                    request(application.app) // create an article
                        .post('/api/articles/')
                        .end(function (err, res) {
                            if (err) return done(err);
                            ArticleIds.push(res.body);
                            var data = JSON.parse(JSON.stringify((++counterArticleSwap < numberOfArticlesToCreate / 2) ? ArticleExample : ApacheExample));
                            data.id = res.body;
                            request(application.app) // save the article
                                .put('/api/articles/' + data.id)
                                .send(data)
                                .end(function () {
                                    data.text += 'version 2';
                                    request(application.app) // save it again to get the old value
                                        .put('/api/articles/' + data.id)
                                        .send(data)
                                        .end(function () {
                                            request(application.app) // attach a file
                                                .post('/api/articles/' + data.id + '/documents')
                                                .attach('documents', './raml/examples/dummy.txt')
                                                .end(function () {
                                                    if (++counter === numberOfArticlesToCreate) done();
                                                });
                                        });
                                });
                        });
                }
            });

            //delay 15 sec for oss to index files, just to be sure
            describe('', function () {

                before(function (done) {
                    this.timeout(21000);
                    setTimeout(done, 20000);
                });

                describe('/api/articles?q=', function () {
                    it('request with q=test', GetValidData('/api/articles?q=test', SearchQResponseSchema));
                    it('request with q=', GetValidData('/api/articles?q=', SearchQResponseSchema));
                    it('request with unknown q', GetValidData('/api/articles?q=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', SearchQResponseSchema));
                    it('search in article', GetValidData('/api/articles?q=important', SearchQResponseSchema));
                    it('search in title', GetValidData('/api/articles?q=Knowledge', SearchQResponseSchema));
                    it('search author', GetValidData('/api/articles?q=author:Max', SearchQResponseSchema));
                    it('search author maxlength', function (done) {
                        var authorName = 'name';

                        for (var i = 0; i < 1001; i++)
                            authorName += 'a';

                        request(application.app)
                            .get('/api/articles?q=author:"' + authorName + '"')
                            .expect('Content-Type', /json/)
                            .expect(400, done);
                    });
                    it('search author with spaces', GetValidData('/api/articles?q=author:"Max Mustermann"', SearchQResponseSchema));
                    it('search author with keyword', GetValidData('/api/articles?q=author:Max Lorem', SearchQResponseSchema));
                    it('search author with spaces with keyword', GetValidData('/api/articles?q=author:"Max Mustermann" dummy', SearchQResponseSchema));
                    it('search in file', GetValidData('/api/articles?q=Lorem', SearchQResponseSchema));
                    it('search filename', GetValidData('/api/articles?q=dummy', SearchQResponseSchema));
                    it('search filename with extension', GetValidData('/api/articles?q=dummy.txt', SearchQResponseSchema));
                });

                describe('/api/articles?ids=', function () {
                    it('request with ids=ArticleIds[0]', GetValidData('/api/articles?ids=' + ArticleIds[0], SearchIdsResponseSchema));
                    it('request with ids=[ArticleIds]', GetValidData('/api/articles?ids=' + ArticleIds.join(','), SearchIdsResponseSchema));
                    it('request with ids=', GetValidData('/api/articles?ids=', SearchIdsResponseSchema));
                    it('request with ids=1,2,3', GetValidData('/api/articles?ids=1,2,3', SearchIdsResponseSchema));
                    it('request with valid invalid ids mixed', GetValidData('/api/articles?ids=1,2,3' + ArticleIds.join(','), SearchIdsResponseSchema));
                });

                describe('/api/articles/:ArticleId', function () {
                    it('request the articles just after save', function (done) {
                        var error = null;
                        var counter = 0;

                        ArticleIds.forEach(function (id) {
                            request(application.app)
                                .get('/api/articles/' + id)
                                .expect('Content-Type', /json/)
                                .expect(200)
                                .end(function (err, res) {
                                    if (err) error = err;

                                    if (++counter === ArticleIds.length) return done(error);
                                });
                        });
                    });
                });

                describe('/api/articles/:ArticleId?old=', function () {
                    it('request the article old after save', GetValidData('/api/articles/' + ArticleIds[0] + '?old=', ArticleSchema));
                });

                describe('acticle saved', function () {
                    it('request the article just after creation', function (done) {
                        request(application.app)
                            .get('/api/articles/' + ArticleIds[0] + '?old=')
                            .expect('Content-Type', /json/)
                            .expect(404, done);
                    });
                });
            });
        });
    });


    describe('POST', function () {
        describe('/api/articles/', function () {
            it('request with all valid information', PostValidData('/api/articles/', PostArticleResponseSchema));
        });

        describe('With Article:', function () {
            var ArticleIds = [];

            before(function (done) {
                var numberOfArticlesToCreate = 10;
                var counter = 0;

                for (var i = 0; i < numberOfArticlesToCreate; i++)
                    request(application.app)
                        .post('/api/articles/')
                        .end(function (err, res) {
                            if (err) return done(err);
                            ArticleIds.push(res.body);

                            if (++counter === numberOfArticlesToCreate) done();
                        });
            });

            describe('/api/articles/:articleId/documents', function () {
                it('upload json testfile', function (done) {
                    request(application.app)
                        .post('/api/articles/' + ArticleIds[0] + '/documents')
                        .attach('documents', './raml/examples/dummy.txt')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .end(ValidateSchema(PostDocumentResponseSchema, done));
                });
            });

            describe('/api/articles/:articleId/documents', function () {
                it('upload testfile 10 times to test replacement', function (done) {
                    var numberOfFileToUpload = 10;
                    var counter = 0;
                    var error = null;

                    for (var i = 0; i < numberOfFileToUpload; i++)
                        request(application.app)
                            .post('/api/articles/' + ArticleIds[0] + '/documents')
                            .attach('documents', './raml/examples/dummy.txt')
                            .expect('Content-Type', /json/)
                            .expect(200)
                            .end(ValidateSchema(PostDocumentResponseSchema, function (err) {
                                if (err) error = err;

                                if (++counter === numberOfFileToUpload)
                                    if (error) return done(error);
                            }));
                });
            });
        });
    });

    describe('PUT', function () {
        describe('With Article:', function () {
            var ArticleIds = [];

            before(function (done) {
                var numberOfArticlesToCreate = 10;
                var counter = 0;

                for (var i = 0; i < numberOfArticlesToCreate; i++)
                    request(application.app)
                        .post('/api/articles/')
                        .end(function (err, res) {
                            if (err) return done(err);
                            ArticleIds.push(res.body);

                            if (++counter === numberOfArticlesToCreate) done();
                        });
            });

            describe('/api/articles/:ArticleId', function () {
                it('put with valid data', function (done) {
                    var data = JSON.parse(JSON.stringify(ArticleExample));

                    data.id = ArticleIds[0];

                    PutValidData('/api/articles/' + ArticleIds[0], data, ArticleSchema)(done);
                });

                it('put without data', function (done) {
                    request(application.app)
                        .put('/api/articles/' + ArticleIds[0])
                        .expect('Content-Type', /json/)
                        .expect(400, done);
                });

                it('put with empty json', function (done) {
                    request(application.app)
                        .put('/api/articles/' + ArticleIds[0])
                        .send({})
                        .expect('Content-Type', /json/)
                        .expect(400, done);
                });

                it('put with string as data', function (done) {
                    request(application.app)
                        .put('/api/articles/' + ArticleIds[0])
                        .send('d45f6ghs7j89kkhg6')
                        .expect('Content-Type', /json/)
                        .expect(400, done);
                });

                it('put with invalid json as data', function (done) {
                    request(application.app)
                        .put('/api/articles/' + ArticleIds[0])
                        .send({asdf: "asdf"})
                        .expect('Content-Type', /json/)
                        .expect(400, done);
                });

                describe('email', function () {
                    it('invalid', function (done) {
                        var data = JSON.parse(JSON.stringify(ArticleExample));

                        data.id = ArticleIds[0];
                        data.author.email = '4d5f6g7hjkjhugzf65d4f5g6h7j8k';

                        request(application.app)
                            .put('/api/articles/' + ArticleIds[0])
                            .send(data)
                            .expect('Content-Type', /json/)
                            .expect(400, done);
                    });
                });

                describe('author', function () {
                    it('to long', function (done) {
                        var data = JSON.parse(JSON.stringify(ArticleExample));

                        data.id = ArticleIds[0];
                        data.author.email = '';

                        for (var i = 0; i < 1001; i++)
                            data.author.name += 'a';

                        request(application.app)
                            .put('/api/articles/' + ArticleIds[0])
                            .send(data)
                            .expect('Content-Type', /json/)
                            .expect(400, done);
                    });
                });

                describe('title', function () {
                    it('to long', function (done) {
                        var data = JSON.parse(JSON.stringify(ArticleExample));

                        data.id = ArticleIds[0];
                        data.author.email = '';

                        for (var i = 0; i < 1001; i++)
                            data.title += 'a';

                        request(application.app)
                            .put('/api/articles/' + ArticleIds[0])
                            .send(data)
                            .expect('Content-Type', /json/)
                            .expect(400, done);
                    });
                });
            });
        });
    });

    describe('DELETE', function () {
        describe('With Article:', function () {
            describe('/api/articles', function () {
                var ArticleId = '';

                before(function (done) {
                    request(application.app)
                        .post('/api/articles/')
                        .end(function (err, res) {
                            if (err) return done(err);
                            ArticleId = res.body;
                            done();
                        });
                });

                it('delete existing article without files', function (done) {
                    request(application.app)
                        .del('/api/articles/' + ArticleId)
                        .expect('Content-Type', /json/)
                        .expect(200, done);
                });
            });

            describe('/api/articles', function () {
                var ArticleId = '';

                before(function (done) {
                    request(application.app)
                        .post('/api/articles/')
                        .end(function (err, res) {
                            if (err) return done(err);
                            ArticleId = res.body;

                            request(application.app)
                                .post('/api/articles/' + ArticleId + '/documents')
                                .attach('documents', './raml/examples/dummy.txt')
                                .end(done);
                        });
                });

                it('delete existing article with files', function (done) {
                    request(application.app)
                        .del('/api/articles/' + ArticleId)
                        .expect('Content-Type', /json/)
                        .expect(200, done);
                });
            });

            describe('/api/articles', function () {
                it('delete not existing article', function (done) {
                    request(application.app)
                        .del('/api/articles/0')
                        .expect('Content-Type', /json/)
                        .expect(404, done);
                });
            });

            describe('/:articleId/documents/:filename', function () {
                var ArticleId = '';

                before(function (done) {
                    request(application.app)
                        .post('/api/articles/')
                        .end(function (err, res) {
                            if (err) return done(err);
                            ArticleId = res.body;

                            request(application.app)
                                .post('/api/articles/' + ArticleId + '/documents')
                                .attach('documents', './raml/examples/dummy.txt')
                                .end(done);
                        });
                });

                it('delete file from existing article', function (done) {
                    request(application.app)
                        .del('/api/articles/' + ArticleId + '/documents/dummy.txt')
                        .expect('Content-Type', /json/)
                        .expect(200, done);
                });

                it('delete article.html', function (done) {
                    request(application.app)
                        .del('/api/articles/' + ArticleId + '/documents/article.html')
                        .expect('Content-Type', /json/)
                        .expect(500, done);
                });

                it('delete server.js', function (done) {
                    request(application.app)
                        .del('/api/articles/' + ArticleId + '/documents/..%2F..%2F..%2Fserver.js')
                        .expect('Content-Type', /json/)
                        .expect(500, done);
                });
            });

            describe('/:articleId/documents/:filename', function () {
                it('delete file from not existing article', function (done) {
                    request(application.app)
                        .del('/api/articles/0/documents/dummy.txt')
                        .expect('Content-Type', /json/)
                        .expect(404, done);
                });
            });
        });
    });

    describe('Database', function () {
        it('findAllPermArticleIds', function (done) {
            databaseConnector.findAllPermArticleIds()
                .then(function (ids) {
                    done();
                });
        });

        it('deleteTemporaryArticlesOlderThan', function (done) {
            databaseConnector.deleteTemporaryArticlesOlderThan(1)
                .then(function () {
                    done();
                });
        });

        it('should fail for values equal 0', function (done) {
            databaseConnector.deleteTemporaryArticlesOlderThan(0).then(function () {
                done("fail!");
            }, function () {
                done();
            });
        });

        it('should fail for values less 0', function (done) {
            databaseConnector.deleteTemporaryArticlesOlderThan(-1).then(function () {
                done("fail!");
            }, function () {
                done();
            });
        });
    });

    describe('Filesystem', function () {
        this.timeout(10000);
        it('deleteEmptyArticles', function (done) {
            articleService.deleteEmptyArticles(); //  TODO: async needs callback within function
            setTimeout(done, 2000);
        });

        it('deleteTemporaryArticles', function (done) {
            articleService.deleteTemporaryArticles().then(done);
        });
    });

    describe('file_system_connector', function () {
        describe('test extract html title content', function () {
            it('should pass', function () {
                assert.equal('foo bar', fileSystemConnector.extractHTMLTitleContent('<title>foo bar</title>'));
            });

            it('should pass with empty title', function () {
                assert.equal('', fileSystemConnector.extractHTMLTitleContent('<title></title>'));
            });

            it('should pass with empty title immediately closed tag', function () {
                assert.equal('', fileSystemConnector.extractHTMLTitleContent('</title>'));
            });

            it('should pass with nested tags', function () {
                assert.equal('foo bar', fileSystemConnector.extractHTMLTitleContent('<title><title>foo bar</title></title>'));
            });

            it('should pass with malformed tags', function () {
                assert.equal('', fileSystemConnector.extractHTMLTitleContent('<titlefoo bar</title>'));
            });

            it('should pass with malformed tags', function () {
                assert.equal('>foo bar', fileSystemConnector.extractHTMLTitleContent('<title>>foo bar</title>'));
            });

            it('should pass without tags', function () {
                assert.equal('foo bar', fileSystemConnector.extractHTMLTitleContent('foo bar'));
            });

            it('should pass two opening one closing tag', function () {
                assert.equal('foo bar', fileSystemConnector.extractHTMLTitleContent('<title><title>foo bar</title>'));
            });

            it('should pass new line', function () {
                assert.equal('foobar', fileSystemConnector.extractHTMLTitleContent("<title>foo<br>bar</title>"));
            });
        });

        describe('test extract html body content', function () {
            it('should pass', function () {
                assert.equal('', fileSystemConnector.extractHTMLBodyContent('<body></body>'));
            });
            it('should pass empty body', function () {
                assert.equal(' ', fileSystemConnector.extractHTMLBodyContent('<body> </body>'));
            });

            it('should pass regular text', function () {
                assert.equal('foo bar', fileSystemConnector.extractHTMLBodyContent('<body>foo bar</body>'));
            });

            it('should pass missing closing tag', function () {
                assert.equal('foo bar', fileSystemConnector.extractHTMLBodyContent('<body>foo bar'));
            });

            it('should pass missing opening tag', function () {
                assert.equal('foo bar', fileSystemConnector.extractHTMLBodyContent('foo bar</body>'));
            });

            it('should pass missing tags', function () {
                assert.equal('foo bar', fileSystemConnector.extractHTMLBodyContent('foo bar'));
            });

            it('should pass with escaped tags', function () {
                assert.equal('&lt;body&gt;foo bar', fileSystemConnector.extractHTMLBodyContent('&lt;body&gt;foo bar</body>'));
            });

            it('should pass with newline', function () {
                assert.equal('foo\n bar', fileSystemConnector.extractHTMLBodyContent('<body>foo\n bar</body>'));
            });
        });

        describe('test wrap content in html', function () {
            it('should pass', function () {
                assert.equal('<html><head><title>foo</title></head><body>foo bar</body></html>', fileSystemConnector.wrapContentInHTMLBody('foo bar', 'foo'));
            });

            it('should pass both params empty', function () {
                assert.equal('<html><head><title></title></head><body></body></html>', fileSystemConnector.wrapContentInHTMLBody('', ''));
            });

            it('should pass both params whitespace', function () {
                assert.equal('<html><head><title> </title></head><body> </body></html>', fileSystemConnector.wrapContentInHTMLBody(' ', ' '));
            });

            it('should pass both params whitespace', function () {
                assert.equal('<html><head><title>\n\n</title></head><body></body></html>', fileSystemConnector.wrapContentInHTMLBody('', '\n\n'));
            });
        });
    });
});