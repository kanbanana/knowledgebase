var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('default', ['mocha'], function() {
      gulp.watch('**/*.js', {interval: 1000, mode: 'poll'}, ['mocha']);
});

gulp.task('mocha', function() {
    return gulp.src(['**/*.spec.js'], { read: false })
        .pipe(mocha({ reporter: 'Spec' }));
});