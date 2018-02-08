const chalk = require('chalk');
const merge = require('lodash.merge');
const path = require('path');
const { Logger } = require('@unic/estatico-utils');

const logger = new Logger('estatico-sass');

const defaults = dev => ({
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
    clean: dev ? null : {},
    clone: dev ? null : {},
  },
  minifiedSuffix: '.min',
  logger,
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
    const size = require('gulp-size'); // eslint-disable-line global-require
    const filterStream = require('postcss-filter-stream'); // eslint-disable-line global-require

    if (config.plugins.autoprefixer) {
      const info = autoprefixer(config.plugins.autoprefixer).info();

      config.logger.debug('autoprefixer', info);
    }

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
      .pipe(sass(config.plugins.sass).on('error', err => config.logger.error(err, dev)))

      // Clone for production version
      .pipe(through.obj(function (file, enc, done) { // eslint-disable-line
        if (config.plugins.clean) {
          const clone = file.clone();

          clone.path = file.path.replace(path.extname(file.path), ext => `${config.minifiedSuffix}${ext}`);

          config.logger.debug('clone', `Cloned ${chalk.yellow(file.path)} to ${chalk.yellow(clone.path)}`);

          this.push(clone);
        }

        done(null, file);
      }))

      // PostCSS
      .pipe(postcss([]
        .concat(config.plugins.autoprefixer ? autoprefixer(config.plugins.autoprefixer) : [])
        .concat(config.plugins.clean ? filterStream(['**/*', `!**/*${config.minifiedSuffix}*`], clean(config.plugins.clean)) : [])))

      .pipe(sourcemaps.write('.', {
        includeContent: false,
        sourceRoot: config.srcBase,
      }))

      // Log
      .pipe(size({
        showFiles: true,
      }))

      // Save
      .pipe(gulp.dest(config.dest));
  };
};
