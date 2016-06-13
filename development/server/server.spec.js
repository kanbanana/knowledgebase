"use strict";
var should = require('should');
var request = require('supertest');
var mongoose = require('mongoose');

var config = require('./lib/config/config');
var databaseConnector = require('./lib/data_connection/database_connector');
var articleService = require('./lib/services/article_service');
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

                for (var i = 0; i < numberOfArticlesToCreate; i++)
                    request(application.app)
                        .post('/api/articles/')
                        .end(function (err, res) {
                            if (err) return done(err);
                            ArticleIds.push(res.body);
                            request(application.app)
                                .put('/api/articles/' + res.body)
                                .send(ArticleExample)
                                .end(function () {
                                    request(application.app)
                                        .post('/api/articles/' + res.body + '/documents')
                                        .attach('documents', './raml/examples/dummy.txt')
                                        .end(function () {
                                            if (++counter === numberOfArticlesToCreate) done();
                                        });
                                });
                        });
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
                        res.body.should.be.type('string');
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
                    request(application.app)
                        .put('/api/articles/' + ArticleIds[0])
                        .send(ArticleExample)
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

                        data.author.email = '4d5f6g7hjkjhugzf65d4f5g6h7j8k';

                        request(application.app)
                            .put('/api/articles/' + ArticleIds[0])
                            .send(data)
                            .expect(400, done);
                    });

                    it('to long', function (done) {
                        var data = JSON.parse(JSON.stringify(ArticleExample));

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

        it('findAllPermArticleIds', function (done) {
            databaseConnector.deleteTemporaryArticlesOlderThan(1)
                .then(function () {
                    done();
                });
        });
    });

    describe('Filesystem', function () {
        it('deleteEmptyArticles', function () {
            articleService.deleteEmptyArticles();
        });
    });
});