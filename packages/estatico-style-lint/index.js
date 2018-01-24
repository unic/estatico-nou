const gulp = require('gulp');
const plumber = require('gulp-plumber');
const changed = require('gulp-changed-in-place');
const gulpStylelint = require('gulp-stylelint');
const merge = require('lodash.merge');

const defaults = {
  src: [
    './src/modules/**/*.css',
  ],
  srcBase: './src/',
  watch: [
    './src/modules/**/*.css',
  ],
};

module.exports = (options) => {
  const config = merge({}, defaults, options);

  return gulp.src(config.src, {
    base: config.srcBase,
  })

    // Prevent stream from unpiping on error
    .pipe(plumber())

    // Do not pass unchanged files
    .pipe(changed({
      firstPass: true,
    }))

    // Stylelint verification
    .pipe(gulpStylelint({
      failAfterError: true,
      reporters: [
        { formatter: 'string', console: true },
      ],
    }));
};
