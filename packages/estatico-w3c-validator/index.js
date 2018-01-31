const log = require('fancy-log');
const chalk = require('chalk');
const merge = require('lodash.merge');

const defaults = {
  src: null,
  srcBase: null,
  plugins: {
    w3cjs: {
      // url: 'http://localhost:8888'
    },
  },
  errorHandler: (err) => {
    log(`estatico-w3c-validator${err.plugin ? ` (${err.plugin})` : null}`, chalk.cyan(err.fileName), chalk.red(err.message));
  },
};

module.exports = (options) => {
  let config = {};

  if (typeof options === 'function') {
    config = options(defaults);
  } else {
    config = merge({}, defaults, options);
  }

  if (!config.src) {
    throw new Error('\'options.src\' is missing');
  }

  return () => {
    const gulp = require('gulp'); // eslint-disable-line global-require
    const plumber = require('gulp-plumber'); // eslint-disable-line global-require
    const changed = require('gulp-changed-in-place'); // eslint-disable-line global-require
    const w3cjs = require('gulp-w3cjs'); // eslint-disable-line global-require
    const through = require('through2'); // eslint-disable-line global-require
    const PluginError = require('plugin-error'); // eslint-disable-line global-require

    return gulp.src(config.src, {
      base: config.srcBase,
    })

      // Prevent stream from unpiping on error
      .pipe(plumber())

      // Do not pass unchanged files
      .pipe(changed({
        firstPass: true,
      }))

      // Send to validation API
      .pipe(w3cjs(config.plugins.w3cjs))

      // Handle errors
      .pipe(through.obj((file, enc, done) => {
        if (!file.w3cjs.success) {
          const err = new PluginError('reporter', 'Linting error (details above)');

          err.fileName = file.path;

          return done(err, file);
        }

        return done(null, file);
      }).on('error', config.errorHandler));
  };
};
