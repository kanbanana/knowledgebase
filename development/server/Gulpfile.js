var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');

function swallowError(error) {
    // If you want details of the error in the console
    console.log(error.toString())

    this.emit('end')
}

gulp.task('default', ['mocha'], function () {
    gulp.watch(['**/*.js', '!node_modules/**', '!coverage/**'], {interval: 1000, mode: 'poll'}, ['mocha']);
});

gulp.task('mocha', function () {
    return gulp.src(['**/*.spec.js', '!node_modules/**', '!coverage/**'], {read: false})
        .pipe(mocha({reporter: 'spec'}))
        .on('error', swallowError);
});

gulp.task('jenkins', ['jenkins-test']);

gulp.task('pre-test', function () {
    return gulp.src(['**/!(*.spec).js', '!node_modules/**', '!coverage/**'])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});

gulp.task('jenkins-test', ['pre-test'], function () {
    return gulp.src(['**/*.spec.js', '!node_modules/**', '!coverage/**'])
        .pipe(mocha({reporter: 'tap'}))
        .on('error', swallowError)
        .pipe(istanbul.writeReports());
});

