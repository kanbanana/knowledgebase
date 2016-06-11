"use strict";
var assert = require('assert');
var request = require('supertest');
var exec = require('child_process').exec;

var application = require(__dirname + '/server.js');

describe('server', function () {
    before(function () {
        application.listen();
    });

    after(function () {
        application.close();
    });

    describe('GET /api/articles/q=test', function () {
        it('respond with json', function (done) {
            request(application.app)
                .get('/api/articles/q=test')
                .set('Accept', 'application/json')
                .expect('Content-Type', /html/)
                .expect(200, done);
        });
    });

    // describe('Run Abao', function () {
    //     it('respond with json', function (done) {
    //         this.timeout(15000);
    //         exec('node node_modules/abao/bin/abao ./raml/api.raml --server http://localhost:3000/api', function (err, stdout) {
    //             console.log(err);
    //             console.log(stdout);
    //             done();
    //         });
    //     });
    // });
});
