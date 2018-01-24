const gulp = require('gulp');
const plumber = require('gulp-plumber');
const changed = require('gulp-changed-in-place');
const w3cjs = require('gulp-w3cjs');
const through = require('through2');
const log = require('fancy-log');
const PluginError = require('plugin-error');
const chalk = require('chalk');
const merge = require('lodash.merge');

const defaults = {
  src: [
    './dist/*.html',
    './dist/modules/**/*.html',
    './dist/pages/**/*.html',
  ],
  srcBase: './dist/',
  plugins: {
    w3cjs: {
      // url: 'http://localhost:8888'
    },
  },
  errorHandler: (err) => {
    log(`estatico-html-validate${err.plugin ? ` (${err.plugin})` : null}`, chalk.cyan(err.fileName), chalk.red(err.message));
  },
  watch: [
    // Possibly needs to be disabled due to rate-limited w3c API
    // Alternative: Use local validator instance
    './dist/*.html',
    './dist/modules/**/*.html',
    './dist/pages/**/*.html',
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
