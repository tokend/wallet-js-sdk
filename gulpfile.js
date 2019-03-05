'use strict';

var gulp        = require('gulp');
var plugins     = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var webpack     = require("webpack");

gulp.task('default', ['build']);

gulp.task('build', function(done) {
  runSequence('clean', ['build-browser'], done);
});

gulp.task('hooks:precommit', ['build'], function() {
  return gulp.src('build/*')
    .pipe(plugins.git.add());
});

gulp.task('build-browser', [], function() {
  return gulp.src('index.js')
    .pipe(plugins.webpack({
      output: {
        library: 'StellarWallet'
      },
      plugins: [
        // Ignore native modules (ed25519)
        new webpack.IgnorePlugin(/ed25519/)
      ]
    }))
    .pipe(plugins.rename('stellar-wallet.js'))
    .pipe(gulp.dest('build'))
    .pipe(plugins.uglify())
    .pipe(plugins.rename('stellar-wallet.min.js'))
    .pipe(gulp.dest('build'));
});

gulp.task('clean', function () {
  return gulp.src('build', { read: false })
      .pipe(plugins.rimraf());
});

gulp.task('watch', ['build'], function() {
  gulp.watch('lib/**/*', ['build']);
});
