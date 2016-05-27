var gulp = require('gulp');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');

gulp.task('default', function() {
      gulp.watch('**/*.js', {interval: 1000, mode: 'poll'}, ['mocha']);
});

gulp.task('mocha', function() {
    return gulp.src(['**/*.spec.js'], { read: false })
        .pipe(mocha({ reporter: 'HTMLCov' }))
        .pipe(gulp.dest('reports'))
        .on('error', gutil.log);
});