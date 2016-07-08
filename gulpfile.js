const fs =           require('fs');
const gulp =         require('gulp');
const streamify =    require('gulp-streamify');
const rename =       require('gulp-rename');
const gutil =        require('gulp-util');
const uglify =       require('gulp-uglify');
const source =       require('vinyl-source-stream');
const browserify =   require('browserify');
const sass =         require('node-sass');
const cleanCSS =     require('gulp-clean-css');

gulp.task('browserify-bundle', function () {
  return browserify({
    entries: './src/js/vulcanup.js'
  })
  .transform('babelify', {
    presets: ['es2015']
  })
  .bundle()
  .pipe(source('./src/js/vulcanup.js'))
  .pipe(rename({
    dirname: '',
    basename: 'vulcanup'
  }))
  .pipe(gulp.dest('./dist'));
});

gulp.task('browserify', ['browserify-bundle'], function () {
  return gulp.src('./dist/vulcanup.js')
    .pipe(rename({
      basename: 'vulcanup.min'
    }))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('sass', function () {

  // bundle
  const result = sass.renderSync({
    file: './src/scss/_vulcanup.scss',
    outFile: './dist/vulcanup.css'
  });
  fs.writeFileSync(__dirname +'/dist/vulcanup.css', result.css);

  // compress
  return gulp.src(['./dist/vulcanup.css'])
    .pipe(cleanCSS({
      compatibility: 'ie8'
    }))
    .pipe(rename({
      dirname: '',
      basename: 'vulcanup.min'
    }))
    .pipe(gulp.dest('./dist', {
        overwrite: true
    }));
});

gulp.task('default', ['browserify', 'sass']);
