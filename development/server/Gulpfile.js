var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');

gulp.task('default', ['mocha'], function() {
      gulp.watch('**/*.js', {interval: 1000, mode: 'poll'}, ['mocha']);
});

gulp.task('mocha', function() {
    return gulp.src(['**/*.spec.js'], { read: false })
        .pipe(mocha({ reporter: 'Spec' }));
});

gulp.task('jenkins', ['jenkins-test']);

gulp.task('pre-test', function () {
  return gulp.src(['**/*.js', '!**/*.spec.js'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task('jenkins-test', function() {
    return gulp.src(['**/*.spec.js'], { read: false })
        .pipe(mocha({ reporter: 'tap' }))
	.pipe(istanbul.writeReports());
});

