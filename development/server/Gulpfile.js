var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var print = require('gulp-print');

gulp.task('default', ['mocha'], function() {
      gulp.watch('**/*.js', '!node_modules/**', '!coverage/**', {interval: 1000, mode: 'poll'}, ['mocha']);
});

gulp.task('mocha', function() {
    return gulp.src(['**/*.spec.js', '!node_modules/**', '!coverage/**'], { read: false })
        .pipe(mocha({ reporter: 'Spec' }));
});

gulp.task('jenkins', ['jenkins-test']);

gulp.task('pre-test', function () {
  return gulp.src(['**/!(*.spec).js', '!node_modules/**', '!coverage/**'])
    .pipe(print())
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task('jenkins-test', ['pre-test'], function() {
    return gulp.src(['**/*.spec.js', '!node_modules/**', '!coverage/**'])
       .pipe(print())
       .pipe(mocha())
	   .pipe(istanbul.writeReports());
});

