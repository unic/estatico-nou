const log = require('fancy-log');
const chalk = require('chalk');
const merge = require('lodash.merge');

const defaults = {
  src: null,
  srcBase: null,
  srcIncludes: [],
  dest: null,
  plugins: {
    sass: {
      includePaths: null,
    },
    autoprefixer: {
      browsers: ['last 1 version'],
    },
    clean: {},
    rename: null,
  },
  errorHandler: (err) => {
    log(`estatico-sass${err.plugin ? ` (${err.plugin})` : null}`, chalk.cyan(err.fileName), chalk.red(err.message));
  },
};

module.exports = (options) => {
  let config = {};

  if (typeof options === 'function') {
    config = options(defaults);
  } else {
    config = merge({}, defaults, options);
  }

  // Validate options
  if (!config.src) {
    throw new Error('\'options.src\' is missing');
  }
  if (!config.srcBase) {
    throw new Error('\'options.srcBase\' is missing');
  }
  if (!config.dest) {
    throw new Error('\'options.dest\' is missing');
  }

  return () => {
    const gulp = require('gulp'); // eslint-disable-line global-require
    const plumber = require('gulp-plumber'); // eslint-disable-line global-require
    const sass = require('gulp-sass'); // eslint-disable-line global-require
    const postcss = require('gulp-postcss'); // eslint-disable-line global-require
    const autoprefixer = require('autoprefixer'); // eslint-disable-line global-require
    const clean = require('postcss-clean'); // eslint-disable-line global-require
    const sourcemaps = require('gulp-sourcemaps'); // eslint-disable-line global-require
    const through = require('through2'); // eslint-disable-line global-require

    return gulp.src(config.src, {
      base: config.srcBase,
    })

      // Prevent stream from unpiping on error
      .pipe(plumber())

      // TODO: Add dependency graph and decide based on fileEvents which files to pass through
      // .pipe(through.obj((file, enc, done) => {
      //   done(null, file)
      // }))

      .pipe(sourcemaps.init())

      // Sass
      .pipe(sass(config.plugins.sass).on('error', config.errorHandler))

      // PostCSS
      .pipe(postcss([]
        .concat(config.plugins.autoprefixer ? autoprefixer(config.plugins.autoprefixer) : [])
        .concat(config.plugins.clean ? clean(config.plugins.clean) : [])))

      // Optional rename, allows to add .min prefix, e.g.
      .pipe(through.obj((file, enc, done) => {
        if (config.plugins.rename) {
          file.path = config.plugins.rename(file); // eslint-disable-line no-param-reassign
        }

        done(null, file);
      }))

      .pipe(sourcemaps.write('.', {
        includeContent: false,
        sourceRoot: config.srcBase,
      }))

      // Save
      .pipe(gulp.dest(config.dest));
  };
};
