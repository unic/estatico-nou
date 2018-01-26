const gulp = require('gulp');
const plumber = require('gulp-plumber');
const changed = require('gulp-changed-in-place');
const gulpStylelint = require('gulp-stylelint');
const log = require('fancy-log');
const chalk = require('chalk');
const merge = require('lodash.merge');

const defaults = {
  src: null,
  srcBase: null,
  dest: null,
  errorHandler: (err) => {
    log(`estatico-stylelint${err.plugin ? ` (${err.plugin})` : null}`, chalk.cyan(err.fileName), chalk.red(err.message));
  },
};

module.exports = (options) => {
  const config = merge({}, defaults, options);

  // Validate options
  if (!config.src) {
    throw new Error('\'options.src\' is missing');
  }
  if (!config.srcBase) {
    throw new Error('\'options.srcBase\' is missing');
  }
  // if (!config.dest) {
  //   throw new Error('\'options.dest\' is missing');
  // }

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
    }).on('error', config.errorHandler));

    // TODO: Optionally write back to disc
};
