// const chalk = require('chalk');
const merge = require('lodash.merge');
const { Logger } = require('estatico-utils');

const logger = new Logger('estatico-eslint');

const defaults = (/* dev */) => ({
  src: null,
  srcBase: null,
  dest: null,
  logger,
  plugins: {
    eslint: {
      fix: true,
    },
    changed: {
      firstPass: true,
    },
  },
});

module.exports = (options, dev) => {
  let config = {};

  if (typeof options === 'function') {
    config = options(defaults(dev));
  } else {
    config = merge({}, defaults(dev), options);
  }

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

  return () => {
    const gulp = require('gulp'); // eslint-disable-line global-require
    const plumber = require('gulp-plumber'); // eslint-disable-line global-require
    const changed = require('gulp-changed-in-place'); // eslint-disable-line global-require
    const eslint = require('gulp-eslint'); // eslint-disable-line global-require
    const through = require('through2'); // eslint-disable-line global-require
    const chalk = require('chalk'); // eslint-disable-line global-require
    const path = require('path'); // eslint-disable-line global-require

    return gulp.src(config.src, {
      base: config.srcBase,
    })

      // Prevent stream from unpiping on error
      .pipe(plumber())

      // Do not pass unchanged files
      .pipe(config.plugins.changed ? changed(config.plugins.changed) : through.obj())

      // Stylelint verification
      .pipe(eslint(config.plugins.eslint).on('error', err => config.logger.error(err, dev)))
      .pipe(eslint.formatEach())
      .pipe(through.obj((file, enc, done) => {
        if (file.eslint && file.eslint.errorCount > 0) {
          logger.error(new Error(`Linting error in file ${chalk.yellow(path.relative(config.srcBase, file.path))} (details above)`), dev);
        }

        return done(null, file);
      }))

      // Optionally write back to disc
      .pipe(config.plugins.eslint.fix ? gulp.dest(config.dest) : through.obj());
  };
};
