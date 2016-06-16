var should = require('should');
var request = require('supertest');
var mongoose = require('mongoose');
var assert = require('assert');

var config = require('./lib/config/config');
var databaseConnector = require('./lib/data_connection/database_connector');
var articleService = require('./lib/services/article_service');
var fileSystemConnector = require('./lib/data_connection/file_system_connector');

var application = require('./server.js');

// Schemas
var ArticleSchema = require('./raml/schemas/article.json');
var ArticlesSchema = require('./raml/schemas/article.json');
// Data
var ArticleExample = require('./raml/examples/getArticle.json');
var ArticlesExample = require('./raml/examples/getArticles.json');

describe('', function () {
    before(function () {
        // Drop the database
        application.listen(function () {
            mongoose.connection.db.dropDatabase();
        });
    });

    after(function () {
        application.close();
        //TODO: Remove as soon as the application is able to do this on its own
        mongoose.disconnect();
    });

    describe('GET', function () {
        describe('/api/articles?q=test', function () {
            it('request with q=test', function (done) {
                request(application.app)
                    .get('/api/articles?q=test')
                    .expect('Content-Type', /json/)
                    .expect(200, done);
            });

            it('request with q=', function (done) {
                request(application.app)
                    .get('/api/articles?q=')
                    .expect(200, done);
            });

            it('request with unknown q', function (done) {
                request(application.app)
                    .get('/api/articles?q=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
                    .expect(200, done);
            });
        });

        describe('With Article:', function () {
            var ArticleIds = [];

            before(function (done) {
                var numberOfArticlesToCreate = 10;
                var counter = 0;

                for (var i = 0; i < numberOfArticlesToCreate; i++) {
                    request(application.app)
                        .post('/api/articles/')
                        .end(function (err, res) {
                            if (err) return done(err);
                            ArticleIds.push(res.body);
                            var data = JSON.parse(JSON.stringify(ArticleExample));
                            data.id = res.body;
                            request(application.app)
                                .put('/api/articles/' + res.body)
                                .send(data)
                                .end(function () {
                                    request(application.app)
                                        .post('/api/articles/' + res.body + '/documents')
                                        .attach('documents', './raml/examples/dummy.txt')
                                        .end(function () {
                                            if (++counter === numberOfArticlesToCreate) done();
                                        });
                                });
                        });
                }
            });


            describe('/api/articles?q=', function () {
                it('search in article', function (done) {
                    request(application.app)
                        .get('/api/articles?q=important')
                        .expect('Content-Type', /json/)
                        .expect(200, done);
                });

                it('search in title', function (done) {
                    request(application.app)
                        .get('/api/articles?q=Knowledge')
                        .expect('Content-Type', /json/)
                        .expect(200, done);
                });

                it('search author', function (done) {
                    request(application.app)
                        .get('/api/articles?q=author:Max')
                        .expect('Content-Type', /json/)
                        .expect(200, done);
                });

                it('search author maxlength', function (done) {
                    var authorName = 'name';

                    for(var i = 0; i < config.postBodyValidationValues.maxArticleAuthorEmailLength; i++)
                        authorName += 'a';

                    request(application.app)
                        .get('/api/articles?q=author:"' + authorName + '"')
                        .expect('Content-Type', /json/)
                        .expect(400, done);
                });

                it('search author with spaces', function (done) {
                    request(application.app)
                        .get('/api/articles?q=author:"Max Mustermann"')
                        .expect('Content-Type', /json/)
                        .expect(200, done);
                });

                it('search author with keyword', function (done) {
                    request(application.app)
                        .get('/api/articles?q=author:Max Lorem')
                        .expect('Content-Type', /json/)
                        .expect(200, done);
                });

                it('search author with spaces with keyword', function (done) {
                    request(application.app)
                        .get('/api/articles?q=author:"Max Mustermann" dummy')
                        .expect('Content-Type', /json/)
                        .expect(200, done);
                });

                it('search in file', function (done) {
                    request(application.app)
                        .get('/api/articles?q=Lorem')
                        .expect('Content-Type', /json/)
                        .expect(200, done);
                });

                it('search filename', function (done) {
                    request(application.app)
                        .get('/api/articles?q=dummy')
                        .expect('Content-Type', /json/)
                        .expect(200, done);
                });

                it('search filename with extension', function (done) {
                    request(application.app)
                        .get('/api/articles?q=dummy.txt')
                        .expect('Content-Type', /json/)
                        .expect(200, done);
                });
            });

            describe('/api/articles?ids=', function () {
                it('request with ids=ArticleIds[0]', function (done) {
                    request(application.app)
                        .get('/api/articles?ids=' + ArticleIds[0])
                        .expect('Content-Type', /json/)
                        .expect(200, done);
                });

                it('request with ids=[ArticleIds]', function (done) {
                    request(application.app)
                        .get('/api/articles?ids=' + ArticleIds.join(','))
                        .expect('Content-Type', /json/)
                        .expect(200, done);
                });

                it('request with ids=', function (done) {
                    request(application.app)
                        .get('/api/articles?ids=')
                        .expect('Content-Type', /json/)
                        .expect(200, done);
                });

                it('request with ids=1,2,3', function (done) {
                    request(application.app)
                        .get('/api/articles?ids=1,2,3')
                        .expect('Content-Type', /json/)
                        .expect(200, done);
                });

                it('request with valid invalid ids mixed', function (done) {
                    request(application.app)
                        .get('/api/articles?ids=1,2,3' + ArticleIds.join(',') + '')
                        .expect('Content-Type', /json/)
                        .expect(200, done);
                });
            });

            describe('/api/articles/:ArticleId', function () {
                it('request the article just after creation', function (done) {
                    request(application.app)
                        .get('/api/articles/' + ArticleIds[0])
                        .expect('Content-Type', /json/)
                        .expect(200, done);
                });
            });

            describe('/api/articles/:ArticleId?old=', function () {
                it('request the article just after creation', function (done) {
                    request(application.app)
                        .get('/api/articles/' + ArticleIds[0] + '?old=')
                        .expect('Content-Type', /json/)
                        .expect(200, done);
                });
            });
        });
    });

    describe('POST', function () {
        describe('/api/articles/', function () {
            it('request with all valid information', function (done) {
                request(application.app)
                    .post('/api/articles/')
                    .expect('Content-Type', /json/)
                    .expect(200, done);
            });

            it('check if request body is a string', function (done) {
                request(application.app)
                    .post('/api/articles/')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        assert('string', typeof res.body);
                        if(err) return done(err);
                        done();
                    });
            });
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
                        .expect(200, done);
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
                            .expect(200, function (err) {
                                if (err) error = err;

                                if (++counter === numberOfFileToUpload)
                                    if (error) return done(error);
                            });
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

                    request(application.app)
                        .put('/api/articles/' + ArticleIds[0])
                        .send(data)
                        .expect('Content-Type', /json/)
                        .expect(200, done);
                });

                it('put without data', function (done) {
                    request(application.app)
                        .put('/api/articles/' + ArticleIds[0])
                        .expect(400, done);
                });

                it('put with empty json', function (done) {
                    request(application.app)
                        .put('/api/articles/' + ArticleIds[0])
                        .send({})
                        .expect(400, done);
                });

                it('put with string as data', function (done) {
                    request(application.app)
                        .put('/api/articles/' + ArticleIds[0])
                        .send('d45f6ghs7j89kkhg6')
                        .expect(400, done);
                });

                it('put with invalid json as data', function (done) {
                    request(application.app)
                        .put('/api/articles/' + ArticleIds[0])
                        .send({asdf: "asdf"})
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
                            .expect(400, done);
                    });

                    it('to long', function (done) {
                        var data = JSON.parse(JSON.stringify(ArticleExample));

                        data.id = ArticleIds[0];
                        data.author.email = '';

                        for (var i = 0; i < config.postBodyValidationValues.maxArticleAuthorEmailLength + 1; i++)
                            data.author.email += 'a';

                        data.author.email += '@test.de';

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

                        for (var i = 0; i < config.postBodyValidationValues.maxArticleAuthorNameLength + 1; i++)
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

                        for (var i = 0; i < config.postBodyValidationValues.maxArticleTitleLength + 1; i++)
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
                        .expect(200, done);
                });
            });

            describe('/api/articles', function () {
                it('delete not existing article', function (done) {
                    request(application.app)
                        .del('/api/articles/0')
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
                        .expect(200, done);
                });

                it('delete article.html', function (done) {
                    request(application.app)
                        .del('/api/articles/' + ArticleId + '/documents/article.html')
                        .expect(500, done);
                });

                it('delete server.js', function (done) {
                    request(application.app)
                        .del('/api/articles/' + ArticleId + '/documents/..%2F..%2F..%2Fserver.js')
                        .expect(500, done);
                });
            });

            describe('/:articleId/documents/:filename', function () {
                it('delete file from not existing article', function (done) {
                    request(application.app)
                        .del('/api/articles/0/documents/dummy.txt')
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
        this.timeout(10000)
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
                assert.equal('<title>foo bar</title>', fileSystemConnector.extractHTMLTitleContent('<title><title>foo bar</title></title>'));
            });

            it('should pass with malformed tags', function () {
                assert.equal('<titlefoo bar</title>', fileSystemConnector.extractHTMLTitleContent('<titlefoo bar</title>'));
            });

            it('should pass with malformed tags', function () {
                assert.equal('>foo bar', fileSystemConnector.extractHTMLTitleContent('<title>>foo bar</title>'));
            });

            it('should pass without tags', function () {
                assert.equal('foo bar', fileSystemConnector.extractHTMLTitleContent('foo bar'));
            });

            it('should pass two opening one closing tag', function () {
                assert.equal('<title>foo bar', fileSystemConnector.extractHTMLTitleContent('<title><title>foo bar</title>'));
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
                assert.equal('foo bar', fileSystemConnector.extractHTMLBodyContent('&lt;body&gt;foo bar</body>'));
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
                assert.equal('<html><head><title>\n\n</title></head><body> </body></html>', fileSystemConnector.wrapContentInHTMLBody('\n\n', ''));
            });
        });
    });
});