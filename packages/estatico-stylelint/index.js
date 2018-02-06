// const chalk = require('chalk');
const merge = require('lodash.merge');
const { Logger } = require('estatico-utils');

const logger = new Logger('estatico-stylelint');

const defaults = (/* dev */) => ({
  src: null,
  srcBase: null,
  dest: null,
  logger,
  plugins: {
    stylelint: {
      failAfterError: true,
      reporters: [
        { formatter: 'string', console: true },
      ],
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
    const gulpStylelint = require('gulp-stylelint'); // eslint-disable-line global-require

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
      .pipe(gulpStylelint(config.plugins.stylelint).on('error', err => config.logger.error(err, dev)));

    // TODO: Optionally write back to disc
  };
};
