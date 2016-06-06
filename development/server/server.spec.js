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

    describe('Array', function () {
        describe('#indexOf()', function () {
            it('should return -1 when the value is not present', function () {
                assert.equal(-1, [1, 2, 3].indexOf(5));
                assert.equal(-1, [1, 2, 3].indexOf(0));
            });
        });

        describe('#indexOf()', function () {
            it('should return -1 when the value is not present', function () {
                assert.equal(-1, [1, 2, 3].indexOf(5));
            });
        });

        describe('GET /', function() {
            it('respond with json', function(done) {
                request(application.app)
                    .get('/')
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /html/)
                    .expect(200, done);
            });
        });

        describe('Run Abao', function() {
            it('respond with json', function(done) {
                this.timeout(15000);
                exec('node node_modules/.bin/abao ./raml/api.raml --server http://localhost:3000/api', function (err, stdout) {
                    console.log(err);
                    console.log(stdout);
                    done();
                });
            });
        });
    });
});
